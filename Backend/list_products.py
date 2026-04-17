import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from store.models import Product

for p in Product.objects.all():
    print(f"ID: {p.id} | Name: {p.name} | Image: {p.image}")
