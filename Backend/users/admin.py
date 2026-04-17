from django.contrib import admin
from .models import AppUser, SupplierProfile, ConsumerProfile, Address, Notification, PromotionalMessage

@admin.register(AppUser)
class AppUserAdmin(admin.ModelAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'is_active', 'created_at')
    list_filter = ('role', 'is_active')
    search_fields = ('username', 'email', 'phone')
    ordering = ('-created_at',)

@admin.register(SupplierProfile)
class SupplierProfileAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'user', 'gst_number')
    search_fields = ('company_name', 'gst_number', 'user__username')

@admin.register(ConsumerProfile)
class ConsumerProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'wallet_balance', 'is_opted_in')
    search_fields = ('user__username',)

@admin.register(Address)
class AddressAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'user', 'city', 'state', 'pincode', 'is_default')
    list_filter = ('state', 'is_default')
    search_fields = ('full_name', 'pincode', 'city')

@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('user', 'title', 'type', 'is_read', 'created_at')
    list_filter = ('type', 'is_read')

@admin.register(PromotionalMessage)
class PromotionalMessageAdmin(admin.ModelAdmin):
    list_display = ('title', 'target_role', 'sent_at')
