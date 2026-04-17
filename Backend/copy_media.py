import shutil
import os

# Create media directory if it doesn't exist
media_dir = "media/products/"
os.makedirs(media_dir, exist_ok=True)

# Sources
sources = [
    r"c:\Users\KRIN\OneDrive\Desktop\24-mantra-organic-moong-dal-1kg.png",
    r"c:\Users\KRIN\OneDrive\Desktop\tata-sampann-toor-dal-1kg.png",
    r"c:\Users\KRIN\OneDrive\Desktop\fortune-everyday-basmati-rice-5kg.png",
    r"c:\Users\KRIN\OneDrive\Desktop\aashirvaad-shudh-chakki-atta.png",
    r"c:\Users\KRIN\OneDrive\Desktop\fresh-tomatoes.png"
]

for src in sources:
    if os.path.exists(src):
        dst = os.path.join(media_dir, os.path.basename(src))
        shutil.copy2(src, dst)
        print(f"Copied {src} to {dst}")
    else:
        print(f"NOT FOUND: {src}")
