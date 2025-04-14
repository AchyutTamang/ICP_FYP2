from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from rest_framework.decorators import action
from .models import Course, Category, Review, Module, Lesson, Content
from .serializers import (CourseSerializer, CategorySerializer, ReviewSerializer,
                         ModuleSerializer, LessonSerializer, ContentSerializer,
                         CourseDetailSerializer)
from instructors.models import Instructor

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class ReviewViewSet(viewsets.ModelViewSet):
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

class CourseViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return CourseDetailSerializer
        return CourseSerializer

    def get_queryset(self):
        queryset = Course.objects.all()
        # For GET requests, show all courses to everyone
        if self.request.method == 'GET':
            return queryset
        # For other methods, filter appropriately
        if hasattr(self.request.user, 'instructor'):
            return queryset.filter(instructor=self.request.user.instructor)
        return queryset.none()

    def perform_create(self, serializer):
        # Extract token claims
        auth_header = self.request.META.get('HTTP_AUTHORIZATION', '')
        print(f"Auth header: {auth_header[:50]}...")
        
        # Check token claims for user_type
        if hasattr(self.request.auth, 'payload'):
            token_payload = self.request.auth.payload
            print(f"Token payload: {token_payload}")
            
            # If token indicates this is an instructor
            if token_payload.get('user_type') == 'instructor':
                instructor_email = token_payload.get('email')
                print(f"Token indicates instructor: {instructor_email}")
                
                try:
                    instructor = Instructor.objects.get(email=instructor_email)
                    print(f"Found instructor: {instructor}")
                    if instructor.verification_status != 'verified':
                        raise PermissionDenied("Only verified instructors can create courses")
                    serializer.save(instructor=instructor)
                    return
                except Instructor.DoesNotExist:
                    print(f"No instructor found with email: {instructor_email}")
        
        # If we get here, try the regular approach
        if hasattr(self.request.user, 'instructor'):
            serializer.save(instructor=self.request.user.instructor)
            return
            
        # Last resort - try to find an instructor with matching email
        try:
            instructor = Instructor.objects.get(email=self.request.user.email)
            serializer.save(instructor=instructor)
            return
        except Instructor.DoesNotExist:
            pass
            
        raise PermissionDenied("Only instructors can create courses")
    
    @action(detail=True, methods=['get'])
    def modules(self, request, pk=None):
        course = self.get_object()
        modules = Module.objects.filter(course=course)
        serializer = ModuleSerializer(modules, many=True)
        return Response(serializer.data)

class ModuleViewSet(viewsets.ModelViewSet):
    serializer_class = ModuleSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Module.objects.all()
    
    def perform_create(self, serializer):
        course = serializer.validated_data['course']
        
        # Check if user is an instructor directly
        if hasattr(self.request.auth, 'payload'):
            token_payload = self.request.auth.payload
            if token_payload.get('user_type') == 'instructor':
                instructor_email = token_payload.get('email')
                try:
                    instructor = Instructor.objects.get(email=instructor_email)
                    if course.instructor != instructor:
                        raise PermissionDenied("You can only add modules to your own courses")
                    serializer.save()
                    return
                except Instructor.DoesNotExist:
                    pass
        
        # Regular approach
        if hasattr(self.request.user, 'instructor'):
            if course.instructor != self.request.user.instructor:
                raise PermissionDenied("You can only add modules to your own courses")
            serializer.save()
            return
            
        raise PermissionDenied("Only instructors can add modules")
    
    @action(detail=True, methods=['get'])
    def lessons(self, request, pk=None):
        module = self.get_object()
        lessons = Lesson.objects.filter(module=module)
        serializer = LessonSerializer(lessons, many=True)
        return Response(serializer.data)

class LessonViewSet(viewsets.ModelViewSet):
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Lesson.objects.all()
    
    def perform_create(self, serializer):
        module = serializer.validated_data['module']
        
        # Check if user is an instructor directly
        if hasattr(self.request.auth, 'payload'):
            token_payload = self.request.auth.payload
            if token_payload.get('user_type') == 'instructor':
                instructor_email = token_payload.get('email')
                try:
                    instructor = Instructor.objects.get(email=instructor_email)
                    if module.course.instructor != instructor:
                        raise PermissionDenied("You can only add lessons to your own courses")
                    serializer.save()
                    return
                except Instructor.DoesNotExist:
                    pass
        
        # Regular approach
        if hasattr(self.request.user, 'instructor'):
            if module.course.instructor != self.request.user.instructor:
                raise PermissionDenied("You can only add lessons to your own courses")
            serializer.save()
            return
            
        raise PermissionDenied("Only instructors can add lessons")
    
    @action(detail=True, methods=['get'])
    def contents(self, request, pk=None):
        lesson = self.get_object()
        contents = Content.objects.filter(lesson=lesson)
        serializer = ContentSerializer(contents, many=True)
        return Response(serializer.data)

class ContentViewSet(viewsets.ModelViewSet):
    serializer_class = ContentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        return Content.objects.all()
    
    def perform_create(self, serializer):
        lesson = serializer.validated_data['lesson']
        
        # Check if user is an instructor directly
        if hasattr(self.request.auth, 'payload'):
            token_payload = self.request.auth.payload
            if token_payload.get('user_type') == 'instructor':
                instructor_email = token_payload.get('email')
                try:
                    instructor = Instructor.objects.get(email=instructor_email)
                    if lesson.module.course.instructor != instructor:
                        raise PermissionDenied("You can only add content to your own courses")
                    content = serializer.save()
                    
                    # If this is a video, process it for CloudFront
                    if content.content_type == 'video' and content.file:
                        self.process_video_for_cloudfront(content)
                    return
                except Instructor.DoesNotExist:
                    pass
        
        # Regular approach
        if hasattr(self.request.user, 'instructor'):
            if lesson.module.course.instructor != self.request.user.instructor:
                raise PermissionDenied("You can only add content to your own courses")
            content = serializer.save()
            
            # If this is a video, process it for CloudFront
            if content.content_type == 'video' and content.file:
                self.process_video_for_cloudfront(content)
            return
            
        raise PermissionDenied("Only instructors can add content")
    
    def process_video_for_cloudfront(self, content):
        # This would be implemented with AWS SDK
        # For now, we'll just add a placeholder
        try:
            from .utils import CloudFrontManager
            manager = CloudFrontManager()
            cloudfront_url = manager.upload_file(content.file.path, 'video/mp4')
            content.cloudfront_url = cloudfront_url
            content.save()
        except ImportError:
            # If AWS integration is not set up yet, use a placeholder
            content.cloudfront_url = f"https://your-cloudfront-distribution.cloudfront.net/{content.file.name}"
            content.save()