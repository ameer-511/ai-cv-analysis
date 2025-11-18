from django.db import models
from django.conf import settings


class CV(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='cvs')
    file = models.FileField(upload_to='cv_files/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.email} - {self.file.name}"


class CVAnalysisResult(models.Model):
    cv = models.OneToOneField(CV, on_delete=models.CASCADE, related_name='analysis')
    summary = models.TextField(blank=True, null=True)
    skills_extracted = models.JSONField(default=list)
    experience_level = models.CharField(max_length=50, blank=True, null=True)
    ai_score = models.FloatField(default=0.0)
    suggestions = models.TextField(blank=True, null=True)
    analyzed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Analysis for {self.cv.user.email}"

class Interview(models.Model):
    cv = models.ForeignKey(CV, on_delete=models.CASCADE, related_name='interviews')
    started_at = models.DateTimeField(auto_now_add=True)
    ai_feedback = models.TextField(blank=True, null=True)
    total_questions = models.IntegerField(default=0)
    correct_answers = models.IntegerField(default=0)
    score = models.FloatField(default=0.0)
    completed = models.BooleanField(default=False)
    current_question_index = models.IntegerField(default=0)  # Track progress for resume

    def __str__(self):
        return f"Interview for {self.cv.user.email}"

class InterviewQuestion(models.Model):
    interview = models.ForeignKey(Interview, on_delete=models.CASCADE, related_name='questions',null=True,blank=True )
    question_text = models.TextField()
    choice_1 = models.CharField(max_length=255)
    choice_2 = models.CharField(max_length=255)
    choice_3 = models.CharField(max_length=255)
    choice_4 = models.CharField(max_length=255)
    user_answer = models.CharField(max_length=255, blank=True, null=True)
    correct_answer = models.CharField(max_length=255)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.question_text
    

