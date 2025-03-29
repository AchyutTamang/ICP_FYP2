from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils import timezone
import uuid

class StudentManager(BaseUserManager):
    def create_user(self, email, fullname, password=None, **extra_fields):
        if not email:
            raise ValueError("Email is required")
        user = self.model(email=self.normalize_email(email), fullname=fullname, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user
    
    def create_superuser(self, email, fullname, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('email_verified', True)
        
        if extra_fields.get('is_staff') is not True:
            raise ValueError('Superuser must have is_staff=True.')
        if extra_fields.get('is_superuser') is not True:
            raise ValueError('Superuser must have is_superuser=True.')
            
        return self.create_user(email, fullname, password, **extra_fields)

class Student(AbstractBaseUser, PermissionsMixin):
    fullname = models.CharField(max_length=255)
    email = models.EmailField(unique=True)
    profile_pic = models.ImageField(upload_to="profile_pics/", default="default.jpg")
    date_joined = models.DateTimeField(auto_now_add=True)
    student_id = models.CharField(max_length=15, unique=True, blank=True, null=True)
    enrollment_count = models.IntegerField(default=0)
    is_active = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    email_verified = models.BooleanField(default=False)
    verification_status = models.CharField(
        max_length=20, 
        choices=[('unverified', 'Unverified'), ('verified', 'Verified')],
        default='unverified'
    )

    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to.',
        related_name='student_set',
        related_query_name='student',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name='student_set',
        related_query_name='student',
    )

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["fullname"]

    objects = StudentManager()
    
    def save(self, *args, **kwargs):
        if not self.student_id:
            year = timezone.now().year
            random_num = str(uuid.uuid4().int)[:4]
            self.student_id = f"STU-{year}-{random_num}"
        
        if self.email_verified:
            self.verification_status = 'verified'
        else:
            self.verification_status = 'unverified'
            
        super().save(*args, **kwargs)

    def has_perm(self, perm, obj=None):
        return self.is_superuser

    def has_module_perms(self, app_label):
        return self.is_superuser

    def __str__(self):
        return self.email