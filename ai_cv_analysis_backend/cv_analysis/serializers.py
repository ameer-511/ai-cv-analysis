from rest_framework import serializers
from .models import CV, CVAnalysisResult
from .models import Interview, InterviewQuestion

class CVCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        # Only accept a file on create; `user` is set server-side in the viewset
        fields = ['file']


class CVListSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ['id', 'file', 'uploaded_at']
        read_only_fields = ['id', 'file', 'uploaded_at']


class CVDetailSerializer(serializers.ModelSerializer):
    analysis = serializers.SerializerMethodField()

    class Meta:
        model = CV
        fields = ['id', 'user', 'file', 'uploaded_at', 'analysis']
        read_only_fields = ['id', 'user', 'file', 'uploaded_at', 'analysis']

    def get_analysis(self, obj):
        # include nested analysis if it exists
        try:
            analysis = obj.analysis
        except CVAnalysisResult.DoesNotExist:
            return None
        return CVAnalysisResultSerializer(analysis).data


class CVUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = CV
        fields = ['file']


class CVAnalysisResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = CVAnalysisResult
        fields = ['id', 'cv', 'summary', 'skills_extracted', 'experience_level', 'ai_score', 'suggestions', 'analyzed_at']
        read_only_fields = ['id', 'cv', 'analyzed_at']


class InterviewQuestionSerializer(serializers.ModelSerializer):
    class Meta:
        model = InterviewQuestion
        fields = '__all__'


class InterviewSerializer(serializers.ModelSerializer):
    questions = InterviewQuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Interview
        fields = '__all__'