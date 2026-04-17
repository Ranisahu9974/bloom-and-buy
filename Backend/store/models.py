from django.db import models
from django.conf import settings
from django.contrib.auth.models import User


class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(unique=True, null=True, blank=True)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Product(models.Model):
    supplier = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        null=True,
        blank=True
    )

    category = models.ForeignKey(
        Category,
        on_delete=models.SET_NULL,
        null=True,
        blank=True
    )

    name = models.CharField(max_length=200)
    description = models.TextField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.PositiveIntegerField()
    is_active = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    image = models.ImageField(upload_to='products/', null=True, blank=True)
    base_price = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    seasonal_tag = models.CharField(max_length=50, blank=True, null=True)
    brand = models.CharField(max_length=100, blank=True, null=True)
    tags = models.CharField(max_length=255, blank=True, null=True)
    approval_status = models.CharField(max_length=20, default='pending', choices=[('pending', 'Pending'), ('approved', 'Approved'), ('rejected', 'Rejected')])
    rejection_reason = models.TextField(blank=True, null=True)

    def __str__(self):
        return self.name


# ✅ ADD THIS
class Cart(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Cart of {self.user.username}"


# ✅ ADD THIS
class CartItem(models.Model):
    cart = models.ForeignKey(Cart, related_name='items',  on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.product.name} ({self.quantity})"

class Banner(models.Model):
    title = models.CharField(max_length=200)
    subtitle = models.TextField()
    background_gradient = models.CharField(max_length=255, default='linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 60%, #0d47a1 100%)')
    accent_color = models.CharField(max_length=20, default='#4fc3f7')
    link = models.CharField(max_length=255, default='/products')
    button_text = models.CharField(max_length=50, default='Shop Now')
    badge_text = models.CharField(max_length=50, default='🔥 Hot Deals')
    emoji = models.CharField(max_length=10, default='⚡')
    is_active = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)

    def __str__(self):
        return self.title



class Wishlist(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="wishlist")
    products = models.ManyToManyField(Product, related_name="wishlists", blank=True)

    def __str__(self):
        return f"Wishlist of {self.user.username}"
