from django.db import models
from django.utils import timezone

class Payment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    )
    
    PAYMENT_TYPE_CHOICES = (
        ('khalti', 'Khalti'),
        ('cash', 'Cash'),
    )
    
    transaction_id = models.CharField(max_length=100, unique=True, null=True, blank=True)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    payment_type = models.CharField(max_length=20, choices=PAYMENT_TYPE_CHOICES, default='khalti')
    user_email = models.EmailField()
    user_type = models.CharField(max_length=20, choices=(('student', 'Student'), ('instructor', 'Instructor')))
    user_id = models.IntegerField()
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Additional fields for payment details
    product_name = models.CharField(max_length=255, default="GyanSort Course")
    description = models.TextField(blank=True, null=True)
    
    # Khalti specific fields
    pidx = models.CharField(max_length=100, blank=True, null=True)  # Khalti payment ID
    
    def __str__(self):
        return f"{self.payment_type} Payment - {self.transaction_id} ({self.status})"

class EsewaPayment(models.Model):
    PAYMENT_STATUS_CHOICES = (
        ('pending', 'Pending'),
        ('success', 'Success'),
        ('failed', 'Failed'),
    )
    user_email = models.EmailField()
    user_id = models.IntegerField()
    product_id = models.CharField(max_length=100)
    transaction_uuid = models.CharField(max_length=100)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default='pending')
    ref_id = models.CharField(max_length=100, blank=True, null=True)
    raw_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(default=timezone.now)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user_email} - {self.transaction_uuid} - {self.status}"