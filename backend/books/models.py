from django.db import models


class Category(models.Model):
    name        = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at  = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = 'categories'
        ordering = ['name']

    def __str__(self):
        return self.name


class Author(models.Model):
    first_name = models.CharField(max_length=100)
    last_name  = models.CharField(max_length=100)
    bio        = models.TextField(blank=True)

    class Meta:
        ordering = ['last_name']

    def __str__(self):
        return f"{self.first_name} {self.last_name}"

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"


class Book(models.Model):
    title            = models.CharField(max_length=300)
    authors          = models.ManyToManyField(Author, related_name='books')
    category         = models.ForeignKey(
                           Category,
                           on_delete=models.SET_NULL,
                           null=True,
                           related_name='books'
                       )
    isbn             = models.CharField(max_length=20, unique=True)
    publisher        = models.CharField(max_length=200, blank=True)
    published_date   = models.DateField(null=True, blank=True)
    description      = models.TextField(blank=True)
    cover_image      = models.ImageField(
                           upload_to='book_covers/',
                           blank=True,
                           null=True
                       )
    total_copies     = models.PositiveIntegerField(default=1)
    available_copies = models.PositiveIntegerField(default=1)
    location         = models.CharField(max_length=100, blank=True)
    language         = models.CharField(max_length=50, default='English')
    pages            = models.PositiveIntegerField(null=True, blank=True)
    created_at       = models.DateTimeField(auto_now_add=True)
    updated_at       = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['title']

    def __str__(self):
        return self.title

    @property
    def is_available(self):
        return self.available_copies > 0