from django.urls import path
from .views import RegisterView, VerifyEmail, LoginView, ProfileView, LogoutView
from django.conf import settings
from django.conf.urls.static import static
from django.urls import path
from .views import UpdateVerificationStatus

urlpatterns = [
    path('register/', RegisterView.as_view(), name='instructor-register'),
    path('verify-email/<str:token>/', VerifyEmail.as_view(), name='instructor-verify-email'),
    path('verify-email/<str:token>/', VerifyEmail.as_view(), name='verify-email'),
    path('login/', LoginView.as_view(), name='instructor-login'),
    path('profile/', ProfileView.as_view(), name='instructor-profile'),
    path('logout/', LogoutView.as_view(), name='instructor-logout'),
    path('update-verification-status/<int:instructor_id>/', UpdateVerificationStatus.as_view(), name='update-verification-status'),
]

# Add this if you want to serve media files during development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)