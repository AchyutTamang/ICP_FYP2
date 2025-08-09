from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    # path('jet/', include('jet.urls', 'jet')),  # Django JET URLS
    # path('jet/dashboard/', include('jet.dashboard.urls', 'jet-dashboard')),  # Django JET dashboard URLS
    path('admin/', admin.site.urls),
    path('api/students/', include('students.urls')),
    path('api/instructors/', include('instructors.urls')),
    path('api/courses/', include('courses.urls')),
    path('api/cart/', include('cart.urls')),
    path('api/payments/', include('payments.urls')),  
    path('api/forums/', include('forums.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
admin.site.site_header = "GyanSort Admin"
admin.site.site_title = "GyanSort Admin Portal"
admin.site.index_title = "Welcome to GyanSort"
