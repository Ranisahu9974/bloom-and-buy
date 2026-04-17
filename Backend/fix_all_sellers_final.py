import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from django.db.models import Q
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

print("Fixing seller IDs and roles...")

for email, store_name in sellers_data.items():
    # Find any user that has this email or this email as username
    users = User.objects.filter(Q(email=email) | Q(username=email))
    
    main_user = None
    if users.exists():
        main_user = users.first()
        for u in users:
            if u.email == email:
                main_user = u
                break
        
        # Delete others to avoid integrity errors
        User.objects.filter(Q(email=email) | Q(username=email)).exclude(id=main_user.id).delete()
    else:
        # Create new if none exist
        main_user = User.objects.create_user(username=email, email=email, password='Seller@1234')
        print(f"Created new User: {email}")

    # Ensure correct username and password
    main_user.username = email
    main_user.email = email
    main_user.set_password('Seller@1234')
    main_user.save()

    # Sync AppUser
    app_user = AppUser.objects.filter(Q(email=email) | Q(user_auth=main_user)).first()
    if not app_user:
        app_user = AppUser.objects.create(
            user_auth=main_user,
            username=email,
            email=email,
            role='supplier',
            phone='9876543210',
            password='Seller@1234'
        )
    else:
        app_user.user_auth = main_user
        app_user.username = email # Sync username
        app_user.email = email
        app_user.role = 'supplier'
        app_user.save()
    
    # Sync SupplierProfile
    profile, _ = SupplierProfile.objects.get_or_create(user=app_user)
    profile.company_name = store_name
    profile.verified = True
    profile.save()
    
    print(f"Verified & Fixed: {email} ({store_name})")

print("\nAll sellers are now standardized.")
print("Login with Email: [email] | Password: Seller@1234")
