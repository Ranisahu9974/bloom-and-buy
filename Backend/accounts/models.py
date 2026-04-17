from django.db import models

# Create your models here.
from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, default='customer')
    phone = models.CharField(max_length=20, blank=True, null=True)
    name = models.CharField(max_length=150, blank=True, null=True)
    avatar = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.user.username} - {self.role}"

class Membership(models.Model):

    MEMBERSHIP_CHOICES = (
        ('CUSTOMER', 'Customer'),
        ('NORMAL', 'Normal'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE)
    membership_type = models.CharField(max_length=20, choices=MEMBERSHIP_CHOICES)
    is_student_verified = models.BooleanField(default=False)
    cashback_percentage = models.DecimalField(max_digits=5, decimal_places=2, default=0.00)
    membership_start = models.DateField(auto_now_add=True)
    membership_end = models.DateField(null=True, blank=True)

    def __str__(self):
        return f"{self.user.username} - {self.membership_type}"
