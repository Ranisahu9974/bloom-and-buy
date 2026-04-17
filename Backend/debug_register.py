import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
django.setup()

from accounts.serializers import RegisterSerializer

data = {
    'username': 'testreg4',
    'email': 'testreg4@example.com',
    'password': 'Password123!',
    'name': 'Test Reg 4',
    'phone': '9876543210',
    'role': 'user',
    'membership_type': 'NORMAL'
}

serializer = RegisterSerializer(data=data)
if serializer.is_valid():
    try:
        user = serializer.save()
        print(f"SUCCESS: User {user.username} created.")
        from accounts.serializers import UserSerializer
        user_data = UserSerializer(user).data
        print("SUCCESS: User data serialized.")
    except Exception as e:
        print(f"CRASH during save: {e}")
        import traceback
        traceback.print_exc()
else:
    print(f"VALIDATION FAILED: {serializer.errors}")
