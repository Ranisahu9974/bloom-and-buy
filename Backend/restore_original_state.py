
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product, Category
from django.contrib.auth.models import User

def cleanup():
    print("Starting database restoration to previous state...")
    
    # 1. Delete system-generated products
    # Based on naming pattern or ID range I used
    deleted_count = Product.objects.filter(name__icontains=" Item ").delete()[0]
    print(f"Deleted {deleted_count} system-generated products.")

    # 2. Identify remaining products (original ones)
    remaining_products = Product.objects.all()
    print(f"Found {remaining_products.count()} original products.")

    # 3. Restore images to file paths where possible
    # We'll map keywords to the files found in media/products
    image_mapping = {
        "moong dal": "products/24-mantra-organic-moong-dal-1kg.png",
        "cerave": "products/CeraVeDailyMoisturizingCream.webp",
        "basmati rice": "products/FortuneRozanaBasmatiRice5kg_indiadesire.jpg",
        "lego": "products/Lego-Technic-Chevrolet-Corvette-ZR1-Bausatz-1.jpg",
        "tyre inflator": "products/Michelin-Superfast-4X4-SUV-Digital-Tyre-Inflator-0001.jpg",
        "shirt": "products/White-Oxford-Shirt-Women-Outfit.jpg",
        "atta": "products/ashirwaad_aata_5kg.jpg",
        "atomic habits": "products/atomic-habits.jpg",
        "dairy milk": "products/dairy_milk_silk.jpg",
        "dyson": "products/dyson_cordless.jpg",
        "ferrero": "products/farrero_rocher.webp",
        "tomato": "products/fresh-tomatoes.png",
        "grapes": "products/green_seedless_grapes_500g.jpg",
        "hershey": "products/hersheys_syurup.jpg",
        "colleen": "products/it-ends-with-us-colleen-hoover-novel-mountaineer.avif",
        "lays": "products/lays_claassic.jpg",
        "skillet": "products/le-creuset-classic-9-skillet-rhone.jpg",
        "jacket": "products/leather_biker_jacket.jpg",
        "maybelline": "products/maybelline_fit_me_foundation.jpg",
        "microfiber": "products/microfiber_cleaning_cloth.webp",
        "maggi": "products/nestle-maggi-2-minute-masala-instant-noodles-12-pack.jpeg",
        "nike": "products/nike_academy_football.avif",
        "oreo": "products/oreo.webp",
        "banana": "products/organic-bananas.webp",
        "parle": "products/parle_g_gold.png",
        "apple": "products/red_fuji_apple_1kg.webp",
        "toor dal": "products/tata-sampann-toor-dal-1kg.png",
        "ordinary": "products/the-ordinary-niacinamide-10-zinc-1-30ml.jpg",
        "money": "products/the_pyschology_of_money.jpg",
        "turtle wax": "products/turtle_wax_high_gloss.jpg",
        "uno": "products/uno_classic.jpg",
        "iphone": "https://m.media-amazon.com/images/I/71d7rjTSKdL._SL1500_.jpg",
        "samsung": "https://m.media-amazon.com/images/I/81vD5K67yYL._SL1500_.jpg",
        "sony": "https://m.media-amazon.com/images/I/61kFL7ywsZS._SL1500_.jpg",
        "macbook": "https://m.media-amazon.com/images/I/61ChS7vC7iL._SL1500_.jpg",
    }

    for p in remaining_products:
        name_lower = p.name.lower()
        matched = False
        for kw, file_path in image_mapping.items():
            if kw in name_lower:
                p.image = file_path
                matched = True
                break
        
        # Ensure all original products are approved
        p.approval_status = 'approved'
        p.save()
        if matched:
            print(f"Restored image for {p.name}")

    # 4. Re-assign original products to the correct sellers
    # This keeps the dashboard working but with original data
    sellers = {
        "Electronics": "techzone@bloomandbuy.com",
        "Fashion": "stylekart@bloomandbuy.com",
        "Home & Kitchen": "homenest@bloomandbuy.com",
        "Books": "bookbazaar@bloomandbuy.com",
        "Sports": "sportsplanet@bloomandbuy.com",
        "Beauty": "glowbeauty@bloomandbuy.com",
        "Grocery": "techzone@bloomandbuy.com", # Fallback
    }

    for cat_name, email in sellers.items():
        try:
            user = User.objects.get(username=email)
            count = Product.objects.filter(category__name__icontains=cat_name).update(supplier=user)
            print(f"Assigned {count} {cat_name} products to {email}")
        except User.DoesNotExist:
            print(f"Seller {email} not found.")

    print("Restoration complete.")

if __name__ == "__main__":
    cleanup()
