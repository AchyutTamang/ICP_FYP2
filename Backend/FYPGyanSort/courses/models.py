from django.db import models
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.core.exceptions import ValidationError
from instructors.models import Instructor
from decimal import Decimal

def validate_file_size(value):
    if 'image' in value.content_type:
        if value.size > 10 * 1024 * 1024:  # 10MB in bytes
            raise ValidationError('Image size cannot exceed 10MB')
    elif 'video' in value.content_type:
        if value.size > 300 * 1024 * 1024:  # 300MB in bytes
            raise ValidationError('Video size cannot exceed 300MB')

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"

    def __str__(self):
        return self.name

class Review(models.Model):
    rating = models.IntegerField(
        choices=[(i, str(i)) for i in range(1, 6)],
        validators=[MinValueValidator(1)]
    )
    comment = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Rating: {self.rating}"

class Course(models.Model):
    instructor = models.ForeignKey(
        Instructor, 
        on_delete=models.CASCADE,
        limit_choices_to={'verification_status': 'verified', 'is_active': True}
    )
    title = models.CharField(max_length=200)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    course_price = models.DecimalField(
        max_digits=10, 
        decimal_places=2,
        validators=[MinValueValidator(Decimal('0.00'))]
    )
    description = models.TextField()
    course_thumbnail = models.ImageField(
        upload_to='course_thumbnails/',
        validators=[
            FileExtensionValidator(['jpg', 'jpeg', 'png']),
            validate_file_size
        ],
        help_text='Maximum file size: 10MB. Allowed formats: JPG, JPEG, PNG'
    )
    demo_video = models.FileField(
        upload_to='course_demos/',
        validators=[
            FileExtensionValidator(['mp4', 'webm']),
            validate_file_size
        ],
        help_text='Maximum file size: 300MB. Allowed formats: MP4, WEBM'
    )
    reviews = models.ManyToManyField(Review, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.title

    class Meta:
        ordering = ['-created_at']