from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework.generics import ListAPIView
from django.shortcuts import get_object_or_404
from django.http import HttpResponse
from django.conf import settings
from reportlab.pdfgen import canvas
import json
import datetime
from django.utils import timezone
from django.db.models import Q
from decimal import Decimal
import logging

from store.models import Cart, CartItem, Product
from .models import Order, OrderItem, Payment
from .serializers import OrderSerializer
from .razorpay_utils import create_razorpay_order, verify_signature
from users.notification_utils import trigger_all_notifications

logger = logging.getLogger(__name__)

class CheckoutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        from users.models import Address, AppUser
        
        cart, created = Cart.objects.get_or_create(user=request.user)
        cart_items = cart.items.all()

        if not cart_items.exists():
            return Response({"error": "Cart is empty"}, status=400)

        # Handle Address
        address_id = request.data.get('address_id') or request.data.get('addressId')
        if not address_id:
            logger.error(f"Checkout error: address_id missing in request data: {request.data}")
            return Response({"error": "Shipping address is required"}, status=400)
        
        try:
            # Try to get AppUser for the request user
            app_user = AppUser.objects.filter(user_auth=request.user).first()
            if not app_user:
                # Auto-create basic profile if missing (common in dev/admin created users)
                app_user = AppUser.objects.create(
                    user_auth=request.user,
                    username=request.user.username,
                    email=request.user.email,
                    role='consumer'
                )
                 
            address_obj = Address.objects.filter(id=address_id, user=app_user).first()
            if not address_obj:
                 return Response({"error": "Invalid address selected"}, status=404)
            
            # Sync phone to AppUser if missing
            if not app_user.phone and address_obj.phone_number:
                app_user.phone = address_obj.phone_number
                app_user.save()
        except Exception as e:
            logger.error(f"Checkout error: Address lookup failed for ID {address_id}: {str(e)}")
            return Response({"error": "Error processing address"}, status=500)
        
        # Snapshot
        delivery_address_snapshot = {
            "full_name": address_obj.full_name,
            "phone": address_obj.phone_number,
            "line1": address_obj.address_line1,
            "city": address_obj.city,
            "state": address_obj.state,
            "pincode": address_obj.pincode
        }

        # Calculation
        subtotal = sum(Decimal(str(i.product.price)) * i.quantity for i in cart_items)
        discount = Decimal('0.00')
        if subtotal > 1000: discount = (subtotal * Decimal('0.10')).quantize(Decimal('0.01'))
        
        shipping = Decimal('0.00')
        if subtotal < 500: shipping = Decimal('50.00')

        tax_total = ((subtotal - discount) * Decimal('0.18')).quantize(Decimal('0.01'))
        total_price = subtotal - discount + tax_total + shipping

        order = Order.objects.create(
            user=request.user, 
            status="Pending", 
            subtotal=subtotal,
            discount=discount,
            total_price=total_price,
            delivery_address=delivery_address_snapshot
        )
        
        for item in cart_items:
            OrderItem.objects.create(order=order, product=item.product, quantity=item.quantity, price=item.product.price)

        # Total in paise for Razorpay
        try:
            razorpay_order = create_razorpay_order(total_price, order.id)
        except ValueError as ve:
            if getattr(settings, 'DEBUG', False):
                logger.warning(f"Razorpay keys missing; using mock checkout for Order {order.id}: {ve}")
                Payment.objects.create(order=order, amount=total_price, is_successful=True, status='Success')
                order.is_paid = True
                order.status = "Confirmed"
                order.payment_status = "Success"
                order.save()

                # Notify for Mock Order
                from users.models import AppUser
                buyer = AppUser.objects.filter(user_auth=order.user).first()
                if buyer:
                    trigger_all_notifications(
                        buyer,
                        "Order Confirmed! 🎉",
                        f"Bloom & Buy: Thank you! Your Order #{order.id} for ₹{order.total_price} is confirmed. Track here: http://localhost:5173/orders/tracking/{order.id}",
                        channels=['In-App', 'Email', 'SMS', 'WhatsApp'],
                        phone=buyer.phone or order.delivery_address.get('phone')
                    )

                return Response({
                    "mock": True,
                    "order_id": order.id,
                    "total": float(total_price),
                    "currency": "INR",
                    "message": "Demo checkout created. (Notifications triggered in console/DB)."
                })
            logger.error(f"Checkout config error: {ve}")
            return Response({"error": str(ve)}, status=503)
        except Exception as e:
            logger.error(f"Checkout error: Razorpay order creation failed for Order {order.id}: {e}")
            return Response({"error": "Payment gateway error. Please try again or contact support."}, status=500)

        if not razorpay_order:
            logger.error(f"Checkout error: Razorpay order creation returned no order for Order {order.id}")
            return Response({"error": "Payment gateway error. Please try again."}, status=500)

        Payment.objects.create(order=order, razorpay_order_id=razorpay_order['id'], amount=total_price)

        return Response({
            "razorpay_order_id": razorpay_order['id'],
            "order_id": order.id,
            "total": float(total_price),
            "currency": "INR",
            "key": getattr(settings, 'RAZORPAY_KEY_ID', '')
        })

class VerifyPaymentView(APIView):
    permission_classes = [IsAuthenticated]
    def post(self, request):
        rid = request.data.get('razorpay_order_id')
        pid = request.data.get('razorpay_payment_id')
        sig = request.data.get('razorpay_signature')

        logger.info(f"Verifying payment: OrderID={rid}, PaymentID={pid}")

        if not all([rid, pid, sig]):
            logger.warning(f"Payment verification failed: Missing fields in {request.data}")
            return Response({"error": "Missing payment confirmation fields"}, status=400)

        if verify_signature(rid, pid, sig):
            try:
                payment = get_object_or_404(Payment, razorpay_order_id=rid)
                payment.is_successful = True
                payment.razorpay_payment_id = pid
                payment.transaction_id = pid
                payment.status = 'Success'
                payment.save()
                
                order = payment.order
                order.is_paid = True
                order.status = "Confirmed"
                order.payment_status = "Success"
                order.save()

                # Reduce Stock & Notify Seller
                for item in order.items.all():
                    item.product.stock -= item.quantity
                    item.product.save()
                    from users.models import AppUser
                    seller = AppUser.objects.filter(user_auth=item.product.supplier).first()
                    if seller:
                        seller_message = (
                            f"New order received!\nOrder ID: {order.id}\nProduct: {item.product.name}\n"
                            f"Quantity: {item.quantity}\nPrice: ₹{item.price}\n"
                            f"Customer: {order.user.email or order.user.username}\nPayment ID: {pid}\n"
                            "Please fulfill this order as soon as possible."
                        )
                        seller_results = trigger_all_notifications(
                            seller,
                            "New Order Received! 📦",
                            seller_message,
                            channels=['In-App', 'Email', 'WhatsApp'],
                            phone=seller.phone
                        )

                # Notify Buyer
                from users.models import AppUser
                buyer = AppUser.objects.filter(user_auth=order.user).first()
                if buyer:
                    items_detail = "\n".join([
                        f"- {item.product.name} x{item.quantity} @ ₹{item.price}"
                        for item in order.items.all()
                    ])
                    address = order.delivery_address or {}
                    address_text = (
                        f"{address.get('line1', '')}, {address.get('city', '')}, {address.get('state', '')} {address.get('pincode', '')}".strip()
                    )
                    tracking_id = order.tracking_id or payment.razorpay_payment_id or 'Pending'
                    buyer_message = (
                        f"Order Confirmed! 🎉\n\n"
                        f"Hi {buyer.user_auth.first_name or 'there'},\n"
                        f"Thank you for your order! It's being processed and will be shipped soon.\n\n"
                        f"📦 Order Details:\n"
                        f"Order ID: {order.id}\n"
                        f"Total Amount: ₹{order.total_price}\n"
                        f"Payment Status: Paid (ID: {pid})\n"
                        f"Tracking ID: {tracking_id}\n\n"
                        f"🛒 Items:\n{items_detail}\n\n"
                        f"📍 Shipping To:\n{address_text}\n\n"
                        f"Track your package here: http://localhost:5173/orders/{order.id}\n\n"
                        f"Thank you for choosing Bloom & Buy!"
                    )
                    buyer_results = trigger_all_notifications(
                        buyer,
                        "Order Confirmed! 🎉",
                        f"Bloom & Buy: Your Order #{order.id} has been placed successfully. Amount: ₹{order.total_price}. Track your package: http://localhost:5173/orders/tracking/{order.id}",
                        channels=['In-App', 'Email', 'SMS', 'WhatsApp'],
                        phone=address.get('phone') or address.get('phone_number') or buyer.phone
                    )

                # Clear Cart
                Cart.objects.filter(user=order.user).delete()
                notification_warning = None
                if buyer_results.get('Email') == 'Skipped':
                    notification_warning = "Email skipped (Demo Mode - Check .env)"

                return Response({
                    "message": "Payment verified and order confirmed!", 
                    "order_id": order.id,
                    "notification_status": buyer_results,
                    "warning": notification_warning
                })
            except Exception as e:
                logger.error(f"Error securing order after payment: {str(e)}")
                return Response({"error": "Payment received but order update failed. Please contact support."}, status=500)
        
        logger.error(f"Payment signature verification failed for OrderID={rid}")
        return Response({"error": "Payment security verification failed"}, status=400)

class MyOrdersView(ListAPIView):
    serializer_class = OrderSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

class TrackOrderAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, order_id):
        order = get_object_or_404(Order, id=order_id, user=request.user)

        status_steps = [
            'Pending', 'Confirmed', 'Packed', 'Shipped',
            'In Transit', 'Out for Delivery', 'Delivered'
        ]
        current_index = status_steps.index(order.status) if order.status in status_steps else 0
        steps = []
        for idx, name in enumerate(status_steps):
            steps.append({
                'name': name,
                'completed': idx <= current_index,
                'current': idx == current_index,
                'time': None,
            })

        if order.tracking_history:
            history = order.tracking_history
            # Fill missing step times using history if available
            for step in steps:
                for entry in history:
                    if entry.get('status') == step['name']:
                        step['time'] = entry.get('time')
                        break
        else:
            history = [
                {
                    'status': step['name'],
                    'time': None,
                    'message': f"Your order is now {step['name'].lower()}.",
                }
                for step in steps if step['completed']
            ]

        return Response({
            'id': order.id,
            'status': order.status,
            'total': float(order.total_price),
            'createdAt': order.created_at,
            'deliveryAddress': order.delivery_address,
            'items': [
                {
                    'product': item.product.name,
                    'quantity': item.quantity,
                    'price': float(item.price)
                }
                for item in order.items.all()
            ],
            'steps': steps,
            'history': history,
            'estimatedDelivery': order.estimated_delivery,
            'tracking_id': order.tracking_id or f"TRACK-{order.id:06d}",
            'carrier': order.carrier or 'Bloom Logistics'
        })

class UpdateOrderStatusView(APIView):
    permission_classes = [IsAdminUser]
    def patch(self, request, order_id):
        order = get_object_or_404(Order, id=order_id)
        old_status = order.status
        new_status = request.data.get("status")
        
        if new_status and old_status != new_status:
            order.status = new_status
            order.save()
            
            # Add to tracking history
            history = order.tracking_history or []
            history.append({
                'status': new_status,
                'time': timezone.now().isoformat(),
                'message': f"Your order status has been updated to {new_status}."
            })
            order.tracking_history = history
            order.save()

            # Notify Buyer
            from users.models import AppUser
            buyer = AppUser.objects.filter(user_auth=order.user).first()
            if buyer:
                status_messages = {
                    'Packed': "Your order has been packed and is ready for shipment! 📦",
                    'Shipped': f"Great news! Your order #{order.id} has been shipped. 🚚 Tracking ID: {order.tracking_id or 'Pending'}",
                    'In Transit': "Your order is on the move and is currently in transit. 🚛",
                    'Out for Delivery': "Get ready! Your order is out for delivery and will reach you soon. 🏠",
                    'Delivered': "Your order has been delivered successfully! Enjoy your purchase. ✨",
                }
                
                msg = status_messages.get(new_status, f"The status of your order #{order.id} has been updated to {new_status}.")
                notif_results = trigger_all_notifications(
                    buyer,
                    f"Order Update: {new_status} 📦",
                    f"Bloom & Buy: Your Order #{order.id} is now {new_status}. View details: http://localhost:5173/orders/tracking/{order.id}",
                    channels=['In-App', 'Email', 'SMS', 'WhatsApp'],
                    phone=buyer.phone or (order.delivery_address or {}).get('phone')
                )
                return Response({
                    "message": f"Status updated to {order.status}",
                    "notification_status": notif_results
                })

        return Response({"message": f"Status updated to {order.status}"})


def generate_invoice(request, order_id):
    order = get_object_or_404(Order, id=order_id, user=request.user)
    response = HttpResponse(content_type='application/pdf')
    response['Content-Disposition'] = f'attachment; filename="order_{order.id}_invoice.pdf"'

    buffer = canvas.Canvas(response)
    buffer.setFont('Helvetica-Bold', 18)
    buffer.drawString(50, 800, f'Invoice for Order #{order.id}')
    buffer.setFont('Helvetica', 12)
    buffer.drawString(50, 770, f'Date: {order.created_at.strftime("%Y-%m-%d %H:%M")})')
    buffer.drawString(50, 750, f'Status: {order.status}')
    buffer.drawString(50, 730, f'Total: ₹{order.total_price}')
    buffer.drawString(50, 710, 'Delivery Address:')

    y = 690
    for key, value in order.delivery_address.items():
        buffer.drawString(60, y, f'{key.replace("_", " ").capitalize()}: {value}')
        y -= 20

    y -= 20
    buffer.drawString(50, y, 'Items:')
    y -= 20

    for item in order.items.all():
        buffer.drawString(60, y, f'{item.quantity} × {item.product.name} @ ₹{item.price} = ₹{item.quantity * item.price}')
        y -= 20
        if y < 80:
            buffer.showPage()
            buffer.setFont('Helvetica', 12)
            y = 800

    buffer.showPage()
    buffer.save()
    return response
