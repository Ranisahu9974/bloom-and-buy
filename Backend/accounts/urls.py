from django.urls import path
from .views import RegisterView, MeView, GoogleLoginView, SubscribeView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('me/', MeView.as_view(), name='me'),
    path('google/', GoogleLoginView.as_view(), name='google-login'),
    path('subscribe/', SubscribeView.as_view(), name='subscribe'),
]
