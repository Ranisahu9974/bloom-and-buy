import os
import django
from twilio.rest import Client
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_twilio():
    print("--- Twilio Debugger ---")
    sid = getattr(settings, 'TWILIO_ACCOUNT_SID', None)
    token = getattr(settings, 'TWILIO_AUTH_TOKEN', None)
    from_phone = getattr(settings, 'TWILIO_PHONE_NUMBER', None)
    
    print(f"SID: {sid[:5]}..." if sid else "SID: None")
    print(f"FROM PHONE: {from_phone}")
    
    if not sid or 'AC...' in str(sid):
        print("\n[ERROR] Twilio SID is missing or placeholder.")
        return

    recipient = input("\nEnter your phone number to test (Include country code e.g. +91XXXXXXXXXX): ")
    
    print("\n1. Test SMS")
    print("2. Test WhatsApp")
    choice = input("Select choice (1 or 2): ")

    try:
        client = Client(sid, token)
        if choice == '1':
            print(f"Sending SMS from {from_phone} to {recipient}...")
            message = client.messages.create(
                body="Bloom & Buy: This is a test SMS! 🚀",
                from_=from_phone,
                to=recipient
            )
            print(f"\n[SUCCESS] SMS Sent! SID: {message.sid}")
        else:
            whatsapp_from = getattr(settings, 'TWILIO_WHATSAPP_NUMBER', f'whatsapp:{from_phone}')
            if not whatsapp_from.startswith('whatsapp:'):
                whatsapp_from = f'whatsapp:{whatsapp_from}'
            
            print(f"Sending WhatsApp from {whatsapp_from} to whatsapp:{recipient}...")
            print("NOTE: On Trial Accounts, the recipient MUST send 'join <your-sandbox-name>' to the Twilio number first.")
            
            message = client.messages.create(
                body="Bloom & Buy: This is a test WhatsApp message! 🌸",
                from_=whatsapp_from,
                to=f'whatsapp:{recipient}'
            )
            print(f"\n[SUCCESS] WhatsApp Message Sent! SID: {message.sid}")
            
    except Exception as e:
        print("\n[FAILED] Error occurred:")
        print(str(e))
        print("\nCommon Fixes:")
        print("1. SENDER NUMBER: .env mein TWILIO_PHONE_NUMBER aapka apna number nahi hona chahiye. Woh Twilio se kharida hua number (+1...) hona chahiye.")
        print("2. TRIAL ACCOUNT: Twilio Trial account sirf 'Verified Caller IDs' par hi msg bhej sakta hai.")
        print("3. WHATSAPP SANDBOX: WhatsApp ke liye aapko pehle Twilio ke sandbox number par 'join ...' bhejna padta hai.")

if __name__ == "__main__":
    test_twilio()
