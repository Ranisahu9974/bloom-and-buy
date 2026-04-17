import os, django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def add_missing_products():
    supplier = User.objects.filter(is_superuser=True).first()
    if not supplier:
        supplier = User.objects.create_superuser('admin', 'admin@shop.com', 'admin123')

    # Data to add mapped by Category
    new_data = [
        # --- BOOKS ---
        ("Books", "Atomic Habits", "A tiny changes, remarkable results - by James Clear.", 450, 699, 100, "https://m.media-amazon.com/images/I/91bYsX41DVL._SL1500_.jpg", "BEST SELLER"),
        ("Books", "The Psychology of Money", "Timeless lessons on wealth, greed, and happiness.", 320, 399, 80, "https://m.media-amazon.com/images/I/71g2ednj0JL._SL1500_.jpg", ""),
        ("Books", "It Ends with Us", "A powerful novel about love and choice by Colleen Hoover.", 299, 450, 120, "https://m.media-amazon.com/images/I/71E86v0HhfL._SL1500_.jpg", ""),
        
        # --- SPORTS ---
        ("Sports", "Nike Academy Football", "High-visibility soccer ball for training and play.", 1895, 2495, 45, "https://static.nike.com/a/images/t_PDP_1280_v1/f_auto,q_auto:eco/e8cf701b-c75c-4f7d-961f-3696504a37b3/academy-soccer-ball-X57hX6.png", "NEW ARIVAL"),
        ("Sports", "Wilson Burn 100 Racket", "Lightweight powerhouse for intermediate tennis players.", 14500, 18900, 15, "https://m.media-amazon.com/images/I/71u9+5D5+OL._SL1500_.jpg", "PREMIUM"),
        ("Sports", "Yoga Mat Pro (6mm)", "Non-slip eco-friendly mat for yoga and pilates.", 850, 1200, 200, "https://images.unsplash.com/photo-1592432676556-2815146c1ad7?w=800&q=80", ""),
        
        # --- BEAUTY ---
        ("Beauty", "The Ordinary Niacinamide", "High-strength vitamin and mineral blemish formula.", 600, 750, 60, "https://m.media-amazon.com/images/I/61R-pI5pP9L._SL1500_.jpg", "TRENDING"),
        ("Beauty", "CeraVe Moisturizing Cream", "Developed with dermatologists for dry skin.", 1450, 1699, 40, "https://m.media-amazon.com/images/I/61S7Ubqm6RL._SL1500_.jpg", ""),
        ("Beauty", "Maybelline Fit Me Foundation", "Matte + Poreless liquid foundation for all skin types.", 495, 599, 100, "https://m.media-amazon.com/images/I/61m12YhPZLL._SL1500_.jpg", ""),
        
        # --- TOYS ---
        ("Toys", "LEGO Technic Chevrolet", "Authentic details for car enthusiasts and kids.", 4500, 5999, 20, "https://m.media-amazon.com/images/I/81xU-q4O9EL._SL1500_.jpg", ""),
        ("Toys", "Rubik's Cube 3x3", "The original 3x3 puzzle with faster turning.", 499, 699, 150, "https://m.media-amazon.com/images/I/71-081p8m9L._SL1500_.jpg", ""),
        ("Toys", "Uno Cards Classic", "The matching card game for family fun night.", 199, 250, 300, "https://m.media-amazon.com/images/I/71m6pU9F4nL._SL1500_.jpg", "GAME NIGHT"),
        
        # --- AUTOMOTIVE ---
        ("Automotive", "Michelin Tyre Inflator", "Fast and accurate digital portable inflator.", 3590, 4800, 30, "https://m.media-amazon.com/images/I/81y6s5Vl96L._SL1500_.jpg", "ESSENTIAL"),
        ("Automotive", "Turtle Wax High Gloss", "Hard shell finish paste wax for car shine.", 750, 1100, 50, "https://m.media-amazon.com/images/I/715M4h7qYPL._SL1500_.jpg", ""),
        ("Automotive", "Microfiber Cleaning Cloths", "Extra soft and absorbent for safe cleaning.", 299, 450, 500, "https://images.unsplash.com/photo-1621905252507-b35482cd84b0?w=800&q=80", ""),
    ]

    for cat_name, prod_name, desc, price, base_price, stock, img_url, tag in new_data:
        category, _ = Category.objects.get_or_create(name=cat_name)
        # Check if already exists to avoid duplicates
        if not Product.objects.filter(name=prod_name).exists():
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
            print(f"Added: {prod_name} to {cat_name}")

if __name__ == '__main__':
    add_missing_products()
    print("Store catalogue expansion complete.")
