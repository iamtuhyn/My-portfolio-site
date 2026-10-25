"""Thumbnails for the hero's sphere wall: 16:10 tiles, 480 px wide, cut from the site's own images.

    PYTHONPATH=<pillow> python3 site/tools/build_wall.py     (run after build_images.py)
Screens are anchored to the top (where the UI starts); photos to the centre.
"""
from pathlib import Path
from PIL import Image

IMG = Path(__file__).resolve().parents[1] / "assets" / "img"
W, H = 480, 300

# key → anchor ("top" or "mid")
TILES = {
    "clm/web-cockpit": "top", "clm/web-gantt": "top", "clm/web-equipment": "top", "clm/web-site": "top",
    "clm/web-create-3": "top", "clm/web-booking-1": "top", "clm/lim-gantt": "top", "clm/lim-floorplan": "top",
    "clm/2019-landing": "top", "recyclium/producer-dashboard": "top", "recyclium/journey": "mid",
    "work/gridops-01": "top", "work/insurance-04": "top", "work/telecom-01": "top", "work/mining-01": "top",
    "work/fleet-01": "top", "work/smart-parking-01": "top", "work/banners-01": "mid", "work/construction-2019-03": "top",
    "work/car-exhibition-01": "mid", "adam-surat/menu": "mid", "adam-surat/poster": "mid", "gfx/rickshaw-cd": "mid",
    "gfx/coffee-hub-billboard": "mid", "gfx/mother-language-day": "mid", "photo/himalaya": "mid", "photo/palms": "mid",
    "docs/on-set": "mid", "photo/theatre-red": "mid", "video/flash-ant": "mid", "photo/hills-mist": "mid", "recyclium/d-handover-1": "top",
}


def main():
    out = IMG / "wall"
    out.mkdir(exist_ok=True)
    for key, anchor in TILES.items():
        im = Image.open(IMG / f"{key}.webp").convert("RGB")
        s = max(W / im.width, H / im.height)
        im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
        left = (im.width - W) // 2
        top = 0 if anchor == "top" else (im.height - H) // 2
        im.crop((left, top, left + W, top + H)).save(out / f"{key.replace('/', '-')}.webp", "WEBP", quality=74, method=6)
    total = sum(f.stat().st_size for f in out.glob("*.webp"))
    print(f"{len(TILES)} tiles, {total / 1e3:.0f} KB")


if __name__ == "__main__":
    main()
