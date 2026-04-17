import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

def seed_final_data():
    supplier = User.objects.filter(is_superuser=True).first()
    
    # Categories and Product Templates
    # Format: (Category, Name, Description, Price, Stock, ImageKeyword)
    templates = [
        # Electronics (10)
        ("Electronics", "iPhone 15 Pro", "Titanium design, A17 Pro chip.", 134900, 15, "iphone"),
        ("Electronics", "Samsung S24 Ultra", "AI-powered performance & S-Pen.", 129999, 12, "samsung,galaxy"),
        ("Electronics", "Sony WH-1000XM5", "Noise canceling headphones.", 34990, 20, "sony,headphones"),
        ("Electronics", "MacBook Air M3", "Supercharged by M3 chip.", 114900, 8, "macbook"),
        ("Electronics", "iPad Pro M2", "The ultimate tablet experience.", 99900, 10, "ipad"),
        ("Electronics", "Dell XPS 15", "Powerful creator laptop.", 145000, 5, "laptop,dell"),
        ("Electronics", "Nintendo Switch", "OLED model handheld gaming.", 32500, 25, "nintendo"),
        ("Electronics", "GoPro HERO 12", "Action camera for creators.", 45000, 15, "gopro"),
        ("Electronics", "Bose SoundLink", "Portable bluetooth speaker.", 12900, 40, "speaker,bluetooth"),
        ("Electronics", "Kindle Paperwhite", "Best reading experience.", 13999, 50, "kindle"),

        # Clothing (10)
        ("Clothing", "Classic White Tee", "100% Organic cotton.", 1299, 100, "tshirt,white"),
        ("Clothing", "Slim Fit Denim", "Classic blue indigo wash.", 3999, 60, "jeans,denim"),
        ("Clothing", "Leather Biker Jacket", "Genuine black sheepskin.", 8500, 15, "jacket,leather"),
        ("Clothing", "Floral Summer Dress", "Lightweight breezy fabric.", 2499, 30, "dress,floral"),
        ("Clothing", "Men's Oxford Shirt", "Perfect for office wear.", 1999, 45, "shirt,oxford"),
        ("Clothing", "Knit Wool Sweater", "Warm premium wool blend.", 2999, 20, "sweater,wool"),
        ("Clothing", "Sportswear Shorts", "Quick-dry athletic shorts.", 999, 80, "shorts,sport"),
        ("Clothing", "Trench Coat", "Classic beige rain coat.", 5500, 10, "coat,trench"),
        ("Clothing", "Yoga Leggings", "High-waist stretch fabric.", 1500, 120, "leggings,yoga"),
        ("Clothing", "Graphic Hoodie", "Urban street style print.", 2499, 50, "hoodie"),

        # Home & Kitchen (10)
        ("Home & Kitchen", "Espresso Machine", "Professional home brewing.", 18900, 10, "espresso,coffee"),
        ("Home & Kitchen", "Non-Stick Cookware", "10-piece ceramic set.", 12000, 15, "cookware,kitchen"),
        ("Home & Kitchen", "Air Purifier", "HEPA filter for clean air.", 9999, 20, "air,purifier"),
        ("Home & Kitchen", "Memory Foam Pillow", "Ergonomic sleep support.", 1999, 100, "pillow,bed"),
        ("Home & Kitchen", "Smart LED Bulb", "Millions of colors via app.", 999, 300, "light,bulb"),
        ("Home & Kitchen", "Robot Vacuum", "Self-charging smart cleaner.", 24900, 12, "vacuum,robot"),
        ("Home & Kitchen", "Blender Pro", "High-speed smoothie maker.", 5500, 25, "blender"),
        ("Home & Kitchen", "Cast Iron Skillet", "Pre-seasoned 12-inch.", 3499, 40, "skillet,castiron"),
        ("Home & Kitchen", "Throw Blanket", "Soft cozy fleece for sofa.", 1200, 60, "blanket,cozy"),
        ("Home & Kitchen", "Knife Set (6pc)", "Forged stainless steel.", 4500, 20, "knives,kitchen"),

        # Books (10)
        ("Books", "Atomic Habits", "James Clear's bestseller.", 499, 200, "book,habits"),
        ("Books", "The Alchemist", "Paulo Coelho's classic.", 350, 150, "book,alchemist"),
        ("Books", "Deep Work", "Rules for focused success.", 550, 80, "book,work"),
        ("Books", "Dune", "Frank Herbert's sci-fi epic.", 699, 40, "book,dune"),
        ("Books", "Sapiens", "History of humankind.", 599, 120, "book,sapiens"),
        ("Books", "1984", "George Orwell's masterpiece.", 299, 100, "book,1984"),
        ("Books", "Psychology of Money", "Morgan Housel's wisdom.", 399, 180, "book,money"),
        ("Books", "Thinking Fast and Slow", "By Daniel Kahneman.", 650, 50, "book,thinking"),
        ("Books", "The Great Gatsby", "F. Scott Fitzgerald.", 250, 70, "book,gatsby"),
        ("Books", "Harry Potter #1", "The boy who lived.", 499, 250, "book,potter"),

        # Beauty (5)
        ("Beauty", "Matte Lipstick", "24hr long-wear red.", 899, 150, "lipstick"),
        ("Beauty", "Moisturizer", "Daily hydrating cream.", 550, 200, "moisturizer"),
        ("Beauty", "Perfume (Floral)", "Luxury jasmine scent.", 6500, 20, "perfume"),
        ("Beauty", "Eye Shadow", "12 colors shimmer kit.", 1999, 40, "eyeshadow"),
        ("Beauty", "Sunscreen SPF 50", "Non-greasy protection.", 750, 100, "sunscreen"),

        # Sports (5)
        ("Sports", "Yoga Mat", "Eco-friendly non-slip.", 1200, 150, "yogamat"),
        ("Sports", "Dumbbells (5kg)", "Pair of iron weights.", 2499, 40, "dumbbells"),
        ("Sports", "Football (Size 5)", "Professional match ball.", 1500, 60, "football"),
        ("Sports", "Tennis Racket", "Lightweight carbon fiber.", 5500, 20, "tennis,racket"),
        ("Sports", "Running Shoes", "Cushioned road trainers.", 4500, 35, "running,shoes"),
    ]

    # Clean existing data to avoid duplicates/confusion if preferred
    # Product.objects.all().delete()
    # Category.objects.all().delete()

    for cat_name, prod_name, desc, price, stock, keyword in templates:
        cat, _ = Category.objects.get_or_create(name=cat_name)
        
        # Construct Unsplash URL based on keyword
        image_url = f"https://source.unsplash.com/featured/800x600?{keyword}"
        
        Product.objects.update_or_create(
            name=prod_name,
            defaults={
                'category': cat,
                'supplier': supplier,
                'description': desc,
                'price': price,
                'stock': stock,
                'image': image_url,
                'is_active': True
            }
        )
    
    print(f"Seeding finished. 50+ products verified for {len(templates)} templates.")

if __name__ == '__main__':
    seed_final_data()
