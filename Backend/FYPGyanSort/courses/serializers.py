from rest_framework import serializers
from .models import Course, Category, Review, Content, Lesson, Module
import boto3
from botocore.exceptions import NoCredentialsError
from django.conf import settings
import os
import uuid


class CategorySerializer(serializers.ModelSerializer):
    name = serializers.CharField(required=True, max_length=100)
    description = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Category
        fields = ['id', 'name', 'description', 'created_at']
        read_only_fields = ['id', 'created_at']

    def create(self, validated_data):
        name = validated_data.get('name', '').strip()
        description = validated_data.get('description', '').strip()
        
        # Check if category with this name already exists
        if Category.objects.filter(name__iexact=name).exists():
            raise serializers.ValidationError({'name': 'A category with this name already exists'})
            
        return Category.objects.create(
            name=name,
            description=description
        )

    def validate_name(self, value):
        # Ensure name is not empty and has valid length
        if not value.strip():
            raise serializers.ValidationError("Category name cannot be empty")
        if len(value) > 100:
            raise serializers.ValidationError("Category name cannot exceed 100 characters")
        return value.strip()

    def validate_description(self, value):
        # Ensure description is not None
        return value or ""

class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model = Review
        fields = '__all__'

class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.fullname', read_only=True)

    class Meta:
        model = Course
        fields = ['id', 'title', 'instructor', 'instructor_name', 'category', 
                 'category_name', 'course_price', 'description', 'course_thumbnail', 
                 'demo_video', 'reviews', 'is_active', 'created_at']


class ContentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Content
        fields = ['id', 'lesson', 'title', 'content_type', 'file', 'cloudfront_url', 
                 'text_content', 'order', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        file = validated_data.get('file')
        content_type = validated_data.get('content_type')
        
        # If this is a video file, upload to S3
        if file and content_type in ['video', 'mp4', 'webm']:
            s3_url = self.upload_to_s3(file)
            if s3_url:
                validated_data['cloudfront_url'] = s3_url
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        file = validated_data.get('file')
        content_type = validated_data.get('content_type')
        
        # If this is a video file and it's changed, upload to S3
        if file and content_type in ['video', 'mp4', 'webm']:
            s3_url = self.upload_to_s3(file)
            if s3_url:
                validated_data['cloudfront_url'] = s3_url
        
        return super().update(instance, validated_data)
    
    def upload_to_s3(self, file):
        try:
            # Generate a unique filename
            file_extension = os.path.splitext(file.name)[1]
            unique_filename = f"{uuid.uuid4()}{file_extension}"
            s3_path = f"gyansort/{unique_filename}"
            
            # Initialize S3 client
            s3_client = boto3.client(
                's3',
                aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
                aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                region_name=settings.AWS_S3_REGION_NAME
            )
            
            # Upload file to S3
            s3_client.upload_fileobj(
                file,
                settings.AWS_STORAGE_BUCKET_NAME,
                s3_path,
                ExtraArgs={
                    'ContentType': file.content_type,
                    'ACL': 'public-read'
                }
            )
            
            # Return the S3 URL
            if hasattr(settings, 'AWS_CLOUDFRONT_DOMAIN') and settings.AWS_CLOUDFRONT_DOMAIN:
                return f"https://{settings.AWS_CLOUDFRONT_DOMAIN}/{s3_path}"
            else:
                return f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/{s3_path}"
                
        except NoCredentialsError:
            print("AWS credentials not available")
            return None
        except Exception as e:
            print(f"Error uploading to S3: {str(e)}")
            return None

class LessonSerializer(serializers.ModelSerializer):
    contents = ContentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'title', 'description', 'order', 'duration', 
                 'contents', 'created_at', 'updated_at']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'order', 
                 'lessons', 'created_at', 'updated_at']

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.fullname', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'instructor', 'instructor_name', 'category', 
                 'category_name', 'course_price', 'description', 'course_thumbnail', 
                 'demo_video', 'reviews', 'modules', 'is_active', 'created_at', 'updated_at']


class CourseSerializer(serializers.ModelSerializer):
    category_name = serializers.SerializerMethodField()
    instructor_name = serializers.SerializerMethodField()
    display_price = serializers.SerializerMethodField()
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'description', 'course_price', 'display_price', 'course_thumbnail', 
                 'demo_video', 'category', 'category_name', 'instructor', 'instructor_name', 
                 'created_at', 'updated_at', 'is_active', 'is_free']
    
    def get_category_name(self, obj):
        return obj.category.name if obj.category else None
    
    def get_instructor_name(self, obj):
        return obj.instructor.fullname if obj.instructor else None
    
    def get_display_price(self, obj):
        if obj.is_free or obj.course_price == 0:
            return "Free"
        return f"Rs{obj.course_price:.2f}"

class LessonSerializer(serializers.ModelSerializer):
    contents = ContentSerializer(many=True, read_only=True)
    
    class Meta:
        model = Lesson
        fields = ['id', 'module', 'title', 'description', 'order', 'duration', 
                 'contents', 'created_at', 'updated_at']

class ModuleSerializer(serializers.ModelSerializer):
    lessons = LessonSerializer(many=True, read_only=True)
    
    class Meta:
        model = Module
        fields = ['id', 'course', 'title', 'description', 'order', 
                 'lessons', 'created_at', 'updated_at']

class CourseDetailSerializer(serializers.ModelSerializer):
    modules = ModuleSerializer(many=True, read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    instructor_name = serializers.CharField(source='instructor.fullname', read_only=True)
    
    class Meta:
        model = Course
        fields = ['id', 'title', 'instructor', 'instructor_name', 'category', 
                 'category_name', 'course_price', 'description', 'course_thumbnail', 
                 'demo_video', 'reviews', 'modules', 'is_active', 'created_at', 'updated_at']