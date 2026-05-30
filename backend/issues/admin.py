from django.contrib import admin
from .models import Issue


class IssueAdmin(admin.ModelAdmin):
    list_display = [
        'student',
        'book',
        'issue_date',
        'due_date',
        'return_date',
        'status',
        'fine_amount',
        'fine_paid',
    ]
    list_filter   = ['status', 'fine_paid']
    search_fields = [
        'student__email',
        'student__first_name',
        'book__title',
    ]
    ordering      = ['-created_at']


admin.site.register(Issue, IssueAdmin)