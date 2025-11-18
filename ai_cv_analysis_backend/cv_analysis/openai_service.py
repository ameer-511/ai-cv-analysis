import json
import logging
import re
import os
from typing import Any, Dict, Optional
from io import BytesIO

import requests
import fitz  # PyMuPDF
from django.conf import settings

logger = logging.getLogger(__name__)


def _extract_json(text: str) -> Optional[Dict[str, Any]]:
    """Try to extract a JSON object from text and parse it.

    This is deliberately robust: it first attempts a direct json.loads,
    then searches for the first {...} block. It returns None if parsing
    fails.
    """
    if not text:
        return None
    text = text.strip()
    try:
        return json.loads(text)
    except Exception:
        pass

    m = re.search(r"\{.*\}", text, re.S)
    if not m:
        return None
    candidate = m.group(0)
    try:
        return json.loads(candidate)
    except Exception:
        # best-effort attempt to fix common issues (single quotes)
        try:
            return json.loads(candidate.replace("'", '"'))
        except Exception:
            logger.exception('Failed to parse JSON from model response')
            return None


def _read_cv_text(cv) -> Optional[str]:
    """Extract text from uploaded CV file (supports PDF and plain text).
    
    For PDF files, uses PyMuPDF (fitz) to extract text from all pages.
    For text files, attempts UTF-8 decoding.
    Returns None if extraction fails.
    """
    try:
        f = cv.file
        # Read file bytes
        try:
            raw = f.read()
        except Exception:
            try:
                with f.open('rb') as fh:
                    raw = fh.read()
            except Exception:
                return None

        if not raw:
            return None

        # Check if it's a PDF by magic bytes or filename
        is_pdf = raw.startswith(b'%PDF') or (hasattr(cv.file, 'name') and cv.file.name.endswith('.pdf'))

        if is_pdf:
            try:
                # Open PDF from BytesIO
                pdf_doc = fitz.open(stream=BytesIO(raw), filetype='pdf')
                text_parts = []
                for page_num in range(len(pdf_doc)):
                    page = pdf_doc[page_num]
                    text_parts.append(page.get_text())
                pdf_doc.close()
                return '\n'.join(text_parts) if text_parts else None
            except Exception as e:
                logger.warning('Failed to extract PDF text: %s', e)
                return None

        # Try UTF-8 decoding for text files
        if isinstance(raw, bytes):
            try:
                return raw.decode('utf-8')
            except Exception:
                return raw.decode('utf-8', errors='ignore')

        return str(raw)
    except Exception as e:
        logger.exception('Error reading CV file: %s', e)
        return None


def analyze_cv(cv, model: Optional[str] = None, timeout: Optional[int] = None) -> Dict[str, Any]:
    """Call the configured OpenAI-compatible API to analyze a CV.

    Configuration is read from Django `settings` first, falling back to
    environment variables. Required settings/env:
      - OPENAI_API_KEY
      - OPENAI_MODEL (optional, defaults to gpt-3.5-turbo)
      - OPENAI_API_URL (optional, defaults to OpenAI chat completions endpoint)
      - OPENAI_TIMEOUT (optional seconds)

    Returns a dict with keys: skills, summary, experience_level, ai_score, suggestions.
    Raises RuntimeError on configuration or API failures.
    """
    # config: prefer Django settings, then environment
    api_key = getattr(settings, 'OPENAI_API_KEY', None) or os.getenv('OPENAI_API_KEY')
    if not api_key:
        raise RuntimeError('OPENAI_API_KEY not configured')

    default_model = getattr(settings, 'OPENAI_MODEL', None) or os.getenv('OPENAI_MODEL', 'gpt-3.5-turbo')
    default_url = getattr(settings, 'OPENAI_API_URL', None) or os.getenv('OPENAI_API_URL', 'https://api.openai.com/v1/chat/completions')
    default_timeout = int(getattr(settings, 'OPENAI_TIMEOUT', None) or os.getenv('OPENAI_TIMEOUT', '30'))

    model = model or default_model
    timeout = timeout or default_timeout

    cv_text = _read_cv_text(cv)

    system_msg = 'You are a helpful assistant that analyzes resumes and returns a strict JSON object.'
    user_msg = (
    "You are an expert resume reviewer. Your task is to help the user improve their CV by providing a structured analysis. "
    "Return ONLY a JSON object with the following keys:\n"
    "- skills (array of strings): A list of key skills mentioned in the CV.\n"
    "- summary (short paragraph): A brief summary of the candidate's professional profile based on the CV.\n"
    "- experience_level (string): The experience level of the candidate (e.g., Entry-Level, Mid-Level, Senior, etc.).\n"
    "- ai_score (number 0-100): A score from 0 to 100 representing the overall quality of the CV as analyzed by the AI.\n"
    "- suggestions (string): Detailed, actionable suggestions to improve the CV. Include advice on:\n"
    " 1. Structure and formatting: Suggest improvements for making the CV visually appealing and easier to read.\n"
    " 2. Content quality: Recommend adding or improving sections, such as work achievements, skills, and professional summary.\n"
    " 3. Clarity and conciseness: Provide tips on making the CV more concise while keeping relevant information.\n"
    " 4. Industry-specific tips: Tailor the suggestions based on the assumed industry or job role the user is applying for.\n"
    " 5. Use of keywords: Advise on adding relevant keywords that are likely to be picked up by applicant tracking systems (ATS).\n"
)
    if cv_text:
        user_msg += "Here is the CV text:\n\n" + cv_text
    else:
        user_msg += f"CV filename: {getattr(cv.file, 'name', 'unknown')}"

    payload = {
        'model': model,
        'messages': [
            {'role': 'system', 'content': system_msg},
            {'role': 'user', 'content': user_msg},
        ],
        'temperature': 0.0,
        'max_tokens': 800,
    }

    headers = {
        'Authorization': f'Bearer {api_key}',
        'Content-Type': 'application/json',
    }

    try:
        resp = requests.post(default_url, headers=headers, json=payload, timeout=timeout)
    except requests.RequestException as exc:
        logger.exception('OpenAI request failed: %s', exc)
        raise RuntimeError('OpenAI request failed') from exc

    if resp.status_code != 200:
        logger.error('OpenAI API error %s: %s', resp.status_code, resp.text)
        raise RuntimeError(f'OpenAI API error: {resp.status_code}')

    try:
        data = resp.json()
    except Exception:
        logger.exception('Failed to decode JSON response from OpenAI')
        raise RuntimeError('Invalid JSON from OpenAI')

    # extract assistant content robustly
    assistant_text = None
    try:
        assistant_text = data['choices'][0]['message']['content']
    except Exception:
        try:
            # fall back to older shape
            assistant_text = data['choices'][0]['text']
        except Exception:
            assistant_text = str(data)

    parsed = _extract_json(assistant_text)
    if not parsed:
        logger.error('Could not parse JSON from model response')
        raise RuntimeError('Failed to parse JSON from model response')

    # Normalize fields
    skills = parsed.get('skills') or []
    if isinstance(skills, str):
        skills = [s.strip() for s in skills.split(',') if s.strip()]
    if not isinstance(skills, list):
        skills = []

    try:
        ai_score = float(parsed.get('ai_score') or 0.0)
    except Exception:
        ai_score = 0.0

    result = {
        'skills': skills,
        'summary': parsed.get('summary') or '',
        'experience_level': parsed.get('experience_level') or '',
        'ai_score': ai_score,
        'suggestions': parsed.get('suggestions') or '',
    }

    return result


