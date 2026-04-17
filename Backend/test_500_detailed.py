import requests
import json

urls = [
    "http://localhost:8000/api/users/announcements/",
    "http://localhost:8000/api/products/?limit=12&sort=popular",
    "http://localhost:8000/api/products/recommendations/"
]

def test(url, headers=None):
    print(f"Testing {url} with headers {headers}...")
    try:
        r = requests.get(url, headers=headers)
        print(f"Status: {r.status_code}")
        if r.status_code == 500:
            # Check if it's HTML (Django error page)
            if 'html' in r.headers.get('Content-Type', ''):
                print("HTML Error Page detected.")
                # Try to find the exception type in HTML
                if 'Exception Type:' in r.text:
                    start = r.text.find('Exception Type:')
                    end = r.text.find('</td>', start)
                    print("Exception Type:", r.text[start:end+5])
            else:
                print("Response:", r.text[:500])
    except Exception as e:
        print(f"Error: {e}")

print("--- Testing Anonymous ---")
for url in urls:
    test(url)

print("\n--- Testing Invalid Token ---")
for url in urls:
    test(url, headers={"Authorization": "Bearer invalid"})
