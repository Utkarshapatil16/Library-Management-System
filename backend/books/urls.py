from django.urls import path
from . import views

urlpatterns = [
    # Books
    path('',                     views.BookListCreateView.as_view(),     name='book_list'),
    path('<int:pk>/',            views.BookDetailView.as_view(),         name='book_detail'),
    path('stats/',               views.BookStatsView.as_view(),          name='book_stats'),

    # Categories
    path('categories/',          views.CategoryListCreateView.as_view(), name='category_list'),
    path('categories/<int:pk>/', views.CategoryDetailView.as_view(),     name='category_detail'),

    # Authors
    path('authors/',             views.AuthorListCreateView.as_view(),   name='author_list'),
    path('authors/<int:pk>/',    views.AuthorDetailView.as_view(),       name='author_detail'),
]