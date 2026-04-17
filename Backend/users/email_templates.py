def get_base_template(content, button_text=None, button_url=None):
    return f"""
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            .email-container {{
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                max-width: 600px;
                margin: 0 auto;
                background-color: #f9f9f9;
                padding: 20px;
            }}
            .header {{
                background: linear-gradient(135deg, #0d1b2a 0%, #1a3a5c 100%);
                padding: 30px;
                text-align: center;
                border-radius: 12px 12px 0 0;
            }}
            .body {{
                background-color: #ffffff;
                padding: 40px;
                border-radius: 0 0 12px 12px;
                color: #333333;
                line-height: 1.6;
            }}
            .footer {{
                text-align: center;
                margin-top: 20px;
                color: #888888;
                font-size: 12px;
            }}
            .button {{
                display: inline-block;
                padding: 14px 30px;
                background-color: #ff9900;
                color: white !important;
                text-decoration: none;
                border-radius: 8px;
                font-weight: bold;
                margin-top: 25px;
            }}
            .highlight {{
                color: #0d47a1;
                font-weight: bold;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1 style="color: white; margin: 0; letter-spacing: 2px;">Bloom & Buy</h1>
                <p style="color: #4fc3f7; margin: 5px 0 0 0;">Shop Smart, Save Big</p>
            </div>
            <div class="body">
                {content}
                {f'<div style="text-align: center;"><a href="{button_url}" class="button">{button_text}</a></div>' if button_text and button_url else ''}
            </div>
            <div class="footer">
                <p>&copy; 2024 Bloom & Buy. All rights reserved.</p>
                <p>You received this email because you are a registered user or subscriber.</p>
            </div>
        </div>
    </body>
    </html>
    """

def get_welcome_email(username):
    content = f"""
    <h2>Welcome to the Family! 🌸</h2>
    <p>Hi <span class="highlight">{username}</span>,</p>
    <p>Thank you for subscribing to <b>Bloom & Buy</b>! We are thrilled to have you with us.</p>
    <p>Get ready for exclusive deals, early access to new collections, and personalized recommendations just for you.</p>
    """
    return get_base_template(content, "Start Shopping", "http://localhost:5173/products")

def get_order_confirmation_email(order_id, total):
    content = f"""
    <h2>Your Order is Confirmed! 🎉</h2>
    <p>Great news! We've received your order <span class="highlight">#{order_id}</span>.</p>
    <p>Total Amount: <span class="highlight">₹{total}</span></p>
    <p>Our team is already working on getting your items packed and ready for shipment. You will receive another update as soon as it's on the way!</p>
    """
    return get_base_template(content, "Track My Order", f"http://localhost:5173/orders/tracking/{order_id}")

def get_tracking_update_email(order_id, status, message):
    content = f"""
    <h2>Order Update: {status} 📦</h2>
    <p>The status of your order <span class="highlight">#{order_id}</span> has been updated.</p>
    <p style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #0d47a1;">
        {message}
    </p>
    <p>Thank you for choosing Bloom & Buy!</p>
    """
    return get_base_template(content, "View My Account", "http://localhost:5173/profile")

def get_promotional_email(title, message):
    content = f"""
    <h2>{title} ✨</h2>
    <p>{message}</p>
    <p>Don't miss out on these limited-time offers. Visit our store now and grab your favorites before they are gone!</p>
    """
    return get_base_template(content, "Explore Deals", "http://localhost:5173/shop")
