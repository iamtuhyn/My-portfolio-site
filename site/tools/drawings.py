"""Pen-style line drawings for the story, generated as SVG (600 × 400).

Hand-drawn feel: every line is subdivided and slightly wobbled, shading is hatching,
and each drawing is split into a few long paths (pathLength="1") so it draws itself
on scroll. Classes: "ink" (main lines), "fine" (detail), "hatch" (shading),
"accent" (mint) and "plum" (vanilla highlight).

    python3 site/tools/drawings.py   → writes site/assets/drawings/*.svg.html
"""
import math
import random
from pathlib import Path

OUT = Path(__file__).resolve().parents[1] / "assets" / "drawings"


class Pen:
    def __init__(self, seed):
        self.r = random.Random(seed)
        self.layers = {"ink": [], "fine": [], "hatch": [], "accent": [], "plum": []}

    def wob(self, pts, amp=0.9, step=10):
        """Subdivide a polyline and nudge each point: a hand-drawn line."""
        out = [pts[0]]
        for (x0, y0), (x1, y1) in zip(pts, pts[1:]):
            n = max(1, int(math.hypot(x1 - x0, y1 - y0) / step))
            for i in range(1, n + 1):
                t = i / n
                j = 0 if i == n else amp
                out.append((x0 + (x1 - x0) * t + self.r.uniform(-j, j), y0 + (y1 - y0) * t + self.r.uniform(-j, j)))
        return out

    def line(self, pts, layer="ink", amp=0.9):
        p = self.wob(pts, amp)
        self.layers[layer].append("M" + " L".join(f"{x:.1f} {y:.1f}" for x, y in p))

    def curve(self, f, t0, t1, n=40, layer="ink", amp=0.6):
        self.line([f(t0 + (t1 - t0) * i / n) for i in range(n + 1)], layer, amp)

    def ellipse(self, cx, cy, rx, ry, layer="ink", a0=0, a1=2 * math.pi, amp=0.5):
        self.curve(lambda t: (cx + rx * math.cos(t), cy + ry * math.sin(t)), a0, a1, 60, layer, amp)

    def hatch(self, poly, angle=35, gap=5, layer="hatch", jitter=0.8):
        """Fill a polygon with parallel strokes."""
        a = math.radians(angle)
        d = (math.cos(a), math.sin(a))
        nrm = (-d[1], d[0])
        proj = [x * nrm[0] + y * nrm[1] for x, y in poly]
        lo, hi = min(proj), max(proj)
        off = lo + gap / 2
        while off < hi:
            hits = []
            for (x0, y0), (x1, y1) in zip(poly, poly[1:] + poly[:1]):
                p0, p1 = x0 * nrm[0] + y0 * nrm[1], x1 * nrm[0] + y1 * nrm[1]
                if (p0 - off) * (p1 - off) < 0:
                    t = (off - p0) / (p1 - p0)
                    hits.append((x0 + (x1 - x0) * t, y0 + (y1 - y0) * t))
            hits.sort(key=lambda h: h[0] * d[0] + h[1] * d[1])
            for i in range(0, len(hits) - 1, 2):
                (ax, ay), (bx, by) = hits[i], hits[i + 1]
                s0, s1 = self.r.uniform(0, 0.08), self.r.uniform(0.92, 1)
                self.line([(ax + (bx - ax) * s0, ay + (by - ay) * s0), (ax + (bx - ax) * s1, ay + (by - ay) * s1)], layer, jitter)
            off += gap * self.r.uniform(0.8, 1.2)

    def svg(self, groups=None):
        groups = groups or {"ink": 8, "fine": 6, "hatch": 6, "accent": 2, "plum": 1}
        out = []
        for layer, n in groups.items():
            items = self.layers[layer]
            if not items:
                continue
            size = max(1, math.ceil(len(items) / n))
            for i in range(0, len(items), size):
                cls = {"ink": "", "fine": ' class="fine"', "hatch": ' class="hatch"', "accent": ' class="accent"', "plum": ' class="plum"'}[layer]
                out.append(f'<path{cls} d="{" ".join(items[i:i + size])}" pathLength="1"/>')
        return "\n".join(out)


def palm(p, x, y, h, lean=0.0, layer="ink"):
    top = (x + lean * h, y - h)
    p.curve(lambda t: (x + lean * h * t * t + math.sin(t * 3) * 2, y - h * t), 0, 1, 30, layer)
    p.curve(lambda t: (x + 4 + lean * h * t * t + math.sin(t * 3) * 2, y - h * t), 0, 0.97, 30, "fine")
    for k in range(9):                                     # trunk rings
        t = (k + 1) / 10
        cx = x + 2 + lean * h * t * t
        p.line([(cx - 4, y - h * t), (cx + 5, y - h * t + 1.5)], "fine", 0.4)
    for i in range(9):                                     # fronds
        ang = math.radians(-170 + i * 20 + p.r.uniform(-6, 6))
        L = h * p.r.uniform(0.32, 0.45)
        ex, ey = top[0] + math.cos(ang) * L, top[1] + math.sin(ang) * L * 0.6 + L * 0.35
        mx, my = top[0] + math.cos(ang) * L * 0.5, top[1] + math.sin(ang) * L * 0.6 * 0.5 - 8
        p.curve(lambda t: ((1 - t) ** 2 * top[0] + 2 * (1 - t) * t * mx + t * t * ex, (1 - t) ** 2 * top[1] + 2 * (1 - t) * t * my + t * t * ey), 0, 1, 16, layer)
        for j in range(1, 7):                              # leaflets
            t = j / 7
            bx = (1 - t) ** 2 * top[0] + 2 * (1 - t) * t * mx + t * t * ex
            by = (1 - t) ** 2 * top[1] + 2 * (1 - t) * t * my + t * t * ey
            p.line([(bx, by), (bx + p.r.uniform(-3, 3), by + 7 - t * 3)], "fine", 0.3)


def narikelbari():
    p = Pen(11)
    p.line([(12, 12), (588, 12), (588, 388), (12, 388), (12, 12)], "accent", 0.4)          # the window: the first frame
    p.line([(300, 12), (300, 388)], "fine", 0.3)
    p.line([(12, 150), (588, 150)], "fine", 0.3)
    p.line([(20, 196), (180, 192), (330, 197), (580, 190)], "ink")                         # horizon
    for k, (hx, hw) in enumerate([(390, 26), (424, 20), (500, 30), (540, 18)]):            # distant houses
        p.line([(hx, 194), (hx, 180), (hx + hw / 2, 170), (hx + hw, 180), (hx + hw, 194)], "fine", 0.4)
    house = [(60, 300), (60, 236), (150, 236), (150, 300)]                                 # tin-roof home
    p.line(house + [(60, 300)], "ink")
    p.line([(48, 240), (105, 204), (162, 240)], "ink")
    p.hatch([(52, 238), (105, 207), (158, 238)], angle=-20, gap=4, layer="fine")
    p.line([(84, 300), (84, 266), (104, 266), (104, 300)], "ink")                           # door
    p.line([(118, 252), (140, 252), (140, 274), (118, 274), (118, 252)], "plum")           # window (a frame)
    p.line([(129, 252), (129, 274)], "fine"); p.line([(118, 263), (140, 263)], "fine")
    p.hatch([(60, 300), (60, 280), (150, 288), (150, 300)], angle=50, gap=4)
    for y in (222, 246, 272):                                                              # paddy rows
        p.curve(lambda t, y=y: (170 + 410 * t, y + math.sin(t * 9) * 2 - (y - 220) * 0.0), 0, 1, 50, "fine", 0.4)
        for k in range(26):
            x = 176 + k * 16 + p.r.uniform(-3, 3)
            p.line([(x, y + 2), (x + p.r.uniform(-3, 3), y - 9)], "fine", 0.3)
    palm(p, 210, 300, 150, lean=0.12)
    palm(p, 250, 310, 120, lean=-0.18)
    palm(p, 520, 230, 90, lean=0.08)
    p.ellipse(330, 340, 170, 30, "ink")                                                    # the pond
    for rx in (26, 52, 84):
        p.ellipse(360, 342, rx, rx * 0.2, "accent" if rx == 52 else "fine")
    p.hatch([(180, 340), (220, 326), (440, 326), (490, 340), (440, 356), (220, 356)], angle=0, gap=4.5)
    for k in range(14):                                                                    # reeds
        x = 172 + k * 6 + p.r.uniform(-2, 2)
        p.line([(x, 352), (x + p.r.uniform(-6, 6), 318 + p.r.uniform(-8, 8))], "fine", 0.4)
    p.line([(420, 340), (468, 340), (460, 350), (428, 350), (420, 340)], "ink")             # paper boat
    p.line([(440, 340), (446, 318), (458, 338)], "ink")
    p.line([(470, 60), (492, 72), (482, 98), (462, 84), (470, 60)], "plum")                # a kite
    p.line([(470, 60), (482, 98)], "fine"); p.line([(462, 84), (492, 72)], "fine")
    p.curve(lambda t: (482 - 60 * t, 98 + 120 * t + math.sin(t * 12) * 6), 0, 1, 40, "fine", 0.3)
    return p


def dhaka():
    p = Pen(23)
    p.line([(20, 200), (580, 200)], "ink")
    x = 24
    while x < 576:                                                                         # skyline with windows
        w = p.r.choice([30, 38, 46, 54]); h = p.r.choice([60, 84, 102, 126, 70])
        if 268 < x < 330:
            x += 16; continue
        p.line([(x, 200), (x, 200 - h), (x + w, 200 - h), (x + w, 200)], "ink")
        for wy in range(200 - h + 10, 192, 14):
            for wx in range(x + 6, x + w - 8, 11):
                if p.r.random() < 0.55:
                    p.line([(wx, wy), (wx + 5, wy), (wx + 5, wy + 6), (wx, wy + 6), (wx, wy)], "fine", 0.2)
        if p.r.random() < 0.5:
            p.hatch([(x + w - 10, 200 - h), (x + w, 200 - h), (x + w, 200), (x + w - 10, 200)], angle=80, gap=3)
        x += w + p.r.choice([4, 8, 12])
    p.line([(180, 395), (292, 204)], "ink"); p.line([(420, 395), (308, 204)], "ink")       # the road
    for k in range(9):
        t0, t1 = k / 9, k / 9 + 0.05
        p.line([(300, 395 - 191 * t0), (300, 395 - 191 * t1)], "accent", 0.2)
    p.hatch([(180, 395), (292, 204), (240, 300)], angle=70, gap=6)
    for k in range(3):                                                                     # rickshaws
        cx, cy, s = 130 + k * 120, 330 - k * 50, 1 - k * 0.25
        p.ellipse(cx, cy, 12 * s, 12 * s, "ink"); p.ellipse(cx + 34 * s, cy, 12 * s, 12 * s, "ink")
        p.line([(cx, cy), (cx + 16 * s, cy - 26 * s), (cx + 34 * s, cy)], "fine")
        p.curve(lambda t, cx=cx, cy=cy, s=s: (cx + 10 * s + 22 * s * t, cy - 30 * s - math.sin(t * math.pi) * 16 * s), 0, 1, 14, "ink")
    p.curve(lambda t: (20 + 560 * t, 60 + math.sin(t * math.pi) * 34), 0, 1, 60, "fine", 0.3)   # wires
    p.curve(lambda t: (20 + 560 * t, 74 + math.sin(t * math.pi) * 30), 0, 1, 60, "fine", 0.3)
    for k in range(5):
        x0 = 60 + k * 110
        p.line([(x0, 40), (x0 + 4, 200)], "fine", 0.3)
    return p


def not_knowing():
    p = Pen(37)
    p.line([(40, 320), (560, 320)], "ink")                                                 # the desk
    p.hatch([(40, 320), (560, 320), (560, 360), (40, 360)], angle=10, gap=6)
    page = [(200, 60), (400, 70), (392, 300), (190, 292)]                                  # a blank page, a little crooked
    p.line(page + [(200, 60)], "ink")
    for k in range(1, 9):
        y = 60 + k * 25
        p.line([(214, y + k * 0.6), (384, y + 8 + k * 0.6)], "fine", 0.2)
    p.curve(lambda t: (228 + 70 * t, 130 + math.sin(t * 14) * 6 * (1 - t)), 0, 0.7, 30, "accent", 0.4)   # a hesitant line that stops
    p.hatch([(392, 300), (400, 70), (410, 80), (402, 306)], angle=80, gap=3)
    p.line([(460, 300), (540, 196)], "ink"); p.line([(468, 306), (548, 202)], "ink")       # a pencil
    p.line([(540, 196), (548, 202), (556, 186), (540, 196)], "plum")
    p.line([(460, 300), (468, 306), (452, 312), (460, 300)], "ink")
    for cx, cy, r in [(96, 296), (130, 304), (78, 306)] and [(96, 296, 16), (130, 304, 12), (74, 308, 10)]:   # crumpled paper
        pts = [(cx + r * math.cos(a) * p.r.uniform(0.7, 1.1), cy + r * math.sin(a) * p.r.uniform(0.7, 1.1)) for a in [i * math.pi / 5 for i in range(11)]]
        p.line(pts, "ink", 0.6)
        for _ in range(4):
            a, b = p.r.choice(pts), p.r.choice(pts)
            p.line([a, b], "fine", 0.5)
    p.ellipse(500, 110, 26, 26, "fine")                                                    # a question mark moon
    p.curve(lambda t: (494 + 10 * math.cos(t), 104 + 10 * math.sin(t)), math.pi, 2.4 * math.pi, 20, "ink")
    p.line([(504, 114), (500, 124)], "ink"); p.line([(500, 130), (500, 132)], "ink")
    return p


def kolkata():
    p = Pen(53)
    for a, b in [((40, 40), (80, 40)), ((40, 40), (40, 80)), ((560, 40), (520, 40)), ((560, 40), (560, 80)),
                 ((40, 360), (80, 360)), ((40, 360), (40, 320)), ((560, 360), (520, 360)), ((560, 360), (560, 320))]:
        p.line([a, b], "accent", 0.2)                                                       # viewfinder
    p.line([(110, 320), (490, 320)], "ink")
    for off, layer in ((0, "ink"), (22, "ink"), (40, "fine")):                             # the gate's arches
        r = 110 - off
        p.line([(190 + off, 320), (190 + off, 196)], layer)
        p.line([(410 - off, 320), (410 - off, 196)], layer)
        p.curve(lambda t, r=r: (300 + r * math.cos(t), 196 - r * math.sin(t) * 0.95), math.pi, 0, 50, layer, 0.5)
    p.hatch([(190, 320), (190, 196), (212, 196), (212, 320)], angle=80, gap=3.5)
    p.hatch([(388, 320), (388, 196), (410, 196), (410, 320)], angle=80, gap=3.5)
    for k in range(6):                                                                     # brick courses
        y = 300 - k * 18
        p.line([(190, y), (212, y)], "fine", 0.2); p.line([(388, y), (410, y)], "fine", 0.2)
    p.line([(300, 320), (300, 268)], "ink")                                                # the statue on its plinth
    p.line([(278, 320), (278, 296), (322, 296), (322, 320)], "ink")
    p.curve(lambda t: (300 + 10 * math.cos(t), 252 + 14 * math.sin(t)), 0, 2 * math.pi, 24, "ink")
    p.line([(288, 268), (312, 268), (316, 296), (284, 296), (288, 268)], "fine")
    p.hatch([(284, 296), (288, 268), (300, 268), (298, 296)], angle=70, gap=2.5)
    for k in range(5):                                                                     # trees behind
        cx = 80 + k * 110 + (40 if k > 1 else 0)
        if 170 < cx < 430:
            continue
        for j in range(18):
            a = p.r.uniform(0, 2 * math.pi); rr = p.r.uniform(8, 30)
            p.line([(cx + math.cos(a) * rr, 250 + math.sin(a) * rr * 0.7), (cx + math.cos(a) * rr + 6, 250 + math.sin(a) * rr * 0.7 + 3)], "fine", 0.6)
        p.line([(cx, 320), (cx + 2, 270)], "ink")
    p.ellipse(300, 196, 6, 6, "plum")
    for k in range(5):                                                                     # the path in
        p.line([(300 - 30 - k * 30, 320 + k * 15), (300 + 30 + k * 30, 320 + k * 15)], "fine", 0.4)
    return p


def starting_over():
    p = Pen(71)
    p.curve(lambda t: (40 + 520 * t, 300 + math.sin(t * 7) * 10), 0, 1, 80, "fine", 0.6)  # coastlines, loosely
    p.curve(lambda t: (60 + 500 * t, 110 + math.sin(t * 5 + 1) * 12), 0, 1, 80, "fine", 0.6)
    p.hatch([(40, 300), (560, 300), (560, 340), (40, 340)], angle=0, gap=7, layer="hatch")
    route = [(500, 250), (470, 240), (440, 244), (380, 200), (300, 150), (250, 140), (200, 132), (160, 150), (120, 168)]
    p.curve(lambda t: route[min(len(route) - 1, int(t * (len(route) - 1)))], 0, 1, 1, "accent")
    pts = []
    for i in range(len(route) - 1):
        (x0, y0), (x1, y1) = route[i], route[i + 1]
        for k in range(8):
            pts.append((x0 + (x1 - x0) * k / 8, y0 + (y1 - y0) * k / 8))
    p.layers["accent"] = []
    for i in range(0, len(pts) - 1, 2):                                                    # a dashed route
        p.line([pts[i], pts[i + 1]], "accent", 0.2)
    for (cx, cy, r) in [(500, 250, 6), (440, 244, 5), (250, 140, 6)]:
        p.ellipse(cx, cy, r, r, "ink")
    p.ellipse(120, 168, 9, 9, "plum")
    p.line([(96, 236), (146, 236), (146, 280), (96, 280), (96, 236)], "ink")              # a suitcase
    p.line([(112, 236), (112, 228), (130, 228), (130, 236)], "ink")
    p.hatch([(96, 260), (146, 260), (146, 280), (96, 280)], angle=45, gap=4)
    p.line([(470, 80), (520, 80)], "fine"); p.line([(495, 60), (495, 100)], "fine")        # a compass
    p.ellipse(495, 80, 18, 18, "fine")
    p.line([(495, 66), (500, 80), (495, 94), (490, 80), (495, 66)], "ink")
    return p


def design_engineer():
    p = Pen(89)
    p.line([(60, 50), (370, 50), (370, 350), (60, 350), (60, 50)], "ink")                 # a frame on the canvas
    p.line([(60, 82), (370, 82)], "fine")
    for k in range(3):
        p.ellipse(76 + k * 12, 66, 3.5, 3.5, "fine")
    p.line([(90, 110), (340, 110), (340, 180), (90, 180), (90, 110)], "plum")
    p.hatch([(90, 110), (340, 110), (340, 180), (90, 180)], angle=30, gap=7)
    for k, w in enumerate([210, 170, 190, 120]):
        p.line([(90, 206 + k * 20), (90 + w, 206 + k * 20)], "fine", 0.2)
    p.line([(90, 300), (200, 300), (200, 330), (90, 330), (90, 300)], "accent")
    p.line([(290, 306), (336, 306), (336, 326), (290, 326), (290, 306)], "ink")
    p.ellipse(326, 316, 7, 7, "accent")
    for k in range(-1, 9):                                                                 # selection handles
        pass
    for x, y in [(90, 110), (340, 110), (90, 180), (340, 180)]:
        p.line([(x - 4, y - 4), (x + 4, y - 4), (x + 4, y + 4), (x - 4, y + 4), (x - 4, y - 4)], "accent", 0.1)
    p.line([(352, 196), (352, 232), (362, 222), (370, 240), (376, 237), (368, 220), (382, 220), (352, 196)], "ink", 0.2)   # cursor
    p.line([(440, 150), (404, 200), (440, 250)], "accent"); p.line([(500, 150), (536, 200), (500, 250)], "accent")       # </>
    p.line([(482, 136), (458, 264)], "accent")
    for k in range(6):                                                                     # lines of code
        p.line([(410, 290 + k * 12), (410 + p.r.choice([60, 90, 120, 40]), 290 + k * 12)], "fine", 0.2)
    return p


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in [("narikelbari", narikelbari), ("dhaka", dhaka), ("not-knowing", not_knowing),
                     ("kolkata", kolkata), ("starting-over", starting_over), ("design-engineer", design_engineer)]:
        svg = fn().svg()
        (OUT / f"{name}.svg.html").write_text(svg)
        print(f"{name}: {svg.count('<path')} paths, {len(svg) / 1024:.0f} KB")
