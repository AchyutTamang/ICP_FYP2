from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from .models import Course, Category, Review
from .serializers import CourseSerializer, CategorySerializer, ReviewSerializer
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
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

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