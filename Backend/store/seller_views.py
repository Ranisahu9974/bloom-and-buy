from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Product
from orders.models import Order, OrderItem
from django.db.models import Sum
from .serializers import ProductSerializer
from users.models import Notification, AppUser, SupplierProfile

class SellerDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Filter products by supplier (current user)
        products = Product.objects.filter(supplier=request.user)
        total_products = products.count()
        
        # Total revenue for this seller
        revenue = OrderItem.objects.filter(product__supplier=request.user).aggregate(Sum('price'))['price__sum'] or 0
        
        # Total items sold
        items_sold = OrderItem.objects.filter(product__supplier=request.user).aggregate(Sum('quantity'))['quantity__sum'] or 0
        
        # Recent orders involving this seller's products
        recent_items = OrderItem.objects.filter(product__supplier=request.user).select_related('order', 'product').order_by('-order__created_at')[:5]
        
        recent_orders = []
        for item in recent_items:
            recent_orders.append({
                "itemName": item.product.name,
                "itemQuantity": item.quantity,
                "itemPrice": item.price,
                "status": item.order.status,
                "createdAt": item.order.created_at
            })

        data = {
            "stats": {
                "totalProducts": total_products,
                "totalOrders": OrderItem.objects.filter(product__supplier=request.user).values('order').distinct().count(),
                "totalRevenue": revenue,
                "totalItemsSold": items_sold,
                "outOfStock": products.filter(stock=0).count(),
                "lowStock": products.filter(stock__gt=0, stock__lte=5).count()
            },
            "recentOrders": recent_orders
        }
        return Response(data)

class SellerAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        from django.utils import timezone
        import datetime
        from django.db.models.functions import TruncDate

        # Last 30 days sales timeline
        thirty_days_ago = timezone.now() - datetime.timedelta(days=30)
        sales_timeline = OrderItem.objects.filter(
            product__supplier=request.user,
            order__created_at__gte=thirty_days_ago
        ).annotate(date=TruncDate('order__created_at')) \
         .values('date') \
         .annotate(revenue=Sum('price')) \
         .order_by('date')
        
        # Format for frontend
        timeline_data = [{
            "_id": s['date'].strftime('%Y-%m-%d'),
            "revenue": float(s['revenue'])
        } for s in sales_timeline]

        # Top 5 products
        top_products = OrderItem.objects.filter(
            product__supplier=request.user
        ).values('product__name') \
         .annotate(revenue=Sum('price')) \
         .order_by('-revenue')[:5]
        
        top_products_data = [{
            "name": p['product__name'],
            "revenue": float(p['revenue'])
        } for p in top_products]

        return Response({
            "salesTimeline": timeline_data,
            "topProducts": top_products_data
        })

class SellerOrdersView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Find all orders that contain products from this seller
        order_items = OrderItem.objects.filter(product__supplier=request.user).select_related('order', 'product', 'order__user').order_by('-order__created_at')
        
        # Group by order
        orders_dict = {}
        for item in order_items:
            oid = str(item.order.id)
            if oid not in orders_dict:
                orders_dict[oid] = {
                    "_id": oid,
                    "orderId": oid,
                    "customer": {"name": item.order.user.username, "email": item.order.user.email},
                    "totalAmount": float(item.order.total_price),
                    "status": item.order.status,
                    "createdAt": item.order.created_at,
                    "items": []
                }
            orders_dict[oid]["items"].append({
                "productName": item.product.name,
                "quantity": item.quantity,
                "price": float(item.price)
            })
        return Response({"orders": list(orders_dict.values())})

class SellerProductListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        products = Product.objects.filter(supplier=request.user).order_by('-created_at')
        serializer = ProductSerializer(products, many=True, context={'request': request})
        return Response({"products": serializer.data})

    def post(self, request):
        data = request.data.copy()
        # Handle multiple tags if sent as list
        tags = request.data.getlist('tags')
        if tags:
            data['tags'] = ', '.join(tags)

        serializer = ProductSerializer(data=data)
        if serializer.is_valid():
            try:
                # Ensure product is pending and inactive by default
                serializer.save(supplier=request.user)
                return Response(serializer.data, status=201)
            except Exception as e:
                print(f"Error saving product: {str(e)}")
                return Response({"message": f"Server error: {str(e)}"}, status=500)
        
        print(f"Serializer errors in add product: {serializer.errors}")
        return Response(serializer.errors, status=400)

class SellerProductDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, pk, user):
        try:
            return Product.objects.get(pk=pk, supplier=user)
        except Product.DoesNotExist:
            return None

    def get(self, request, pk):
        product = self.get_object(pk, request.user)
        if not product:
            return Response({"error": "Product not found"}, status=404)
        serializer = ProductSerializer(product, context={'request': request})
        return Response(serializer.data)

    def put(self, request, pk):
        product = self.get_object(pk, request.user)
        if not product:
            return Response({"error": "Product not found or access denied"}, status=404)
        
        data = request.data.copy()
        tags = request.data.getlist('tags')
        if tags:
            data['tags'] = ', '.join(tags)

        serializer = ProductSerializer(product, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=400)

    def delete(self, request, pk):
        product = self.get_object(pk, request.user)
        if not product:
            return Response({"error": "Product not found or access denied"}, status=404)
        product.delete()
        return Response({"message": "Product deleted successfully"})

class SellerNotificationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app_user = getattr(request.user, 'app_user', None)
        if not app_user:
            return Response([])
        notifications = Notification.objects.filter(user=app_user).order_by('-created_at')
        data = [{
            "id": n.id,
            "_id": n.id,
            "title": n.title,
            "message": n.message,
            "isRead": n.is_read,
            "createdAt": n.created_at
        } for n in notifications]
        return Response(data)

class SellerNotificationMarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, pk):
        app_user = getattr(request.user, 'app_user', None)
        if not app_user:
            return Response({"error": "User not found"}, status=404)
        try:
            notification = Notification.objects.get(pk=pk, user=app_user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read"})
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)

class SellerProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        app_user = getattr(request.user, 'app_user', None)
        if not app_user:
            return Response({"error": "Seller profile not found"}, status=404)
        
        profile = getattr(app_user, 'supplierprofile', None)
        return Response({
            "name": app_user.username,
            "email": app_user.email,
            "phone": app_user.phone,
            "storeName": profile.company_name if profile else "No Store Name",
            "storeLogo": profile.logo.url if profile and profile.logo else None,
            "isVerified": profile.verified if profile else False
        })

    def put(self, request):
        app_user = getattr(request.user, 'app_user', None)
        if not app_user:
            return Response({"error": "Seller profile not found"}, status=404)
            
        data = request.data
        app_user.phone = data.get('phone', app_user.phone)
        app_user.save()
        
        profile, _ = SupplierProfile.objects.get_or_create(user=app_user)
        profile.company_name = data.get('storeName', profile.company_name)
        profile.save()
        
        return Response({"message": "Profile updated successfully"})
