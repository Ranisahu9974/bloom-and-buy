import os
import django
from django.core.mail import send_mail
from django.conf import settings

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

def test_email():
    print("--- SMTP Debugger ---")
    print(f"HOST: {settings.EMAIL_HOST}")
    print(f"PORT: {settings.EMAIL_PORT}")
    print(f"USER: {settings.EMAIL_HOST_USER}")
    
    if 'your-email@gmail.com' in settings.EMAIL_HOST_USER:
        print("\n[ERROR] You are still using the placeholder 'your-email@gmail.com'!")
        print("Please edit your .env file and put your real Gmail.")
        return

    recipient = input("\nEnter recipient email to test (e.g. your personal email): ")
    
    try:
        print(f"Attempting to send test email to {recipient}...")
        send_mail(
            'Test Email from Bloom & Buy',
            'If you are reading this, your SMTP settings in .env are working perfectly! 🎉',
            settings.DEFAULT_FROM_EMAIL,
            [recipient],
            fail_silently=False,
        )
        print("\n[SUCCESS] Email sent! Check your inbox (and Spam folder).")
    except Exception as e:
        print("\n[FAILED] Error occurred:")
        print(str(e))
        print("\nCommon fixes:")
        print("1. If using Gmail, make sure you created an 'App Password' (NOT your normal password).")
        print("2. Make sure 2-Step Verification is ON in your Google Account.")
        print("3. Check if your internet or firewall allows port 587.")

if __name__ == "__main__":
    test_email()
