# Gör om Blenders PNG-bilder till de små filer som spelet använder.
#
#   python till-webp.py <mapp med renderingar> <spelets img-mapp>
import sys
from pathlib import Path

from PIL import Image

src, dst = Path(sys.argv[1]), Path(sys.argv[2])
dst.mkdir(parents=True, exist_ok=True)

for p in sorted(src.glob('arena-*.png')):
    Image.open(p).convert('RGB').save(dst / (p.stem + '.webp'), quality=80, method=6)
if (src / 'hero.png').exists():
    Image.open(src / 'hero.png').convert('RGB').save(dst / 'hero.webp', quality=78, method=6)
for name in ('trophy-cup', 'trophy-plate'):
    if (src / f'{name}.png').exists():
        im = Image.open(src / f'{name}.png').convert('RGBA')
        im = im.crop(im.getbbox())
        side = max(im.size)
        sq = Image.new('RGBA', (side, side), (0, 0, 0, 0))
        sq.paste(im, ((side - im.width) // 2, side - im.height))
        sq.resize((160, 160), Image.LANCZOS).save(dst / f'{name}.webp', quality=88, method=6)
if (src / 'icon.png').exists():
    icon = Image.open(src / 'icon.png').convert('RGB')
    for size in (512, 192, 180):
        icon.resize((size, size), Image.LANCZOS).save(dst / f'icon-{size}.png', optimize=True)

for p in sorted(dst.iterdir()):
    print(f'{p.stat().st_size / 1024:7.0f} kB  {p.name}')
