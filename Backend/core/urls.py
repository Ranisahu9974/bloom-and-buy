from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
import traceback
import sys

def init_db(request):
    """Safe endpoint to run migrations and seeding manually from the browser."""
    try:
        # Check database connection and run migrations
        call_command('migrate', interactive=False)
        
        # Check if products exist, seed if not
        from store.models import Product
        if Product.objects.count() == 0:
            try:
                from seed_final_v7 import seed_data_v7
                seed_data_v7()
                return JsonResponse({"status": "success", "message": "Database migrated and seeded successfully!"})
            except Exception as e:
                # Fallback to subprocess
                import subprocess
                python_exec = sys.executable or "python3"
                subprocess.run([python_exec, "seed_final_v7.py"], check=True)
                return JsonResponse({"status": "success", "message": "Database migrated and seeded (via subprocess)!"})
        return JsonResponse({"status": "success", "message": "Database already up to date (products exist)!"})
    except Exception as e:
        return JsonResponse({
            "status": "error", 
            "message": str(e), 
            "traceback": traceback.format_exc()
        }, status=500)

from accounts.views import (
    CustomTokenObtainPairView,
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),

    # Users / Accounts
    path('api/users/', include('accounts.urls')),
    path('api/users/', include('users.urls')),

    # Store
    path('api/', include('store.urls')),

    # Orders (Includes Checkout, Verify-Payment, Track, etc.)
    path('api/orders/', include('orders.urls')),

    # JWT
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),

    # Admin Panel
    path('api/admin/', include('adminpanel.urls')),
    
    # Seller Dashboard
    path('api/seller/', include('store.seller_urls')),

    # AI Features
    path('api/ai/', include('ai_features.urls')),
]

from django.conf import settings
from django.conf.urls.static import static

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

urlpatterns.insert(0, path('api/init-db/', init_db, name='init-db'))
