from rest_framework import serializers
from .models import Order, OrderItem, Payment

class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    imageURL = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ['id', 'product', 'product_name', 'quantity', 'price', 'imageURL']

    def get_imageURL(self, obj):
        if obj.product and obj.product.image:
            img_val = str(obj.product.image)
            if img_val.startswith('http'):
                return img_val
            return obj.product.image.url
        return None

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    user = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='created_at', read_only=True)
    totalAmount = serializers.DecimalField(source='total_price', max_digits=10, decimal_places=2, read_only=True)

    class Meta:
        model = Order
        fields = [
            'id', 'user', 'createdAt', 'subtotal', 'discount', 
            'shipping', 'cgst', 'sgst', 'igst', 'total_price', 'totalAmount', 
            'is_paid', 'status', 'payment_status', 'items', 
            'delivery_address', 'tracking_history', 'tracking_id', 
            'carrier', 'estimated_delivery'
        ]

    def get_user(self, obj):
        return {
            'id': obj.user.id,
            'name': obj.user.username,
            'email': obj.user.email
        }

class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"