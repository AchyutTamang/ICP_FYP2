from rest_framework import permissions
import logging
import jwt
from django.conf import settings

# Set up logging
logger = logging.getLogger(__name__)

class IsVerifiedInstructor(permissions.BasePermission):
    """
    Custom permission to only allow verified instructors to create forums.
    """
    def has_permission(self, request, view):
        # For safe methods like GET, allow access
        if request.method in permissions.SAFE_METHODS:
            return True
            
        # For unsafe methods, check if user is a verified instructor
        user = request.user
        
        # Check if user has instructor attribute
        if hasattr(user, 'instructor'):
            return user.instructor.verification_status == 'verified'
            
        # Try to find instructor by email
        from instructors.models import Instructor
        try:
            instructor = Instructor.objects.get(email=user.email)
            return instructor.verification_status == 'verified'
        except Instructor.DoesNotExist:
            return False

class IsVerifiedStudent(permissions.BasePermission):
    """
    Custom permission to only allow verified students to join forums.
    """
    message = "Only verified students can join forums."

    def has_permission(self, request, view):
        # Check if user is authenticated and is a student
        if not hasattr(request.user, 'student'):
            return False
        
        # Check if the student's email is verified
        return hasattr(request.user.student, 'email_verified') and request.user.student.email_verified

class IsForumMember(permissions.BasePermission):
    """
    Custom permission to only allow forum members to access forum content.
    """
    message = "You must be a member of this forum to access its content."

    def has_object_permission(self, request, view, obj):
        # Allow instructors who created the forum
        if hasattr(request.user, 'instructor') and obj.created_by == request.user.instructor:
            return True
        
        # Allow students who are members of the forum
        if hasattr(request.user, 'student'):
            return obj.memberships.filter(student=request.user.student, is_active=True).exists()
        
        return False