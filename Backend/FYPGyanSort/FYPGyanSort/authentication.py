from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import get_authorization_header
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from instructors.models import Instructor
from students.models import Student

class CustomJWTAuthentication(JWTAuthentication):
    def authenticate(self, request):
        header = get_authorization_header(request).decode('utf-8')
        if not header.startswith('Bearer '):
            return None
            
        token = header.split(' ')[1]
        
        try:
            # Decode the token manually to inspect its contents
            decoded_token = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
            print(f"Decoded token: {decoded_token}")
            
            user_type = decoded_token.get('type')
            email = decoded_token.get('email')
            
            if user_type == 'instructor':
                try:
                    instructor = Instructor.objects.get(email=email)
                    return (instructor, token)
                except Instructor.DoesNotExist:
                    print(f"No instructor found with email: {email}")
                    return None
            
            elif user_type == 'student':
                try:
                    student = Student.objects.get(email=email)
                    return (student, token)
                except Student.DoesNotExist:
                    print(f"No student found with email: {email}")
                    return None
            
            # If no user_type or unrecognized type, fall back to standard JWT authentication
            return super().authenticate(request)
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError:
            print("Invalid token")
            return None