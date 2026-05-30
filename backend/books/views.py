from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters import rest_framework as filters
from .models import Book, Author, Category
from .serializers import BookSerializer, AuthorSerializer, CategorySerializer


class IsLibrarianOrReadOnly(permissions.BasePermission):
    """
    Librarian and Admin can Add, Edit, Delete books
    Students can only View books
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return (
            request.user.is_authenticated and
            request.user.role in ['admin', 'librarian']
        )


class BookFilter(filters.FilterSet):
    title    = filters.CharFilter(lookup_expr='icontains')
    language = filters.CharFilter(lookup_expr='icontains')
    category = filters.NumberFilter(field_name='category__id')
    available = filters.BooleanFilter(method='filter_available')

    class Meta:
        model  = Book
        fields = ['title', 'language', 'category', 'available']

    def filter_available(self, queryset, name, value):
        if value:
            return queryset.filter(available_copies__gt=0)
        return queryset.filter(available_copies=0)


class BookListCreateView(generics.ListCreateAPIView):
    """
    GET  → List all books (all logged in users)
    POST → Add new book (admin/librarian only)
    """
    queryset           = Book.objects.prefetch_related('authors').select_related('category')
    serializer_class   = BookSerializer
    permission_classes = [IsLibrarianOrReadOnly]
    filterset_class    = BookFilter
    search_fields      = ['title', 'isbn', 'authors__first_name', 'authors__last_name']
    ordering_fields    = ['title', 'created_at', 'available_copies']
    ordering           = ['title']


class BookDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    → View single book
    PUT    → Update book (admin/librarian only)
    DELETE → Delete book (admin/librarian only)
    """
    queryset           = Book.objects.prefetch_related('authors').select_related('category')
    serializer_class   = BookSerializer
    permission_classes = [IsLibrarianOrReadOnly]

    def destroy(self, request, *args, **kwargs):
        book = self.get_object()
        if book.available_copies < book.total_copies:
            return Response(
                {'error': 'Cannot delete book that has active issues.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        book.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CategoryListCreateView(generics.ListCreateAPIView):
    """
    GET  → List all categories
    POST → Add new category (admin/librarian only)
    """
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [IsLibrarianOrReadOnly]


class CategoryDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    → View single category
    PUT    → Update category
    DELETE → Delete category
    """
    queryset           = Category.objects.all()
    serializer_class   = CategorySerializer
    permission_classes = [IsLibrarianOrReadOnly]


class AuthorListCreateView(generics.ListCreateAPIView):
    """
    GET  → List all authors
    POST → Add new author (admin/librarian only)
    """
    queryset           = Author.objects.all()
    serializer_class   = AuthorSerializer
    permission_classes = [IsLibrarianOrReadOnly]
    search_fields      = ['first_name', 'last_name']


class AuthorDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    GET    → View single author
    PUT    → Update author
    DELETE → Delete author
    """
    queryset           = Author.objects.all()
    serializer_class   = AuthorSerializer
    permission_classes = [IsLibrarianOrReadOnly]


class BookStatsView(APIView):
    """
    GET → Get book statistics
    """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        books = Book.objects.all()
        total_copies    = sum(b.total_copies for b in books)
        borrowed_copies = sum(
            b.total_copies - b.available_copies for b in books
        )
        return Response({
            'total_books':      books.count(),
            'available_books':  books.filter(available_copies__gt=0).count(),
            'total_categories': Category.objects.count(),
            'total_authors':    Author.objects.count(),
            'total_copies':     total_copies,
            'borrowed_copies':  borrowed_copies,
        })