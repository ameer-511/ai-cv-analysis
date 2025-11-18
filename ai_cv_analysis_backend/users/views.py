import os
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.core.mail import send_mail
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes,force_str

from .models import User
from .serializers import RegisterSerializer, LoginSerializer, UserSerializer, UserUpdateSerializer

token_generator = PasswordResetTokenGenerator()

class UserViewSet(viewsets.ModelViewSet):
    """
    CRUD for users. Uses different serializers for create (registration) and for read/update.
    Also exposes `login/`, `recover_password/`, and `reset_password/` actions.
    """

    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_serializer_class(self):
        if self.action == 'create':
            return RegisterSerializer
        if self.action == 'login':
            return LoginSerializer
        if self.action in ['update', 'partial_update']:
            return UserUpdateSerializer
        return UserSerializer

    def get_permissions(self):
        # Allow anyone to register, login, recover or reset password
        if self.action in ['create', 'login', 'recover_password', 'reset_password']:
            return [AllowAny()]
        return [IsAuthenticated()]

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def login(self, request):
        """Login action returning JWT tokens using LoginSerializer."""
        serializer = LoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def recover_password(self, request):
        """
        Sends a password recovery email with a secure token.
        Accepts 'email' in POST body.
        """
        email = request.data.get("email")
        if not email:
            return Response({"detail": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)

            # Generate UID and token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token_generator = PasswordResetTokenGenerator()
            token = token_generator.make_token(user)

            # Construct reset link for frontend
            reset_link = f"http://localhost:5173/reset-password?uid={uid}&token={token}"

            # Send email
            send_mail(
                subject="Password Recovery",
                message=f"Click this link to reset your password: {reset_link}",
                from_email=os.environ.get('EMAIL_HOST_USER'),
                recipient_list=[email],
                fail_silently=False,
            )
        except User.DoesNotExist:
            # Do not reveal if email exists
            pass

        return Response(
            {"detail": "If this email exists, a password recovery email has been sent."},
            status=status.HTTP_200_OK,
        )

    @action(detail=False, methods=['post'], permission_classes=[AllowAny])
    def reset_password(self, request):
        """
        Resets the user password.
        Accepts 'uid', 'token', and 'new_password' in POST body.
        """
        uid = request.data.get("uid")
        token = request.data.get("token")
        new_password = request.data.get("new_password")

        if not uid or not token or not new_password:
            return Response({"detail": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user_id = urlsafe_base64_decode(uid).decode()
            user = User.objects.get(pk=user_id)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            return Response({"detail": "Invalid link."}, status=status.HTTP_400_BAD_REQUEST)

        token_generator = PasswordResetTokenGenerator()
        if not token_generator.check_token(user, token):
            return Response({"detail": "Invalid or expired token."}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()

        return Response({"detail": "Password has been reset successfully."}, status=status.HTTP_200_OK)
