import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from store.models import Category, Product

for c in Category.objects.all():
    print(f"Category: {c.name} | Count: {Product.objects.filter(category=c).count()}")
