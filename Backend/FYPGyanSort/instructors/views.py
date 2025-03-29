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
from .serializers import InstructorRegistrationSerializer, InstructorLoginSerializer, InstructorProfileSerializer
from rest_framework.permissions import AllowAny

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
      
class ProfileView(APIView):
    permission_classes = [AllowAny] 
    def get(self, request):
        user = request.user
        serializer = InstructorProfileSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        serializer = InstructorProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)