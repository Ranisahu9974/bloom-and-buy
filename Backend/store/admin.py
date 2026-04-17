from django.contrib import admin
from .models import Category, Product, Banner, Cart, CartItem, Wishlist

@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'stock', 'category', 'supplier', 'approval_status', 'is_active', 'created_at')
    list_filter = ('category', 'approval_status', 'is_active', 'seasonal_tag')
    search_fields = ('name', 'description', 'brand')
    list_editable = ('price', 'stock', 'approval_status', 'is_active')

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name',)
    search_fields = ('name',)

@admin.register(Banner)
class BannerAdmin(admin.ModelAdmin):
    list_display = ('title', 'is_active')

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ('user', 'created_at')

@admin.register(CartItem)
class CartItemAdmin(admin.ModelAdmin):
    list_display = ('cart', 'product', 'quantity')

@admin.register(Wishlist)
class WishlistAdmin(admin.ModelAdmin):
    list_display = ('user',)
