import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product

def fix_images():
    # Map of partial product name or unique keyword to local filenames
    image_map = {
        'iPhone': 'iphone.jpg',
        'Samsung': 'samsung.webp',
        'Sony': 'sony-wh-1000xm5-review-11.jpg',
        'MacBook': 'macbook-pro-m2-max-16-inch.jpg',
        'Parle-G': 'parle_g_gold.png',
        'Maggi': 'nestle-maggi-2-minute-masala-instant-noodles-12-pack.jpeg',
        'Oreo': 'oreo.webp',
        'Lay\'s': 'lays_claassic.jpg',
        'Ferrero': 'farrero_rocher.webp',
        'Dairy Milk': 'dairy_milk_silk.jpg',
        'Moong Dal': '24-mantra-organic-moong-dal-1kg.png',
        'CeraVe': 'CeraVeDailyMoisturizingCream.webp',
        'Basmati Rice': 'FortuneRozanaBasmatiRice5kg_indiadesire.jpg',
        'Galaxy Tab': 'Galaxy-Tab-S11-7.jpg',
        'Lego': 'Lego-Technic-Chevrolet-Corvette-ZR1-Bausatz-1.jpg',
        'Michelin': 'Michelin-Superfast-4X4-SUV-Digital-Tyre-Inflator-0001.jpg',
        'Shirt': 'White-Oxford-Shirt-Women-Outfit.jpg',
        'Atta': 'aashirvaad-shudh-chakki-atta.png',
        'Habits': 'atomic-habits.jpg',
        'Cube': 'cube.webp',
        'Face Wash': 'dot-and-key-vitamin-c-e-super-bright-gel-face-wash-with-blood-orange-and-niaci_zSSufgN.webp',
        'Dyson': 'dyson_cordless.jpg',
        'Tomatoes': 'fresh-tomatoes.png',
        'Grapes': 'green_seedless_grapes_500g.jpg',
        'Syrup': 'hersheys_syurup.jpg',
        'Colleen Hoover': 'it-ends-with-us-colleen-hoover-novel-mountaineer.avif',
        'Le Creuset': 'le-creuset-classic-9-skillet-rhone.jpg',
        'Leather': 'leather_biker_jacket.jpg',
        'Foundation': 'maybelline_fit_me_foundation.jpg',
        'Cloth': 'microfiber_cleaning_cloth.webp',
        'Nike': 'nike_academy_football.avif',
        'Onion': 'onion.webp',
        'Bananas': 'organic-bananas.webp',
        'Potato': 'potato.webp',
        'Apple': 'red_fuji_apple_1kg.webp',
        'Ordinary': 'the-ordinary-niacinamide-10-zinc-1-30ml.jpg',
        'Psychology of Money': 'the_pyschology_of_money.jpg',
        'Toor Dal': 'tata-sampann-toor-dal-1kg.png',
        'Turtle Wax': 'turtle_wax_high_gloss.jpg',
        'Uno': 'uno_classic.jpg',
        'Wilson': 'wilson_racket.jpg',
        'Yoga': 'yoga_mat.webp'
    }

    products = Product.objects.all()
    count = 0
    for p in products:
        found = False
        for key, filename in image_map.items():
            if key.lower() in p.name.lower():
                p.image = f'products/{filename}'
                p.save()
                print(f"Fixed image for: {p.name} -> {filename}")
                found = True
                count += 1
                break
        
        if not found:
            # Fallback for anything else
            if not p.image or p.image.name.startswith('http'):
                 # Just pick a random one or leave it
                 pass

    print(f"Successfully updated {count} product images to local media files.")

if __name__ == "__main__":
    fix_images()
