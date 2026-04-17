import os
import sys
import traceback

# Add the 'Backend' directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, '..'))
root_dir = os.path.abspath(os.path.join(backend_dir, '..'))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if root_dir not in sys.path:
    sys.path.insert(0, root_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

try:
    from django.core.wsgi import get_wsgi_application
    application = get_wsgi_application()
except Exception:
    # If Django fails to load, we capture the error to show it in the response
    application = None
    startup_error = traceback.format_exc()

def handler(environ, start_response):
    path = environ.get('PATH_INFO', '')
    
    # 1. Simple Probe: Test if Python is alive
    if path == '/api/health-check' or path == '/health-check':
        start_response('200 OK', [('Content-Type', 'text/plain')])
        return [b"Django Python runtime is alive! Path: " + path.encode('utf-8')]

    # 2. Show startup error if Django failed to initialize
    if not application:
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [f"Django Startup Error:\n\n{startup_error}".encode('utf-8')]

    # 3. Regular Django application
    try:
        return application(environ, start_response)
    except Exception:
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        return [f"Django Runtime Error:\n\n{traceback.format_exc()}".encode('utf-8')]

app = handler
