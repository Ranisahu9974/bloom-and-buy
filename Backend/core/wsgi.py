import os
import sys
import traceback

# Add the 'Backend' directory to the Python path
current_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.abspath(os.path.join(current_dir, '..'))
root_dir = os.path.abspath(os.path.join(backend_dir, '..'))

if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

def handler(environ, start_response):
    path = environ.get('PATH_INFO', '')
    
    # 1. Advanced Diagnostic Probe
    if path == '/api/health-check' or path == '/api/debug':
        import pkgutil
        import platform
        
        installed_packages = [package.name for package in pkgutil.iter_modules()]
        
        report = [
            f"--- SYSTEM DIAGNOSTICS ---",
            f"Python Version: {platform.python_version()}",
            f"Current Directory: {os.getcwd()}",
            f"File Path: {__file__}",
            f"Sys Path: {sys.path}",
            f"DJANGO_SETTINGS_MODULE: {os.environ.get('DJANGO_SETTINGS_MODULE')}",
            f"\n--- INSTALLED PACKAGES (Sample) ---",
            f"Django in path: {'django' in installed_packages}",
            f"setuptools in path: {'setuptools' in installed_packages}",
            f"pkg_resources available: {('pkg_resources' in installed_packages) or ('pkg_resources' in sys.modules)}",
            f"All: {', '.join(installed_packages[:20])}...",
            f"\n--- ENVIRONMENT ---",
            f"DATABASE_URL set: {bool(os.environ.get('DATABASE_URL'))}",
            f"PORT: {os.environ.get('PORT', 'Not set')}"
        ]
        
        start_response('200 OK', [('Content-Type', 'text/plain')])
        return ["\n".join(report).encode('utf-8')]

    # 2. Main Django application with Traceback detection
    try:
        from django.core.wsgi import get_wsgi_application
        application = get_wsgi_application()
        return application(environ, start_response)
    except Exception:
        start_response('500 Internal Server Error', [('Content-Type', 'text/plain')])
        error_msg = f"DJANGO BOOTSTRAP FAILED\n\n{traceback.format_exc()}"
        return [error_msg.encode('utf-8')]

app = handler
