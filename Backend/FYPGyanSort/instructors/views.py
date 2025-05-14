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
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str

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



def send_verification_status_email(instructor, status):
    subject_map = {
        'verified': 'Your GyanSort Instructor Account has been Verified',
        'rejected': 'GyanSort Instructor Account Status Update',
        'under_review': 'Your GyanSort Instructor Account is Under Review',
        'pending': 'GyanSort Instructor Account Status Update'
    }

    message_map = {
        'verified': f"""
            <p>Congratulations! Your instructor account has been verified. You can now start creating and publishing courses on GyanSort.</p>
            <p>Get started by logging into your account and accessing the instructor dashboard.</p>
        """,
        'rejected': f"""
            <p>We regret to inform you that your instructor account verification was not successful at this time.</p>
            <p>This could be due to incomplete or insufficient documentation. Please contact our support team for more information.</p>
        """,
        'under_review': f"""
            <p>Your instructor account is currently under review by our admin team.</p>
            <p>We'll notify you once the review process is complete. This usually takes 1-2 business days.</p>
        """,
        'pending': f"""
            <p>Your instructor account status is pending verification.</p>
            <p>Please ensure you have submitted all required documentation for the verification process.</p>
        """
    }

    # Create HTML email content
    html_content = f"""
    <html>
    <head>
        <style>
            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }}
            .container {{ padding: 20px; }}
            h1 {{ color: #00AA44; }}
            .message {{ margin: 20px 0; }}
            .footer {{ margin-top: 30px; font-size: 12px; color: #666; }}
        </style>
    </head>
    <body>
        <div class="container">
            <h1>GyanSort Instructor Account Update</h1>
            <p>Hello {instructor.fullname},</p>
            <div class="message">
                {message_map[status]}
            </div>
            <div class="footer">
                <p>Best regards,<br>The GyanSort Team</p>
            </div>
        </div>
    </body>
    </html>
    """

    # Create plain text version
    text_content = strip_tags(html_content)

    # Send email
    email = EmailMultiAlternatives(
        subject_map[status],
        text_content,
        settings.EMAIL_HOST_USER,
        [instructor.email]
    )
    email.attach_alternative(html_content, "text/html")
    email.send()

# Add a new view for updating verification status
class UpdateVerificationStatus(APIView):
    permission_classes = [IsAuthenticated]  # Add appropriate permission class for admin

    def post(self, request, instructor_id):
        try:
            instructor = Instructor.objects.get(id=instructor_id)
            new_status = request.data.get('verification_status')
            
            if new_status not in ['verified', 'rejected', 'under_review', 'pending']:
                return Response(
                    {"error": "Invalid verification status"},
                    status=status.HTTP_400_BAD_REQUEST
                )

            # Update status
            instructor.verification_status = new_status
            instructor.save()

            # Send email notification
            send_verification_status_email(instructor, new_status)

            return Response({
                "message": f"Instructor verification status updated to {new_status}",
                "instructor_id": instructor_id,
                "new_status": new_status
            }, status=status.HTTP_200_OK)

        except Instructor.DoesNotExist:
            return Response(
                {"error": "Instructor not found"},
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ForgotPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get('email')
        try:
            user = Instructor.objects.get(email=email)
            token = default_token_generator.make_token(user)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            
            # Update the reset URL to use the frontend URL and correct path structure
            reset_url = f"http://localhost:5173/reset-password/instructor/{uid}/{token}"
            
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
                    <h1>Reset Your Instructor Password</h1>
                    <p>Hello {user.fullname},</p>
                    <p>We received a request to reset your instructor account password.</p>
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
            Reset Your Instructor Password
            Hello {user.fullname},
            We received a request to reset your instructor account password.
            Click the link below to reset your password:
            {reset_url}
            If you didn't request this, please ignore this email.
            This link will expire in 24 hours.
            Best regards,
            The GyanSort Team
            """
            
            email = EmailMultiAlternatives(
                'Reset Your Instructor Password - GyanSort',
                text_content,
                settings.EMAIL_HOST_USER,
                [user.email]
            )
            email.attach_alternative(html_content, "text/html")
            email.send()
            
            return Response({
                'message': 'Password reset link sent to your email'
            }, status=status.HTTP_200_OK)
            
        except Instructor.DoesNotExist:
            return Response({
                'error': 'No instructor account found with this email'
            }, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = Instructor.objects.get(pk=uid)
            
            if default_token_generator.check_token(user, token):
                new_password = request.data.get('password')
                if not new_password:
                    return Response({
                        'error': 'Password is required'
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                # Add check for password reuse
                if user.check_password(new_password):
                    return Response({
                        'error': 'New password must be different from the current password',
                        'success': False
                    }, status=status.HTTP_400_BAD_REQUEST)
                
                user.set_password(new_password)
                user.save()
                
                return Response({
                    'message': 'Password reset successful',
                    'success': True
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Invalid or expired reset link'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except (TypeError, ValueError, OverflowError, Instructor.DoesNotExist):
            return Response({
                'error': 'Invalid reset link'
            }, status=status.HTTP_400_BAD_REQUEST)