import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_data_v6():
    # 1. Clear existing data to ensure no duplicates
    Product.objects.all().delete()
    print("Cleared existing products.")

    # 2. Setup Supplier (User)
    supplier = User.objects.filter(is_superuser=True).first()
    if not supplier:
        supplier = User.objects.create_superuser('admin', 'admin@shop.com', 'admin123')

    # 3. Product Catalog
    catalog = [
        # --- ELECTRONICS (Premium) ---
        ("Electronics", "iPhone 15 Pro Max", "The ultimate iPhone experience with Titanium design.", 159900, 184900, 10, "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800", "NEW ARRIVAL"),
        ("Electronics", "Samsung Galaxy S24 Ultra", "Titanium gray, 512GB with AI features.", 129999, 144999, 15, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800", "HOT DEAL"),
        ("Electronics", "Sony WH-1000XM5", "Best-in-class noise canceling headphones.", 29990, 34990, 25, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800", ""),
        ("Electronics", "MacBook Pro M3 Max", "14-inch Space Black, 36GB Unified Memory.", 249900, 269900, 5, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800", "PREMIUM"),
        ("Electronics", "Apple Watch Ultra 2", "The most rugged and capable Apple Watch.", 89900, 94900, 12, "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800", ""),
        ("Electronics", "Nintendo Switch OLED", "Vibrant 7-inch OLED screen, Neon Blue/Red.", 32500, 35000, 20, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800", ""),

        # --- GROCERY (Extensive Real Items) ---
        # Biscuits & Snacks
        ("Grocery", "Parle-G Gold (1kg)", "The original glucose biscuit, gold family pack.", 120, 150, 100, "https://images.unsplash.com/photo-1626078299034-756020583b6b?w=800", ""),
        ("Grocery", "Oreo Family Pack", "Crunchy chocolate cookies with vanilla cream.", 80, 100, 150, "https://images.unsplash.com/photo-1558961312-50346c0998d7?w=800", "KIDS CHOICE"),
        ("Grocery", "Maggi Family Pack (12-in-1)", "Classic Masala Noodles, family value pack.", 160, 180, 200, "https://images.unsplash.com/photo-1612927601601-6638404737ce?w=800", "BEST SELLER"),
        ("Grocery", "Lays Classic Salted", "Thin and crispy salted potato chips, party pack.", 50, 60, 120, "https://images.unsplash.com/photo-1566478431375-7033105ff761?w=800", ""),
        ("Grocery", "Kurkure Masala Munch", "Traditional spicy and tangy snacks.", 30, 35, 180, "https://images.unsplash.com/photo-1601004890684-d8cbf393f5f2?w=800", ""),
        
        # Chocolates
        ("Grocery", "Ferrero Rocher (24 Pcs)", "Premium hazelnut chocolates for gifting.", 890, 1100, 100, "https://images.unsplash.com/photo-1549007994-cb92cfd7448d?w=800", "GIFTING"),
        ("Grocery", "Cadbury Dairy Milk Silk", "Smooth and creamy chocolate bars, 150g.", 175, 195, 80, "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=800", ""),
        ("Grocery", "Amul Dark Chocolate", "90% Cocoa rich dark chocolate for health seekers.", 150, 175, 60, "https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=800", "HEALTHY"),
        
        # Fruits & Vegetables
        ("Grocery", "Fresh Bananas (6 pcs)", "Ripe yellow organic bananas.", 45, 55, 50, "https://images.unsplash.com/photo-1571771894821-ad9902d83f4e?w=800", "FRESH"),
        ("Grocery", "Red Apples (1kg)", "Crispy Himachal apples premium quality.", 180, 220, 40, "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=800", ""),
        ("Grocery", "Organic Potatoes (2kg)", "Farm fresh unpolished potatoes.", 70, 85, 100, "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800", ""),
        ("Grocery", "Fresh Tomatoes (1kg)", "Local farm vine-ripened juicy tomatoes.", 40, 50, 60, "https://images.unsplash.com/photo-1546473427-e1ad6d6ed850?w=800", "LOCALLY SOURCED"),
        ("Grocery", "Fresh Baby Spinach", "Organic bundle of fresh green baby spinach.", 35, 45, 30, "https://images.unsplash.com/photo-1620706857370-e1b977f7f022?w=800", ""),
        
        # Staples (Flours & Dals)
        ("Grocery", "Aashirvaad Atta (5kg)", "Whole wheat flour with 0% Maida, original pack.", 245, 295, 75, "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800", "ESSENTIAL"),
        ("Grocery", "Fortune Basmati Rice (5kg)", "Long grain everyday super basmati rice.", 450, 550, 120, "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800", ""),
        ("Grocery", "Tata Sampann Toor Dal (1kg)", "Unpolished high-protein toor dal premium.", 175, 195, 90, "https://images.unsplash.com/photo-1541533230434-aa17a7833a68?w=800", ""),
        ("Grocery", "Organic Moong Dal (1kg)", "Yellow split moong dal, chemical free.", 145, 165, 85, "https://images.unsplash.com/photo-1541533230434-aa17a7833a68?w=801", ""),
        
        # Dairy & Beverages
        ("Grocery", "Amul Butter (500g)", "Salted pasteurized butter original.", 275, 295, 60, "https://images.unsplash.com/photo-1589923188900-85dae523342b?w=800", ""),
        ("Grocery", "Fresh Toned Milk (1L)", "Nandini/Amul high nutrient toned milk.", 54, 58, 40, "https://images.unsplash.com/photo-1563636619-e9107da5a1bb?w=800", ""),
        ("Grocery", "Starbucks Dark Roast Beans", "Whole bean coffee, French Roast premium.", 750, 899, 45, "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800", "PREMIUM"),
        ("Grocery", "Tata Tea Gold (500g)", "High quality aromatic black tea.", 350, 420, 150, "https://images.unsplash.com/photo-1594631252845-29fc458695d7?w=800", ""),
        ("Grocery", "Nescafe Classic (100g)", "Instant coffee powder pure.", 245, 275, 120, "https://images.unsplash.com/photo-1544787214-51caafbb3ad3?w=800", ""),

        # --- CLOTHING ---
        ("Clothing", "Premium Leather Jacket", "Handcrafted black lambskin leather biker jacket.", 8500, 12000, 15, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800", "WINTER CLASSIC"),
        ("Clothing", "Oxford Cotton Shirt", "Slim fit, white organic cotton for office wear.", 1800, 2499, 40, "https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=800", ""),
        ("Clothing", "Slim Fit Selvedge Jeans", "Japanese indigo selvedge denim, 14oz.", 4500, 5999, 30, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800", "BEST SELLER"),
        ("Clothing", "Woolen Oversized Cardigan", "Cozy beige cardigan with shell buttons.", 2400, 3200, 50, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800", "SEASONAL"),

        # --- BEAUTY & HEALTH ---
        ("Beauty", "Dior Sauvage Elixir", "Powerful, woody, and spicy mens fragrance.", 14500, 16000, 20, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800", "MUST HAVE"),
        ("Beauty", "The Ordinary Hyaluronic Acid", "Hydration support formula with ultra-pure HA.", 790, 950, 100, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800", "SKINCARE"),
        ("Beauty", "Matte Red Lipstick", "Long-lasting, velvet matte finish.", 1200, 1500, 80, "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800", ""),

        # --- HOME & KITCHEN ---
        ("Home & Kitchen", "Dyson V15 Detect", "Most powerful, intelligent cordless vacuum.", 65900, 72000, 8, "https://images.unsplash.com/photo-1558317374-067df5f15430?w=800", "TECH HOME"),
        ("Home & Kitchen", "Nespresso Citiz Platinum", "Elegant coffee machine for Espresso & Lungo.", 18900, 22000, 15, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800", ""),
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

    print(f"Seeding finished. Successfully added {count} complete products across all categories.")

if __name__ == '__main__':
    seed_data_v6()
