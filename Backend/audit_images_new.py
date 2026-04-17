import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from store.models import Product

all_products = Product.objects.all()
total = all_products.count()
http_count = 0
local_count = 0
empty_count = 0

for p in all_products:
    img = str(p.image)
    if img.startswith('http'):
        http_count += 1
    elif 'products/' in img:
        local_count += 1
    elif not img:
        empty_count += 1

print(f"Total Products: {total}")
print(f"Internet Images (HTTP): {http_count}")
print(f"Local Images (products/): {local_count}")
print(f"Empty Images: {empty_count}")

# Print 5 names that are empty if any
if empty_count > 0:
    print("Example empty products:")
    for p in all_products.filter(image=''):
        print(f"- {p.name} (ID: {p.id}, Category: {p.category.name})")
