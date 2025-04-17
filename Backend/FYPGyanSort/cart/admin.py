from django.contrib import admin
from .models import CartItem, Favorite

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('student__email', 'course__title')

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('student', 'course', 'added_at')
    list_filter = ('added_at',)
    search_fields = ('student__email', 'course__title')