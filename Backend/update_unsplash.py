import os
import django
import urllib.parse

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product

for p in Product.objects.all():
    name = p.name.lower()
    cat = p.category.name.lower() if p.category else ""
    
    kw = "product"
    if "iphone" in name:
        kw = "iphone"
    elif "galaxy" in name or "smartphone" in name:
        kw = "smartphone"
    elif "sony" in name or "headphone" in name:
        kw = "headphones"
    elif "macbook" in name or "laptop" in name:
        kw = "laptop"
    elif "grocery" in cat:
        if "banana" in name: kw = "banana"
        elif "apple" in name: kw = "apple"
        elif "tomato" in name: kw = "tomato"
        elif "chocolate" in name or "dairy" in name or "ferrero" in name or "oreo" in name: kw = "chocolate"
        elif "dal" in name or "atta" in name or "rice" in name: kw = "grains"
        else: kw = "groceries"
    elif "home" in cat or "kitchen" in cat:
        if "dyson" in name: kw = "vacuum"
        elif "skillet" in name: kw = "skillet"
        else: kw = "home"
    elif "clothing" in cat:
        if "jacket" in name: kw = "jacket"
        elif "shirt" in name: kw = "shirt"
        else: kw = "clothes"
    elif "books" in cat:
        kw = "book"
    elif "sports" in cat:
        if "football" in name: kw = "football"
        elif "racket" in name: kw = "tennis"
        elif "mat" in name: kw = "yoga"
        else: kw = "sports"
    elif "beauty" in cat:
        kw = "cosmetics"
    elif "toys" in cat:
        if "lego" in name: kw = "lego"
        elif "rubik" in name: kw = "rubiks"
        elif "uno" in name: kw = "cards"
        else: kw = "toys"
    elif "automotive" in cat:
        if "tyre" in name: kw = "tire"
        elif "wax" in name: kw = "carwax"
        elif "cloth" in name: kw = "microfiber"
        else: kw = "car"

    url = f"https://loremflickr.com/600/400/{kw}?lock={p.id}"
    p.image = url
    p.save()
    print(f"Updated {p.name} with {url}")
