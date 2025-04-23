from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from django.core.mail import EmailMultiAlternatives
from django.conf import settings
from django.utils.html import strip_tags
import urllib.parse
import traceback
from .tokens import InstructorRefreshToken
from .models import Instructor
from .serializers import InstructorRegistrationSerializer, InstructorLoginSerializer, InstructorProfileSerializer,LogoutSerializer
from rest_framework.permissions import AllowAny, IsAuthenticated

class RegisterView(APIView):
    permission_classes = [AllowAny] 
    def post(self, request):
        serializer = InstructorRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save(is_active=False)
            # Generate token for email verification
            token = InstructorRefreshToken.for_user(user)
            access_token = str(token.access_token)
            
            # Create verification URL
            verification_url = f"http://localhost:8000/api/instructors/verify-email/{token}"

            # Create HTML email with button
            html_content = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
                    .container {{ padding: 20px; }}
                    h1 {{ color: #00AA44; }}
                    .button {{ background-color: #00FF40; color: #000; padding: 12px 24px; text-decoration: none; 
                              display: inline-block; border-radius: 50px; font-weight: bold; margin: 20px 0; }}
                    .button:hover {{ background-color: #00DD30; }}
                    .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Welcome to GyanSort as an Instructor!</h1>
                    <p>Hello {user.fullname},</p>
                    <p>Thank you for registering with GyanSort as an instructor. Please verify your email address to continue the verification process.</p>
                    <p><a href="{verification_url}" class="button">Verify Email Address</a></p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p>{verification_url}</p>
                    <p>This link will expire in 60 minutes.</p>
                    <p>After email verification, our admin team will review your submitted documents and approve your instructor account.</p>
                    <div class="footer">
                        <p>Best regards,<br>The GyanSort Team</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version
            text_content = f"""
            Welcome to GyanSort as an Instructor!
            
            Hello {user.fullname},
            
            Thank you for registering with GyanSort as an instructor. Please verify your email address to continue the verification process.
            
            Verification link: {verification_url}
            
            This link will expire in 60 minutes.
            
            After email verification, our admin team will review your submitted documents and approve your instructor account.
            
            Best regards,
            The GyanSort Team
            """
            
            # Create email message
            subject = "Verify Your GyanSort Instructor Account"
            from_email = settings.EMAIL_HOST_USER
            to = [user.email]
            
            email = EmailMultiAlternatives(subject, text_content, from_email, to)
            email.attach_alternative(html_content, "text/html")
            
            # Send the email
            email.send()
            
            return Response({
                "message": "Instructor registration successful. Please check your email for verification."
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmail(APIView):
    permission_classes = [AllowAny] 
    def get(self, request, token):
        try:
            # Parse the token
            token_obj = RefreshToken(token)
            user_id = token_obj.payload.get("user_id")
            
            if not user_id:
                return Response({
                    'success': False,
                    'message': 'Invalid verification token - no user ID found.'
                }, status=status.HTTP_400_BAD_REQUEST)
                
            user = Instructor.objects.get(id=user_id)
            
            # Set email as verified and account as active
            user.email_verified = True
            user.is_active = True  # Add this line to set the account as active
            user.verification_status = 'under_review'  # Document needs review by admin
            user.save()
            
            # Return success response
            return Response({
                'success': True,
                'message': 'Email verified successfully. Your account is now under review by our admin team.',
                'redirect': 'http://localhost:5173/instructor-verification-pending'
            }, status=status.HTTP_200_OK)
            
        except Instructor.DoesNotExist:
            return Response({
                'success': False,
                'message': 'User not found'
            }, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(traceback.format_exc())
            return Response({
                'success': False,
                'message': f'Verification failed: {str(e)}'
            }, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = InstructorLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            print(f"Attempting to authenticate instructor: {email}")
            
            try:
                user = Instructor.objects.get(email=email)
                print(f"Found instructor: {user.email}, checking password")
                
                if user.check_password(password):
                    print("Password is correct")
                    
                    # Check account status
                    if not user.is_active:
                        print("Account is not active")
                        return Response({"error": "Account is not active"}, status=status.HTTP_403_FORBIDDEN)
                    
                    if not user.email_verified:
                        print("Email not verified")
                        return Response({"error": "Email not verified"}, status=status.HTTP_403_FORBIDDEN)
                    
                    # Print verification status for debugging
                    print(f"Verification status: {user.verification_status}")
                    
                    # Allow login but include verification status in response
                    token = InstructorRefreshToken.for_user(user)
                    
                    # Create response with verification status
                    response_data = {
                        "access": str(token.access_token), 
                        "refresh": str(token),
                        "user": {
                            "id": user.id,
                            "email": user.email,
                            "fullname": user.fullname,
                            "institution": user.institution if hasattr(user, 'institution') else None,
                            "department": user.department if hasattr(user, 'department') else None,
                            "verification_status": user.verification_status
                        }
                    }
                    
                    # If not verified, add a warning message
                    if user.verification_status != 'verified':
                        response_data["warning"] = "Your account is still under review. Some features may be limited until approval."
                        print("Returning success with warning about verification status")
                    else:
                        print("User is fully verified")
                    
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    print("Password is incorrect")
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                    
            except Instructor.DoesNotExist:
                print(f"No instructor found with email: {email}")
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
      
# class ProfileView(APIView):
#     permission_classes = [IsAuthenticated]
    
#     def get(self, request):
#         # Get the token from the request
#         auth_header = request.headers.get('Authorization', '')
#         if not auth_header.startswith('Bearer '):
#             return Response({"error": "Invalid authorization header"}, status=status.HTTP_401_UNAUTHORIZED)
        
#         token = auth_header.split(' ')[1]
        
#         # Decode the token to get the user ID
#         try:
#             # Import the necessary modules
#             from rest_framework_simplejwt.tokens import AccessToken
#             from django.conf import settings
#             import jwt
            
#             # Decode the token
#             decoded_token = jwt.decode(
#                 token,
#                 settings.SECRET_KEY,
#                 algorithms=["HS256"]
#             )
            
#             user_id = decoded_token.get('user_id')
#             print(f"Token decoded, user_id from token: {user_id}")
            
#             # Get the instructor by ID
#             try:
#                 instructor = Instructor.objects.get(id=user_id)
#                 print(f"Found instructor by ID: {instructor.email}")
                
#                 serializer = InstructorProfileSerializer(instructor)
#                 data = serializer.data
                
#                 # Ensure email is included
#                 if 'email' not in data:
#                     data['email'] = instructor.email
                    
#                 print(f"Returning instructor profile for {instructor.email}: {data}")
#                 return Response(data, status=status.HTTP_200_OK)
                
#             except Instructor.DoesNotExist:
#                 print(f"No instructor found with ID: {user_id}")
#                 return Response(
#                     {"error": f"No instructor found with ID: {user_id}"}, 
#                     status=status.HTTP_404_NOT_FOUND
#                 )
                
#         except Exception as e:
#             print(f"Error decoding token: {str(e)}")
#             return Response(
#                 {"error": f"Invalid token: {str(e)}"}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )
    
#     def put(self, request):
#         # Similar approach for the PUT method
#         auth_header = request.headers.get('Authorization', '')
#         if not auth_header.startswith('Bearer '):
#             return Response({"error": "Invalid authorization header"}, status=status.HTTP_401_UNAUTHORIZED)
        
#         token = auth_header.split(' ')[1]
        
#         try:
#             from rest_framework_simplejwt.tokens import AccessToken
#             from django.conf import settings
#             import jwt
            
#             decoded_token = jwt.decode(
#                 token,
#                 settings.SECRET_KEY,
#                 algorithms=["HS256"]
#             )
            
#             user_id = decoded_token.get('user_id')
            
#             try:
#                 instructor = Instructor.objects.get(id=user_id)
#                 serializer = InstructorProfileSerializer(instructor, data=request.data, partial=True)
#                 if serializer.is_valid():
#                     serializer.save()
#                     return Response(serializer.data, status=status.HTTP_200_OK)
#                 return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
                
#             except Instructor.DoesNotExist:
#                 return Response(
#                     {"error": f"No instructor found with ID: {user_id}"}, 
#                     status=status.HTTP_404_NOT_FOUND
#                 )
                
#         except Exception as e:
#             return Response(
#                 {"error": f"Invalid token: {str(e)}"}, 
#                 status=status.HTTP_401_UNAUTHORIZED
#             )

# After the LoginView class and before the LogoutView class

class ProfileView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        # Use the authenticated user directly from request
        instructor = request.user
        
        # Check if the user is an Instructor
        if not isinstance(instructor, Instructor):
            print(f"User is not an Instructor: {instructor}")
            return Response({"error": "Invalid user type"}, status=status.HTTP_401_UNAUTHORIZED)
            
        print(f"Found instructor from request.user: {instructor.email}")
        
        # Serialize and return the instructor data
        serializer = InstructorProfileSerializer(instructor)
        data = serializer.data
        
        # Ensure email is included
        if 'email' not in data:
            data['email'] = instructor.email
        
        # Ensure profile picture URL is properly formatted
        if hasattr(instructor, 'profile_picture') and instructor.profile_picture:
            # Get the base URL from settings or use a default
            base_url = getattr(settings, 'MEDIA_URL', '/media/')
            if not base_url.startswith('http'):
                # If it's a relative URL, make it absolute
                base_url = request.build_absolute_uri(base_url)
            
            # Ensure the URL doesn't have double slashes
            if base_url.endswith('/') and str(instructor.profile_picture).startswith('/'):
                profile_pic_url = f"{base_url[:-1]}{instructor.profile_picture}"
            else:
                profile_pic_url = f"{base_url}{instructor.profile_picture}"
            
            data['profile_picture'] = profile_pic_url
            print(f"Profile picture URL: {profile_pic_url}")
        
        print(f"Returning instructor profile for {instructor.email}: {data}")
        return Response(data, status=status.HTTP_200_OK)
    
    def put(self, request):
        # Use the authenticated user directly from request
        instructor = request.user
        
        # Check if the user is an Instructor
        if not isinstance(instructor, Instructor):
            return Response({"error": "Invalid user type"}, status=status.HTTP_401_UNAUTHORIZED)
        
        # Update the instructor profile
        serializer = InstructorProfileSerializer(instructor, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            
            # Get the updated data with proper profile picture URL
            updated_data = serializer.data
            if hasattr(instructor, 'profile_picture') and instructor.profile_picture:
                base_url = getattr(settings, 'MEDIA_URL', '/media/')
                if not base_url.startswith('http'):
                    base_url = request.build_absolute_uri(base_url)
                
                if base_url.endswith('/') and str(instructor.profile_picture).startswith('/'):
                    profile_pic_url = f"{base_url[:-1]}{instructor.profile_picture}"
                else:
                    profile_pic_url = f"{base_url}{instructor.profile_picture}"
                
                updated_data['profile_picture'] = profile_pic_url
            
            return Response(updated_data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LoginView(APIView):
    permission_classes = [AllowAny]
    def post(self, request):
        serializer = InstructorLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data["email"]
            password = serializer.validated_data["password"]
            print(f"Attempting to authenticate instructor: {email}")
            
            try:
                user = Instructor.objects.get(email=email)
                print(f"Found instructor: {user.email}, checking password")
                
                if user.check_password(password):
                    print("Password is correct")
                    
                    # Check account status
                    if not user.is_active:
                        print("Account is not active")
                        return Response({"error": "Account is not active"}, status=status.HTTP_403_FORBIDDEN)
                    
                    if not user.email_verified:
                        print("Email not verified")
                        return Response({"error": "Email not verified"}, status=status.HTTP_403_FORBIDDEN)
                    
                    # Print verification status for debugging
                    print(f"Verification status: {user.verification_status}")
                    
                    # Allow login but include verification status in response
                    token = InstructorRefreshToken.for_user(user)
                    
                    # Create response with verification status
                    response_data = {
                        "access": str(token.access_token), 
                        "refresh": str(token),
                        "user": {
                            "id": user.id,
                            "email": user.email,
                            "fullname": user.fullname,
                            "institution": user.institution if hasattr(user, 'institution') else None,
                            "department": user.department if hasattr(user, 'department') else None,
                            "verification_status": user.verification_status
                        }
                    }
                    
                    # Add profile picture URL to the response
                    if hasattr(user, 'profile_picture') and user.profile_picture:
                        # Get the base URL from settings or use a default
                        base_url = getattr(settings, 'MEDIA_URL', '/media/')
                        if not base_url.startswith('http'):
                            # If it's a relative URL, make it absolute
                            base_url = request.build_absolute_uri(base_url)
                        
                        # Ensure the URL doesn't have double slashes
                        if base_url.endswith('/') and str(user.profile_picture).startswith('/'):
                            profile_pic_url = f"{base_url[:-1]}{user.profile_picture}"
                        else:
                            profile_pic_url = f"{base_url}{user.profile_picture}"
                        
                        response_data["user"]["profile_picture"] = profile_pic_url
                        print(f"Added profile picture URL to login response: {profile_pic_url}")
                    
                    # If not verified, add a warning message
                    if user.verification_status != 'verified':
                        response_data["warning"] = "Your account is still under review. Some features may be limited until approval."
                        print("Returning success with warning about verification status")
                    else:
                        print("User is fully verified")
                    
                    return Response(response_data, status=status.HTTP_200_OK)
                else:
                    print("Password is incorrect")
                    return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                    
            except Instructor.DoesNotExist:
                print(f"No instructor found with email: {email}")
                return Response({"error": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)
                
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            serializer = LogoutSerializer(data=request.data)
            if serializer.is_valid():
                refresh_token = serializer.validated_data["refresh"]
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)