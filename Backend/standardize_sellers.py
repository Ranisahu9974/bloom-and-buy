import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import AppUser, SupplierProfile

# Mapping of email to desired Store Name
sellers_data = {
    'autogear@bloomandbuy.com': 'AutoGear Pro Accessories',
    'kiddoparadise@bloomandbuy.com': 'KiddoParadise Toy Store',
    'stylekart@bloomandbuy.com': 'StyleKart Fashion',
    'techzone@bloomandbuy.com': 'TechZone India',
    'glowbeauty@bloomandbuy.com': 'GlowBeauty Studio',
    'homenest@bloomandbuy.com': 'HomeNest Decor',
    'bookbazaar@bloomandbuy.com': 'BookBazaar India',
    'sportsplanet@bloomandbuy.com': 'SportsPlanet Pro',
    'freshmart@bloomandbuy.com': 'FreshMart Grocery'
}

print("Standardizing Seller usernames to match emails for easier login...")
for email, store_name in sellers_data.items():
    # 1. Handle the User model
    user = User.objects.filter(email=email).first()
    if not user:
        # Create from scratch if not found
        user = User.objects.create_user(username=email, email=email, password='Seller@1234')
        print(f"Created new User: {email}")
    else:
        # Standardize username to email
        if user.username != email:
            old_un = user.username
            user.username = email
            user.save()
            print(f"Standardized username for {email} (was {old_un})")
        # Ensure password is correct
        user.set_password('Seller@1234')
        user.save()

    # 2. Handle AppUser model
    app_user, created = AppUser.objects.get_or_create(
        user_auth=user,
        defaults={
            'username': user.username,
            'email': email,
            'role': 'supplier',
            'phone': '9876543210',
            'password': 'Seller@1234'
        }
    )
    if not created:
        app_user.role = 'supplier'
        app_user.username = user.username
        app_user.email = email
        app_user.save()
        print(f"Verified AppUser role for {email}")

    # 3. Handle SupplierProfile model
    profile, created = SupplierProfile.objects.get_or_create(user=app_user)
    profile.company_name = store_name
    profile.verified = True
    profile.save()
    print(f"Verified SupplierProfile for {store_name}")

print("\nAll seller IDs have been standardized.")
print("Login with Email: [email] | Password: Seller@1234")
