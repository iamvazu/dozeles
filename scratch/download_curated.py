import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

images = {
    # 1. Luxury Modern White Kitchen with sparkling island & cabinets:
    'client/public/images/hero_kitchen_spotless.png': 'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?auto=format&fit=crop&w=1200&q=85',
    # 2. Sleek Modern Kitchen Interior:
    'client/public/images/hero_kitchen_modern.png': 'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1200&q=85',
    # 3. Modern Clean Bathroom / Restroom with double vanity, mirrors, and tiles:
    'client/public/images/hero_bathroom_clean.png': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
    # 4. Commercial / Luxury Restroom with glass, marble & sleek mirrors:
    'client/public/images/hero_commercial_restroom_clean.png': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=85',
    # 5. Commercial Restroom / Public Restroom:
    'client/public/images/hero_commercial_bathroom.png': 'https://images.unsplash.com/photo-1564540574859-0dfb63985953?auto=format&fit=crop&w=1200&q=85'
}

for local_path, url in images.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp, open(local_path, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {local_path} ({os.path.getsize(local_path)} bytes)")
    except Exception as e:
        print(f"Failed {url}: {e}")
