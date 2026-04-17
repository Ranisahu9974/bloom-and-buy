from rest_framework import serializers
from .models import Product, Category, Cart, CartItem, Banner, Wishlist


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = '__all__'


class ProductSerializer(serializers.ModelSerializer):
    _id = serializers.IntegerField(source='id', read_only=True)
    name = serializers.CharField(required=True)
    price = serializers.DecimalField(max_digits=10, decimal_places=2, required=True)
    category = serializers.SlugRelatedField(slug_field='name', queryset=Category.objects.all(), required=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    image = serializers.ImageField(required=False, allow_null=True)
    imageURL = serializers.SerializerMethodField()
    basePrice = serializers.DecimalField(source='base_price', max_digits=10, decimal_places=2, required=False)
    seasonalTag = serializers.CharField(source='seasonal_tag', required=False, allow_blank=True, allow_null=True)
    stockQuantity = serializers.IntegerField(source='stock', required=True)
    approvalStatus = serializers.CharField(source='approval_status', read_only=True)
    isActive = serializers.BooleanField(source='is_active', read_only=True)
    brand = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    tags = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    seller = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = [
            'id', '_id', 'name', 'description', 'price', 'basePrice', 
            'stockQuantity', 'is_active', 'isActive', 'created_at', 'image', 'imageURL', 
            'category', 'category_name', 'supplier', 'seasonalTag', 
            'brand', 'tags', 'approval_status', 'approvalStatus', 'seller'
        ]
        read_only_fields = ['supplier', 'approval_status']

    def get_seller(self, obj):
        if not obj.supplier:
            return None
        try:
            from users.models import AppUser, SupplierProfile
            app_user = AppUser.objects.get(user_auth=obj.supplier)
            profile = SupplierProfile.objects.filter(user=app_user).first()
            return {
                "storeName": profile.company_name if profile else app_user.username,
                "storeLogo": profile.logo.url if profile and profile.logo else None
            }
        except:
            return {"storeName": obj.supplier.username, "storeLogo": None}

    def to_representation(self, instance):
        ret = super().to_representation(instance)
        # Ensure image field in JSON is the full URL, not relative path
        ret['image'] = self.get_imageURL(instance)
        return ret

    def get_imageURL(self, obj):
        if not obj.image:
            # Fallback for demonstration if no image is present
            return f"https://placehold.co/600x400?text={obj.name.replace(' ', '+')}"
        try:
            img_val = str(obj.image)
            if img_val.startswith('http'):
                return img_val
            
            request = self.context.get('request')
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        except Exception:
            return "https://placehold.co/600x400?text=Error+Loading+Image"


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer()
    total_price = serializers.SerializerMethodField()

    class Meta:
        model = CartItem
        fields = ['id', 'product', 'quantity', 'total_price']

    def get_total_price(self, obj):
        return obj.product.price * obj.quantity


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_cart_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = ['id', 'user', 'items', 'total_cart_price']

    def get_total_cart_price(self, obj):
        return sum(item.product.price * item.quantity for item in obj.items.all())


class WishlistSerializer(serializers.ModelSerializer):
    products = ProductSerializer(many=True, read_only=True)

    class Meta:
        model = Wishlist
        fields = ["id", "user", "products"]
