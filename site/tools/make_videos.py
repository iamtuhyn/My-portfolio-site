"""Short screen-flow videos for the case studies, made from the site's own screens.

A tiny script per video: show a screen, glide the cursor to a button, click (a mint ripple), cut to the
next screen (fade or slide), or scroll a tall page while its header and sidebar stay put.

    PYTHONPATH=<pillow> python3 site/tools/make_videos.py      (needs ffmpeg: imageio-ffmpeg or on PATH)
Writes site/assets/video/<name>.mp4 and site/assets/img/video/<name>.webp (poster).
"""
import math
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

SITE = Path(__file__).resolve().parents[1]
IMG = SITE / "assets" / "img"
VOUT = SITE / "assets" / "video"
W, H, FPS = 1600, 1000, 30
MINT = (168, 213, 186)

# sticky chrome of the CLM web app, as fractions of the screen width (measured on the exports)
CLM_HEAD, CLM_SIDE = 0.0817, 0.173


def ease(t):
    return 4 * t ** 3 if t < .5 else 1 - (-2 * t + 2) ** 3 / 2


def load(key, width=None):
    width = width or W
    im = Image.open(IMG / f"{key}.webp").convert("RGB")
    return im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)


def cursor(scale=1.0):
    """A pointer arrow: white with a dark edge and a soft shadow."""
    s = 2.2 * scale
    pts = [(0, 0), (0, 17), (4.2, 13.2), (7, 19.5), (9.6, 18.4), (6.9, 12.3), (12.2, 12.2)]
    pts = [(x * s + 6, y * s + 6) for x, y in pts]
    size = int(40 * scale) + 12
    sh = Image.new("RGBA", (size, size)); ImageDraw.Draw(sh).polygon([(x + 2, y + 3) for x, y in pts], fill=(0, 0, 0, 110))
    sh = sh.filter(ImageFilter.GaussianBlur(2.5))
    d = ImageDraw.Draw(sh)
    d.polygon(pts, fill=(255, 255, 255, 255), outline=(20, 20, 24, 255))
    d.line(pts + [pts[0]], fill=(20, 20, 24, 255), width=max(1, round(1.6 * scale)))
    return sh


class Film:
    def __init__(self, first, w=None, h=None):
        self.w, self.h = w or W, h or H
        self.frames, self.screen, self.scroll = [], first, 0
        self.cx, self.cy, self.press, self.ripples, self.visible = self.w * .62, self.h * .7, 0, [], True
        self.sticky = None                                  # (head_h, side_w) when the screen has fixed chrome

    def compose(self, screen=None, scroll=None):
        screen = screen or self.screen
        scroll = self.scroll if scroll is None else scroll
        W, H = self.w, self.h
        frame = screen.crop((0, scroll, W, scroll + H)) if screen.height > H else screen.crop((0, 0, W, H))
        if self.sticky and scroll > 0:                      # header + sidebar stay fixed while the content scrolls
            hh, sw = self.sticky
            frame.paste(screen.crop((0, 0, sw, H)), (0, 0))
            frame.paste(screen.crop((0, 0, W, hh)), (0, 0))
        return frame

    def emit(self, frame):
        W, H = self.w, self.h
        fr = frame.convert("RGBA")
        for r in self.ripples:                              # click ripples
            k = r["t"] / 14
            if k > 1:
                continue
            ov = Image.new("RGBA", (W, H)); d = ImageDraw.Draw(ov)
            rad = 10 + 46 * ease(k)
            d.ellipse([r["x"] - rad, r["y"] - rad, r["x"] + rad, r["y"] + rad], outline=MINT + (int(230 * (1 - k)),), width=3)
            d.ellipse([r["x"] - 9, r["y"] - 9, r["x"] + 9, r["y"] + 9], fill=MINT + (int(150 * (1 - k)),))
            fr = Image.alpha_composite(fr, ov)
            r["t"] += 1
        self.ripples = [r for r in self.ripples if r["t"] <= 14]
        if self.visible:
            c = cursor(1 - .12 * self.press)
            fr.alpha_composite(c, (int(self.cx) - 6, int(self.cy) - 6))
        self.frames.append(fr.convert("RGB"))

    def hold(self, sec):
        for _ in range(round(sec * FPS)):
            self.emit(self.compose())

    def move(self, x, y, sec=.7):
        x0, y0, n = self.cx, self.cy, max(1, round(sec * FPS))
        for i in range(1, n + 1):
            t = ease(i / n)
            # a slight arc, like a hand moving a mouse
            self.cx = x0 + (x - x0) * t
            self.cy = y0 + (y - y0) * t - math.sin(math.pi * t) * 18
            self.emit(self.compose())

    def click(self):
        self.ripples.append({"x": self.cx, "y": self.cy, "t": 0})
        for p in (1, 1, .6, .3, 0):
            self.press = p
            self.emit(self.compose())

    def cut(self, key, kind="fade", sec=.45, sticky=None):
        W, H = self.w, self.h
        nxt = load(key, W)
        a = self.compose()
        old_sticky, self.sticky = self.sticky, sticky
        self.scroll = 0
        b = self.compose(nxt, 0)
        n = max(1, round(sec * FPS))
        for i in range(1, n + 1):
            t = ease(i / n)
            if kind == "slide":
                fr = Image.new("RGB", (W, H))
                fr.paste(a, (int(-W * .25 * t), 0)); fr.paste(b, (int(W * (1 - t)), 0))
                d = ImageDraw.Draw(fr); d.rectangle([int(W * (1 - t)) - 1, 0, int(W * (1 - t)), H], fill=(0, 0, 0))
            else:
                fr = Image.blend(a, b, t)
            self.emit(fr)
        self.screen = nxt

    def scroll_to(self, y, sec=1.6):
        y = max(0, min(y, self.screen.height - self.h))
        y0, n = self.scroll, max(1, round(sec * FPS))
        for i in range(1, n + 1):
            self.scroll = round(y0 + (y - y0) * ease(i / n))
            self.emit(self.compose())

    def save(self, name):
        VOUT.mkdir(parents=True, exist_ok=True)
        tmp = Path(tempfile.mkdtemp())
        for i, f in enumerate(self.frames):
            f.save(tmp / f"{i:04d}.png")
        ff = shutil.which("ffmpeg")
        if not ff:
            import imageio_ffmpeg
            ff = imageio_ffmpeg.get_ffmpeg_exe()
        subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-framerate", str(FPS), "-i", str(tmp / "%04d.png"),
                        "-vf", f"scale={min(1280, self.w)}:-2", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "24", "-preset", "slow",
                        "-movflags", "+faststart", str(VOUT / f"{name}.mp4")], check=True)
        (IMG / "video").mkdir(parents=True, exist_ok=True)
        first = self.frames[0]; first.resize((min(1280, self.w), round(first.height * min(1280, self.w) / first.width)), Image.LANCZOS).save(IMG / "video" / f"{name}.webp", "WEBP", quality=78)
        shutil.rmtree(tmp)
        print(f"{name}: {len(self.frames) / FPS:.1f}s, {(VOUT / f'{name}.mp4').stat().st_size / 1e6:.2f} MB")


def clm_sticky(key):
    return (round(W * CLM_HEAD), round(W * CLM_SIDE))


SCRIPTS = {}


def script(fn):
    SCRIPTS[fn.__name__] = fn
    return fn


@script
def clm_signin():                                           # sign in → the cockpit
    f = Film(load("clm/web-login"))
    f.cx, f.cy = 900, 760
    f.hold(.5)
    f.move(*SIGNIN, .8); f.click(); f.hold(.15)
    f.cut("clm/web-cockpit", "fade", .5)
    f.move(330, 520, .9); f.hold(1.4)
    f.save("clm-signin")


@script
def clm_overview():                                         # the analytical side: tabs, and long pages that scroll
    f = Film(load("clm/web-status")); f.sticky = clm_sticky("clm/web-status")
    f.cx, f.cy = 820, 560
    f.hold(.5)
    f.move(*TAB_LOGISTICS, .7); f.click()
    f.cut("clm/web-logistics", "fade", .35, sticky=clm_sticky("clm/web-logistics"))
    f.move(1000, 640, .5); f.scroll_to(1250, 1.8); f.hold(.4)
    f.move(*TAB_EQUIPMENT, .7); f.click()
    f.cut("clm/web-equipment", "fade", .35, sticky=clm_sticky("clm/web-equipment"))
    f.move(1050, 620, .5); f.scroll_to(1500, 1.9); f.hold(.8)
    f.save("clm-overview")


@script
def clm_create():                                           # booking a delivery, step by step
    f = Film(load("clm/web-create-1"))
    f.cx, f.cy = 900, 600
    f.hold(.4)
    for k in range(2, 6):
        f.move(*NEXT_BTN, .55); f.click()
        f.cut(f"clm/web-create-{k}", "slide", .45)
        f.hold(.5)
    f.hold(.5)
    f.save("clm-create")


@script
def recyclium_onboarding():                                 # earn first, sign up second: scan → item → reward → profile
    PW, PH = 750, 1624
    f = Film(load("recyclium/s-scan", PW), PW, PH)
    f.cx, f.cy = 560, 1380
    f.hold(.4)
    for key, target in [("recyclium/s-item", (375, 1093)), ("recyclium/s-reward-offer", (375, 560)), ("recyclium/s-about-you", (375, 1262))]:
        f.move(*target, .5); f.click(); f.cut(key, "slide", .4); f.hold(.5)
    f.move(375, 1055, .5); f.click(); f.hold(.6)
    f.save("recyclium-onboarding")


# click targets, in the 1600 × 1000 frame (set after looking at the screens)
SIGNIN = (1344, 542)
TAB_LOGISTICS = (504, 100)
TAB_EQUIPMENT = (627, 100)
NEXT_BTN = (1450, 176)

if __name__ == "__main__":
    import sys
    for name in (sys.argv[1:] or SCRIPTS):
        SCRIPTS[name]()
