// src/components/api/interview.js
import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

// Create an axios instance without baseURL so we use full paths
const api = axios.create({
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to attach the Authorization header dynamically.
// This ensures the token is read from localStorage on each request (useful when token
// is set after login without full page reload).
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Start a new interview for a CV
export const startInterview = async (cvId) => {
  return api.post(`${API_BASE}/api/cv/interviews/start/`, { cv_id: cvId });
};

// Get all interviews for the user
export const getInterviews = async () => {
  return api.get(`${API_BASE}/api/cv/interviews/`);
};

// Get interview status for a specific CV
export const getInterviewByCV = async (cvId) => {
  const response = await api.get(`${API_BASE}/api/cv/interviews/`);
  // Filter interviews for this CV and get the most recent one
  const interviews = Array.isArray(response.data)
    ? response.data
    : response.data.results || [];
  const cvInterviews = interviews.filter((interview) => interview.cv === cvId);
  return cvInterviews.length > 0 ? cvInterviews[cvInterviews.length - 1] : null;
};

// Get all interviews for a specific CV
export const getInterviewsForCV = async (cvId) => {
  try {
    const response = await api.get(`${API_BASE}/api/cv/interviews/`);
    console.log("API Response for interviews:", response.data);

    let interviews = [];
    if (Array.isArray(response.data)) {
      interviews = response.data;
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      interviews = response.data.results;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      interviews = response.data.data;
    }

    console.log("All interviews:", interviews);
    console.log("CV ID to filter:", cvId, "Type:", typeof cvId);

    const filtered = interviews.filter((interview) => {
      console.log(
        "Comparing interview.cv:",
        interview.cv,
        "with cvId:",
        cvId,
        "Equal:",
        interview.cv == cvId
      );
      return parseInt(interview.cv) === parseInt(cvId);
    });

    console.log("Filtered interviews:", filtered);
    return filtered;
  } catch (error) {
    console.error("Error in getInterviewsForCV:", error);
    return [];
  }
};

// Get a specific interview with its questions
export const getInterview = async (id) => {
  return api.get(`${API_BASE}/api/cv/interviews/${id}/`);
};

// Submit an answer to a question
export const submitAnswer = async (interviewId, questionId, userAnswer) => {
  return api.post(
    `${API_BASE}/api/cv/interviews/${interviewId}/submit-answer/`,
    {
      question_id: questionId,
      user_answer: userAnswer,
    }
  );
};

// Save interview progress (current question index)
export const saveProgress = async (interviewId, currentQuestionIndex) => {
  return api.post(
    `${API_BASE}/api/cv/interviews/${interviewId}/save-progress/`,
    {
      current_question_index: currentQuestionIndex,
    }
  );
};

// Get CV details by ID
export const getCVDetails = async (cvId) => {
  return api.get(`${API_BASE}/api/cv/cvs/${cvId}/`);
};

// Delete an interview by ID
export const deleteInterview = async (interviewId) => {
  return api.delete(`${API_BASE}/api/cv/interviews/${interviewId}/`);
};
