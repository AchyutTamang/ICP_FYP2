from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.authentication import get_authorization_header
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from instructors.models import Instructor

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
            
            # Check if this is an instructor token
            if decoded_token.get('user_type') == 'instructor':
                print(f"Token is for instructor: {decoded_token.get('email')}")
                try:
                    instructor = Instructor.objects.get(email=decoded_token.get('email'))
                    print(f"Found instructor: {instructor}")
                    return (instructor, token)
                except Instructor.DoesNotExist:
                    print(f"No instructor found with email: {decoded_token.get('email')}")
            
            # Fall back to standard JWT authentication
            return super().authenticate(request)
            
        except jwt.ExpiredSignatureError:
            print("Token has expired")
            return None
        except jwt.InvalidTokenError:
            print("Invalid token")
            return None