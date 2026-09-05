import urllib.request
import os

headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'}

# Download commercial public/office restrooms with sinks, tiles and mirrors
commercial_bathrooms = {
    # Modern Commercial Restroom with vanity sinks & mirrors:
    'client/public/images/hero_commercial_restroom_sinks.png': 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=1200&q=85',
    # Luxury Commercial/Hotel Bathroom with modern marble and tiles:
    'client/public/images/hero_commercial_bathroom_luxury.png': 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=1200&q=85',
    # Commercial Restroom with tiled sinks:
    'client/public/images/hero_commercial_restroom_facility.png': 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?auto=format&fit=crop&w=1200&q=85',
    # Modern sleek bathroom interior:
    'client/public/images/hero_commercial_restroom_sleek.png': 'https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&w=1200&q=85'
}

for local_path, url in commercial_bathrooms.items():
    try:
        req = urllib.request.Request(url, headers=headers)
        with urllib.request.urlopen(req, timeout=15) as resp, open(local_path, 'wb') as f:
            f.write(resp.read())
        print(f"Downloaded {local_path} ({os.path.getsize(local_path)} bytes)")
    except Exception as e:
        print(f"Failed {url}: {e}")
