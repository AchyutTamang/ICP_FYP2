from django.urls import path
from .views import (
    RegisterView, StudentLoginView, LogoutView, ProfileView, 
    VerifyEmail, ForgotPasswordView, ResetPasswordView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', StudentLoginView.as_view(), name='student-login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('verify-email/<str:uid>/<str:token>/', VerifyEmail.as_view(), name='verify_email'),
    path('logout/', LogoutView.as_view(), name='student-logout'),
    path('forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('reset-password/<str:uidb64>/<str:token>/', ResetPasswordView.as_view(), name='reset-password'),
]