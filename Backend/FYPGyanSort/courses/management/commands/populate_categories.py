from django.core.management.base import BaseCommand
from courses.models import Category

class Command(BaseCommand):
    help = 'Populate initial course categories'

    def handle(self, *args, **kwargs):
        for category_code, category_name in Category.CATEGORY_CHOICES:
            Category.objects.get_or_create(
                name=category_code,
                defaults={
                    'description': Category.get_default_description(category_code)
                }
            )
        self.stdout.write(self.style.SUCCESS('Successfully populated categories'))