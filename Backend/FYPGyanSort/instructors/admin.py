from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.forms import UserChangeForm, UserCreationForm
from .models import Instructor
from django.utils.html import format_html

class InstructorChangeForm(UserChangeForm):
    class Meta:
        model = Instructor
        fields = '__all__'

class InstructorCreationForm(UserCreationForm):
    class Meta:
        model = Instructor
        fields = ('email', 'fullname')

@admin.register(Instructor)
class InstructorAdmin(BaseUserAdmin):
    form = InstructorChangeForm
    add_form = InstructorCreationForm
    
    list_display = ('email', 'fullname', 'verification_status_display', 'verification_status', 'email_verified', 'document_link', 'profile_picture_preview', 'is_active')
    list_editable = ('verification_status',) 
    list_filter = ('verification_status', 'email_verified', 'is_active')
    search_fields = ('email', 'fullname')
    readonly_fields = ('email_verified',)
    actions = ['mark_under_review', 'approve_instructors', 'reject_instructors']
    
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        ('Personal info', {'fields': ('fullname', 'institution', 'department', 'bio', 'profile_picture')}),
        ('Verification', {
            'fields': ('email_verified', 'verification_status', 'verification_document'),
            'classes': ('wide',),
            'description': 'Manage instructor verification status and documents'
        }),
        ('Permissions', {'fields': ('is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions')}),
    )
    
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'fullname', 'password1', 'password2'),
        }),
    )
    
    ordering = ('email',)
    filter_horizontal = ('groups', 'user_permissions',)
    
    def verification_status_display(self, obj):
        colors = {
            'pending': '#FFA500',
            'under_review': '#0096FF',
            'verified': '#00FF40',
            'rejected': '#FF0000'
        }
        return format_html(
            '<span style="color: {}; font-weight: bold;">{}</span>',
            colors.get(obj.verification_status, 'black'),
            obj.get_verification_status_display()
        )
    verification_status_display.short_description = 'Status'
    
    def document_link(self, obj):
        if obj.verification_document:
            return format_html(
                '<a href="{}" target="_blank" style="background-color: #4CAF50; color: white; '
                'padding: 5px 10px; text-decoration: none; border-radius: 3px;">View Document</a>',
                obj.verification_document.url
            )
        return "No document"
    document_link.short_description = 'Verification Document'
    
    def profile_picture_preview(self, obj):
        if obj.profile_picture:
            return format_html(
                '<img src="{}" width="50" height="50" style="border-radius: 50%;" />',
                obj.profile_picture.url
            )
        return "No picture"
    profile_picture_preview.short_description = 'Profile Picture'
    
    def mark_under_review(self, request, queryset):
        updated = queryset.update(verification_status='under_review')
        self.message_user(request, f'{updated} instructor(s) marked as under review.')
    mark_under_review.short_description = "⌛ Mark as Under Review"
    
    def approve_instructors(self, request, queryset):
        updated = queryset.update(
            verification_status='verified',
            is_active=True,
            email_verified=True
        )
        self.message_user(request, f'{updated} instructor(s) successfully verified.')
    approve_instructors.short_description = "✓ Verify selected instructors"
    
    def reject_instructors(self, request, queryset):
        updated = queryset.update(
            verification_status='rejected',
            is_active=False
        )
        self.message_user(request, f'{updated} instructor(s) rejected.')
    reject_instructors.short_description = "✗ Reject selected instructors"