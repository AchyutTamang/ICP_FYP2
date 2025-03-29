from rest_framework import serializers
from .models import Student

class StudentRegistrationSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    
    class Meta:
        model = Student
        fields = ('email', 'fullname', 'password', 'profile_pic')
        
    def create(self, validated_data):
        student = Student.objects.create_user(
            email=validated_data['email'],
            fullname=validated_data['fullname'],
            password=validated_data['password']
        )
        if 'profile_pic' in validated_data:
            student.profile_pic = validated_data['profile_pic']
            student.save()
        return student

class StudentLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

class StudentProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Student
        fields = ('id', 'fullname', 'email', 'profile_pic', 'student_id', 'enrollment_count', 'date_joined')
        read_only_fields = ('id', 'student_id', 'enrollment_count', 'date_joined')