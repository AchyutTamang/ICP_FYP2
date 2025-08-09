from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Student
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken

@admin.register(Student)
class StudentAdmin(UserAdmin):
    list_display = ('email', 'fullname', 'student_id', 'is_active', 'verification_status')
    list_filter = ('is_active', 'email_verified', 'verification_status')
    search_fields = ('email', 'fullname', 'student_id')
    ordering = ('-date_joined',)
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal Info', {'fields': ('fullname', 'student_id', 'profile_pic')}),
        ('Status', {'fields': ('is_active', 'email_verified', 'verification_status')}),
        ('Permissions', {'fields': ('is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'fullname', 'password1', 'password2'),
        }),
    )

    def delete_model(self, request, obj):
        # Delete associated tokens first
        OutstandingToken.objects.filter(user_id=obj.id).delete()
        # Then delete the student
        super().delete_model(request, obj)

    def delete_queryset(self, request, queryset):
        # Handle bulk deletions
        for obj in queryset:
            OutstandingToken.objects.filter(user_id=obj.id).delete()
        super().delete_queryset(request, queryset)
