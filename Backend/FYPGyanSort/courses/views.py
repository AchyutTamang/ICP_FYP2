from rest_framework import viewsets, permissions
from rest_framework.response import Response
from .models import Course, Category, Review
from .serializers import CourseSerializer, CategorySerializer, ReviewSerializer

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
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        queryset = Course.objects.all()
        if not self.request.user.is_superuser:
            if hasattr(self.request.user, 'instructor'):
                queryset = queryset.filter(instructor=self.request.user.instructor)
        return queryset

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user.instructor)