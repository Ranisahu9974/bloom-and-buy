from django.urls import path
from .views import CreateOrderView, VerifyPaymentView

urlpatterns = [
    path('create-order', CreateOrderView.as_view()),
    path('verify', VerifyPaymentView.as_view()),
]
