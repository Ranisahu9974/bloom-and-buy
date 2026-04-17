from django.db import models

class AppUser(models.Model):
    ROLE_CHOICES = [
        ('admin','Admin'),
        ('supplier','Supplier'),
        ('consumer','Consumer')
    ]

    user_auth = models.OneToOneField('auth.User', on_delete=models.CASCADE, related_name='app_user', null=True, blank=True)
    username = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    phone = models.CharField(max_length=15)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class SupplierProfile(models.Model):
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE)
    company_name = models.CharField(max_length=150, blank=True, null=True)
    logo = models.ImageField(upload_to='logos/', blank=True, null=True)
    gst_number = models.CharField(max_length=50, blank=True, null=True)
    address = models.TextField(blank=True, null=True)
    rating = models.FloatField(default=0)
    verified = models.BooleanField(default=False)


class Address(models.Model):
    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='addresses')
    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=15)
    address_line1 = models.CharField(max_length=255)
    address_line2 = models.CharField(max_length=255, blank=True, null=True)
    locality = models.CharField(max_length=150)
    city = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    pincode = models.CharField(max_length=10)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.city}, {self.pincode}"

class ConsumerProfile(models.Model):
    user = models.OneToOneField(AppUser, on_delete=models.CASCADE)
    # Primary address can be selected from the addresses related set
    wallet_balance = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    is_opted_in = models.BooleanField(default=True)

class Notification(models.Model):
    TYPE_CHOICES = [
        ('In-App', 'In-App'),
        ('Email', 'Email'),
        ('SMS', 'SMS'),
        ('WhatsApp', 'WhatsApp'),
    ]

    user = models.ForeignKey(AppUser, on_delete=models.CASCADE, related_name='notifications')
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, default='In-App')
    title = models.CharField(max_length=150)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    status = models.CharField(max_length=20, default='Sent') # Sent, Failed, Pending
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"To {self.user.username} ({self.type}): {self.title}"

class PromotionalMessage(models.Model):
    title = models.CharField(max_length=150)
    content = models.TextField()
    target_role = models.CharField(max_length=20, default='consumer')
    send_via = models.CharField(max_length=50, default='Email') # Comma separated: Email,SMS,WhatsApp
    created_at = models.DateTimeField(auto_now_add=True)
    sent_at = models.DateTimeField(blank=True, null=True)

    def __str__(self):
        return self.title
