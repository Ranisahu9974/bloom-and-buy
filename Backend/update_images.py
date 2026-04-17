import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product

def update_product_images():
    mappings = {
        'Moong Dal': 'products/24-mantra-organic-moong-dal-1kg.png',
        'Toor Dal': 'products/tata-sampann-toor-dal-1kg.png',
        'Basmati Rice': 'products/fortune-everyday-basmati-rice-5kg.png',
        'Atta': 'products/aashirvaad-shudh-chakki-atta.png',
        'Tomatoes': 'products/fresh-tomatoes.png'
    }

    for key, img_path in mappings.items():
        p = Product.objects.filter(name__icontains=key).first()
        if p:
            # Set image field
            p.image = img_path
            p.save()
            print(f"Updated {p.name} to use {img_path}")
        else:
            print(f"Product containing '{key}' not found.")

if __name__ == '__main__':
    update_product_images()
