from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework.permissions import IsAdminUser
from django.db.models import Sum, Q
from django.contrib.auth.models import User
from django.utils import timezone
from django.shortcuts import get_object_or_404
from django.core.paginator import Paginator
import datetime
import logging

from users.models import AppUser, Notification, PromotionalMessage, ConsumerProfile
from store.models import Product, Category
from orders.models import Order, Payment, OrderItem
from store.serializers import ProductSerializer
from orders.serializers import OrderSerializer
from users.notification_utils import trigger_all_notifications

logger = logging.getLogger(__name__)

# --- Summary & Analytics ---
class AdminSummaryView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        total_users = User.objects.count()
        total_products = Product.objects.count()
        total_orders = Order.objects.count()
        total_revenue = Payment.objects.filter(is_successful=True).aggregate(Sum('amount'))['amount__sum'] or 0
        last_7_days = timezone.now() - datetime.timedelta(days=7)
        recent_revenue = Payment.objects.filter(is_successful=True, created_at__gte=last_7_days).values('created_at__date').annotate(revenue=Sum('amount')).order_by('created_at__date')
        top_products = OrderItem.objects.values('product__name').annotate(totalSold=Sum('quantity'), revenue=Sum('price')).order_by('-totalSold')[:5]
        
        # Using correct field 'stock'
        low_stock = Product.objects.filter(stock__lte=10).values('name', 'stock')

        return Response({
            "totalRevenue": total_revenue, "totalOrders": total_orders, "totalUsers": total_users, "totalProducts": total_products,
            "recentRevenue": [{"id": str(r['created_at__date']), "revenue": r['revenue']} for r in recent_revenue],
            "topProducts": [{"id": p['product__name'], "totalSold": p['totalSold'], "revenue": p['revenue']} for p in top_products],
            "lowStock": [{"name": p['name'], "stockQuantity": p['stock']} for p in low_stock]
        })

# --- Inventory & Moderation ---
class AdminInventoryView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        queryset = Product.objects.all().order_by('-created_at')
        lowstock = request.query_params.get('lowstock')
        deadstock = request.query_params.get('deadstock')
        if lowstock == 'true': queryset = queryset.filter(stock__lt=10)
        elif deadstock == 'true': queryset = queryset.filter(stock=0)
        serializer = ProductSerializer(queryset, many=True, context={'request': request})
        return Response({"products": serializer.data})

class AdminProductOverrideView(APIView):
    permission_classes = [IsAdminUser]
    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        data = request.data.copy()
        # Handle field rename from frontend
        if 'stockQuantity' in data: data['stock'] = data.pop('stockQuantity')
        if 'stock' in data and data['stock'] == '': data['stock'] = 0
        
        serializer = ProductSerializer(product, data=data, partial=True, context={'request': request})
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Product updated successfully"})
        return Response(serializer.errors, status=400)

class AdminProductModerationView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        status = request.query_params.get('status', 'pending')
        category = request.query_params.get('category')
        search = request.query_params.get('search')
        
        queryset = Product.objects.all().order_by('-created_at')
        if status:
            queryset = queryset.filter(approval_status=status)
        if category:
            queryset = queryset.filter(category__name__icontains=category)
        if search:
            queryset = queryset.filter(Q(name__icontains=search) | Q(description__icontains=search))
            
        paginator = Paginator(queryset, request.query_params.get('limit', 12))
        page_obj = paginator.get_page(request.query_params.get('page', 1))
        serializer = ProductSerializer(page_obj.object_list, many=True, context={'request': request})
        return Response({
            "products": serializer.data,
            "pagination": {"page": page_obj.number, "pages": paginator.num_pages, "total": paginator.count}
        })

class AdminOrderListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        orders = Order.objects.all().order_by('-created_at')
        data = [
            {
                'id': order.id,
                'user': {
                    'id': order.user.id,
                    'name': order.user.username,
                    'email': order.user.email
                } if order.user else None,
                'total': float(order.total_price),
                'totalAmount': float(order.total_price),
                'status': order.status,
                'createdAt': order.created_at
            }
            for order in orders
        ]
        return Response({"orders": data})

class AdminModerateProductView(APIView):
    permission_classes = [IsAdminUser]
    def put(self, request, pk):
        product = get_object_or_404(Product, pk=pk)
        status = request.data.get('status') or request.data.get('approvalStatus')
        reason = request.data.get('reason') or request.data.get('rejectionReason', '')
        if status in ['approved', 'rejected']:
            product.approval_status = status
            product.is_active = (status == 'approved')
            product.save()
            
            if product.supplier:
                target_app_user = AppUser.objects.filter(user_auth=product.supplier).first()
                if target_app_user:
                    title = f"Product {status.capitalize()} âœ…" if status == 'approved' else f"Product {status.capitalize()} âŒ"
                    message = f"Your product '{product.name}' was {status} by Admin."
                    if status == 'rejected' and reason:
                        message += f" Reason: {reason}"
                    
                    trigger_all_notifications(
                        target_app_user, 
                        title, 
                        message,
                        channels=['In-App', 'Email', 'SMS', 'WhatsApp']
                    )
            return Response({"message": f"Product {status} successfully"})
        return Response({"error": "Invalid status"}, status=400)

class AdminBulkModerateView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        product_ids = request.data.get('productIds', [])
        status = request.data.get('approvalStatus')
        products = Product.objects.filter(id__in=product_ids)
        for product in products:
            product.approval_status = status
            product.is_active = (status == 'approved')
            product.save()
            if product.supplier:
                target_app_user = AppUser.objects.filter(user_auth=product.supplier).first()
                if target_app_user:
                    trigger_all_notifications(target_app_user, f"Bulk Update: {status.capitalize()}", f"Product '{product.name}' {status}.", channels=['In-App'])
        return Response({"message": f"Bulk {status} completed"})

class AdminPromotionalView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        title = request.data.get('title')
        content = request.data.get('content')
        target_role = request.data.get('target_role', 'consumer')
        channels = request.data.get('channels', ['In-App', 'Email'])
        
        promotional = PromotionalMessage.objects.create(
            title=title,
            content=content,
            target_role=target_role,
            send_via=','.join(channels) if isinstance(channels, (list, tuple)) else str(channels)
        )

        targets = AppUser.objects.filter(role=target_role, is_active=True)
        for t in targets:
            trigger_all_notifications(t, title, content, channels=channels)
        return Response({"message": "Promotion sent", "announcementId": promotional.id})

class AdminSendNotificationView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request):
        user_id = request.data.get('userId')
        title = request.data.get('title')
        message = request.data.get('message')
        channels = request.data.get('channels') or ['In-App', 'Email', 'SMS', 'WhatsApp']
        
        # Try finding AppUser directly or via auth User ID
        user = AppUser.objects.filter(Q(pk=user_id) | Q(user_auth_id=user_id)).first()
        if not user:
            # Maybe user_id is coming as just a username or something? 
            # Or it might be the supplier ID from product
            user = AppUser.objects.filter(user_auth__id=user_id).first()
            
        if not user:
            return Response({"error": f"User not found for ID {user_id}"}, status=404)
        
        trigger_all_notifications(user, title, message, channels=channels)
        return Response({"message": "Sent"})

class AdminUserListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        users = User.objects.all().order_by('-date_joined')
        data = [{"id": u.id, "name": u.username, "email": u.email, "createdAt": u.date_joined, "is_active": u.is_active} for u in users]
        return Response({"users": data})

class AdminUserDetailView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        return Response({
            "id": user.id,
            "name": user.username,
            "email": user.email,
            "createdAt": user.date_joined,
            "is_active": user.is_active
        })

class AdminSellerListView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        suppliers = AppUser.objects.filter(role='supplier')
        data = []
        for s in suppliers:
             data.append({
                "id": s.id, 
                "storeName": getattr(getattr(s, 'supplierprofile', None), 'company_name', s.username),
                "phone": s.phone, "isActive": s.is_active, 
                "email": s.email,
                "user": {"name": s.username, "email": s.email},
                "productCount": Product.objects.filter(supplier=s.user_auth).count()
            })
        return Response({"sellers": data})

class AdminSellerDetailView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request, pk):
        seller = get_object_or_404(AppUser, pk=pk, role='supplier')
        return Response({
            "id": seller.id,
            "storeName": getattr(getattr(seller, 'supplierprofile', None), 'company_name', seller.username),
            "email": seller.email,
            "phone": seller.phone,
            "is_active": seller.is_active,
            "productCount": Product.objects.filter(supplier=seller.user_auth).count()
        })

class AdminToggleUserView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        user = get_object_or_404(User, pk=pk)
        user.is_active = not user.is_active
        user.save()
        return Response({"is_active": user.is_active})

class AdminToggleSellerView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        user = get_object_or_404(AppUser, pk=pk)
        user.is_active = not user.is_active
        user.save()
        return Response({"is_active": user.is_active})

class AdminOrderDetailView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request, pk):
        order = get_object_or_404(Order, id=pk)
        from orders.serializers import OrderSerializer
        serialized = OrderSerializer(order).data
        if order.user:
            serialized['user'] = {
                'id': order.user.id,
                'name': order.user.username,
                'email': order.user.email
            }
        return Response(serialized)

class AdminNotificationView(APIView):
    permission_classes = [IsAdminUser]
    def get(self, request):
        notifications = Notification.objects.filter(user__user_auth=request.user).order_by('-created_at')[:20]
        return Response([{"id": n.id, "title": n.title, "message": n.message, "isRead": n.is_read, "createdAt": n.created_at} for n in notifications])

class AdminNotificationMarkReadView(APIView):
    permission_classes = [IsAdminUser]
    def post(self, request, pk):
        note = get_object_or_404(Notification, id=pk)
        note.is_read = True
        note.save()
        return Response({"success": True})
