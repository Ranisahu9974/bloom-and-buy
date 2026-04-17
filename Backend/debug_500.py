import os
import django
import sys

# Set up Django environment
sys.path.append(os.getcwd())
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from store.models import Product, Category
from users.models import PromotionalMessage
from rest_framework.test import APIRequestFactory
from store.views import ProductListAPIView, RecommendationsAPIView
from users.views import GlobalAnnouncementsView

factory = APIRequestFactory()

def test_view(view_class, url):
    print(f"Testing {view_class.__name__} at {url}...")
    view = view_class.as_view()
    request = factory.get(url)
    try:
        response = view(request)
        print(f"Status: {response.status_code}")
        if response.status_code == 500:
            print("Response Data:", response.data)
    except Exception as e:
        import traceback
        print(f"FAILED with exception: {e}")
        traceback.print_exc()

print("--- Testing API Endpoints ---")
test_view(GlobalAnnouncementsView, '/api/users/announcements/')
test_view(ProductListAPIView, '/api/products/?limit=12&sort=popular')
test_view(RecommendationsAPIView, '/api/products/recommendations/')
