from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
admin.site.site_header = "GyanSort Admin"
admin.site.site_title = "GyanSort Admin Portal"
admin.site.index_title = "Welcome to GyanSort"

 
urlpatterns = [
    path('jet/', include('jet.urls', 'jet')),
    path('admin/', admin.site.urls),
    path('api/students/', include('students.urls')),
    path('api/instructors/', include('instructors.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
