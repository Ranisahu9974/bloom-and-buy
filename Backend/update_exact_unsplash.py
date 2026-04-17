import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product

mapping = {
    'iPhone 15 Pro Max': 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800',
    'Samsung Galaxy S24 Ultra': 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?w=800',
    'Sony WH-1000XM5': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800',
    'MacBook Pro M3 Max': 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800',
    'Parle-G Gold (800g)': 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=800',
    'Maggi Masala Noodles (12 Pk)': 'https://images.unsplash.com/photo-1612929633738-8fe44f7ec841?w=800',
    'Oreo Chocolate Sandwich': 'https://images.unsplash.com/photo-1557089706-68d022b39798?w=800',
    "Lay's Classic Salted": 'https://images.unsplash.com/photo-1566478989037-e50337b51b3a?w=800',
    'Ferrero Rocher (24 Pcs)': 'https://images.unsplash.com/photo-1612373027877-66a7b7d7f766?w=800',
    'Dairy Milk Silk': 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=800',
    "Hershey's Syrup (623g)": 'https://images.unsplash.com/photo-1600350369848-18eaf3962649?w=800',
    'Organic Bananas (Pack of 6)': 'https://images.unsplash.com/photo-1481349518771-20055b2a7b24?w=800',
    'Red Fuji Apples (1kg)': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6faa6?w=800',
    'Green Seedless Grapes (500g)': 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=800',
    'Organic Potatoes (2kg)': 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=800',
    'Fresh Onions (2kg)': 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=800',
    'Fresh Roma Tomatoes (1kg)': 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=800',
    'Aashirvaad Shudh Chakki Atta (5kg)': 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800',
    'Fortune Basmati Rice (5kg)': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=800',
    'Tata Sampann Toor Dal (1kg)': 'https://images.unsplash.com/photo-1600007283728-22caece3fc1a?w=800',
    'Organic Moong Dal (1kg)': 'https://images.unsplash.com/photo-1595180635443-4aa9df0ec8a5?w=800',
    'Leather Biker Jacket': 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800',
    'Classic Oxfords Shirt': 'https://images.unsplash.com/photo-1596755094514-f87e32f85e2c?w=800',
    'Dyson V15 Cordless': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800',
    'Le Creuset Skillet': 'https://images.unsplash.com/photo-1584990347449-b001a1dcaeca?w=800',
    'Atomic Habits': 'https://images.unsplash.com/photo-1589829085413-56de0ae18c73?w=800',
    'The Psychology of Money': 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800',
    'It Ends with Us': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800',
    'Nike Academy Football': 'https://images.unsplash.com/photo-1614632537190-23e4146777bf?w=800',
    'Wilson Burn 100 Racket': 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800',
    'Yoga Mat Pro (6mm)': 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800',
    'The Ordinary Niacinamide': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800',
    'CeraVe Moisturizing Cream': 'https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800',
    'Maybelline Fit Me Foundation': 'https://images.unsplash.com/photo-1599305090598-fe179d501227?w=800',
    'LEGO Technic Chevrolet': 'https://images.unsplash.com/photo-1585366119957-e9730b6d0f60?w=800',
    "Rubik's Cube 3x3": 'https://images.unsplash.com/photo-1591991564021-0662a8573199?w=800',
    'Uno Cards Classic': 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?w=800',
    'Michelin Tyre Inflator': 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800',
    'Turtle Wax High Gloss': 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?w=800',
    'Microfiber Cleaning Cloths': 'https://images.unsplash.com/photo-1585834821016-df809074d284?w=800'
}

# Update all matching products
for name, url in mapping.items():
    products = Product.objects.filter(name__icontains=name.split()[0])
    for p in products:
        if name in p.name:
            p.image = url
            p.save()
            print(f"Assigned accurate image to: {p.name}")
