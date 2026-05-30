from django.urls import path
from . import views

urlpatterns = [
    # List and create issues
    path('',                      views.IssueListCreateView.as_view(), name='issue_list'),

    # Single issue detail
    path('<int:pk>/',             views.IssueDetailView.as_view(),     name='issue_detail'),

    # Return a book
    path('<int:pk>/return/',      views.ReturnBookView.as_view(),      name='issue_return'),

    # Renew a book
    path('<int:pk>/renew/',       views.RenewBookView.as_view(),       name='issue_renew'),

    # Statistics
    path('stats/',                views.IssueStatsView.as_view(),      name='issue_stats'),
]