import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_data_v7():
    Product.objects.all().delete()
    print("Cleaned up existing database products.")

    supplier = User.objects.filter(is_superuser=True).first()
    if not supplier:
        supplier = User.objects.create_superuser('admin', 'admin@shop.com', 'admin123')

    # Premium Product Catalog with ultra-specific high-quality images
    catalog = [
        # --- ELECTRONICS ---
        ("Electronics", "iPhone 15 Pro Max", "Titanium Natural, 256GB with A17 Pro Chip.", 159900, 184900, 10, "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800&q=80", "NEW"),
        ("Electronics", "Samsung Galaxy S24 Ultra", "Titanium Gray, 512GB, AI Integration.", 129999, 144999, 15, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&q=80", "HOT DEAL"),
        ("Electronics", "Sony WH-1000XM5", "Best wireless noise canceling over-ear headphones.", 29990, 34990, 25, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800&q=80", ""),
        ("Electronics", "MacBook Pro M3 Max", "14-inch Space Black, 36GB Unified RAM.", 249900, 269900, 5, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&q=80", "PREMIUM"),

        # --- GROCERY (Biscuits, Maggie, Chocolates, Fruits, Vegetables) ---
        ("Grocery", "Parle-G Gold (800g)", "The original glucose biscuits, big economy pack.", 80, 100, 100, "https://images.unsplash.com/photo-1626078299034-756020583b6b?w=800&fit=crop&q=80", ""),
        ("Grocery", "Maggi Masala Noodles (12 Pk)", "Instant 2-minute noodles, family pack.", 160, 185, 200, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800&fit=crop&q=80", "BEST SELLER"),
        ("Grocery", "Oreo Chocolate Sandwich", "Crunchy chocolate biscuits with vanilla cream.", 40, 50, 150, "https://images.unsplash.com/photo-1558961312-50346c0998d7?w=800&fit=crop&q=80", ""),
        ("Grocery", "Lay's Classic Salted", "Classic crunchy potato chips, party pack size.", 50, 60, 120, "https://images.unsplash.com/photo-1566478431375-7033105ff761?w=800&fit=crop&q=80", ""),
        ("Grocery", "Ferrero Rocher (24 Pcs)", "Premium hazelnut-filled chocolate for gifting.", 890, 1150, 100, "https://images.unsplash.com/photo-1549007994-cb92cfd7448d?w=800&fit=crop&q=80", "GIFTING"),
        ("Grocery", "Dairy Milk Silk", "Velvety smooth milk chocolate, 150g.", 175, 195, 80, "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800&fit=crop&q=80", ""),
        ("Grocery", "Hershey's Syrup (623g)", "Classic chocolate flavor for desserts.", 235, 275, 50, "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=801&fit=crop&q=80", ""),
        
        ("Grocery", "Organic Bananas (Pack of 6)", "Farm fresh naturally ripened yellow bananas.", 45, 60, 50, "https://images.unsplash.com/photo-1571771894821-ad9902d83f4e?w=800&fit=crop&q=80", "FRESH"),
        ("Grocery", "Red Fuji Apples (1kg)", "Crisp and sweet premium red Himachal apples.", 180, 240, 40, "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=800&fit=crop&q=80", "VIBRANT"),
        ("Grocery", "Green Seedless Grapes (500g)", "Sweet and juicy fresh green grapes.", 110, 140, 30, "https://images.unsplash.com/photo-1596364721223-30fe20286373?w=800&fit=crop&q=80", ""),
        ("Grocery", "Organic Potatoes (2kg)", "Best quality unwashed farm potatoes.", 70, 90, 100, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&fit=crop&q=80", ""),
        ("Grocery", "Fresh Onions (2kg)", "Essential red onions for daily cooking.", 95, 120, 80, "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&fit=crop&q=80", ""),
        ("Grocery", "Fresh Roma Tomatoes (1kg)", "Juicy red tomatoes for salads and curries.", 45, 60, 60, "https://images.unsplash.com/photo-1546473427-e1ad6d6ed850?w=800&fit=crop&q=80", "ORGANIC"),
        
        ("Grocery", "Aashirvaad Shudh Chakki Atta (5kg)", "100% whole wheat flour with no Maida.", 245, 299, 75, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&fit=crop&q=80", "STAPLE"),
        ("Grocery", "Fortune Basmati Rice (5kg)", "Lighter and aromatic long grain basmati.", 499, 599, 120, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800&fit=crop&q=80", ""),
        ("Grocery", "Tata Sampann Toor Dal (1kg)", "Unpolished high quality toor dal fiber rich.", 185, 210, 90, "https://images.unsplash.com/photo-1541533230434-aa17a7833a68?w=800&fit=crop&q=80", ""),
        ("Grocery", "Organic Moong Dal (1kg)", "Yellow split skinless moong dal pure.", 145, 175, 85, "https://images.unsplash.com/photo-1541533230434-aa17a7833a68?w=801&fit=crop&q=80", ""),

        # --- CLOTHING ---
        ("Clothing", "Leather Biker Jacket", "Soft-grain black genuine leather jacket.", 8500, 11999, 15, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80", ""),
        ("Clothing", "Classic Oxfords Shirt", "Slim-fit white cotton formal shirt.", 1800, 2400, 40, "https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=800&q=80", ""),

        # --- HOME & KITCHEN ---
        ("Home & Kitchen", "Dyson V15 Cordless", "Deep cleans carpets and hard floors with laser.", 65900, 72000, 8, "https://images.unsplash.com/photo-1558317374-067df5f15430?w=800&q=80", ""),
        ("Home & Kitchen", "Le Creuset Skillet", "Premium enameled cast iron kitchenware.", 14500, 18000, 5, "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=800&q=80", ""),
    ]

    count = 0
    for cat_name, prod_name, desc, price, base_price, stock, img_url, tag in catalog:
        category, _ = Category.objects.get_or_create(name=cat_name)
        Product.objects.create(
            name=prod_name,
            category=category,
            supplier=supplier,
            description=desc,
            price=Decimal(str(price)),
            base_price=Decimal(str(base_price)),
            stock=stock,
            image=img_url,
            seasonal_tag=tag,
            is_active=True
        )
        count += 1

    print(f"Final Premium Dataset v7 seeded: {count} products added successfully.")

if __name__ == '__main__':
    seed_data_v7()
