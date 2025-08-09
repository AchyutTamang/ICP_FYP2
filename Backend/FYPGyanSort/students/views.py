from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework import status
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken, AccessToken
from rest_framework_simplejwt.exceptions import TokenError
from django.core.mail import send_mail
from django.conf import settings
from .models import Student
from django.utils.html import strip_tags
from django.core.mail import EmailMultiAlternatives
from rest_framework.permissions import IsAuthenticated, AllowAny
from .serializers import LogoutSerializer, StudentRegistrationSerializer as RegisterSerializer, StudentLoginSerializer
import urllib.parse
import traceback
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

class RegisterView(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        print("serializer:", serializer.is_valid())
        if serializer.is_valid():
            user = serializer.save()
            
            # Create a custom token for email verification
            from django.contrib.auth.tokens import default_token_generator
            from django.utils.http import urlsafe_base64_encode
            from django.utils.encoding import force_bytes
            
            # Generate verification token
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = default_token_generator.make_token(user)
            
            # Create verification URL
            verification_url = f"http://localhost:8000/api/students/verify-email/{uid}/{token}/"
            
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
                    <h1>Welcome to GyanSort!</h1>
                    <p>Hello {user.fullname},</p>
                    <p>Thank you for registering with GyanSort. Please verify your email address to complete your registration.</p>
                    <p><a href="{verification_url}" class="button">Verify Email Address</a></p>
                  
                    <p>This link will expire in 60 minutes.</p>
                    <p>If you did not register for GyanSort, please ignore this email.</p>
                    <div class="footer">
                        <p>Best regards,<br>The GyanSort Team</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            # Plain text version for email clients that don't support HTML
            text_content = f"""
            Welcome to GyanSort!
            
            Hello {user.fullname},
            
            Thank you for registering with GyanSort. Please verify your email address to complete your registration.
            
            Verification link: {verification_url}
            
            This link will expire in 60 minutes.
            
            If you did not register for GyanSort, please ignore this email.
            
            Best regards,
            The GyanSort Team
            """
            
            # Create email message with both HTML and plain text
            subject = "Verify Your GyanSort Account"
            from_email = settings.EMAIL_HOST_USER
            to = [user.email]
            
            # Create the email message
            email = EmailMultiAlternatives(subject, text_content, from_email, to)
            email.attach_alternative(html_content, "text/html")
            
            # Send the email
            email.send()
            
            return Response({
                'message': 'Registration successful. Please check your email for verification.',
                'email': user.email
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class VerifyEmail(APIView):
    permission_classes = [AllowAny]

    def get(self, request, uid, token):
        try:
            # Decode the uid to get user pk
            user_id = force_str(urlsafe_base64_decode(uid))
            user = Student.objects.get(pk=user_id)
            
            # Check if the token is valid
            if default_token_generator.check_token(user, token):
                if user.email_verified:
                    return Response({
                        'success': True,
                        'message': 'Email already verified',
                        'redirect': '/login'
                    }, status=status.HTTP_200_OK)
                
                # Update user verification status
                user.is_active = True
                user.email_verified = True
                user.save()
                
                return Response({
                    'success': True,
                    'message': 'Email verified successfully',
                    'redirect': '/login'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'success': False,
                    'message': 'Invalid verification token'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, Student.DoesNotExist):
            return Response({
                'success': False,
                'message': 'Invalid verification link'
            }, status=status.HTTP_400_BAD_REQUEST)

class StudentLoginView(APIView):
    def post(self, request):
        serializer = StudentLoginSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            
            try:
                student = Student.objects.get(email=email)
                if student.check_password(password):
                    # Create token payload
                    token = RefreshToken()
                    token['user_id'] = student.id
                    token['email'] = student.email
                    token['type'] = 'student'
                    
                    return Response({
                        'refresh': str(token),
                        'access': str(token.access_token),
                    })
                else:
                    return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
            except Student.DoesNotExist:
                return Response({'error': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class ProfileView(APIView):
    def get(self, request):
        user = request.user
        serializer = StudentSerializer(user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    
    def put(self, request):
        user = request.user
        serializer = StudentSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# Then your LogoutView class should work correctly
class LogoutView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        try:
            # Get the refresh token from the request
            refresh_token = request.data.get('refresh')
            if not refresh_token:
                return Response({"error": "Refresh token is required"}, status=status.HTTP_400_BAD_REQUEST)
            
            # Blacklist the token
            token = RefreshToken(refresh_token)
            token.blacklist()
            
            return Response({"message": "Logout successful"}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = Student.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Match the same URL structure as instructor
            reset_url = f"http://localhost:5173/reset-password/student/{uid}/{token}"
            
            html_content = f"""
            <html>
            <head>
                <style>
                    body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                    .container {{ padding: 20px; }}
                    h1 {{ color: #00AA44; }}
                    .button {{ background-color: #00FF40; color: #000; padding: 12px 24px; 
                             text-decoration: none; border-radius: 50px; font-weight: bold; }}
                    .button:hover {{ background-color: #00DD30; }}
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>Reset Your Student Password</h1>
                    <p>Hello {user.fullname},</p>
                    <p>We received a request to reset your student account password.</p>
                    <p><a href="{reset_url}" class="button">Reset Password</a></p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <p>This link will expire in 24 hours.</p>
                    <div class="footer">
                        <p>Best regards,<br>The GyanSort Team</p>
                    </div>
                </div>
            </body>
            </html>
            """
            
            text_content = f"""
            Reset Your Password
            Hello {user.fullname},
            Click the link below to reset your password:
            {reset_url}
            If you didn't request this, please ignore this email.
            This link will expire in 24 hours.
            """
            
            email = EmailMultiAlternatives(
                'Reset Your Password - GyanSort',
                text_content,
                settings.EMAIL_HOST_USER,
                [user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
            
            return Response({
                'message': 'Password reset link sent to your email'
            }, status=status.HTTP_200_OK)
            
        except Student.DoesNotExist:
            return Response({
                'error': 'No account found with this email'
            }, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            print(f"Received reset request - uidb64: {uidb64}, token: {token}")
            
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Student.objects.get(pk=uid)
            print(f"Found user: {user.email}")
            
            if default_token_generator.check_token(user, token):
                new_password = request.data.get('password')
                print("Token validated successfully")
                
                if not new_password:
                    return Response({
                        'error': 'Password is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Check if the new password is the same as the old password
                if user.check_password(new_password):
                    return Response({
                        'error': 'New password must be different from the current password',
                        'success': False
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
                user.save()
                print(f"Password reset successful for user: {user.email}")
                
                return Response({
                    'message': 'Password reset successful',
                    'success': True
                }, status=status.HTTP_200_OK)
            else:
                print("Invalid token")
                return Response({
                    'error': 'Invalid or expired reset link',
                    'success': False
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            print(f"Reset password error: {str(e)}")
            return Response({
                'error': 'Invalid reset link or server error',
                'success': False
            }, status=status.HTTP_400_BAD_REQUEST)