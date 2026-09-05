import shutil

# 1. Kitchen Slide (Pristine Luxury White Marble Modern Kitchen)
shutil.copy('client/public/images/hero_kitchen_modern.png', 'client/public/images/hero_kitchen_slide.png')

# 2. Commercial Restroom Slide (Spotless Commercial Luxury Restroom with Glass & Tile)
shutil.copy('client/public/images/hero_commercial_bathroom_luxury.png', 'client/public/images/hero_bathroom_slide.png')

print("Copied hero_kitchen_slide.png and hero_bathroom_slide.png successfully!")
