from rest_framework import serializers
from .models import Course, Category, Review, Content, Lesson, Module


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'

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
        return obj.instructor.user.get_full_name() if obj.instructor and hasattr(obj.instructor, 'user') else None
    
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