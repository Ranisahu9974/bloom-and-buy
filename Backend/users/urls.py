from django.urls import path
from .views import (
    UserAddressListCreateView,
    UserAddressDetailView,
    UserNotificationsView,
    MarkNotificationReadView,
    GlobalAnnouncementsView,
    GlobalAnnouncementDetailView
)
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path('addresses/', UserAddressListCreateView.as_view(), name='user-addresses'),
    path('addresses/<int:pk>/', UserAddressDetailView.as_view(), name='user-address-detail'),
    path('notifications/', UserNotificationsView.as_view(), name='user-notifications'),
    path('notifications/<int:pk>/read/', MarkNotificationReadView.as_view(), name='mark-notification-read'),
    path('announcements/', GlobalAnnouncementsView.as_view(), name='global-announcements'),
    path('announcements/<int:pk>/', GlobalAnnouncementDetailView.as_view(), name='global-announcement-detail'),
]
