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
        print(f"IsVerifiedInstructor check for user: {request.user.email}")
        print(f"Request method: {request.method}")
        
        # For OPTIONS requests, always return True to allow CORS preflight
        if request.method == 'OPTIONS':
            print("OPTIONS request - allowing for CORS preflight")
            return True
        
        # Check JWT token directly
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                import jwt
                from django.conf import settings
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print(f"Token decoded: {decoded}")
                
                # If token indicates this is an instructor
                if decoded.get('user_type') == 'instructor':
                    email = decoded.get('email')
                    print(f"Token is for instructor: {email}")
                    
                    from instructors.models import Instructor
                    try:
                        instructor = Instructor.objects.get(email=email)
                        print(f"Found instructor by token email: {instructor}")
                        # Temporarily attach the instructor to the user
                        setattr(request.user, 'instructor', instructor)
                        return instructor.email_verified
                    except Instructor.DoesNotExist:
                        print(f"No instructor found with email from token: {email}")
            except Exception as e:
                print(f"Error decoding token: {e}")
        
        # Continue with existing checks
        if hasattr(request.user, 'instructor'):
            print(f"User has instructor attribute: {request.user.instructor}")
            return request.user.instructor.email_verified
        
        # Try to find instructor by user email
        from instructors.models import Instructor
        try:
            instructor = Instructor.objects.get(email=request.user.email)
            print(f"Found instructor by user email: {instructor}")
            # Temporarily attach the instructor to the user
            setattr(request.user, 'instructor', instructor)
            return instructor.email_verified
        except Instructor.DoesNotExist:
            print(f"No instructor found with email: {request.user.email}")
            
        print("Permission denied - user is not a verified instructor")
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