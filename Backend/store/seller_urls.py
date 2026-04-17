from django.urls import path
from .seller_views import (
    SellerDashboardView, SellerAnalyticsView, SellerOrdersView,
    SellerProductListView, SellerProductDetailView,
    SellerNotificationView, SellerNotificationMarkReadView,
    SellerProfileView
)

urlpatterns = [
    path('dashboard/', SellerDashboardView.as_view()),
    path('analytics/', SellerAnalyticsView.as_view()),
    path('orders/', SellerOrdersView.as_view()),
    path('products/', SellerProductListView.as_view()),
    path('products/<int:pk>/', SellerProductDetailView.as_view()),
    path('notifications/', SellerNotificationView.as_view()),
    path('notifications/<int:pk>/read/', SellerNotificationMarkReadView.as_view()),
    path('profile/', SellerProfileView.as_view()),
]
