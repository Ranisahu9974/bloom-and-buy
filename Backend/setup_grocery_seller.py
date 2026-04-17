import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import AppUser, SupplierProfile
from store.models import Product, Category

def setup_grocery_seller():
    email = 'freshmart@bloomandbuy.com'
    username = 'FreshMart'
    pwd = 'Seller@1234'
    
    # 1. Create/Update Auth User
    auth_user, created = User.objects.get_or_create(username=username, defaults={'email': email})
    auth_user.set_password(pwd)
    auth_user.save()
    
    # 2. Create/Update App User
    app_user, created = AppUser.objects.get_or_create(
        email=email, 
        defaults={
            'username': username, 
            'role': 'supplier', 
            'user_auth': auth_user, 
            'password': pwd, 
            'phone': '9876543210'
        }
    )
    if not created:
        app_user.user_auth = auth_user
        app_user.save()

    # 3. Create/Update Profile
    profile, created = SupplierProfile.objects.get_or_create(
        user=app_user, 
        defaults={'company_name': 'FreshMart Grocery', 'verified': True}
    )
    if not created:
        profile.company_name = 'FreshMart Grocery'
        profile.verified = True
        profile.save()

    # 4. Assign Grocery Products
    grocery_cat = Category.objects.filter(name__icontains='Grocery').first()
    if grocery_cat:
        updated = Product.objects.filter(category=grocery_cat).update(supplier=auth_user)
        print(f"Successfully assigned {updated} products to FreshMart Grocery ({email})")
    else:
        print("Error: Grocery category not found")

if __name__ == "__main__":
    setup_grocery_seller()
