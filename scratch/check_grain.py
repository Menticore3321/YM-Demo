import urllib.request
import re
from PIL import Image
import os

url = 'https://grainient.supply/backgrounds/ultravibe-20'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')

# Extract all links and images
imgs = re.findall(r'https://framerusercontent\.com/images/[a-zA-Z0-9_\-\.]+', html)
unique_imgs = list(dict.fromkeys(imgs))

os.makedirs('scratch/imgs', exist_ok=True)
for i, img_url in enumerate(unique_imgs):
    try:
        local_path = f'scratch/imgs/img_{i}.jpg'
        urllib.request.urlretrieve(img_url, local_path)
        im = Image.open(local_path)
        print(f'{i}: {im.size} {im.format} -> {img_url}')
    except Exception as e:
        print(f'{i}: error {e} -> {img_url}')
