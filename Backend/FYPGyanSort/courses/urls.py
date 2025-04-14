from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'courses', views.CourseViewSet, basename='course')
router.register(r'categories', views.CategoryViewSet)
router.register(r'reviews', views.ReviewViewSet)
router.register(r'modules', views.ModuleViewSet, basename='module')
router.register(r'lessons', views.LessonViewSet, basename='lesson')
router.register(r'contents', views.ContentViewSet, basename='content')

urlpatterns = [
    path('', include(router.urls)),
]