from django.db import models
from django.utils import timezone
from students.models import Student
from instructors.models import Instructor
from courses.models import Course

def forum_file_upload_path(instance, filename):
    """Generate file path for forum attachments"""
    return f'forum_files/{instance.forum.id}/{instance.sender_type}_{instance.sender_id}_{filename}'

class Forum(models.Model):
    title = models.CharField(max_length=255)
    description = models.TextField()
    course = models.ForeignKey(Course, on_delete=models.CASCADE, related_name='forums', null=True, blank=True)
    created_by = models.ForeignKey(Instructor, on_delete=models.CASCADE, related_name='created_forums')
    created_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    def __str__(self):
        return self.title

class ForumMembership(models.Model):
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='memberships')
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='forum_memberships')
    joined_at = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('forum', 'student')
    
    def __str__(self):
        return f"{self.student.email} in {self.forum.title}"

class ForumMessage(models.Model):
    SENDER_TYPES = (
        ('instructor', 'Instructor'),
        ('student', 'Student'),
    )
    
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='messages')
    content = models.TextField()
    sender_type = models.CharField(max_length=10, choices=SENDER_TYPES)
    sender_id = models.IntegerField()  # ID of either instructor or student
    sent_at = models.DateTimeField(default=timezone.now)
    
    def __str__(self):
        return f"Message in {self.forum.title} by {self.sender_type} {self.sender_id}"
    
    @property
    def sender(self):
        if self.sender_type == 'instructor':
            return Instructor.objects.get(id=self.sender_id)
        else:
            return Student.objects.get(id=self.sender_id)

class ForumAttachment(models.Model):
    message = models.ForeignKey(ForumMessage, on_delete=models.CASCADE, related_name='attachments')
    forum = models.ForeignKey(Forum, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to=forum_file_upload_path)
    file_name = models.CharField(max_length=255)
    file_type = models.CharField(max_length=100)
    uploaded_at = models.DateTimeField(default=timezone.now)
    sender_type = models.CharField(max_length=10, choices=ForumMessage.SENDER_TYPES)
    sender_id = models.IntegerField()
    
    def __str__(self):
        return self.file_name