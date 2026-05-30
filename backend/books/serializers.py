from rest_framework import serializers
from .models import Book, Author, Category


class CategorySerializer(serializers.ModelSerializer):
    book_count = serializers.SerializerMethodField()

    class Meta:
        model  = Category
        fields = [
            'id',
            'name',
            'description',
            'book_count',
            'created_at',
        ]

    def get_book_count(self, obj):
        return obj.books.count()


class AuthorSerializer(serializers.ModelSerializer):
    full_name  = serializers.ReadOnlyField()
    book_count = serializers.SerializerMethodField()

    class Meta:
        model  = Author
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'bio',
            'book_count',
        ]

    def get_book_count(self, obj):
        return obj.books.count()


class BookSerializer(serializers.ModelSerializer):
    authors      = AuthorSerializer(many=True, read_only=True)
    category     = CategorySerializer(read_only=True)
    author_ids   = serializers.PrimaryKeyRelatedField(
        queryset=Author.objects.all(),
        source='authors',
        many=True,
        write_only=True,
        required=False
    )
    category_id  = serializers.PrimaryKeyRelatedField(
        queryset=Category.objects.all(),
        source='category',
        write_only=True,
        required=False
    )
    is_available = serializers.ReadOnlyField()

    class Meta:
        model  = Book
        fields = [
            'id',
            'title',
            'authors',
            'author_ids',
            'category',
            'category_id',
            'isbn',
            'publisher',
            'published_date',
            'description',
            'cover_image',
            'total_copies',
            'available_copies',
            'is_available',
            'location',
            'language',
            'pages',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def create(self, validated_data):
        authors = validated_data.pop('authors', [])
        book    = Book.objects.create(**validated_data)
        book.authors.set(authors)
        return book

    def update(self, instance, validated_data):
        authors = validated_data.pop('authors', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if authors is not None:
            instance.authors.set(authors)
        return instance