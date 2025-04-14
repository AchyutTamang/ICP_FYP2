from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from instructors.models import Instructor

User = get_user_model()

class MultiModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # First try to authenticate as a Student
        user = super().authenticate(request, username=username, password=password, **kwargs)
        
        # If successful as Student, return the user
        if user:
            return user
            
        # If not successful as Student, try as Instructor
        try:
            instructor = Instructor.objects.get(email=username)
            if instructor.check_password(password):
                # Set a flag or attribute to identify this user as an instructor
                instructor.is_instructor = True
                return instructor
        except Instructor.DoesNotExist:
            return None
            
        return None