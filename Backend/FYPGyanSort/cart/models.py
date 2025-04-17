from django.db import models
from students.models import Student
from courses.models import Course
from django.utils import timezone

class CartItem(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='cart_items')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"


class Favorite(models.Model):
    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='favorites')
    course = models.ForeignKey(Course, on_delete=models.CASCADE)
    added_at = models.DateTimeField(default=timezone.now)

    class Meta:
        unique_together = ('student', 'course')
        ordering = ['-added_at']

    def __str__(self):
        return f"{self.student.email} - {self.course.title}"