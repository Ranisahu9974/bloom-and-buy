from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView , RetrieveUpdateDestroyAPIView
from .models import Product, Category, Cart, CartItem
from orders.models import Order, OrderItem
from .serializers import ProductSerializer , CategorySerializer, CartSerializer, CartItemSerializer
from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.views import APIView


# Create your views here.
class ProductListAPIView(ListCreateAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, SearchFilter, OrderingFilter]
    search_fields = ['name', 'description', 'category__name']
    ordering_fields = ['price', 'created_at']
    
    def dispatch(self, request, *args, **kwargs):
        try:
            return super().dispatch(request, *args, **kwargs)
        except Exception as e:
            import traceback
            print(f"ERROR in ProductListAPIView: {e}")
            traceback.print_exc()
            raise e

    def get_queryset(self):
        queryset = Product.objects.all()

        category = self.request.query_params.get('category')
        if category:
            queryset = queryset.filter(category__name__iexact=category)

        # We actually don't need to manually filter 'search' here because 
        # SearchFilter from DRF automatically handles it across all search_fields
        # but if we want strict substring matching, we can keep it. Let's let DRF handle it
        # automatically so it searches categories and descriptions seamlessly!

        price_min = self.request.query_params.get('priceMin')
        if price_min:
            try:
                queryset = queryset.filter(price__gte=float(price_min))
            except ValueError:
                pass
            
        price_max = self.request.query_params.get('priceMax')
        if price_max:
            try:
                queryset = queryset.filter(price__lte=float(price_max))
            except ValueError:
                pass

        sort_param = self.request.query_params.get('sort', '')
        if ':' in sort_param:
            sort_param = sort_param.split(':')[0]

        if sort_param == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_param == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_param == 'popular':
            queryset = queryset.order_by('-stock') 
        elif sort_param == 'rating':
            # Mock rating by ordering them so they look varied
            queryset = queryset.order_by('-id')
        else: # newest
            queryset = queryset.order_by('-created_at')

        return queryset

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())

        limit = request.query_params.get('limit')
        if limit:
            try:
                limit_val = int(limit)
                if limit_val > 0:
                    queryset = queryset[:limit_val]
            except ValueError:
                pass

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class ProductDetailApi(RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer

class RecentProductsAPIView(APIView):

    def get(self, request):
        products = Product.objects.order_by("-id")[:5]
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class ProductStatsAPIView(APIView):
    def get(self, request):
        stats = {
            "totalProducts": Product.objects.count(),
            "totalCategories": Category.objects.count(),
        }
        return Response(stats)

class RecommendationsAPIView(APIView):
    def get(self, request):
        try:
            limit_param = request.query_params.get('limit', 5)
            try:
                limit = int(limit_param)
                if limit <= 0:
                    limit = 5
            except (ValueError, TypeError):
                limit = 5

            if request.user.is_authenticated:
                # AI recommendation based on past orders
                from orders.models import OrderItem
                past_orders = OrderItem.objects.filter(order__user=request.user)
                if past_orders.exists():
                    from django.db.models import Count
                    top_category = past_orders.values('product__category').annotate(count=Count('product__category')).order_by('-count').first()
                    if top_category and top_category['product__category']:
                        recs = Product.objects.filter(category_id=top_category['product__category']).order_by('-id')[:limit]
                        serializer = ProductSerializer(recs, many=True)
                        return Response(serializer.data)
            
            # Fallback to general popular products
            recs = Product.objects.all().order_by('?')[:limit]  # Pseudo-random/popular mix
            serializer = ProductSerializer(recs, many=True)
            return Response(serializer.data)
        except Exception as e:
            import traceback
            print(f"ERROR in RecommendationsAPIView: {e}")
            traceback.print_exc()
            raise e

class CategoryListCreateAPIView(ListCreateAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class CategoryDetailAPIView(RetrieveUpdateDestroyAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class CartAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        cart, created = Cart.objects.get_or_create(user=request.user)
        serializer = CartSerializer(cart)
        
        subtotal = sum(item.product.price * item.quantity for item in cart.items.all())
        item_count = sum(item.quantity for item in cart.items.all())

        return Response({
            "cart": serializer.data,
            "subtotal": subtotal,
            "itemCount": item_count
        })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def add_to_cart(request):
    user = request.user
    product_id = request.data.get("product_id")
    quantity = request.data.get("quantity", 1)
    

    try:
        quantity = int(quantity)
    except ValueError:
        return Response({"error": "Invalid quantity"}, status=400)

    if not product_id:
        return Response({"error": "Product ID is required"}, status=400)

    try:
        product = Product.objects.get(id=product_id)
    except Product.DoesNotExist:
        return Response({"error": "Product not found"}, status=404)

    cart, created = Cart.objects.get_or_create(user=user)

    cart_item, created = CartItem.objects.get_or_create(
        cart=cart,
        product=product
    )

    if not created:
        cart_item.quantity += quantity
    else:
        cart_item.quantity = quantity

    cart_item.save()

    return Response({"message": "Product added to cart"})


@api_view(['PUT'])
@permission_classes([IsAuthenticated])
def update_cart_quantity(request):
    user = request.user
    product_id = request.data.get("product_id")
    quantity = request.data.get("quantity")

    try:
        quantity = int(quantity)
    except ValueError:
        return Response({"error": "Invalid quantity"}, status=400)

    if quantity <= 0:
        return Response({"error": "Quantity must be greater than zero"}, status=400)

    try:
        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        cart_item.quantity = quantity
        cart_item.save()
        return Response({"message": "Quantity updated"})
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({"error": "Item not found in cart"}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def remove_from_cart(request, product_id):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
        cart_item = CartItem.objects.get(cart=cart, product_id=product_id)
        cart_item.delete()
        return Response({"message": "Item removed from cart"})
    except (Cart.DoesNotExist, CartItem.DoesNotExist):
        return Response({"error": "Item not found in cart"}, status=404)


@api_view(['DELETE'])
@permission_classes([IsAuthenticated])
def clear_cart(request):
    user = request.user
    try:
        cart = Cart.objects.get(user=user)
        cart.items.all().delete()
    except Cart.DoesNotExist:
        pass
    return Response({"message": "Cart cleared"})

class CheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        cart = Cart.objects.get(user=request.user)

        order = Order.objects.create(user=request.user)

        total = 0

        from users.models import Notification, AppUser
        for item in cart.items.all():
            OrderItem.objects.create(
                order=order,
                product=item.product,
                quantity=item.quantity,
                price=item.product.price
            )
            total += item.product.price * item.quantity
            
            # Notify seller
            supplier = item.product.supplier
            if supplier:
                try:
                    app_user = supplier.app_user
                    Notification.objects.create(
                        user=app_user,
                        title="New Order Received",
                        message=f"You have a new order for '{item.product.name}' (Quantity: {item.quantity})"
                    )
                except:
                    pass

        order.total_price = total
        order.save()

        cart.items.all().delete()

        return Response({"message": "Order created successfully"})

class BannerListAPIView(generics.ListAPIView):
    queryset = Product.objects.none() # Placeholder to avoid errors if model not found
    serializer_class = ProductSerializer # Placeholder

    def get_queryset(self):
        from .models import Banner
        return Banner.objects.filter(is_active=True).order_by('order')

    def get_serializer_class(self):
        from .serializers import BannerSerializer
        return BannerSerializer


from .models import Wishlist
from .serializers import WishlistSerializer
from django.shortcuts import get_object_or_404

class WishlistAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        wishlist, created = Wishlist.objects.get_or_create(user=request.user)
        serializer = WishlistSerializer(wishlist)
        return Response({"wishlist": serializer.data})

class WishlistItemAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, product_id):
        user = request.user
        wishlist, created = Wishlist.objects.get_or_create(user=user)
        product = get_object_or_404(Product, id=product_id)
        
        if product in wishlist.products.all():
            return Response({"error": "Product already in wishlist"}, status=400)
            
        wishlist.products.add(product)
        return Response({"message": "Product added to wishlist"})

    def delete(self, request, product_id):
        user = request.user
        try:
            wishlist = Wishlist.objects.get(user=user)
            product = get_object_or_404(Product, id=product_id)
            wishlist.products.remove(product)
            return Response({"message": "Product removed from wishlist"})
        except Wishlist.DoesNotExist:
            return Response({"error": "Wishlist not found"}, status=404)
