from django.contrib import admin
from .models import Book, Author, Category


class BookAdmin(admin.ModelAdmin):
    list_display = [
        'title',
        'isbn',
        'category',
        'total_copies',
        'available_copies',
        'language',
    ]
    list_filter  = ['category', 'language']
    search_fields = ['title', 'isbn', 'authors__first_name']
    ordering     = ['title']


class AuthorAdmin(admin.ModelAdmin):
    list_display  = ['first_name', 'last_name']
    search_fields = ['first_name', 'last_name']


class CategoryAdmin(admin.ModelAdmin):
    list_display  = ['name', 'description']
    search_fields = ['name']


admin.site.register(Book, BookAdmin)
admin.site.register(Author, AuthorAdmin)
admin.site.register(Category, CategoryAdmin)