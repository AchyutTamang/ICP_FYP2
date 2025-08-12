from django.db import models
from django.core.validators import FileExtensionValidator, MinValueValidator
from django.core.exceptions import ValidationError
from instructors.models import Instructor
from decimal import Decimal
from .storage_backends import CourseVideoS3Storage
from django.core.files.storage import FileSystemStorage
from django.conf import settings

local_storage = FileSystemStorage()
s3_video_storage = CourseVideoS3Storage()

def content_upload_to(instance, filename):
    # Optional: different upload paths for different content types
    if instance.content_type == 'video':
        return f'course_content_videos/{filename}'
    return f'content/{filename}'

def validate_file_size(value):
    if 'image' in value.content_type:
        if value.size > 10 * 1024 * 1024:  # 10MB in bytes
            raise ValidationError('Image size cannot exceed 10MB')
    elif 'video' in value.content_type:
        if value.size > 300 * 1024 * 1024:  # 300MB in bytes
            raise ValidationError('Video size cannot exceed 300MB')

# Category
class Category(models.Model):
    CATEGORY_CHOICES = [
        ('web_dev', 'Web Development'),
        ('graphic_design', 'Graphic Design'),
        ('data_science', 'Data Science & Analytics'),
        ('digital_marketing', 'Digital Marketing'),
        ('personal_finance', 'Personal Finance'),
        ('entrepreneurship', 'Entrepreneurship & Startups'),
        ('photography', 'Photography & Videography'),
        ('fitness', 'Fitness & Wellness'),
        ('language', 'Language Learning'),
        ('mobile_dev', 'Mobile App Development'),
        ('music', 'Music & Audio Production'),
        ('ui_ux', 'UI/UX Design'),
        ('software_tools', 'Software & Tools'),
        ('teaching', 'Teaching & Academics'),
        ('project_management', 'Project Management & Leadership'),
    ]

    name = models.CharField(max_length=100, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Categories"
        constraints = [
            models.UniqueConstraint(
                fields=['name'],
                name='unique_category_name_case_insensitive',
                condition=models.Q(),
            )
        ]

    def __str__(self):
        return dict(self.CATEGORY_CHOICES).get(self.name, self.name)

    @classmethod
    def get_default_description(cls, category_name):
        descriptions = {
            'web_dev': 'Learn to build websites using HTML, CSS, JavaScript, Django, React, etc.',
            'graphic_design': 'Courses on Photoshop, Illustrator, Canva, logo design, etc.',
            'data_science': 'Python, R, machine learning, statistics, data visualization.',
            'digital_marketing': 'SEO, social media marketing, Google Ads, email marketing.',
            'personal_finance': 'Budgeting, investing, savings, cryptocurrencies.',
            'entrepreneurship': 'Business planning, pitching, MVPs, startup growth.',
            'photography': 'DSLR skills, mobile photography, editing in Premiere Pro.',
            'fitness': 'Home workouts, yoga, nutrition, mindfulness, meditation.',
            'language': 'English, Spanish, French, Nepali, and other language courses.',
            'mobile_dev': 'Android, iOS, Flutter, React Native, mobile UI/UX.',
            'music': 'Guitar, piano, FL Studio, singing, mixing/mastering.',
            'ui_ux': 'Wireframing, Figma, Adobe XD, design principles.',
            'software_tools': 'Excel, Word, PowerPoint, Google Workspace, productivity tools.',
            'teaching': 'Math, science, humanities, exam prep, online teaching.',
            'project_management': 'Agile, Scrum, team management, communication.',
        }
        return descriptions.get(category_name, '')
        
    def save(self, *args, **kwargs):
        # Normalize the name to lowercase before saving
        if self.name:
            self.name = self.name.strip()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name

# Review
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

# Course
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
    is_free = models.BooleanField(default=False)
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
        null=True,
        blank=True,
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
        
    def save(self, *args, **kwargs):
        # If price is 0, automatically mark as free
        if self.course_price == Decimal('0.00'):
            self.is_free = True
        super().save(*args, **kwargs)

    class Meta:
        ordering = ['-created_at']

# Module
class Module(models.Model):
    course = models.ForeignKey(Course, related_name='modules', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.course.title} - {self.title}"

# Lesson
class Lesson(models.Model):
    module = models.ForeignKey(Module, related_name='lessons', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    duration = models.PositiveIntegerField(help_text="Duration in minutes", default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

# Content
class Content(models.Model):
    CONTENT_TYPES = (
        ('video', 'Video'),
        ('document', 'Document'),
    )
    
    lesson = models.ForeignKey(Lesson, related_name='contents', on_delete=models.CASCADE)
    title = models.CharField(max_length=200)
    content_type = models.CharField(max_length=20, choices=CONTENT_TYPES)
    file = models.FileField(upload_to='content/', null=True, blank=True)
    text_content = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['order']

    def __str__(self):
        return self.title

    def save(self, *args, **kwargs):
        if self.file:
            if self.content_type == 'video':
                # Use S3 storage for video files
                self.file.storage = s3_video_storage
            else:
                # Use local storage for other files
                self.file.storage = local_storage
        super().save(*args, **kwargs)

    @property
    def cloudfront_url(self):
        """Dynamically generate the CloudFront URL for this file if present."""
        if self.file and self.file.name:
            return f"https://{settings.CLOUDFRONT_DOMAIN}/{self.file.name.lstrip('/')}"
        return None