from django.shortcuts import render
from rest_framework import generics
from django.contrib.auth.models import User
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from users.notification_utils import trigger_all_notifications, send_email_notification

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, CustomTokenObtainPairSerializer, UserSerializer

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        # Send Welcome Notification
        try:
            from users.models import AppUser
            app_user = AppUser.objects.filter(user_auth=user).first()
            welcome_msg = f"Hi {user.first_name or user.username}, Welcome to Bloom & Buy! 🌸 Your account has been created successfully. Start exploring our wide range of products today."
            trigger_all_notifications(
                app_user or user, 
                "Welcome to Bloom & Buy! 🌸", 
                welcome_msg,
                channels=['Email', 'In-App']
            )
        except Exception as e:
            print(f"Welcome notification failed: {e}")
        
        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'user': UserSerializer(user).data
        }, status=201)

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        # Check if seller profile exists (simplified for now)
        data = {
            "user": serializer.data
        }
        return Response(data)

    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Profile updated successfully", "user": serializer.data})
        return Response(serializer.errors, status=400)

class GoogleLoginView(APIView):
    def post(self, request):
        email = request.data.get('email')
        name = request.data.get('name', 'Google User')
        if not email:
            return Response({'error': 'Email is required from Google'}, status=400)
        
        # 1. Get or Create the Auth User
        first_name = name.split()[0] if name and name.split() else 'User'
        user, created = User.objects.get_or_create(
            username=email, 
            defaults={'email': email, 'first_name': first_name}
        )
        if created:
            user.set_unusable_password()
            user.save()
            # Send initial welcome for new Google users
            try:
                welcome_msg = f"Hi {name}, welcome to Bloom & Buy! 🌸 Thank you for joining us via Google. We're excited to have you here."
                send_email_notification(email, "Welcome to Bloom & Buy! 🌸", welcome_msg)
            except Exception: pass
            
        # 2. Get or Create the AppUser (users app)
        from users.models import AppUser, ConsumerProfile, SupplierProfile
        app_user = AppUser.objects.filter(email=email).first()
        
        if not app_user:
            # Create new AppUser if email doesn't exist at all
            app_user = AppUser.objects.create(
                user_auth=user,
                username=email,
                email=email,
                role='consumer',
                phone='',
                password=''
            )
        elif not app_user.user_auth:
            # Link existing AppUser to this auth user if not linked
            app_user.user_auth = user
            app_user.save()
            
        # 3. Ensure appropriate profile exists
        if app_user.role == 'supplier':
            SupplierProfile.objects.get_or_create(user=app_user)
        else:
            ConsumerProfile.objects.get_or_create(user=app_user)
            
        # 4. Sync UserProfile (accounts app fallback)
        from .models import UserProfile
        profile, _ = UserProfile.objects.get_or_create(user=user)
        profile.role = 'seller' if app_user.role == 'supplier' else 'customer'
        profile.name = name
        if request.data.get('avatar'):
            profile.avatar = request.data.get('avatar')
        profile.save()

        # 5. Send login success notification and promotional messages
        promo_response = []
        try:
            login_message = (
                f"Hi {name}, you have successfully logged in with Google to Bloom & Buy. "
                "Enjoy personalized offers, tracking updates, and quick order notifications."
            )
            results = trigger_all_notifications(
                app_user, 
                "Login Successful", 
                login_message, 
                channels=['In-App', 'Email', 'SMS', 'WhatsApp']
            )
            print(f"[NOTIFICATION DEBUG] Google login notification results for {email}: {results}")

            from users.models import PromotionalMessage
            promo_messages = PromotionalMessage.objects.filter(
                target_role__iexact=app_user.role
            ).order_by('-created_at')[:3]
            if promo_messages.exists():
                promo_response = [
                    {
                        'title': promo.title,
                        'content': promo.content,
                        'sendVia': promo.send_via,
                        'createdAt': promo.created_at,
                    }
                    for promo in promo_messages
                ]
                promo_text = "\n\n".join([f"{promo.title}: {promo.content}" for promo in promo_messages])
                trigger_all_notifications(
                    app_user,
                    "Special Offers Just For You 🎁",
                    promo_text,
                    channels=['Email', 'SMS', 'WhatsApp']
                )
        except Exception as e:
            print(f"Login notification issue: {e}")

        # 6. Generate tokens
        from rest_framework_simplejwt.tokens import RefreshToken
        refresh = RefreshToken.for_user(user)

        return Response({
            'refresh': str(refresh),
            'token': str(refresh.access_token),
            'user': UserSerializer(user).data,
            'promotional_messages': promo_response
        })

class SubscribeView(APIView):
    def post(self, request):
        email = request.data.get('email')
        if not email:
            return Response({'error': 'Email is required'}, status=400)

        user, created = User.objects.get_or_create(
            username=email,
            defaults={'email': email}
        )
        if created:
            user.set_unusable_password()
            user.save()

        try:
            from users.models import AppUser, ConsumerProfile
            app_user = AppUser.objects.filter(email=email).first()
            if not app_user:
                app_user = AppUser.objects.create(
                    user_auth=user,
                    username=email,
                    email=email,
                    role='consumer',
                    phone='',
                    password=''
                )
                ConsumerProfile.objects.get_or_create(user=app_user)
            elif not app_user.user_auth:
                app_user.user_auth = user
                app_user.save()
        except Exception:
            pass

        subject = 'Welcome to Bloom & Buy — You are subscribed!'
        message = (
            'Thank you for subscribing to Bloom & Buy newsletters.\n\n'
            'You will now receive the latest offers, deals, and product updates directly in your inbox. '
            'Stay tuned for exciting promotions and savings!'
        )
        status_result = send_email_notification(email, subject, message, app_user=app_user)
        
        if status_result == 'Sent':
            return Response({"message": "Subscription successful! Check your inbox for confirmation.🌸"}, status=200)
        elif status_result == 'Skipped':
            return Response({
                "message": "Subscription successful! (Email skipped - Demo Mode).",
                "warning": "SMTP credentials not configured."
            }, status=200)
        else:
            return Response({
                "message": "Subscription recorded, but confirmation email failed. Please check back later.",
                "error": "Email delivery failed"
            }, status=200)
