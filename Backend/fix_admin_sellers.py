
import os
import django
import random

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from django.contrib.auth.models import User
from users.models import AppUser, SupplierProfile
from store.models import Product, Category

def setup():
    # 1. Fix Admin
    admin_email = 'admin@bloomandbuy.com'
    try:
        admin = User.objects.get(username=admin_email)
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()
        print(f"Fixed admin status for {admin_email}")
    except User.DoesNotExist:
        admin = User.objects.create_superuser(admin_email, admin_email, 'Admin@1234')
        print(f"Created admin user {admin_email}")

    # 2. Categories
    categories = ["Electronics", "Fashion", "Home & Kitchen", "Books", "Sports", "Beauty"]
    for cat_name in categories:
        Category.objects.get_or_create(name=cat_name)

    # 3. Setup Sellers
    sellers_data = [
        {"name": "TechZone India", "email": "techzone@bloomandbuy.com", "cat": "Electronics", "logo": "https://img.icons8.com/plasticine/100/monitor.png"},
        {"name": "StyleKart Fashion", "email": "stylekart@bloomandbuy.com", "cat": "Fashion", "logo": "https://img.icons8.com/plasticine/100/t-shirt.png"},
        {"name": "HomeNest Decor", "email": "homenest@bloomandbuy.com", "cat": "Home & Kitchen", "logo": "https://img.icons8.com/plasticine/100/home.png"},
        {"name": "BookBazaar India", "email": "bookbazaar@bloomandbuy.com", "cat": "Books", "logo": "https://img.icons8.com/plasticine/100/book.png"},
        {"name": "SportsPlanet Pro", "email": "sportsplanet@bloomandbuy.com", "cat": "Sports", "logo": "https://img.icons8.com/plasticine/100/football.png"},
        {"name": "GlowBeauty Studio", "email": "glowbeauty@bloomandbuy.com", "cat": "Beauty", "logo": "https://img.icons8.com/plasticine/100/makeup.png"},
    ]

    for s in sellers_data:
        # Create User
        user, created = User.objects.get_or_create(username=s['email'], email=s['email'])
        if created:
            user.set_password('Seller@1234')
            user.save()
        
        # Create AppUser
        app_user, created = AppUser.objects.get_or_create(user_auth=user)
        app_user.role = 'supplier'
        app_user.save()

        # Create SupplierProfile
        profile, created = SupplierProfile.objects.get_or_create(user=app_user)
        profile.company_name = s['name']
        # For simplicity, assign logo URL to a CharField or handle as image
        # Since I added ImageField, I'll just set it to a placeholder for now or handle the URL logic
        profile.save()
        
        print(f"Ensured seller: {s['name']} ({s['email']})")

        # Assign existing products of that category to this seller
        category = Category.objects.get(name=s['cat'])
        Product.objects.filter(category=category).update(supplier=user)
        
        # Ensure they have at least 5 products
        count = Product.objects.filter(supplier=user).count()
        if count < 5:
            for i in range(count+1, 6):
                Product.objects.create(
                    name=f"{s['cat']} Item {i}",
                    description=f"Premium {s['cat']} product from {s['name']}",
                    price=random.randint(500, 5000),
                    stock=random.randint(0, 100), # Some might have 0 stock for deadstock filter
                    category=category,
                    supplier=user,
                    approval_status=random.choice(['approved', 'approved', 'pending']) # Mix of approved and pending
                )
            print(f"Added products for {s['name']} to reach at least 5.")

    # Reset some stock to 0 for deadstock testing
    deadstock_ids = Product.objects.all().order_by('?').values_list('id', flat=True)[:5]
    Product.objects.filter(id__in=deadstock_ids).update(stock=0)
    print(f"Set {len(deadstock_ids)} items to 0 stock for deadstock filter testing.")

if __name__ == "__main__":
    setup()
