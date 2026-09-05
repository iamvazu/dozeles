import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Curated Unsplash Direct High-Resolution Clean Kitchen & Commercial Restroom Photos
images = {
    # 1. Luxury Modern Kitchen (Clean White Marble & Stainless Steel)
    'client/public/images/hero_kitchen.png': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85',
    # 2. Commercial / Luxury Restroom (Pristine Tiles, Chrome Fixtures, Sparkling Mirror & Sinks)
    'client/public/images/hero_commercial_restroom.png': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85'
}

for local_path, url in images.items():
    try:
        print(f"Downloading {url} -> {local_path}...")
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp, open(local_path, 'wb') as f:
            f.write(resp.read())
        print(f"Saved {local_path} ({os.path.getsize(local_path)} bytes)")
    except Exception as e:
        print(f"Failed to download {url}: {e}")
