from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Forum, ForumMembership, ForumMessage, ForumAttachment
from .serializers import ForumSerializer, ForumMembershipSerializer, ForumMessageSerializer, ForumAttachmentSerializer
from .permissions import IsVerifiedInstructor, IsVerifiedStudent, IsForumMember

class ForumViewSet(viewsets.ModelViewSet):
    serializer_class = ForumSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsVerifiedInstructor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        # Instructors can see forums they created
        if hasattr(user, 'instructor'):
            return Forum.objects.filter(created_by=user.instructor)
        
        # Students can see forums they are members of
        if hasattr(user, 'student'):
            return Forum.objects.filter(memberships__student=user.student, memberships__is_active=True)
        
        return Forum.objects.none()
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user.instructor)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated(), IsVerifiedStudent()])
    def join(self, request, pk=None):
        forum = self.get_object()
        student = request.user.student
        
        # Check if student is already a member
        if ForumMembership.objects.filter(forum=forum, student=student).exists():
            return Response({"error": "You are already a member of this forum"}, status=status.HTTP_400_BAD_REQUEST)
        
        # Create membership
        membership = ForumMembership(forum=forum, student=student)
        membership.save()
        
        return Response({"message": "Successfully joined the forum"}, status=status.HTTP_201_CREATED)
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated()])
    def leave(self, request, pk=None):
        forum = self.get_object()
        
        if hasattr(request.user, 'student'):
            student = request.user.student
            
            try:
                membership = ForumMembership.objects.get(forum=forum, student=student)
                membership.is_active = False
                membership.save()
                return Response({"message": "Successfully left the forum"}, status=status.HTTP_200_OK)
            except ForumMembership.DoesNotExist:
                return Response({"error": "You are not a member of this forum"}, status=status.HTTP_400_BAD_REQUEST)
        
        return Response({"error": "Only students can leave forums"}, status=status.HTTP_400_BAD_REQUEST)

class ForumMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ForumMessageSerializer
    permission_classes = [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get forum ID from URL parameter
        forum_id = self.request.query_params.get('forum')
        if not forum_id:
            return ForumMessage.objects.none()
        
        # Check if user has access to this forum
        if hasattr(user, 'instructor'):
            forum_exists = Forum.objects.filter(id=forum_id, created_by=user.instructor).exists()
        elif hasattr(user, 'student'):
            forum_exists = ForumMembership.objects.filter(forum_id=forum_id, student=user.student, is_active=True).exists()
        else:
            forum_exists = False
        
        if not forum_exists:
            return ForumMessage.objects.none()
        
        return ForumMessage.objects.filter(forum_id=forum_id).order_by('sent_at')
    
    def perform_create(self, serializer):
        user = self.request.user
        
        if hasattr(user, 'instructor'):
            sender_type = 'instructor'
            sender_id = user.instructor.id
        elif hasattr(user, 'student'):
            sender_type = 'student'
            sender_id = user.student.id
        else:
            raise permissions.PermissionDenied("Invalid user type")
        
        serializer.save(sender_type=sender_type, sender_id=sender_id)

class ForumAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = ForumAttachmentSerializer
    permission_classes = [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get message ID from URL parameter
        message_id = self.request.query_params.get('message')
        if not message_id:
            return ForumAttachment.objects.none()
        
        # Check if user has access to the forum this message belongs to
        try:
            message = ForumMessage.objects.get(id=message_id)
            forum = message.forum
            
            if hasattr(user, 'instructor') and forum.created_by == user.instructor:
                return ForumAttachment.objects.filter(message_id=message_id)
            elif hasattr(user, 'student') and forum.memberships.filter(student=user.student, is_active=True).exists():
                return ForumAttachment.objects.filter(message_id=message_id)
            
            return ForumAttachment.objects.none()
        except ForumMessage.DoesNotExist:
            return ForumAttachment.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        message = ForumMessage.objects.get(id=self.request.data.get('message'))
        
        if hasattr(user, 'instructor'):
            sender_type = 'instructor'
            sender_id = user.instructor.id
        elif hasattr(user, 'student'):
            sender_type = 'student'
            sender_id = user.student.id
        else:
            raise permissions.PermissionDenied("Invalid user type")
        
        # Validate file type (PDF or image)
        file = self.request.FILES.get('file')
        file_type = file.content_type
        
        if not (file_type.startswith('image/') or file_type == 'application/pdf'):
            raise serializers.ValidationError("Only images and PDF files are allowed")
        
        serializer.save(
            forum=message.forum,
            sender_type=sender_type,
            sender_id=sender_id,
            file_type=file_type,
            file_name=file.name
        )