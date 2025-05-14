from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView, 
    VerifyEmail, ForgotPasswordView, ResetPasswordView,
    UpdateVerificationStatus
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='instructor-register'),
    path('verify-email/<str:token>/', VerifyEmail.as_view(), name='instructor-verify-email'),
    path('verify-email/<str:token>/', VerifyEmail.as_view(), name='verify-email'),
    path('login/', LoginView.as_view(), name='instructor-login'),
    path('profile/', ProfileView.as_view(), name='instructor-profile'),
    path('logout/', LogoutView.as_view(), name='instructor-logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='instructor-forgot-password'),
    path('reset-password/<str:uidb64>/<str:token>/', ResetPasswordView.as_view(), name='instructor-reset-password'),
    path('update-verification-status/<int:instructor_id>/', UpdateVerificationStatus.as_view(), name='update-verification-status'),
]
