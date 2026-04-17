from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse
from django.core.management import call_command
import traceback
import sys

def init_db(request):
    """
    Safe endpoint to run migrations and seeding manually from the browser.
    Ensures the production database is initialized with data.
    """
    try:
        # Step 1: Run Migrations
        call_command('migrate', interactive=False)
        
        from store.models import Product
        if Product.objects.count() == 0:
            # Step 2: Attempt Seeding (Multiple fallbacks)
            seed_scripts = [
                ('seed_final_v7', 'seed_data_v7'),
                ('seed_large', 'seed_large_data'),
                ('seed_grocery', 'seed_grocery_data')
            ]
            
            error_log = []
            for module_name, func_name in seed_scripts:
                try:
                    module = __import__(module_name)
                    func = getattr(module, func_name)
                    func()
                    return JsonResponse({
                        "status": "success", 
                        "message": f"Migrated and seeded successfully using {module_name}!"
                    })
                except Exception as e:
                    error_log.append(f"{module_name} failed: {str(e)}")
            
            return JsonResponse({
                "status": "partial_success",
                "message": "Migrations completed, but seeding failed.",
                "errors": error_log
            }, status=500)
            
        return JsonResponse({"status": "success", "message": "Database already up to date (products exist)!"})
    except Exception as e:
        return JsonResponse({
            "status": "error", 
            "message": f"General Error: {str(e)}", 
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
