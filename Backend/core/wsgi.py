"""
WSGI config for core project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/wsgi/
"""

import os

from django.core.wsgi import get_wsgi_application
from django.core.management import call_command

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# This will run once when the Vercel function starts
try:
    print("Initializing database...")
    from django.core.management import call_command
    call_command('migrate', interactive=False)
    
    from store.models import Product
    if Product.objects.count() == 0:
        print("Database is empty. Seeding initial products...")
        # Try to run the seed script via management command or direct import
        try:
            from seed_final_v7 import seed_data_v7
            seed_data_v7()
        except ImportError:
            # Fallback if import fails
            import subprocess
            subprocess.run(["python3", "seed_final_v7.py"], check=True)
except Exception as e:
    # Use a safe way to log error that doesn't crash the app start
    print(f"CRITICAL: Database setup error: {e}")

application = get_wsgi_application()
app = application
