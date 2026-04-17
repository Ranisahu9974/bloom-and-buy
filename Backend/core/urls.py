from django.contrib import admin
from django.urls import path, include
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
