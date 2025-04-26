from django.db.models.signals import pre_save
from django.dispatch import receiver
from .models import Instructor
from .views import send_verification_status_email

@receiver(pre_save, sender=Instructor)
def handle_status_change(sender, instance, **kwargs):
    try:
        # Get the instructor before save
        if instance.pk:
            old_instance = Instructor.objects.get(pk=instance.pk)
            # Check if verification_status has changed
            if old_instance.verification_status != instance.verification_status:
                send_verification_status_email(instance, instance.verification_status)
    except Instructor.DoesNotExist:
        pass