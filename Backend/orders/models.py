from django.db import models
from users.models import ConsumerProfile
from store.models import Product
from django.contrib.auth.models import User

# Create your models here.

class Order(models.Model):
    STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Confirmed", "Confirmed"),
        ("Packed", "Packed"),
        ("Shipped", "Shipped"),
        ("In Transit", "In Transit"),
        ("Out for Delivery", "Out for Delivery"),
        ("Delivered", "Delivered"),
        ("Cancelled", "Cancelled"),
        ("Refunded", "Refunded"),
    ]

    PAYMENT_STATUS_CHOICES = [
        ("Pending", "Pending"),
        ("Success", "Success"),
        ("Failed", "Failed"),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Financial Breakdown
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    cgst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    sgst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    igst = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    shipping = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    total_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    
    is_paid = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Pending")
    payment_status = models.CharField(max_length=20, choices=PAYMENT_STATUS_CHOICES, default="Pending")
    
    # Snapshot of the address used for this order
    delivery_address = models.JSONField(help_text="Snapshot of the address at time of order", null=True, blank=True)
    
    # Logistic details
    tracking_id = models.CharField(max_length=100, blank=True, null=True)
    carrier = models.CharField(max_length=100, blank=True, null=True)
    estimated_delivery = models.DateField(blank=True, null=True)
    
    # Tracking History (Timestamps for each stage)
    # Format: [{"status": "Pending", "time": "2024-04-10T10:00:00Z", "message": "Order placed successfully"}]
    tracking_history = models.JSONField(default=list, blank=True)

    def __str__(self):
        return f"Order #{self.id} - {self.user.username} - ₹{self.total_price}"


class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='order_items')
    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)


class Payment(models.Model):
    order = models.OneToOneField(Order, on_delete=models.CASCADE, related_name='payment')
    payment_method = models.CharField(max_length=50, default='Razorpay')
    transaction_id = models.CharField(max_length=100, blank=True, null=True) # General tx id
    
    # Razorpay specific
    razorpay_order_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_payment_id = models.CharField(max_length=100, blank=True, null=True)
    razorpay_signature = models.CharField(max_length=255, blank=True, null=True)
    
    amount = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_successful = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='Pending')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Payment #{self.id} - Order #{self.order.id} - {self.order.user.username}"
