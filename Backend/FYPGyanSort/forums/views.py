from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db.models import Q
from .models import Forum, ForumMembership, ForumMessage, ForumAttachment
from .serializers import ForumSerializer, ForumMembershipSerializer, ForumMessageSerializer, ForumAttachmentSerializer
from .permissions import IsVerifiedInstructor, IsVerifiedStudent, IsForumMember
from rest_framework.exceptions import PermissionDenied

class ForumViewSet(viewsets.ModelViewSet):
    serializer_class = ForumSerializer
    
    def get_permissions(self):
        if self.action in ['create']:
            return [permissions.IsAuthenticated(), IsVerifiedInstructor()]
        return [permissions.IsAuthenticated()]
    
    def get_queryset(self):
        user = self.request.user
        
        # For list and retrieve actions, return all forums
        if self.action in ['list', 'retrieve']:
            return Forum.objects.all()
        
        # For other actions, use restrictive filtering
        if hasattr(user, 'instructor'):
            return Forum.objects.filter(created_by=user.instructor)
        
        if hasattr(user, 'student'):
            return Forum.objects.filter(memberships__student=user.student, memberships__is_active=True)
        
        return Forum.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        
        print("=" * 50)
        print("FORUM CREATION ATTEMPT")
        print(f"Request method: {self.request.method}")
        print(f"Request content type: {self.request.content_type}")
        print(f"Request data: {self.request.data}")
        print(f"User: {user.email} (ID: {user.id})")
        print(f"Has instructor attribute: {hasattr(user, 'instructor')}")
        
        # Check for instructor headers
        instructor_email = self.request.headers.get('X-User-Email')
        is_instructor_request = self.request.data.get('is_instructor_request', False)
        
        print(f"X-User-Email header: {instructor_email}")
        print(f"is_instructor_request flag: {is_instructor_request}")
        
        # If instructor headers are present, try to find the instructor by email
        if instructor_email:
            from instructors.models import Instructor
            try:
                instructor = Instructor.objects.get(email=instructor_email)
                print(f"Found instructor by email header: {instructor}")
                serializer.save(created_by=instructor, is_active=True)
                print("Forum created successfully with instructor from header")
                return
            except Instructor.DoesNotExist:
                print(f"No instructor found with email: {instructor_email}")
        
        # Fall back to checking if the user has an instructor attribute
        if hasattr(user, 'instructor'):
            print(f"Using instructor from user object: {user.instructor}")
            serializer.save(created_by=user.instructor, is_active=True)
            print("Forum created successfully with instructor from user object")
            return
        
        # Try to find if this user has an instructor profile by email
        from instructors.models import Instructor
        try:
            instructor = Instructor.objects.get(email=user.email)
            print(f"Found instructor by user email: {instructor}")
            serializer.save(created_by=instructor, is_active=True)
            print("Forum created successfully with instructor found by email")
            return
        except Instructor.DoesNotExist:
            print(f"No instructor profile found for user: {user.email}")
            
        print("FORUM CREATION FAILED - No valid instructor found")
        raise PermissionDenied("Only instructors can create forums")
    
    @action(detail=True, methods=['post'], url_path='join')
    def join(self, request, pk=None, forum_id=None):
        # Use either pk or forum_id depending on your URL configuration
        forum_id_to_use = forum_id if forum_id is not None else pk
        
        try:
            forum = Forum.objects.get(pk=forum_id_to_use)
            
            # Debug information
            print(f"User attempting to join forum: {request.user.email}")
            print(f"Has student attribute: {hasattr(request.user, 'student')}")
            
            # Check if the user is a student
            if not hasattr(request.user, 'student'):
                # Try to find if this user has a student profile by email
                from students.models import Student
                try:
                    student = Student.objects.get(email=request.user.email)
                    print(f"Found student by email: {student}")
                    # Link the student to the user for this request
                    setattr(request.user, 'student', student)
                except Student.DoesNotExist:
                    print(f"No student profile found for email: {request.user.email}")
                    return Response({"detail": "Only students can join forums. Please create a student profile first."}, 
                                   status=status.HTTP_400_BAD_REQUEST)
            
            student = request.user.student
            print(f"Student found: {student}")
            
            # Verify that the student is verified
            if not student.email_verified:
                return Response({"detail": "Your student account must be verified before joining forums."}, 
                               status=status.HTTP_400_BAD_REQUEST)
            
            # Check if the student is already a member
            if ForumMembership.objects.filter(forum=forum, student=student, is_active=True).exists():
                return Response({"detail": "You are already a member of this forum."}, status=status.HTTP_400_BAD_REQUEST)
            
            # Create membership
            membership = ForumMembership.objects.create(
                forum=forum,
                student=student,
                is_active=True
            )
            
            serializer = ForumMembershipSerializer(membership)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except Forum.DoesNotExist:
            return Response({"detail": "Forum not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in join forum: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'], url_path='leave')
    def leave(self, request, pk=None, forum_id=None):
        try:
            # Use either pk or forum_id depending on your URL configuration
            forum_id_to_use = forum_id if forum_id is not None else pk
            
            # Directly fetch the forum by ID instead of using get_object()
            forum = Forum.objects.get(pk=forum_id_to_use)
            
            # Debug information
            print(f"User attempting to leave forum: {request.user.email}")
            print(f"Has student attribute: {hasattr(request.user, 'student')}")
            
            # Check if the user is a student
            if not hasattr(request.user, 'student'):
                # Try to find if this user has a student profile by email
                from students.models import Student
                try:
                    student = Student.objects.get(email=request.user.email)
                    print(f"Found student by email: {student}")
                    # Link the student to the user for this request
                    setattr(request.user, 'student', student)
                except Student.DoesNotExist:
                    print(f"No student profile found for email: {request.user.email}")
                    return Response({"error": "Only students can leave forums"}, status=status.HTTP_400_BAD_REQUEST)
            
            student = request.user.student
            print(f"Student found: {student}")
            
            try:
                # Get the membership record and update it
                membership = ForumMembership.objects.get(forum=forum, student=student)
                print(f"Found membership ID: {membership.id}, current is_active: {membership.is_active}")
                
                # Simply update is_active to False
                membership.is_active = False
                membership.save()
                print(f"Updated membership with ID: {membership.id}, is_active: {membership.is_active}")
                
                return Response({"message": "Successfully left the forum"}, status=status.HTTP_200_OK)
            except ForumMembership.DoesNotExist:
                return Response({"error": "You are not a member of this forum"}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                print(f"Database error: {str(e)}")
                return Response({"error": f"Database error: {str(e)}"}, status=status.HTTP_400_BAD_REQUEST)
        except Forum.DoesNotExist:
            return Response({"detail": "Forum not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            print(f"Error in leave forum: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ForumMessageViewSet(viewsets.ModelViewSet):
    serializer_class = ForumMessageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get forum ID from URL parameter
        forum_id = self.request.query_params.get('forum')
        if not forum_id:
            return ForumMessage.objects.none()
        
        # Check if user has access to this forum
        if hasattr(user, 'instructor'):
            forum_exists = Forum.objects.filter(id=forum_id, created_by=user.instructor).exists()
        elif hasattr(user, 'student'):
            forum_exists = ForumMembership.objects.filter(forum_id=forum_id, student=user.student, is_active=True).exists()
        else:
            forum_exists = False
        
        if not forum_exists:
            return ForumMessage.objects.none()
        
        return ForumMessage.objects.filter(forum_id=forum_id).order_by('sent_at')

    def perform_create(self, serializer):
        user = self.request.user
        
        # Get the forum ID from the request data
        forum_id = self.request.data.get('forum_id') or self.request.data.get('forum')
        
        print(f"Request data: {self.request.data}")
        print(f"Looking for forum with ID: {forum_id}")
        
        # Validate that forum exists
        try:
            forum = Forum.objects.get(id=forum_id)
            print(f"Found forum: {forum}")
            
            # Check if the user is a student or instructor
            if not hasattr(user, 'student') and not hasattr(user, 'instructor'):
                # Try to find if this user has a student profile by email
                from students.models import Student
                try:
                    student = Student.objects.get(email=user.email)
                    print(f"Found student by email: {student}")
                    # Link the student to the user for this request
                    setattr(user, 'student', student)
                except Student.DoesNotExist:
                    # Try to find if this user has an instructor profile by email
                    from instructors.models import Instructor
                    try:
                        instructor = Instructor.objects.get(email=user.email)
                        print(f"Found instructor by email: {instructor}")
                        # Link the instructor to the user for this request
                        setattr(user, 'instructor', instructor)
                    except Instructor.DoesNotExist:
                        print(f"User {user.email} has no instructor or student profile")
                        raise PermissionDenied("Invalid user type")
            
            # Check if user has permission to post in this forum
            if hasattr(user, 'instructor'):
                # Instructors can post if they created the forum
                if forum.created_by != user.instructor:
                    print(f"Instructor {user.instructor} is not the creator of forum {forum}")
                    raise PermissionDenied("You don't have permission to post in this forum")
            elif hasattr(user, 'student'):
                # Students can post if they are active members
                if not ForumMembership.objects.filter(forum=forum, student=user.student, is_active=True).exists():
                    print(f"Student {user.student} is not an active member of forum {forum}")
                    raise PermissionDenied("You must be an active member to post in this forum")
            else:
                print(f"User {user.email} has no instructor or student profile")
                raise PermissionDenied("Invalid user type")
            
            # Set sender type and ID based on user type
            if hasattr(user, 'instructor'):
                sender_type = 'instructor'
                sender_id = user.instructor.id
            elif hasattr(user, 'student'):
                sender_type = 'student'
                sender_id = user.student.id
            
            print(f"Setting sender_type={sender_type}, sender_id={sender_id}")
            
            # Save the message with the forum and sender information
            serializer.save(
                forum=forum,
                sender_type=sender_type,
                sender_id=sender_id
            )
        except Forum.DoesNotExist:
            print(f"Forum with ID {forum_id} not found")
            raise PermissionDenied("Forum not found")

class ForumAttachmentViewSet(viewsets.ModelViewSet):
    serializer_class = ForumAttachmentSerializer
    # Fixed: Removed parentheses from IsAuthenticated
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        
        # Get message ID from URL parameter
        message_id = self.request.query_params.get('message')
        if not message_id:
            return ForumAttachment.objects.none()
        
        # Check if user has access to the forum this message belongs to
        try:
            message = ForumMessage.objects.get(id=message_id)
            forum = message.forum
            
            if hasattr(user, 'instructor') and forum.created_by == user.instructor:
                return ForumAttachment.objects.filter(message_id=message_id)
            elif hasattr(user, 'student') and forum.memberships.filter(student=user.student, is_active=True).exists():
                return ForumAttachment.objects.filter(message_id=message_id)
            
            return ForumAttachment.objects.none()
        except ForumMessage.DoesNotExist:
            return ForumAttachment.objects.none()
    
    def perform_create(self, serializer):
        user = self.request.user
        
        # Get the message ID from the request data
        message_id = self.request.data.get('message')
        print(f"Request data for attachment: {self.request.data}")
        print(f"Looking for message with ID: {message_id}")
        print(f"User email: {user.email}")
        print(f"User ID: {user.id}")
        # Only print username if it exists
        if hasattr(user, 'username'):
            print(f"User username: {user.username}")
        
        # Override user profile based on token data if available
        sender_type = self.request.data.get('sender_type')
        sender_id = self.request.data.get('sender_id')
        
        print(f"Token sender_type: {sender_type}, sender_id: {sender_id}")
        
        if sender_type == 'instructor':
            # Force use the instructor profile from the token
            from instructors.models import Instructor
            try:
                instructor = Instructor.objects.get(id=sender_id)
                print(f"Found instructor by ID from token: {instructor}")
                # Link the instructor to the user for this request
                setattr(user, 'instructor', instructor)
                # Remove any student attribute if it exists
                if hasattr(user, 'student'):
                    delattr(user, 'student')
            except Instructor.DoesNotExist:
                print(f"No instructor found with ID: {sender_id}")
        
        try:
            # Try to get the message
            message = ForumMessage.objects.get(id=message_id)
            forum = message.forum
            print(f"Found message: {message}, in forum: {forum}")
            
            # Check if the user is a student or instructor
            if not hasattr(user, 'student') and not hasattr(user, 'instructor'):
                # First try to find if this user has an instructor profile by email
                from instructors.models import Instructor
                try:
                    instructor = Instructor.objects.get(email=user.email)
                    print(f"Found instructor by email: {instructor}")
                    # Link the instructor to the user for this request
                    setattr(user, 'instructor', instructor)
                except Instructor.DoesNotExist:
                    # If not an instructor, try to find if this user has a student profile
                    from students.models import Student
                    try:
                        student = Student.objects.get(email=user.email)
                        print(f"Found student by email: {student}")
                        # Link the student to the user for this request
                        setattr(user, 'student', student)
                    except Student.DoesNotExist:
                        print(f"User {user.email} has no instructor or student profile")
                        raise PermissionDenied("Invalid user type")
            
            # Check if user has permission to add attachment to this message
            if hasattr(user, 'instructor'):
                print(f"User is instructor: {user.instructor}")
                # Instructors can add attachments if they created the forum
                if forum.created_by != user.instructor:
                    print(f"Instructor {user.instructor} is not the creator of forum {forum}")
                    raise PermissionDenied("You don't have permission to add attachments to this forum")
            elif hasattr(user, 'student'):
                print(f"User is student: {user.student}")
                # Students can add attachments if they are active members
                if not ForumMembership.objects.filter(forum=forum, student=user.student, is_active=True).exists():
                    print(f"Student {user.student} is not an active member of forum {forum}")
                    raise PermissionDenied("You must be an active member to add attachments to this forum")
            else:
                print(f"User {user.email} has no instructor or student profile")
                raise PermissionDenied("Invalid user type")
            
            # Set sender type and ID based on user type
            if hasattr(user, 'instructor'):
                sender_type = 'instructor'
                sender_id = user.instructor.id
            elif hasattr(user, 'student'):
                sender_type = 'student'
                sender_id = user.student.id
            
            print(f"Setting sender_type={sender_type}, sender_id={sender_id}")
            
            # Validate file type (PDF or image)
            file = self.request.FILES.get('file')
            if not file:
                raise serializers.ValidationError("No file provided")
                
            file_type = file.content_type
            print(f"File type: {file_type}")
            
            if not (file_type.startswith('image/') or file_type == 'application/pdf'):
                raise serializers.ValidationError("Only images and PDF files are allowed")
            
            # Save the attachment
            serializer.save(
                message=message,
                forum=forum,
                sender_type=sender_type,
                sender_id=sender_id,
                file_type=file_type,
                file_name=file.name
            )
        except ForumMessage.DoesNotExist:
            print(f"Message with ID {message_id} not found")
            raise PermissionDenied("Message not found")
        except Exception as e:
            print(f"Error creating attachment: {str(e)}")
            raise PermissionDenied(f"Error creating attachment: {str(e)}")


@action(detail=False, methods=['post', 'get'], url_path='test-auth')
def test_auth(self, request):
        print("=" * 50)
        print("TEST AUTH ENDPOINT REACHED")
        print(f"Request method: {request.method}")
        print(f"User: {request.user.email} (ID: {request.user.id})")
        print(f"Has instructor attribute: {hasattr(request.user, 'instructor')}")
        print(f"Has student attribute: {hasattr(request.user, 'student')}")
        print(f"Headers: {request.headers}")
        
        # Check token information
        auth_header = request.headers.get('Authorization', '')
        if auth_header.startswith('Bearer '):
            token = auth_header.split(' ')[1]
            print(f"Token: {token[:10]}...")
            
            # Decode token to check payload
            import jwt
            from django.conf import settings
            try:
                decoded = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
                print(f"Decoded token: {decoded}")
            except Exception as e:
                print(f"Error decoding token: {e}")
        
        # Return user information
        response_data = {
            "email": request.user.email,
            "user_id": request.user.id,
            "is_instructor": hasattr(request.user, 'instructor'),
            "is_student": hasattr(request.user, 'student')
        }
        
        if hasattr(request.user, 'instructor'):
            response_data["instructor_email"] = request.user.instructor.email
            response_data["instructor_id"] = request.user.instructor.id
            
        if hasattr(request.user, 'student'):
            response_data["student_email"] = request.user.student.email
            response_data["student_id"] = request.user.student.id
            
        return Response(response_data, status=status.HTTP_200_OK)

class ForumParticipantViewSet(viewsets.ModelViewSet):
    serializer_class = ForumMembershipSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        forum_id = self.request.query_params.get('forum')
        
        try:
            forum = Forum.objects.get(id=forum_id)
            
            # Instructors can see all participants of forums they created
            if hasattr(user, 'instructor') and forum.created_by == user.instructor:
                return ForumMembership.objects.filter(forum=forum)
            
            # Students can see participants if they are members
            if hasattr(user, 'student') and forum.memberships.filter(student=user.student, is_active=True).exists():
                return ForumMembership.objects.filter(forum=forum, is_active=True)
            
            return ForumMembership.objects.none()
            
        except Forum.DoesNotExist:
            return ForumMembership.objects.none()