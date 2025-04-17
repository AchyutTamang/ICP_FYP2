from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CartViewSet, FavoriteViewSet

router = DefaultRouter()
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'favorites', FavoriteViewSet, basename='favorites')

urlpatterns = [
    path('', include(router.urls)),
]