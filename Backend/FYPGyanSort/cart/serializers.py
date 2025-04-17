from rest_framework import serializers
from .models import CartItem, Favorite
from courses.serializers import CourseSerializer

class CartItemSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = CartItem
        fields = ['id', 'course', 'added_at', 'course_details']
        read_only_fields = ['added_at']


class FavoriteSerializer(serializers.ModelSerializer):
    course_details = CourseSerializer(source='course', read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'course', 'added_at', 'course_details']
        read_only_fields = ['added_at']