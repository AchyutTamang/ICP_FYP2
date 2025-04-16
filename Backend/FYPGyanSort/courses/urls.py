from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.reverse import reverse
from . import views

@api_view(['GET', 'POST', 'PUT', 'DELETE'])
def api_root(request, format=None):
    if request.method == 'GET':
        return Response({
            'courses': reverse('course-list', request=request, format=format),
            'categories': reverse('category-list', request=request, format=format),
            'reviews': reverse('review-list', request=request, format=format),
            'modules': reverse('module-list', request=request, format=format),
            'lessons': reverse('lesson-list', request=request, format=format),
            'contents': reverse('content-list', request=request, format=format),
        })
    else:
        # For other methods, return a helpful message
        return Response({
            "detail": "Please use a specific endpoint like /api/courses/courses/ instead of the root URL for this operation."
        }, status=405)  # 405 Method Not Allowed

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'categories', views.CategoryViewSet, basename='category')
router.register(r'reviews', views.ReviewViewSet, basename='review')
router.register(r'modules', views.ModuleViewSet, basename='module')
router.register(r'lessons', views.LessonViewSet, basename='lesson')
router.register(r'contents', views.ContentViewSet, basename='content')

urlpatterns = [
    path('', api_root, name='api-root'),
    path('', include(router.urls)),
]