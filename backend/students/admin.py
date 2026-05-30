from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Student


class StudentAdmin(UserAdmin):
    model = Student
    list_display = [
        'email',
        'first_name',
        'last_name',
        'roll_number',
        'department',
        'role',
        'is_active',
    ]
    list_filter = ['role', 'is_active', 'department']
    search_fields = ['email', 'first_name', 'last_name', 'roll_number']
    ordering = ['-date_joined']

    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': (
            'first_name',
            'last_name',
            'roll_number',
            'department',
            'phone',
            'address',
            'profile_picture',
        )}),
        ('Permissions', {'fields': (
            'role',
            'is_active',
            'is_staff',
            'is_superuser',
        )}),
        ('Important Dates', {'fields': ('last_login',)}),
    )

    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'email',
                'first_name',
                'last_name',
                'roll_number',
                'department',
                'role',
                'password1',
                'password2',
            ),
        }),
    )


admin.site.register(Student, StudentAdmin)