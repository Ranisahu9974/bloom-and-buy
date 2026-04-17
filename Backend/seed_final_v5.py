import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_data_v5():
    # 1. Clear existing data to ensure no duplicates or generic placeholders
    Product.objects.all().delete()
    print("Cleared existing products.")

    # 2. Setup Supplier (User)
    supplier = User.objects.filter(is_superuser=True).first()
    if not supplier:
        supplier = User.objects.create_superuser('admin', 'admin@shop.com', 'admin123')

    # 3. Product Catalog
    catalog = [
        # --- ELECTRONICS ---
        ("Electronics", "iPhone 15 Pro Max", "The ultimate iPhone experience with Titanium design.", 159900, 184900, 10, "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", "NEW ARRIVAL"),
        ("Electronics", "Samsung Galaxy S24 Ultra", "Titanium gray, 512GB with AI features.", 129999, 144999, 15, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800", "HOT DEAL"),
        ("Electronics", "Sony WH-1000XM5", "Best-in-class noise canceling headphones.", 29990, 34990, 25, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800", ""),
        ("Electronics", "MacBook Pro M3 Max", "14-inch Space Black, 36GB Unified Memory.", 249900, 269900, 5, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "PREMIUM"),
        ("Electronics", "Apple Watch Ultra 2", "The most rugged and capable Apple Watch.", 89900, 94900, 12, "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800", ""),
        ("Electronics", "Nintendo Switch OLED", "Vibrant 7-inch OLED screen, Neon Blue/Red.", 32500, 35000, 20, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800", ""),

        # --- CLOTHING ---
        ("Clothing", "Premium Leather Jacket", "Handcrafted black lambskin leather biker jacket.", 8500, 12000, 15, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", "WINTER CLASSIC"),
        ("Clothing", "Oxford Cotton Shirt", "Slim fit, white organic cotton for office wear.", 1800, 2499, 40, "https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=800", ""),
        ("Clothing", "Slim Fit Selvedge Jeans", "Japanese indigo selvedge denim, 14oz.", 4500, 5999, 30, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", "BEST SELLER"),
        ("Clothing", "Summer Floral Maxi Dress", "Lightweight, breathable fabric for sunny days.", 2990, 3999, 25, "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800", ""),
        ("Clothing", "Woolen Oversized Cardigan", "Cozy beige cardigan with shell buttons.", 2400, 3200, 50, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", "SEASONAL"),

        # --- GROCERY ---
        ("Grocery", "Ferrero Rocher (24 Pcs)", "Premium hazelnut chocolates for gifting.", 890, 1100, 100, "https://images.unsplash.com/photo-1549007994-cb92cfd7448d?w=800", "GIFTING"),
        ("Grocery", "Maggi Family Pack (12-in-1)", "The favorite 2-minute masala noodles.", 160, 180, 200, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800", ""),
        ("Grocery", "Organic Honey (500g)", "Raw, unpasteurized forest honey.", 450, 550, 60, "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=800", "HOT ITEM"),
        ("Grocery", "Starbucks Dark Roast Beans", "Whole bean coffee, French Roast 250g.", 750, 850, 45, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800", ""),
        ("Grocery", "Fresh Avocado (2 Pcs)", "Creamy Hass avocados from Mexico.", 350, 450, 30, "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=800", "FRESH"),

        # --- BEAUTY & HEALTH ---
        ("Beauty", "Dior Sauvage Elixir", "Powerful, woody, and spicy mens fragrance.", 14500, 16000, 20, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800", "MUST HAVE"),
        ("Beauty", "The Ordinary Hyaluronic Acid", "Hydration support formula with ultra-pure HA.", 790, 950, 100, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "SKINCARE"),
        ("Beauty", "Matte Red Lipstick", "Long-lasting, velvet matte finish.", 1200, 1500, 80, "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800", ""),

        # --- HOME & KITCHEN ---
        ("Home & Kitchen", "Dyson V15 Detect", "Most powerful, intelligent cordless vacuum.", 65900, 72000, 8, "https://images.unsplash.com/photo-1558317374-067df5f15430?w=800", "TECH HOME"),
        ("Home & Kitchen", "Nespresso Citiz Platinum", "Elegant coffee machine for Espresso & Lungo.", 18900, 22000, 15, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800", ""),
        ("Home & Kitchen", "Velvet Teal Throw Pillow", "Soft touch luxury decor for living room.", 1200, 1600, 120, "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800", "NEW STYLE"),
        ("Home & Kitchen", "Le Creuset Skillet", "Signature enameled cast iron 10-inch skillet.", 14500, 18000, 5, "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=800", "CHEF CHOICE"),
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

    print(f"Seeding finished. Successfully added {count} premium products with real images and pricing.")

if __name__ == '__main__':
    seed_data_v5()
