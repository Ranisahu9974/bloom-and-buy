from django.urls import path
from .views import (
    ProductListAPIView,
    ProductDetailApi,
    RecentProductsAPIView,
    CategoryListCreateAPIView,
    CategoryDetailAPIView,
    CartAPIView,
    add_to_cart,
    clear_cart,
    update_cart_quantity,
    remove_from_cart,
    CheckoutAPIView,
    ProductStatsAPIView,
    CheckoutAPIView,
    ProductStatsAPIView,
    BannerListAPIView,
    RecommendationsAPIView,
    WishlistAPIView,
    WishlistItemAPIView
)

urlpatterns = [
    path('products/', ProductListAPIView.as_view()),
    path('products/stats/', ProductStatsAPIView.as_view()),
    path('products/<int:pk>/', ProductDetailApi.as_view(), name='product-detail'),
    path('products/recent/', RecentProductsAPIView.as_view()),
    path('products/recommendations/', RecommendationsAPIView.as_view()),

    path('categories/', CategoryListCreateAPIView.as_view()),
    path('categories/<int:pk>/', CategoryDetailAPIView.as_view()),

    path('cart/', CartAPIView.as_view()),
    path('cart/clear/', clear_cart, name='clear-cart'),
    path('cart/update/', update_cart_quantity, name='update-cart'),
    path('cart/remove/<int:product_id>/', remove_from_cart, name='remove-cart'),
    path('add-to-cart/', add_to_cart, name='add-to-cart'),
    path('checkout/', CheckoutAPIView.as_view()),
    path('wishlist/', WishlistAPIView.as_view(), name='wishlist'),
    path('wishlist/<int:product_id>/', WishlistItemAPIView.as_view(), name='wishlist-item'),
]