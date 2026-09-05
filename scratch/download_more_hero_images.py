import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Download pristine commercial office restroom and sparkling luxury modern kitchen
images = {
    # Pristine Kitchen with Clean Island Countertops
    'client/public/images/hero_kitchen.png': 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=85',
    # Commercial Luxury Restroom with multiple modern sinks & mirrors
    'client/public/images/hero_commercial_restroom.png': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
    # Alternative commercial restroom option:
    'client/public/images/hero_commercial_restroom2.png': 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=1200&q=85',
    # Sparkling modern kitchen interior:
    'client/public/images/hero_kitchen2.png': 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85'
}

for local_path, url in images.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp, open(local_path, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {local_path} ({os.path.getsize(local_path)} bytes)")
    except Exception as e:
        print(f"Failed {url}: {e}")
