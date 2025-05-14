from django.urls import path
from .views import (
    RegisterView, LoginView, LogoutView, ProfileView, 
    VerifyEmail, ForgotPasswordView, ResetPasswordView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('verify-email/<str:token>/', VerifyEmail.as_view(), name='verify_email'),
    path('logout/', LogoutView.as_view(), name='student-logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<str:uidb64>/<str:token>/', ResetPasswordView.as_view(), name='reset-password'),
]