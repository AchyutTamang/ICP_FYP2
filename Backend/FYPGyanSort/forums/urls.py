from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ForumViewSet, ForumMessageViewSet, ForumAttachmentViewSet, ForumParticipantViewSet

router = DefaultRouter()
router.register(r'forums', ForumViewSet, basename='forum')
router.register(r'messages', ForumMessageViewSet, basename='forum-message')
router.register(r'attachments', ForumAttachmentViewSet, basename='forum-attachment')
router.register(r'participants', ForumParticipantViewSet, basename='forum-participant')

urlpatterns = [
    path('', include(router.urls)),
    path('forums/<int:pk>/join/', ForumViewSet.as_view({'post': 'join'}), name='forum-join'),
    path('forums/<int:pk>/leave/', ForumViewSet.as_view({'post': 'leave'}), name='forum-leave'),
    path('forums/<int:pk>/participants/', ForumViewSet.as_view({'get': 'participants'}), name='forum-participants'),
]
