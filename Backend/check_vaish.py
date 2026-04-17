import os
import django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()
from django.contrib.auth.models import User
print(f"USER_EXISTS:{User.objects.filter(email='vaish@gmail.com').exists()}")
