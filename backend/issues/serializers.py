from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.utils import timezone
from books.models import Book
from books.serializers import BookSerializer
from students.serializers import StudentSerializer
from .models import Issue

Student = get_user_model()


class IssueSerializer(serializers.ModelSerializer):
    # Read only - shows full details
    book_detail    = BookSerializer(source='book', read_only=True)
    student_detail = StudentSerializer(source='student', read_only=True)

    # Write only - accepts ids
    book    = serializers.PrimaryKeyRelatedField(
        queryset=Book.objects.all()
    )
    student = serializers.PrimaryKeyRelatedField(
        queryset=Student.objects.all()
    )

    # Computed fields
    is_overdue   = serializers.ReadOnlyField()
    days_overdue = serializers.ReadOnlyField()

    class Meta:
        model  = Issue
        fields = [
            'id',
            'book',
            'book_detail',
            'student',
            'student_detail',
            'issued_by',
            'issue_date',
            'due_date',
            'return_date',
            'status',
            'fine_amount',
            'fine_paid',
            'notes',
            'renewal_count',
            'is_overdue',
            'days_overdue',
            'created_at',
        ]
        read_only_fields = [
            'id',
            'issue_date',
            'status',
            'fine_amount',
            'created_at',
        ]

    def validate_book(self, book):
        """Check if book is available"""
        if book.available_copies <= 0:
            raise serializers.ValidationError(
                'No copies available for this book.'
            )
        return book

    def validate_student(self, student):
        """Check if student has less than 3 active issues"""
        active_issues = Issue.objects.filter(
            student=student,
            status__in=['issued', 'overdue', 'renewed']
        ).count()
        if active_issues >= 3:
            raise serializers.ValidationError(
                'Student already has 3 active issues. '
                'Please return a book first.'
            )
        return student

    def create(self, validated_data):
        from django.db import transaction
        with transaction.atomic():
            issue = Issue.objects.create(**validated_data)
            # Reduce available copies
            book = issue.book
            book.available_copies -= 1
            book.save()
        return issue


class ReturnSerializer(serializers.Serializer):
    fine_paid = serializers.BooleanField(default=False)
    notes     = serializers.CharField(
        required=False,
        allow_blank=True
    )


class RenewSerializer(serializers.Serializer):
    days = serializers.IntegerField(
        default=14,
        min_value=1,
        max_value=30
    )