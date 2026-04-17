from django.urls import path
from .views import (
    CheckoutAPIView, VerifyPaymentView, MyOrdersView, 
    TrackOrderAPIView, UpdateOrderStatusView, generate_invoice
)

urlpatterns = [
    path('checkout/', CheckoutAPIView.as_view()),
    path('verify-payment/', VerifyPaymentView.as_view()),
    path('my-orders/', MyOrdersView.as_view()),
    path("invoice/<int:order_id>/", generate_invoice),
    path("track/<int:order_id>/", TrackOrderAPIView.as_view()),
    path("update-status/<int:order_id>/", UpdateOrderStatusView.as_view()),
]
