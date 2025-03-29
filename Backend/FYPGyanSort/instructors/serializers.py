from rest_framework import serializers
from .models import Instructor
from django.contrib.auth.password_validation import validate_password

class InstructorRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True, validators=[validate_password])
    password2 = serializers.CharField(write_only=True, required=True)
    verification_document = serializers.FileField(required=True)
    profile_picture = serializers.ImageField(required=False)
    
    class Meta:
        model = Instructor
        fields = ('email', 'fullname', 'password', 'password2', 'verification_document', 'profile_picture', 'bio')
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError({"password": "Password fields didn't match."})
        
        # Validate file is PDF
        document = attrs.get('verification_document')
        if document:
            if not document.name.endswith('.pdf'):
                raise serializers.ValidationError({"verification_document": "Only PDF files are allowed."})
            if document.size > 5 * 1024 * 1024:  # 5MB limit
                raise serializers.ValidationError({"verification_document": "File size cannot exceed 5MB."})
        
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        
        instructor = Instructor.objects.create(
            email=validated_data['email'],
            fullname=validated_data['fullname'],
            verification_document=validated_data['verification_document'],
            profile_picture=validated_data.get('profile_picture'),
            bio=validated_data.get('bio', ''),
            is_active=False,  # Inactive until email is verified
            verification_status='pending'
        )
        
        instructor.set_password(validated_data['password'])
        instructor.save()
        
        return instructor

class InstructorLoginSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)
    password = serializers.CharField(required=True, write_only=True)

class InstructorProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Instructor
        fields = ('id', 'email', 'fullname', 'bio', 'verification_status', 'email_verified', 'profile_picture')
        read_only_fields = ('email', 'verification_status', 'email_verified')