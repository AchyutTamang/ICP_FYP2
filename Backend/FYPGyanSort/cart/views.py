from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import CartItem, Favorite
from .serializers import CartItemSerializer, FavoriteSerializer
from courses.models import Course

class IsVerifiedStudent(permissions.BasePermission):
    """
    Custom permission to only allow verified students to access the view.
    """
    message = "Only verified students can perform this action."

    def has_permission(self, request, view):
        # Check if user is authenticated and is a student
        if not request.user.is_authenticated:
            return False
        
        # Check if the user is verified
        # Assuming Student model has an 'is_verified' field
        return hasattr(request.user, 'email_verified') and request.user.email_verified

class CartViewSet(viewsets.ModelViewSet):
    serializer_class = CartItemSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedStudent]

    def get_queryset(self):
        return CartItem.objects.filter(student=self.request.user)

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already in cart
        if CartItem.objects.filter(student=request.user, course=course).exists():
            return Response({"error": "Course already in cart"}, status=status.HTTP_400_BAD_REQUEST)
        
        cart_item = CartItem(student=request.user, course=course)
        cart_item.save()
        
        serializer = self.get_serializer(cart_item)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def move_to_favorites(self, request, pk=None):
        try:
            cart_item = self.get_queryset().get(pk=pk)
        except CartItem.DoesNotExist:
            return Response({"error": "Item not found in cart"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already in favorites
        if Favorite.objects.filter(student=request.user, course=cart_item.course).exists():
            # Remove from cart since it's already in favorites
            cart_item.delete()
            return Response({"message": "Item removed from cart as it's already in favorites"})
        
        # Add to favorites
        favorite = Favorite(student=request.user, course=cart_item.course)
        favorite.save()
        
        # Remove from cart
        cart_item.delete()
        
        return Response({"message": "Item moved from cart to favorites"})


class FavoriteViewSet(viewsets.ModelViewSet):
    serializer_class = FavoriteSerializer
    permission_classes = [permissions.IsAuthenticated, IsVerifiedStudent]

    def get_queryset(self):
        return Favorite.objects.filter(student=self.request.user)

    def create(self, request, *args, **kwargs):
        course_id = request.data.get('course')
        
        try:
            course = Course.objects.get(id=course_id)
        except Course.DoesNotExist:
            return Response({"error": "Course not found"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already in favorites
        if Favorite.objects.filter(student=request.user, course=course).exists():
            return Response({"error": "Course already in favorites"}, status=status.HTTP_400_BAD_REQUEST)
        
        favorite = Favorite(student=request.user, course=course)
        favorite.save()
        
        serializer = self.get_serializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def move_to_cart(self, request, pk=None):
        try:
            favorite = self.get_queryset().get(pk=pk)
        except Favorite.DoesNotExist:
            return Response({"error": "Item not found in favorites"}, status=status.HTTP_404_NOT_FOUND)
        
        # Check if already in cart
        if CartItem.objects.filter(student=request.user, course=favorite.course).exists():
            # Remove from favorites since it's already in cart
            favorite.delete()
            return Response({"message": "Item removed from favorites as it's already in cart"})
        
        # Add to cart
        cart_item = CartItem(student=request.user, course=favorite.course)
        cart_item.save()
        
        # Remove from favorites
        favorite.delete()
        
        return Response({"message": "Item moved from favorites to cart"})