import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import AppUser, SupplierProfile

sellers = [
    'autogear@bloomandbuy.com', 
    'kiddoparadise@bloomandbuy.com', 
    'stylekart@bloomandbuy.com', 
    'techzone@bloomandbuy.com', 
    'glowbeauty@bloomandbuy.com', 
    'homenest@bloomandbuy.com', 
    'bookbazaar@bloomandbuy.com', 
    'sportsplanet@bloomandbuy.com',
    'freshmart@bloomandbuy.com'
]

print("Checking and fixing seller roles...")
for email in sellers:
    user = User.objects.filter(email=email).first()
    if user:
        app_user = AppUser.objects.filter(user_auth=user).first()
        if not app_user:
            # Create AppUser if it doesn't exist
            username = email.split('@')[0].capitalize()
            app_user = AppUser.objects.create(
                user_auth=user,
                username=username,
                email=email,
                role='supplier',
                phone='9876543210',
                password='Seller@1234' # Placeholder
            )
            print(f"Created missing AppUser for {email}")
        
        # Ensure role is supplier (mapped to 'seller' in frontend)
        if app_user.role != 'supplier':
            app_user.role = 'supplier'
            app_user.save()
            print(f"Fixed role for {email} to 'supplier'")
        
        # Ensure SupplierProfile exists
        profile, created = SupplierProfile.objects.get_or_create(user=app_user)
        if created:
            profile.company_name = email.split('@')[0].capitalize() + " Store"
            profile.verified = True
            profile.save()
            print(f"Created missing SupplierProfile for {email}")
        elif not profile.verified:
            profile.verified = True
            profile.save()
            print(f"Verified profile for {email}")

        print(f"Verified: {email} is now a FULL SELLER")
    else:
        print(f"WARNING: User {email} not found in database")
