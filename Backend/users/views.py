import os
from twilio.rest import Client
from django.core.mail import send_mail
from django.conf import settings
from django.shortcuts import get_object_or_404
from .models import Notification, AppUser, PromotionalMessage, Address
from .serializers import AddressSerializer
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework import status

# Twilio Setup
TWILIO_ACCOUNT_SID = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
TWILIO_AUTH_TOKEN = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
TWILIO_PHONE_NUMBER = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
TWILIO_WHATSAPP_NUMBER = getattr(settings, 'TWILIO_WHATSAPP_NUMBER', None)


def get_or_create_app_user(auth_user):
    from users.models import AppUser, ConsumerProfile
    app_user = getattr(auth_user, 'app_user', None)
    if app_user:
        return app_user

    app_user = AppUser.objects.filter(user_auth=auth_user).first()
    if app_user:
        return app_user

    if auth_user.email:
        app_user = AppUser.objects.filter(email=auth_user.email).first()
        if app_user:
            app_user.user_auth = auth_user
            app_user.save()
            return app_user

    app_user = AppUser.objects.create(
        user_auth=auth_user,
        username=auth_user.username or auth_user.email or 'user',
        email=auth_user.email or '',
        role='consumer',
        phone='',
        password='' # fixed missing field
    )
    ConsumerProfile.objects.get_or_create(user=app_user)
    return app_user

from .notification_utils import (
    trigger_all_notifications, 
    send_web_notification, 
    send_email_notification, 
    send_sms_notification, 
    send_whatsapp_notification
)


class UserAddressListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app_user = get_or_create_app_user(request.user)
        addresses = Address.objects.filter(user=app_user).order_by('-is_default', '-created_at')
        serializer = AddressSerializer(addresses, many=True)
        return Response(serializer.data)

    def post(self, request):
        app_user = get_or_create_app_user(request.user)
        data = request.data.copy()
        data['user'] = app_user.id
        serializer = AddressSerializer(data=data)
        if serializer.is_valid():
            if data.get('is_default'):
                Address.objects.filter(user=app_user).update(is_default=False)
            address = serializer.save(user=app_user)
            return Response(AddressSerializer(address).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserAddressDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        app_user = get_or_create_app_user(request.user)
        try:
            address = Address.objects.get(pk=pk, user=app_user)
        except Address.DoesNotExist:
            return Response({'detail': 'Address not found.'}, status=status.HTTP_404_NOT_FOUND)

        address.delete()
        return Response({'message': 'Address deleted'}, status=status.HTTP_204_NO_CONTENT)


class UserNotificationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app_user = get_or_create_app_user(request.user)
        notifications = Notification.objects.filter(user=app_user).order_by('-created_at')[:20]
        data = [
            {
                'id': note.id,
                'type': note.type,
                'title': note.title,
                'message': note.message,
                'is_read': note.is_read,
                'status': note.status,
                'createdAt': note.created_at,
            }
            for note in notifications
        ]
        return Response(data)


class MarkNotificationReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
        app_user = get_or_create_app_user(request.user)
        try:
            notification = Notification.objects.get(pk=pk, user=app_user)
        except Notification.DoesNotExist:
            return Response({'detail': 'Notification not found.'}, status=status.HTTP_404_NOT_FOUND)

        notification.is_read = True
        notification.save()
        return Response({'message': 'Notification marked as read'})


class IsAppAdmin(BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        if request.user.is_superuser or request.user.is_staff:
            return True
        app_user = getattr(request.user, 'app_user', None)
        return getattr(app_user, 'role', '').lower() == 'admin'

class GlobalAnnouncementsView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request):
        try:
            announcements = PromotionalMessage.objects.all().order_by('-created_at')[:10]
            data = [
                {
                    'id': ann.id,
                    'title': ann.title,
                    'content': ann.content,
                    'targetRole': ann.target_role,
                    'sendVia': ann.send_via,
                    'createdAt': ann.created_at,
                }
                for ann in announcements
            ]
            return Response(data)
        except Exception as e:
            import traceback
            print(f"ERROR in GlobalAnnouncementsView: {e}")
            traceback.print_exc()
            raise e

class GlobalAnnouncementDetailView(APIView):
    permission_classes = [IsAppAdmin]
    
    def delete(self, request, pk):
        announcement = get_object_or_404(PromotionalMessage, pk=pk)
        announcement.delete()
        return Response({"message": "Announcement deleted successfully"}, status=204)
