import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_final_data_v3():
    # Clear existing data to ensure clean filtering test
    Product.objects.all().delete()
    Category.objects.all().delete()
    
    supplier = User.objects.filter(is_superuser=True).first()
    
    # Categories: 'Electronics', 'Clothing', 'Home & Kitchen', 'Books', 'Sports', 'Beauty', 'Grocery', 'Toys', 'Automotive'
    templates = [
        # Electronics (10)
        ("Electronics", "iPhone 15 Pro", "89052-123", 134900, 15, "https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800"),
        ("Electronics", "Samsung S24 Ultra", "Powerhouse performance.", 129999, 12, "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800"),
        ("Electronics", "Sony XM5 Headphones", "Best noise canceling.", 34990, 20, "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800"),
        ("Electronics", "MacBook Air M3", "Supercharged by Apple.", 114900, 8, "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800"),
        ("Electronics", "iPad Pro 12.9", "Liquid Retina XDR.", 99900, 10, "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=800"),
        ("Electronics", "Dell XPS 13", "InfinityEdge display.", 105000, 5, "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800"),
        ("Electronics", "GoPro HERO 12", "5.3K video action cam.", 45000, 15, "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=800"),
        ("Electronics", "Bose Speaker", "Deep bass bluetooth.", 12900, 40, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800"),
        ("Electronics", "Nintendo Switch", "OLED gaming console.", 32500, 25, "https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=800"),
        ("Electronics", "Apple Watch S9", "Advanced health tracker.", 41900, 50, "https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=800"),

        # Clothing (10)
        ("Clothing", "Classic White T-Shirt", "100% Organinc cotton.", 1299, 100, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800"),
        ("Clothing", "Slim Denim Jeans", "Classic indigo wash.", 3499, 60, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=800"),
        ("Clothing", "Leather Biker Jacket", "Soft black leather.", 8500, 15, "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800"),
        ("Clothing", "Summer Floral Dress", "Light breezy fabric.", 2499, 30, "https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800"),
        ("Clothing", "Woolen Cardigan", "Stay warm in style.", 1999, 45, "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=800"),
        ("Clothing", "Oxford Cotton Shirt", "Clean sharp look.", 1800, 20, "https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=800"),
        ("Clothing", "Activewear Leggings", "High-stretch fabric.", 1500, 80, "https://images.unsplash.com/photo-1506152983158-b4a74a01c721?w=800"),
        ("Clothing", "Hooded Sweatshirt", "Oversized cozy fit.", 2999, 50, "https://images.unsplash.com/photo-1556821840-410316279998?w=800"),
        ("Clothing", "Beige Trench Coat", "Rainproof classic.", 5500, 12, "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800"),
        ("Clothing", "Striped Polo Shirt", "Premium breathable pique.", 1499, 55, "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=800"),

        # Home & Kitchen (10)
        ("Home & Kitchen", "Coffee Maker Pro", "Barista quality coffee.", 15900, 10, "https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=800"),
        ("Home & Kitchen", "Air Purifier HEPA", "Breather cleaner air.", 8500, 20, "https://images.unsplash.com/photo-1558317374-067df5f15430?w=800"),
        ("Home & Kitchen", "Non-Stick Pan Set", "Eco-friendly coating.", 4999, 35, "https://images.unsplash.com/photo-1594833230434-aa17a7833a68?w=800"),
        ("Home & Kitchen", "Smart LED Lamp", "App controlled lighting.", 2499, 100, "https://images.unsplash.com/photo-1534073828943-f801091bb18c?w=800"),
        ("Home & Kitchen", "Memory Foam Mattress", "Ultimate sleep comfort.", 25000, 5, "https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"),
        ("Home & Kitchen", "Stand Mixer Retro", "Heavy duty baking.", 18500, 15, "https://images.unsplash.com/photo-1594385208974-2e75f9d86c13?w=800"),
        ("Home & Kitchen", "Cast Iron Skillet", "Pre-seasoned 12-inch.", 3200, 40, "https://images.unsplash.com/photo-1591261730799-ee4e6c2d16d7?w=800"),
        ("Home & Kitchen", "Velvet Throw Pillow", "Luxury home decor.", 899, 150, "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=800"),
        ("Home & Kitchen", "Blender 1000W", "Smoothie powerhouse.", 3999, 30, "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=800"),
        ("Home & Kitchen", "Organic Linen Towels", "Set of 4 ultra soft.", 1200, 80, "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=800"),

        # Books (10)
        ("Books", "Atomic Habits", "Build better habits.", 499, 200, "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800"),
        ("Books", "The Alchemist", "Follow your legend.", 350, 150, "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"),
        ("Books", "Dune Deluxe Edition", "Sci-fi masterpiece.", 850, 40, "https://images.unsplash.com/photo-1543004271-bfbd15e219ba?w=800"),
        ("Books", "Sapiens", "Brief history of human.", 599, 100, "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=800"),
        ("Books", "Deep Work", "Rules for focus.", 450, 85, "https://images.unsplash.com/photo-1535905557558-afc4877a26fc?w=800"),
        ("Books", "Rich Dad Poor Dad", "Financial literacy.", 399, 120, "https://images.unsplash.com/photo-1614849963640-9cc74b2a826f?w=800"),
        ("Books", "Zero to One", "How to build future.", 550, 60, "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800"),
        ("Books", "Harry Potter #1", "Magic starts here.", 499, 300, "https://images.unsplash.com/photo-1618666012174-83b441c0bc76?w=800"),
        ("Books", "The Psychology of Money", "Investment wisdom.", 380, 180, "https://images.unsplash.com/photo-1592492159418-39f319320569?w=800"),
        ("Books", "Thinking Fast and Slow", "Daniel Kahneman classic.", 650, 50, "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800"),

        # Sports (5)
        ("Sports", "Yoga Mat Eco", "Non-slip grip.", 1200, 100, "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800"),
        ("Sports", "Football Size 5", "Pro match quality.", 1500, 50, "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800"),
        ("Sports", "Tennis Racket Carbon", "Lightweight frame.", 5500, 25, "https://images.unsplash.com/photo-1622279457486-62dcc4a4b1de?w=800"),
        ("Sports", "Running Shoes Pro", "Cushioned road shoes.", 4500, 40, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800"),
        ("Sports", "Water Bottle 1L", "Insulated stainless steel.", 899, 200, "https://images.unsplash.com/photo-1523362628745-0c100150b504?w=800"),

        # Beauty (5)
        ("Beauty", "Face Serum C", "Brightening hydration.", 799, 150, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800"),
        ("Beauty", "Lipstick Matte", "Red velvet shade.", 550, 250, "https://images.unsplash.com/photo-1586776977607-310e9c725c37?w=800"),
        ("Beauty", "Face Cream 24h", "Sensitive skin friendly.", 499, 100, "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=800"),
        ("Beauty", "Perfume Gold", "Classic elegant scent.", 6500, 30, "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800"),
        ("Beauty", "Charcoal Scrub", "Deep detox exfoliant.", 450, 120, "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=800"),
    ]

    # Fill up to 50+ by adding variations
    for i in range(1, 11):
        templates.append(("Grocery", f"Fresh Item #{i}", "High quality grocery.", 99 + (i*10), 100, f"https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&sig={i}"))
    
    for cat_name, prod_name, desc, price, stock, img_url in templates:
        cat, _ = Category.objects.get_or_create(name=cat_name)
        Product.objects.create(
            name=prod_name,
            category=cat,
            supplier=supplier,
            description=desc,
            price=price,
            stock=stock,
            image=img_url,
            is_active=True
        )

    print(f"Final seeding finished. Total {Product.objects.count()} products added across {Category.objects.count()} categories.")

if __name__ == '__main__':
    seed_final_data_v3()
