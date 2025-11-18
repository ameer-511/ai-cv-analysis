from django.contrib import admin
from.models import CV, CVAnalysisResult, Interview, InterviewQuestion


admin.site.register(CV)
admin.site.register(CVAnalysisResult)
admin.site.register(Interview)
admin.site.register(InterviewQuestion)