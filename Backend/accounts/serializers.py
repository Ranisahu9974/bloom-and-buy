from django.contrib.auth.models import User
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Membership

class UserSerializer(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    avatar = serializers.SerializerMethodField()
    walletBalance = serializers.SerializerMethodField()
    totalSpent = serializers.SerializerMethodField()
    createdAt = serializers.DateTimeField(source='date_joined', read_only=True)
    address = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'name', 'role', 'phone', 'avatar', 'walletBalance', 'totalSpent', 'createdAt', 'address']

    def get_name(self, obj):
        return getattr(obj, 'profile', None).name if hasattr(obj, 'profile') else obj.username

    def get_role(self, obj):
        if obj.is_superuser:
            return 'admin'
        
        # Check AppUser (users app)
        app_user = getattr(obj, 'app_user', None)
        if app_user:
            role = app_user.role.lower()
            if role == 'supplier': return 'seller'
            if role in ['consumer', 'customer', 'user']: return 'user'
            return role
            
        # Check UserProfile (accounts app) fallback
        profile = getattr(obj, 'profile', None)
        if profile:
            role = profile.role.lower()
            if role == 'supplier': return 'seller'
            if role in ['consumer', 'customer', 'user']: return 'user'
            return role
            
        return 'user'

    def get_phone(self, obj):
        return getattr(obj, 'app_user', None).phone if hasattr(obj, 'app_user') and obj.app_user else ''

    def get_avatar(self, obj):
        return getattr(obj, 'profile', None).avatar if hasattr(obj, 'profile') and obj.profile else ''

    def get_walletBalance(self, obj):
        app_user = getattr(obj, 'app_user', None)
        if app_user:
            from users.models import ConsumerProfile
            profile = ConsumerProfile.objects.filter(user=app_user).first()
            return float(profile.wallet_balance) if profile else 0.0
        return 0.0

    def get_totalSpent(self, obj):
        from orders.models import Order
        from django.db.models import Sum
        total = Order.objects.filter(user=obj, is_paid=True).aggregate(Sum('total_price'))['total_price__sum'] or 0
        return float(total)

    def get_address(self, obj):
        app_user = getattr(obj, 'app_user', None)
        if app_user:
            from users.models import Address
            addr = Address.objects.filter(user=app_user, is_default=True).first()
            if addr:
                return {
                    "full_name": addr.full_name,
                    "phone_number": addr.phone_number,
                    "street": addr.address_line1,
                    "locality": addr.locality,
                    "city": addr.city,
                    "district": addr.district,
                    "state": addr.state,
                    "zipCode": addr.pincode,
                    "country": "IN"
                }
        return {"street": "", "city": "", "state": "", "zipCode": "", "country": "IN"}

    def update(self, instance, validated_data):
        # Update User email
        instance.email = validated_data.get('email', instance.email)
        
        # Extracted fields from request initial data
        name = self.initial_data.get('name')
        phone = self.initial_data.get('phone')
        avatar = self.initial_data.get('avatar')
        address_data = self.initial_data.get('address')
        
        if name:
            names = name.split(' ', 1)
            instance.first_name = names[0]
            instance.last_name = names[1] if len(names) > 1 else ''
        
        instance.save()

        # Update AppUser
        try:
            from users.models import AppUser, Address
            app_user = getattr(instance, 'app_user', None)
            
            # If AppUser doesn't exist, create it (should not happen normally but for robustness)
            if not app_user:
                app_user = AppUser.objects.create(
                    user_auth=instance,
                    username=instance.username,
                    email=instance.email,
                    role='consumer',
                    password=''
                )

            if phone: 
                app_user.phone = phone
                app_user.save()
            
            # Update Address
            if address_data and isinstance(address_data, dict):
                # Robust key mapping (supports camelCase and snake_case)
                pincode = address_data.get('zipCode') or address_data.get('pincode') or address_data.get('zip_code')
                city = address_data.get('city') or 'N/A'
                state = address_data.get('state') or 'N/A'
                street = address_data.get('street') or address_data.get('address_line1') or 'N/A'
                
                if pincode or city != 'N/A' or street != 'N/A':
                    addr_defaults = {
                        'full_name': address_data.get('full_name') or name or app_user.username,
                        'phone_number': address_data.get('phone_number') or phone or app_user.phone or '0000000000',
                        'address_line1': street,
                        'locality': address_data.get('locality') or 'N/A',
                        'city': city,
                        'district': address_data.get('district') or city,
                        'state': state,
                        'pincode': pincode or '000000'
                    }
                    
                    addr, created = Address.objects.update_or_create(
                        user=app_user, 
                        is_default=True,
                        defaults=addr_defaults
                    )
        except Exception as e:
            print(f"⚠️ Warning: Profile/Address update partial failure: {e}")

        # Update UserProfile (accounts app fallback)
        try:
            from .models import UserProfile
            profile, created = UserProfile.objects.get_or_create(user=instance)
            if name: profile.name = name
            if phone: profile.phone = phone
            if avatar: profile.avatar = avatar
            profile.save()
        except Exception as e:
            print(f"⚠️ Warning: UserProfile update failure: {e}")

        return instance

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Add custom claims if needed
        return token

    def validate(self, attrs):
        # The frontend sends 'email' and 'password'
        # DRF simplejwt token view expects 'username' and 'password' by default
        # If 'username' is not provided and 'email' is, we use email
        if 'username' not in attrs and 'email' in self.initial_data:
            attrs['username'] = self.initial_data['email']
        
        data = super().validate(attrs)
        # Ensure a linked AppUser record exists for the authenticated user.
        try:
            from users.models import AppUser, ConsumerProfile
            app_user = getattr(self.user, 'app_user', None)
            if not app_user:
                app_user = AppUser.objects.filter(user_auth=self.user).first()
            if not app_user and self.user.email:
                app_user = AppUser.objects.filter(email=self.user.email).first()
                if app_user:
                    app_user.user_auth = self.user
                    app_user.save()

            if not app_user:
                app_user = AppUser.objects.create(
                    user_auth=self.user,
                    username=self.user.username or self.user.email or 'user',
                    email=self.user.email or '',
                    role='consumer',
                    phone='',
                    password=''
                )
                ConsumerProfile.objects.get_or_create(user=app_user)

            if app_user:
                try:
                    from users.notification_utils import trigger_all_notifications
                    results = trigger_all_notifications(
                        app_user,
                        "Login Successful ✅",
                        f"Hi {self.user.first_name or self.user.username}, you have successfully logged in. Welcome back to Bloom & Buy!",
                        channels=['In-App', 'Email', 'SMS', 'WhatsApp']
                    )
                    print(f"[NOTIFICATION DEBUG] Login notification results for {self.user.email or self.user.username}: {results}")
                except Exception as e:
                    print(f"[NOTIFICATION DEBUG] Login notification exception: {e}")
        except Exception:
            pass

        # Customize the return data
        data['token'] = data.pop('access') # Rename access to token
        data['user'] = UserSerializer(self.user).data
        return data

class RegisterSerializer(serializers.ModelSerializer):
    username = serializers.CharField(required=False)
    password = serializers.CharField(write_only=True)
    membership_type = serializers.ChoiceField(
        choices=Membership.MEMBERSHIP_CHOICES,
        required=False,
        default='NORMAL'
    )
    # Extra fields from frontend
    phone = serializers.CharField(required=False, write_only=True)
    name = serializers.CharField(required=False, write_only=True)
    role = serializers.CharField(required=False, write_only=True)

    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'membership_type', 'phone', 'name', 'role']

    def validate(self, attrs):
        if 'username' not in attrs and 'email' in attrs:
            attrs['username'] = attrs['email']
        
        email = attrs.get('email')
        if email and User.objects.filter(email=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})
            
        from users.models import AppUser
        if email and AppUser.objects.filter(email=email).exists():
             raise serializers.ValidationError({"email": "This email is already registered."})

        return attrs

    def create(self, validated_data):
        membership_type = validated_data.pop('membership_type', 'NORMAL')
        phone = validated_data.pop('phone', '')
        name = validated_data.pop('name', '')
        role = validated_data.pop('role', 'user')
        if role == 'seller':
            role = 'supplier'
        elif role == 'user':
            role = 'consumer'

        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )

        # Create AppUser profile
        from users.models import AppUser, ConsumerProfile, SupplierProfile
        app_user = AppUser.objects.create(
            user_auth=user,
            username=user.username,
            email=user.email,
            role=role,
            phone=phone,
            password='' # satisfy model requirement
        )
        
        # Create profile based on role
        if role == 'supplier':
            SupplierProfile.objects.create(user=app_user, company_name=name)
        else:
            ConsumerProfile.objects.create(user=app_user)

        # Also create UserProfile (accounts app) for compatibility
        from .models import UserProfile
        UserProfile.objects.create(
            user=user,
            role='seller' if role == 'supplier' else 'customer',
            phone=phone,
            name=name
        )

        # Existing membership
        Membership.objects.create(
            user=user,
            membership_type=membership_type,
            cashback_percentage=2.00,
            is_student_verified=False
        )

        return user
