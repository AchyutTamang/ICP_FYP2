from rest_framework_simplejwt.tokens import RefreshToken

class InstructorRefreshToken(RefreshToken):
    @classmethod
    def for_user(cls, user):
        """
        Custom token generator for instructors
        """
        token = cls()
        token['user_id'] = user.id
        token['email'] = user.email
        token['fullname'] = user.fullname
        token['user_type'] = 'instructor'
        
        return token