from rest_framework import generics, status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model
from .serializers import (
    CustomTokenObtainPairSerializer,
    RegisterSerializer,
    StudentSerializer,
    ChangePasswordSerializer,
    UpdateProfileSerializer,
)

Student = get_user_model()


class LoginView(TokenObtainPairView):
    """Login with email and password → returns JWT tokens"""
    serializer_class   = CustomTokenObtainPairSerializer
    permission_classes = [permissions.AllowAny]


class RegisterView(generics.CreateAPIView):
    """Register new student"""
    queryset           = Student.objects.all()
    serializer_class   = RegisterSerializer
    permission_classes = [permissions.AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        student = serializer.save()
        refresh = RefreshToken.for_user(student)
        return Response({
            'user':    StudentSerializer(student).data,
            'refresh': str(refresh),
            'access':  str(refresh.access_token),
        }, status=status.HTTP_201_CREATED)


class LogoutView(APIView):
    """Logout → blacklist refresh token"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        try:
            token = RefreshToken(request.data.get('refresh'))
            token.blacklist()
            return Response(
                {'message': 'Logged out successfully.'}
            )
        except Exception:
            return Response(
                {'error': 'Invalid token.'},
                status=status.HTTP_400_BAD_REQUEST
            )


class ProfileView(generics.RetrieveUpdateAPIView):
    """View and update own profile"""
    serializer_class   = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

    def update(self, request, *args, **kwargs):
        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(StudentSerializer(request.user).data)


class ChangePasswordView(APIView):
    """Change password"""
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )
        serializer.is_valid(raise_exception=True)
        request.user.set_password(
            serializer.validated_data['new_password']
        )
        request.user.save()
        return Response(
            {'message': 'Password changed successfully.'}
        )


class StudentListView(generics.ListAPIView):
    """List all students — admin/librarian only"""
    serializer_class   = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'librarian']:
            return Student.objects.all().order_by('-date_joined')
        return Student.objects.filter(id=user.id)


class StudentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Get, update or delete a student — admin/librarian only"""
    serializer_class   = StudentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'librarian']:
            return Student.objects.all()
        return Student.objects.filter(id=user.id)