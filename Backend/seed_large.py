import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_large_data():
    supplier = User.objects.filter(is_superuser=True).first()
    
    data = [
        # Electronics (10)
        ("Electronics", "iPhone 15 Pro", "Apple's latest flagship with titanium design.", 129900, 15, "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800"),
        ("Electronics", "Samsung Galaxy S24 Ultra", "Powerhouse with AI features and S-Pen.", 124999, 10, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"),
        ("Electronics", "Sony WH-1000XM5", "Best-in-class noise cancellation.", 34990, 25, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"),
        ("Electronics", "MacBook Pro M3", "High performance for professionals.", 169900, 8, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"),
        ("Electronics", "Dell XPS 13", "The ultimate ultraportable laptop.", 105000, 12, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"),
        ("Electronics", "iPad Pro 12.9", "Powerful tablet for creators.", 99900, 20, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"),
        ("Electronics", "Nintendo Switch OLED", "Premium handheld gaming.", 32000, 30, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800"),
        ("Electronics", "Canon EOS R5", "Full-frame mirrorless camera.", 330000, 5, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"),
        ("Electronics", "Apple Watch Series 9", "The ultimate health partner.", 41900, 40, "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800"),
        ("Electronics", "Bose QuietComfort Ultra", "Immersive audio experience.", 35900, 15, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"),

        # Fashion (10)
        ("Fashion", "Men's Slim Fit Shirt", "Classic white cotton shirt.", 1899, 100, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),
        ("Fashion", "Women's Denim Jacket", "Timeless blue denim style.", 3499, 50, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"),
        ("Fashion", "Ray-Ban Aviators", "Iconic gold-frame sunglasses.", 8900, 30, "https://images.unsplash.com/photo-1511499767390-903390e6fbc7?w=800"),
        ("Fashion", "Nike Air Force 1", "Classic white leather sneakers.", 7495, 60, "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=800"),
        ("Fashion", "Floral Maxi Dress", "Perfect for summer parties.", 2999, 25, "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800"),
        ("Fashion", "Leather Crossbody Bag", "Elegant brown handcrafted leather.", 4500, 15, "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800"),
        ("Fashion", "Casio G-Shock", "Rugged and durable watch.", 6995, 45, "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=800"),
        ("Fashion", "Wool Blend Pea Coat", "Warm and stylish for winter.", 6500, 20, "https://images.unsplash.com/photo-1539533377285-33df213a0ea7?w=800"),
        ("Fashion", "Ankle Leather Boots", "Comfortable brown boots.", 4999, 30, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"),
        ("Fashion", "Graphic Printed Hoodie", "Cool urban streetwear.", 2499, 80, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"),

        # Home & Kitchen (10)
        ("Home & Kitchen", "Nespresso Pixie Machine", "Compact espresso maker.", 15500, 10, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800"),
        ("Home & Kitchen", "Dyson V11 Vacuum", "Powerful cordless vacuum cleaner.", 45900, 15, "https://images.unsplash.com/photo-1558317374-067df5f15430?w=800"),
        ("Home & Kitchen", "Scented Soy Candle", "Vanilla and sandalwood fragrance.", 799, 200, "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"),
        ("Home & Kitchen", "Cast Iron Skillet", "Pre-seasoned 12 inch skillet.", 2499, 40, "https://images.unsplash.com/photo-1594833230434-aa17a7833a68?w=800"),
        ("Home & Kitchen", "Linen Bed Sheet Set", "Ultra-soft premium flax linen.", 5500, 30, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"),
        ("Home & Kitchen", "KitchenAid Stand Mixer", "The baker's best friend.", 39900, 10, "https://images.unsplash.com/photo-1594385208974-2e75f9d86c13?w=800"),
        ("Home & Kitchen", "Smart LED Desk Lamp", "Adjustable color temperature.", 2499, 55, "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800"),
        ("Home & Kitchen", "Bamboo Bath Tray", "Expandable tray for bubble baths.", 1850, 25, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"),
        ("Home & Kitchen", "Modern Ceramic Vase", "Minimalist white table decor.", 1200, 40, "https://images.unsplash.com/photo-1581783898377-1c85bf937427?w=800"),
        ("Home & Kitchen", "Electric Wine Opener", "Rechargeable with foil cutter.", 1599, 60, "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800"),

        # Books (10)
        ("Books", "Atomic Habits", "Small changes, remarkable results.", 499, 100, "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800"),
        ("Books", "The Alchemist", "A fable about following your dream.", 350, 150, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"),
        ("Books", "Rich Dad Poor Dad", "What the rich teach their kids.", 399, 120, "https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?w=800"),
        ("Books", "Think and Grow Rich", "Napoleon Hill's classic.", 299, 80, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"),
        ("Books", "Deep Work", "Rules for focused success.", 450, 90, "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800"),
        ("Books", "Principles", "Ray Dalio's life and work.", 799, 45, "https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=800"),
        ("Books", "Zero to One", "How to build the future.", 550, 65, "https://images.unsplash.com/photo-1543004271-bfbd15e219ba?w=800"),
        ("Books", "Sapiens", "A brief history of humankind.", 599, 110, "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800"),
        ("Books", "Startup Way", "The new approach to innovation.", 650, 40, "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800"),
        ("Books", "Psychology of Money", "Timeless lessons on wealth.", 380, 150, "https://images.unsplash.com/photo-1592492159418-39f319320569?w=800"),

        # Beauty (10)
        ("Beauty", "Face Serum (Vitamin C)", "Glow and hydration.", 799, 80, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800"),
        ("Beauty", "Matte Lipstick (Ruby)", "Long-lasting deep red.", 550, 120, "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800"),
        ("Beauty", "Charcoal Face Mask", "Deep cleaning and detox.", 450, 95, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"),
        ("Beauty", "Argan Hair Oil", "Nourishing 100% pure argan.", 1200, 50, "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800"),
        ("Beauty", "Sunscreen SPF 50", "Non-greasy sun protection.", 650, 75, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800"),
        ("Beauty", "Moisturizing Cream", "Daily hydration for dry skin.", 499, 110, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"),
        ("Beauty", "Eye Shadow Palette", "12 vibrant shimmer colors.", 1500, 30, "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800"),
        ("Beauty", "Luxury Perfume (Floral)", "Sophisticated day scent.", 4500, 20, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"),
        ("Beauty", "Exfoliating Scrub", "Natural apricot and honey.", 350, 85, "https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800"),
        ("Beauty", "Nail Polish Set", "5 pastel spring shades.", 999, 60, "https://images.unsplash.com/photo-1631730359585-38a4935ccbb2?w=800"),

    ]

    for cat_name, prod_name, desc, price, stock, img in data:
        cat, _ = Category.objects.get_or_create(name=cat_name)
        Product.objects.update_or_create(
            name=prod_name,
            defaults={
                'category': cat,
                'supplier': supplier,
                'description': desc,
                'price': price,
                'stock': stock,
                'image': img,
                'is_active': True
            }
        )
    print(f"Seeding finished. Added {len(data)} products.")

if __name__ == '__main__':
    seed_large_data()
