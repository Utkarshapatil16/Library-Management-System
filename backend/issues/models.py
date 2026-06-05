from django.db import models
from django.conf import settings
from django.utils import timezone
from datetime import timedelta


class Issue(models.Model):
    STATUS_CHOICES = [
        ('issued',   'Issued'),
        ('returned', 'Returned'),
        ('overdue',  'Overdue'),
        ('renewed',  'Renewed'),
    ]

    book          = models.ForeignKey(
                        'books.Book',
                        on_delete=models.PROTECT,
                        related_name='issues'
                    )
    student       = models.ForeignKey(
                        settings.AUTH_USER_MODEL,
                        on_delete=models.PROTECT,
                        related_name='issues'
                    )
    issued_by     = models.ForeignKey(
                        settings.AUTH_USER_MODEL,
                        on_delete=models.SET_NULL,
                        null=True,
                        blank=True,
                        related_name='issued_by'
                    )
    issue_date    = models.DateField(auto_now_add=True)
    due_date      = models.DateField(null=True, blank=True)
    return_date   = models.DateField(null=True, blank=True)
    status        = models.CharField(
                        max_length=20,
                        choices=STATUS_CHOICES,
                        default='issued'
                    )
    fine_amount   = models.DecimalField(
                        max_digits=8,
                        decimal_places=2,
                        default=0.00
                    )
    fine_paid     = models.BooleanField(default=False)
    notes         = models.TextField(blank=True)
    renewal_count = models.PositiveIntegerField(default=0)
    created_at    = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.student} → {self.book.title} ({self.status})"

    def save(self, *args, **kwargs):
        # Set default due date 14 days from today
        if not self.due_date:
            self.due_date = timezone.now().date() + timedelta(days=14)
        # Auto mark overdue
        if self.status == 'issued' and timezone.now().date() > self.due_date:
            self.status      = 'overdue'
            self.fine_amount = (
                timezone.now().date() - self.due_date
            ).days * 5  # ₹5 per day fine
        super().save(*args, **kwargs)

    @property
    def days_overdue(self):
        if self.status == 'returned':
            return 0
        overdue = (timezone.now().date() - self.due_date).days
        return max(0, overdue)

    @property
    def is_overdue(self):
        return self.days_overdue > 0