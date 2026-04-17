import requests
import json

urls = [
    "http://localhost:8001/api/users/announcements/",
    "http://localhost:8001/api/products/?limit=12&sort=popular",
    "http://localhost:8001/api/products/recommendations/"
]

headers = {
    "Authorization": "Bearer some-invalid-token"
}

for url in urls:
    print(f"Testing {url}...")
    try:
        r = requests.get(url, headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 500:
            print("Response:", r.text[:200])
    except Exception as e:
        print(f"Error: {e}")
