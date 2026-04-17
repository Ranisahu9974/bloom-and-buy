from django.urls import path
from .views import recommend_products, ChatbotAPIView

urlpatterns = [
    path('recommendations/<int:user_id>/', recommend_products),
    path('chatbot/', ChatbotAPIView.as_view(), name='chatbot_api'),
]