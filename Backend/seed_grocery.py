import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_grocery_data():
    # Get or create Grocery category
    category, _ = Category.objects.get_or_create(name='Grocery')
    
    # Get a supplier (default to superuser/admin)
    supplier = User.objects.filter(is_superuser=True).first()
    if not supplier:
        supplier = User.objects.create_superuser('admin_seed', 'admin@example.com', 'admin123')

    # Remove generic "Fresh Item" products in Grocery category
    Product.objects.filter(category=category, name__icontains='Fresh Item').delete()
    
    # Real Grocery products
    grocery_items = [
        # Biscuits & Snacks
        ("Parle-G Biscuits", "The original glucose biscuit, 800g pack.", 80, 100, "https://images.unsplash.com/photo-1558961312-50346c0998d7?w=800"),
        ("Oreo Chocolate Sandwich", "Crunchy chocolate cookies with vanilla cream, 120g.", 40, 150, "https://images.unsplash.com/photo-1558961312-50346c0998d7?w=801"),
        ("Maggi 2-Minute Noodles", "Classic Masala Noodles, 12 pack.", 160, 200, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800"),
        ("Lay's Classic Salted", "Crispy potato chips, large party pack.", 50, 120, "https://images.unsplash.com/photo-1566478431375-7033105ff761?w=800"),
        
        # Chocolates
        ("Cadbury Dairy Milk Silk", "Smooth and creamy chocolate bars, 150g.", 175, 80, "https://images.unsplash.com/photo-1549007994-cb92cfd7448d?w=800"),
        ("Amul Dark Chocolate", "90% Cocoa rich dark chocolate.", 150, 60, "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800"),
        
        # Fruits & Vegetables
        ("Fresh Bananas (6 pcs)", "Ripe yellow organic bananas.", 45, 50, "https://images.unsplash.com/photo-1571771894821-ad9902d83f4e?w=800"),
        ("Red Apples (1kg)", "Crispy Himachal apples.", 180, 40, "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=800"),
        ("Organic Potatoes (2kg)", "Farm fresh potatoes.", 70, 100, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800"),
        ("Fresh Tomatoes (1kg)", "Local farm vine-ripened tomatoes.", 40, 60, "https://images.unsplash.com/photo-1546473427-e1ad6d6ed850?w=800"),
        
        # Staples (Flours & Dals)
        ("Aashirvaad Atta (5kg)", "Whole wheat flour with 0% Maida.", 245, 75, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800"),
        ("Fortune Basmati Rice (1kg)", "Long grain everyday basmati rice.", 110, 120, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800"),
        ("Tata Sampann Toor Dal (1kg)", "Unpolished high-protein toor dal.", 175, 90, "https://images.unsplash.com/photo-1541533230434-aa17a7833a68?w=802"),
        ("Organic Moong Dal (1kg)", "Yellow split moong dal.", 145, 85, "https://images.unsplash.com/photo-1541533230434-aa17a7833a68?w=803"),
        
        # Dairy & Others
        ("Amul Butter (500g)", "Salted pasteurized butter.", 275, 60, "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800"),
        ("Nandini Fresh Milk (1L)", "Toned milk, pasteurized.", 54, 40, "https://images.unsplash.com/photo-1563636619-e9107da5a1bb?w=800"),
    ]

    for name, desc, price, stock, img_url in grocery_items:
        Product.objects.create(
            name=name,
            category=category,
            supplier=supplier,
            description=desc,
            price=price,
            stock=stock,
            image=img_url,
            is_active=True
        )

    print(f"Grocery seeding finished. Added {len(grocery_items)} real products to the '{category.name}' category.")

if __name__ == '__main__':
    seed_grocery_data()
