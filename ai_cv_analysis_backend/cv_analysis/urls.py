from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CVViewSet, CVAnalysisResultViewSet, InterviewViewSet
router = DefaultRouter()
router.register(r'cvs', CVViewSet, basename='cv')
router.register(r'analysis-results', CVAnalysisResultViewSet, basename='cv-analysis-result')
router.register(r'interviews', InterviewViewSet, basename='interview')

urlpatterns = [
    path('', include(router.urls)),
    
]
