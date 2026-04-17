from django.urls import path
from . import views

urlpatterns = [
    path("summary", views.AdminSummaryView.as_view()),
    path('inventory', views.AdminInventoryView.as_view()),
    path('products/<int:pk>/override', views.AdminProductOverrideView.as_view()),
    path('orders', views.AdminOrderListView.as_view()),
    path('orders/<int:pk>', views.AdminOrderDetailView.as_view()),
    path('users', views.AdminUserListView.as_view()),
    path('users/<int:pk>', views.AdminUserDetailView.as_view()),
    path('users/<int:pk>/toggle', views.AdminToggleUserView.as_view()),
    path('sellers', views.AdminSellerListView.as_view()),
    path('sellers/<int:pk>', views.AdminSellerDetailView.as_view()),
    path('sellers/<int:pk>/toggle', views.AdminToggleSellerView.as_view()),
    path('products/moderation', views.AdminProductModerationView.as_view()),
    path('products/<int:pk>/moderate', views.AdminModerateProductView.as_view()),
    path('notifications/send', views.AdminSendNotificationView.as_view()),
    path('promotions/send', views.AdminPromotionalView.as_view()),
    path('notifications', views.AdminNotificationView.as_view()),
    path('notifications/<int:pk>/read', views.AdminNotificationMarkReadView.as_view()),
]