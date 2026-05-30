from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.utils import timezone
from datetime import timedelta
from .models import Issue
from .serializers import IssueSerializer, ReturnSerializer, RenewSerializer


class IsLibrarian(permissions.BasePermission):
    """Only admin and librarian can issue and return books"""
    def has_permission(self, request, view):
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'librarian']
        )


class IssueListCreateView(generics.ListCreateAPIView):
    """
    GET  → List all issues
    POST → Issue a book (admin/librarian only)
    """
    serializer_class = IssueSerializer

    def get_permissions(self):
        if self.request.method == 'POST':
            return [IsLibrarian()]
        return [permissions.IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs   = Issue.objects.select_related(
            'book', 'student'
        ).all()

        # Students can only see their own issues
        if user.role == 'student':
            qs = qs.filter(student=user)

        # Filter by status
        status_filter = self.request.query_params.get('status')
        if status_filter:
            qs = qs.filter(status=status_filter)

        # Filter by student id
        student_id = self.request.query_params.get('student')
        if student_id and user.role in ['admin', 'librarian']:
            qs = qs.filter(student_id=student_id)

        # Filter by book id
        book_id = self.request.query_params.get('book')
        if book_id:
            qs = qs.filter(book_id=book_id)

        return qs

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)


class IssueDetailView(generics.RetrieveAPIView):
    """
    GET → View single issue details
    """
    serializer_class   = IssueSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'librarian']:
            return Issue.objects.all()
        return Issue.objects.filter(student=user)


class ReturnBookView(APIView):
    """
    POST → Return a book (admin/librarian only)
    """
    permission_classes = [IsLibrarian]

    def post(self, request, pk):
        # Get issue
        try:
            issue = Issue.objects.select_related('book').get(pk=pk)
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Issue not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Check if already returned
        if issue.status == 'returned':
            return Response(
                {'error': 'Book already returned.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate request data
        serializer = ReturnSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        from django.db import transaction
        with transaction.atomic():
            # Update issue
            issue.return_date = timezone.now().date()
            issue.status      = 'returned'
            issue.fine_paid   = serializer.validated_data.get(
                'fine_paid', False
            )
            issue.notes       = serializer.validated_data.get(
                'notes', issue.notes
            )
            issue.save()

            # Increase available copies
            book = issue.book
            book.available_copies += 1
            book.save()

        return Response(IssueSerializer(issue).data)


class RenewBookView(APIView):
    """
    POST → Renew a book issue
    Students can renew their own issues
    Max 2 renewals allowed
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        # Get issue
        try:
            issue = Issue.objects.get(pk=pk)
        except Issue.DoesNotExist:
            return Response(
                {'error': 'Issue not found.'},
                status=status.HTTP_404_NOT_FOUND
            )

        # Students can only renew their own issues
        if (request.user.role == 'student' and
                issue.student != request.user):
            return Response(
                {'error': 'Not authorized.'},
                status=status.HTTP_403_FORBIDDEN
            )

        # Check if already returned
        if issue.status == 'returned':
            return Response(
                {'error': 'Cannot renew a returned issue.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Check max renewals
        if issue.renewal_count >= 2:
            return Response(
                {'error': 'Maximum 2 renewals allowed.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Validate request data
        serializer = RenewSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Update issue
        days               = serializer.validated_data.get('days', 14)
        issue.due_date     = timezone.now().date() + timedelta(days=days)
        issue.renewal_count += 1
        issue.status       = 'renewed'
        issue.save()

        return Response(IssueSerializer(issue).data)


class IssueStatsView(APIView):
    """
    GET → Get issue statistics
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.role in ['admin', 'librarian']:
            base = Issue.objects.all()
        else:
            base = Issue.objects.filter(student=user)

        return Response({
            'total_issues':   base.count(),
            'active_issues':  base.filter(
                status__in=['issued', 'overdue', 'renewed']
            ).count(),
            'overdue_issues': base.filter(status='overdue').count(),
            'returned_today': base.filter(
                return_date=timezone.now().date()
            ).count(),
        })