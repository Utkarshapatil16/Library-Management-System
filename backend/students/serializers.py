from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Student


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Adds extra data into JWT token"""

    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['email']       = user.email
        token['full_name']   = user.full_name
        token['role']        = user.role
        token['roll_number'] = user.roll_number
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = StudentSerializer(self.user).data
        return data


class StudentSerializer(serializers.ModelSerializer):
    full_name = serializers.ReadOnlyField()

    class Meta:
        model  = Student
        fields = [
            'id',
            'email',
            'first_name',
            'last_name',
            'full_name',
            'roll_number',
            'department',
            'role',
            'phone',
            'address',
            'profile_picture',
            'is_active',
            'date_joined',
        ]
        read_only_fields = ['id', 'date_joined']


class RegisterSerializer(serializers.ModelSerializer):
    password  = serializers.CharField(
        write_only=True,
        validators=[validate_password]
    )
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = Student
        fields = [
            'email',
            'first_name',
            'last_name',
            'roll_number',
            'department',
            'phone',
            'password',
            'password2',
        ]

    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {'password': "Passwords don't match."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop('password2')
        return Student.objects.create_user(**validated_data)


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(
        required=True,
        validators=[validate_password]
    )

    def validate_old_password(self, value):
        if not self.context['request'].user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model  = Student
        fields = [
            'first_name',
            'last_name',
            'phone',
            'address',
            'department',
            'profile_picture',
        ]