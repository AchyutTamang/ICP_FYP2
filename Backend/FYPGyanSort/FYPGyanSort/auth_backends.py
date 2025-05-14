class MultiModelBackend:
    """
    Custom authentication backend that checks both Student and Instructor models.
    """
    def authenticate(self, request, username=None, password=None, **kwargs):
        # Check if this is a token authentication request
        if request and hasattr(request, 'auth') and request.auth:
            print(f"Token authentication detected for user: {request.user}")
            
            # Check for instructor headers
            instructor_email = request.headers.get('X-User-Email')
            instructor_role = request.headers.get('X-User-Role')
            
            if instructor_email and instructor_role == 'instructor':
                print(f"Instructor headers detected: {instructor_email}")
                from instructors.models import Instructor
                try:
                    instructor = Instructor.objects.get(email=instructor_email)
                    print(f"Found instructor by email header: {instructor}")
                    # Set the instructor attribute on the user
                    if not hasattr(request.user, 'instructor'):
                        setattr(request.user, 'instructor', instructor)
                    return request.user
                except Instructor.DoesNotExist:
                    print(f"No instructor found with email: {instructor_email}")
            
            return request.user
            
        # For username/password authentication
        if username is None:
            username = kwargs.get('email')
            
        if username is None or password is None:
            return None
            
        # Try authenticating as a Student first
        from students.models import Student
        try:
            student = Student.objects.get(email=username)
            if student.check_password(password):
                return student
        except Student.DoesNotExist:
            pass
            
        # Then try as an Instructor
        from instructors.models import Instructor
        try:
            instructor = Instructor.objects.get(email=username)
            if instructor.check_password(password):
                return instructor
        except Instructor.DoesNotExist:
            pass
            
        return None
        
    def get_user(self, user_id):
        # Try to get a Student with this ID
        from students.models import Student
        try:
            return Student.objects.get(pk=user_id)
        except Student.DoesNotExist:
            pass
            
        # Then try to get an Instructor with this ID
        from instructors.models import Instructor
        try:
            return Instructor.objects.get(pk=user_id)
        except Instructor.DoesNotExist:
            pass
            
        return None