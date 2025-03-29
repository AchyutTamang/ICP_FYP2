from django.urls import path
from .views import RegisterView, LoginView, ProfileView, VerifyEmail

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('verify-email/<str:token>/', VerifyEmail.as_view(), name='verify_email'),
]