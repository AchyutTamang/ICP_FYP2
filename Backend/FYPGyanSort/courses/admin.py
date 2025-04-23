from django.contrib import admin
from django.urls import path
from django.http import JsonResponse
from django.db.models import Count
from django.db.models.functions import TruncMonth
from django.template.response import TemplateResponse
from .models import Course, Category, Module, Lesson, Content, Review

class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'category', 'course_price', 'is_free', 'is_active', 'created_at')
    list_filter = ('is_active', 'is_free', 'category', 'created_at')
    search_fields = ('title', 'description', 'instructor__user__email')
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('dashboard/', self.admin_site.admin_view(self.dashboard_view), name='course_dashboard'),
            path('api/course-stats/', self.admin_site.admin_view(self.course_stats_api), name='course_stats_api'),
        ]
        return custom_urls + urls
    
    def dashboard_view(self, request):
        context = {
            **self.admin_site.each_context(request),
            'title': 'Course Dashboard',
        }
        return TemplateResponse(request, 'admin/course_dashboard.html', context)
    
    def course_stats_api(self, request):
        # Get course count by category for pie chart
        category_stats = Category.objects.annotate(
            course_count=Count('course')
        ).values('name', 'course_count')
        
        # Get courses created per month for bar chart
        monthly_stats = Course.objects.annotate(
            month=TruncMonth('created_at')
        ).values('month').annotate(
            count=Count('id')
        ).order_by('month')
        
        # Get free vs paid courses for pie chart
        pricing_stats = {
            'free': Course.objects.filter(is_free=True).count(),
            'paid': Course.objects.filter(is_free=False).count()
        }
        
        return JsonResponse({
            'category_stats': list(category_stats),
            'monthly_stats': list(monthly_stats),
            'pricing_stats': pricing_stats
        })

admin.site.register(Course, CourseAdmin)
admin.site.register(Category)
admin.site.register(Module)
admin.site.register(Lesson)
admin.site.register(Content)
admin.site.register(Review)