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
    message = "Only verified instructors can create forums."

    def has_permission(self, request, view):
        # Print detailed debugging information
        print(f"REQUEST USER: {request.user}, Authenticated: {request.user.is_authenticated}")
        
        # Debug JWT token
        auth_header = request.META.get('HTTP_AUTHORIZATION', '')
        token_email = None
        
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            try:
                # Try to decode the token to see what's in it
                decoded = jwt.decode(token, options={"verify_signature": False})
                print(f"Decoded token: {decoded}")
                
                # Check if the token contains the expected user
                if 'email' in decoded:
                    token_email = decoded['email']
                    print(f"Token email: {token_email}")
                    
                    # If token email doesn't match authenticated user, try to use token email instead
                    if token_email != request.user.email:
                        print(f"Token email ({token_email}) doesn't match authenticated user ({request.user.email})")
                        
                        # Try to find instructor by token email
                        try:
                            from instructors.models import Instructor
                            
                            instructor = Instructor.objects.get(email=token_email)
                            print(f"Found instructor from token: {instructor}")
                            
                            # Check if this instructor is verified
                            if hasattr(instructor, 'verification_status') and instructor.verification_status == 'verified':
                                print(f"Instructor from token is verified: {instructor.verification_status}")
                                
                                # Store the instructor directly on the request object
                                # This will be used in the view's perform_create method
                                request.instructor_from_token = instructor
                                
                                # Also add an instructor attribute to the user object
                                # This is a workaround for the view trying to access request.user.instructor
                                setattr(request.user, 'instructor', instructor)
                                print(f"Added instructor attribute to user: {instructor}")
                                
                                return True
                        except Exception as e:
                            print(f"Error finding instructor from token: {e}")
            except Exception as e:
                print(f"Error decoding token: {e}")
        
        # Allow GET requests for all users
        if request.method in permissions.SAFE_METHODS:
            return True
        
        # First check if the user has an instructor attribute
        if hasattr(request.user, 'instructor'):
            instructor = request.user.instructor
            print(f"User has instructor attribute: {instructor}")
            
            # Check verification status
            has_status = hasattr(instructor, 'verification_status')
            status_value = getattr(instructor, 'verification_status', None)
            print(f"Verification status: {status_value}")
            
            return has_status and status_value and status_value.lower() == 'verified'
        
        # If no instructor attribute, try to find by email
        print(f"User {request.user} does not have instructor attribute, checking by email")
        try:
            from instructors.models import Instructor
            # Check if there's an instructor with this email
            instructor = Instructor.objects.get(email=request.user.email)
            print(f"Found instructor by email: {instructor}")
            
            # Check if this instructor is verified
            is_verified = instructor.verification_status == 'verified'
            print(f"Instructor verification status: {instructor.verification_status}, Is verified: {is_verified}")
            
            return is_verified
        except Exception as e:
            print(f"Error finding instructor: {e}")
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