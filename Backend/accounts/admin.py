from django.contrib import admin
from .models import UserProfile, Membership

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'role', 'phone', 'name')
    search_fields = ('user__username', 'phone', 'name')
    list_filter = ('role',)

@admin.register(Membership)
class MembershipAdmin(admin.ModelAdmin):
    list_display = ('user', 'membership_type', 'is_student_verified', 'cashback_percentage', 'membership_start')
    list_filter = ('membership_type', 'is_student_verified')
    search_fields = ('user__username',)
