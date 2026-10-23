import urllib.request
import re

url = 'https://grainient.supply/backgrounds/ultravibe-20'
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
html = urllib.request.urlopen(req).read().decode('utf-8', 'ignore')

# Search for any .mp4, .webm, .webp, .png, .jpg
all_urls = re.findall(r'https://framerusercontent\.com/[^\s"\'\)]+', html)
for u in sorted(set(all_urls)):
    print('URL:', u)

# Let's also search for searchIndex or chunks
chunks = re.findall(r'https://framerusercontent\.com/sites/[^\s"\'\)]+\.json', html)
for c in chunks:
    print('Chunk:', c)
