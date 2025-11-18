from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'username', 'first_name', 'last_name', 'password', 'account_type', 'profile_picture']

    def create(self, validated_data):
        user = User.objects.create_user(
            email=validated_data['email'],
            username=validated_data.get('username'),
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            account_type=validated_data.get('account_type', 'jobseeker'),
            password=validated_data['password'],
            profile_picture=validated_data.get('profile_picture', None),

        )
        return user

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email')
        password = data.get('password')

        user = authenticate(email=email, password=password)
        if not user:
            raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        # Return serializable values only. ImageField/FileField values are
        # not JSON-serializable directly, so expose the URL (or None).
        profile_url = None
        try:
            if getattr(user, 'profile_picture', None):
                # If the file has a URL attribute (typical for FileField), use it
                profile_url = getattr(user.profile_picture, 'url', None) or str(user.profile_picture)
        except Exception:
            profile_url = None

        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': {
                'username': user.username,
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'account_type': user.account_type,
                'profile_picture': profile_url,
            }
        }


class UserSerializer(serializers.ModelSerializer):
    """Serializer for read/list/retrieve operations on User."""
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'account_type', 'linkedin_profile', 'profile_picture', 'bio'
        ]
        read_only_fields = ['id', 'email']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for read/list/retrieve operations on User."""
    linkedin_profile = serializers.URLField(
        required=False, allow_blank=True, allow_null=True
    )
    bio = serializers.CharField(
        required=False, allow_blank=True, allow_null=True
    )
    profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name',
            'linkedin_profile', 'profile_picture', 'bio'
        ]
        read_only_fields = ['id', 'email']
