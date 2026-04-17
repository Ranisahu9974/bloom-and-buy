import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Category, Product
from django.contrib.auth.models import User

# List of categories and products to create
categories_data = [
    {
        'name': 'Electronics',
        'products': [
            {'name': 'iPhone 15 Pro', 'description': 'Latest apple smartphone with titanium build', 'price': 129999.00, 'stock': 15, 'image': 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=800'},
            {'name': 'Sony WH-1000XM5', 'description': 'Industry-leading noise canceling headphones', 'price': 34990.00, 'stock': 20, 'image': 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800'},
            {'name': 'MacBook Air M2', 'description': 'Thinnest and lightest laptop by Apple', 'price': 114900.00, 'stock': 10, 'image': 'https://images.unsplash.com/photo-1611186871348-b1ec696e52c9?w=800'}
        ]
    },
    {
        'name': 'Fashion',
        'products': [
            {'name': 'Levi\'s 501 Original', 'description': 'Classic straight fit denim jeans', 'price': 4599.00, 'stock': 50, 'image': 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=800'},
            {'name': 'Premium Cotton Crew T-Shirt', 'description': 'Soft and breathable 100% cotton tee', 'price': 1299.00, 'stock': 150, 'image': 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800'},
            {'name': 'Floral Summer Dress', 'description': 'Light and airy dress for summer days', 'price': 2499.00, 'stock': 25, 'image': 'https://images.unsplash.com/photo-1572804013427-4d7ca7268217?w=800'}
        ]
    },
    {
        'name': 'Home & Kitchen',
        'products': [
            {'name': 'Ergonomic Office Chair', 'description': 'Breathable mesh back with lumbar support', 'price': 12500.00, 'stock': 12, 'image': 'https://images.unsplash.com/photo-1505797149-43b0069ec26b?w=800'},
            {'name': 'Smart Induction Cooktop', 'description': 'Touch control with 7 preset menus', 'price': 3999.00, 'stock': 30, 'image': 'https://images.unsplash.com/photo-1506484334402-40ff22e0d467?w=800'}
        ]
    },
    {
        'name': 'Books',
        'products': [
            {'name': 'The Psychology of Money', 'description': 'Timeless lessons on wealth, greed, and happiness', 'price': 350.00, 'stock': 100, 'image': 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800'},
            {'name': 'Atomic Habits', 'description': 'An easy and proven way to build good habits', 'price': 499.00, 'stock': 85, 'image': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800'}
        ]
    },
    {
        'name': 'Beauty',
        'products': [
            {'name': 'Hydrating Face Serum', 'description': 'With Vitamin C and Hyaluronic Acid', 'price': 799.00, 'stock': 60, 'image': 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800'}
        ]
    }
]

def seed_data():
    # Get a dummy supplier (e.g. admin)
    supplier = User.objects.filter(is_superuser=True).first()
    
    for cat_data in categories_data:
        category, _ = Category.objects.get_or_create(name=cat_data['name'])
        
        for prod_data in cat_data['products']:
            product, created = Product.objects.get_or_create(
                name=prod_data['name'],
                defaults={
                    'category': category,
                    'supplier': supplier,
                    'description': prod_data['description'],
                    'price': prod_data['price'],
                    'stock': prod_data['stock'],
                    'image': prod_data['image']
                }
            )
            if not created:
                # Update existing product images/description if needed
                product.image = prod_data['image']
                product.category = category
                product.save()
            print(f"{'Created' if created else 'Updated'} product: {product.name}")

if __name__ == '__main__':
    seed_data()
    print("Seeding complete.")
