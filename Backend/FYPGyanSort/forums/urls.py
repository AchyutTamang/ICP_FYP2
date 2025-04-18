from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumViewSet, ForumMessageViewSet, ForumAttachmentViewSet

router = DefaultRouter()
router.register(r'forums', ForumViewSet, basename='forum')
router.register(r'messages', ForumMessageViewSet, basename='forum-message')
router.register(r'attachments', ForumAttachmentViewSet, basename='forum-attachment')

urlpatterns = [
    path('', include(router.urls)),
]