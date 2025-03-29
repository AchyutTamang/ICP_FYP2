from django.contrib.auth.backends import ModelBackend
from django.contrib.auth import get_user_model
from instructors.models import Instructor
import logging

logger = logging.getLogger(__name__)

class MultiModelBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        # First try to authenticate with the default user model (Student)
        UserModel = get_user_model()
        if username is None:
            username = kwargs.get(UserModel.USERNAME_FIELD)
        
        logger.debug(f"Attempting to authenticate: {username}")
        
        # Try Student model first
        try:
            user = UserModel.objects.get(email=username)
            logger.debug(f"Found student: {username}, checking password")
            if user.check_password(password):
                logger.debug(f"Password is correct for student: {username}")
                return user
            logger.debug(f"Password is incorrect for student: {username}")
            return None
        except UserModel.DoesNotExist:
            logger.debug(f"Student not found: {username}, trying instructor")
            # If student doesn't exist, try instructor
            try:
                instructor = Instructor.objects.get(email=username)
                logger.debug(f"Found instructor: {username}, checking password")
                if instructor.check_password(password):
                    logger.debug(f"Password is correct for instructor: {username}")
                    return instructor
                logger.debug(f"Password is incorrect for instructor: {username}")
                return None
            except Instructor.DoesNotExist:
                logger.debug(f"Instructor not found: {username}")
                return None

    def get_user(self, user_id):
        # Try to get user from Student model
        UserModel = get_user_model()
        try:
            return UserModel.objects.get(pk=user_id)
        except UserModel.DoesNotExist:
            # If not found, try Instructor model
            try:
                return Instructor.objects.get(pk=user_id)
            except Instructor.DoesNotExist:
                return None