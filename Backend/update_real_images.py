import os, django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product

image_map = {
    "iPhone 15 Pro Max": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium?wid=1000&hei=1000&fmt=p-jpg&qlt=80",
    "Samsung Galaxy S24 Ultra": "https://images.samsung.com/is/image/samsung/p6pim/in/2401/gallery/in-galaxy-s24-s928-sm-s928bztqins-539573351?$650_519_PNG$",
    "Sony WH-1000XM5": "https://www.sony.co.in/image/5d02da5df55202485edc7e2d5861105c?fmt=pjpeg&wid=600&hei=600",
    "MacBook Pro M3 Max": "https://store.storeimages.cdn-apple.com/4668/as-images.apple.com/is/mbp14-spaceblack-select-202310?wid=904&hei=840&fmt=jpeg&qlt=90",
    "Parle-G Gold (800g)": "https://m.media-amazon.com/images/I/51rYfV9hLFL._SL1000_.jpg",
    "Maggi Masala Noodles (12 Pk)": "https://m.media-amazon.com/images/I/81I-uYF8QFL._SL1500_.jpg",
    "Oreo Chocolate Sandwich": "https://m.media-amazon.com/images/I/71R2I6K0KjL._SL1500_.jpg",
    "Lay's Classic Salted": "https://m.media-amazon.com/images/I/81vJ9S7y6QL._SL1500_.jpg",
    "Ferrero Rocher (24 Pcs)": "https://m.media-amazon.com/images/I/71nS7pX-47L._SL1500_.jpg",
    "Dairy Milk Silk": "https://m.media-amazon.com/images/I/61NAsq-nIEL._SL1500_.jpg",
    "Hershey's Syrup (623g)": "https://m.media-amazon.com/images/I/71L0p0jO-OL._SL1500_.jpg",
    "Organic Bananas (Pack of 6)": "https://images.unsplash.com/photo-1571771894821-ad9902d83f4e?w=800&q=80",
    "Red Fuji Apples (1kg)": "https://images.unsplash.com/photo-1560806887-1e4cd0b6bcd6?w=800&q=80",
    "Green Seedless Grapes (500g)": "https://m.media-amazon.com/images/I/61iVvQ-r1hL._SL1500_.jpg",
    "Organic Potatoes (2kg)": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800&q=80",
    "Fresh Onions (2kg)": "https://images.unsplash.com/photo-1508747703725-719777637510?w=800&q=80",
    "Fresh Roma Tomatoes (1kg)": "https://m.media-amazon.com/images/I/516mQdAsRcL._SL1000_.jpg",
    "Aashirvaad Shudh Chakki Atta (5kg)": "https://m.media-amazon.com/images/I/81W2G89AivL._SL1500_.jpg",
    "Fortune Basmati Rice (5kg)": "https://m.media-amazon.com/images/I/81xU-q4O9EL._SL1500_.jpg",
    "Tata Sampann Toor Dal (1kg)": "https://m.media-amazon.com/images/I/71z7oI7C2wL._SL1500_.jpg",
    "Organic Moong Dal (1kg)": "https://m.media-amazon.com/images/I/71sE1n7v7DL._SL1500_.jpg",
    "Leather Biker Jacket": "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&q=80",
    "Classic Oxfords Shirt": "https://images.unsplash.com/photo-1598033129183-c4f50c717658?w=800&q=80",
    "Dyson V15 Cordless": "https://m.media-amazon.com/images/I/51w7Y6R-n4L._SL1500_.jpg",
    "Le Creuset Skillet": "https://m.media-amazon.com/images/I/71b2S1P-D0L._SL1500_.jpg"
}

for name, url in image_map.items():
    Product.objects.filter(name=name).update(image=url)
    print(f"Updated {name}")

print("All product images updated to real-world URLs.")
