
import os

def fix_file(filepath):
    print(f"Fixing {filepath}...")
    with open(filepath, 'rb') as f:
        content = f.read()
    
    # Remove null bytes
    clean_content = content.replace(b'\x00', b'')
    
    # Also handle the spaced out characters if they are literal spaces
    # (But let's stick to null bytes first as the error says)
    
    with open(filepath, 'wb') as f:
        f.write(clean_content)
    print("Fixed.")

if __name__ == "__main__":
    fix_file('adminpanel/views.py')
    fix_file('adminpanel/urls.py')
