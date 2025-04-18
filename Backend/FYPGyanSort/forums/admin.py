from django.contrib import admin
from .models import Forum, ForumMembership, ForumMessage, ForumAttachment

@admin.register(Forum)
class ForumAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'created_at', 'is_active')
    list_filter = ('is_active', 'created_at')
    search_fields = ('title', 'description', 'created_by__email')

@admin.register(ForumMembership)
class ForumMembershipAdmin(admin.ModelAdmin):
    list_display = ('forum', 'student', 'joined_at', 'is_active')
    list_filter = ('is_active', 'joined_at')
    search_fields = ('forum__title', 'student__email')

@admin.register(ForumMessage)
class ForumMessageAdmin(admin.ModelAdmin):
    list_display = ('forum', 'sender_type', 'sender_id', 'sent_at')
    list_filter = ('sender_type', 'sent_at')
    search_fields = ('forum__title', 'content')

@admin.register(ForumAttachment)
class ForumAttachmentAdmin(admin.ModelAdmin):
    list_display = ('forum', 'message', 'file_name', 'file_type', 'uploaded_at')
    list_filter = ('file_type', 'uploaded_at')
    search_fields = ('forum__title', 'file_name')