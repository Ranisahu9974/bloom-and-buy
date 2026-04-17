from django.contrib import admin
from .models import Order, OrderItem, Payment


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0


class OrderAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "total_price", "status", "payment_status", "is_paid", "created_at")
    list_filter = ("status", "payment_status", "is_paid", "created_at")
    search_fields = ("user__username", "id")
    inlines = [OrderItemInline]


class PaymentAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "order_id",
        "user",
        "amount",
        "payment_method",
        "is_successful",
        "created_at",
    )

    def order_id(self, obj):
        return obj.order.id
    order_id.short_description = "Order ID"

    def user(self, obj):
        return obj.order.user.username
    user.short_description = "User"


admin.site.register(Order, OrderAdmin)
admin.site.register(Payment, PaymentAdmin)

