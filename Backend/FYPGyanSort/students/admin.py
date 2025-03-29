from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Student

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
