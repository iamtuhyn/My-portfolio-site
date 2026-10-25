"""Turn a photo into "line and form" line art (polygon mesh + hatching) for the story.

Points are concentrated along the photo's edges, connected with a Delaunay mesh,
and darker triangles get hatch lines. The result is a handful of long SVG paths
(pathLength="1") that draw themselves on scroll, left to right.

    python3 site/tools/line_art.py photo.jpg out.svg.html --points 1100
Needs Pillow, NumPy and SciPy.
"""
import argparse
import math

import numpy as np
from PIL import Image, ImageFilter, ImageOps
from scipy.spatial import Delaunay

W, H = 600, 400


def load(path, focus_y=0.5):
    im = ImageOps.exif_transpose(Image.open(path)).convert("L")
    s = max(W / im.width, H / im.height)
    im = im.resize((round(im.width * s), round(im.height * s)), Image.LANCZOS)
    left = (im.width - W) // 2
    top = int((im.height - H) * focus_y)
    return im.crop((left, top, left + W, top + H))


def build(path, n_points=1100, seed=7, focus_y=0.5, groups=26, hatch=True, edge_keep=0.16):
    rng = np.random.default_rng(seed)
    gray = ImageOps.autocontrast(load(path, focus_y), cutoff=2)
    lum = np.asarray(gray, dtype=float) / 255
    edges = np.asarray(gray.filter(ImageFilter.GaussianBlur(1.2)).filter(ImageFilter.FIND_EDGES), dtype=float)
    edges = edges / (edges.max() or 1)
    weight = edges ** 2 + 0.004
    weight /= weight.sum()
    idx = rng.choice(W * H, size=n_points, replace=False, p=weight.ravel())
    pts = np.column_stack([idx % W, idx // W]).astype(float)
    border = [(x, 0) for x in range(0, W + 1, 60)] + [(x, H) for x in range(0, W + 1, 60)] + \
             [(0, y) for y in range(0, H + 1, 50)] + [(W, y) for y in range(0, H + 1, 50)]
    pts = np.vstack([pts, np.array(border, dtype=float)])
    tri = Delaunay(pts)

    segs = set()
    hatches = []
    for a, b, c in tri.simplices:
        for u, v in ((a, b), (b, c), (c, a)):
            segs.add((min(u, v), max(u, v)))
        if not hatch:
            continue
        P = pts[[a, b, c]]
        cx, cy = P.mean(axis=0)
        dark = 1 - lum[min(H - 1, int(cy)), min(W - 1, int(cx))]
        k = int(dark * 6) - 2                         # 0–4 hatch lines: tone comes from hatching
        if k <= 0:
            continue
        ang = math.radians(35)
        d = np.array([math.cos(ang), math.sin(ang)])
        nrm = np.array([-d[1], d[0]])
        proj = P @ nrm
        for i in range(1, k + 1):
            off = proj.min() + (proj.max() - proj.min()) * i / (k + 1)
            hits = []
            for p, q in ((P[0], P[1]), (P[1], P[2]), (P[2], P[0])):
                pp, qq = p @ nrm, q @ nrm
                if (pp - off) * (qq - off) < 0:
                    t = (off - pp) / (qq - pp)
                    hits.append(p + (q - p) * t)
            if len(hits) == 2:
                hatches.append((hits[0], hits[1]))

    def chunks(lines, n):
        lines.sort(key=lambda s: (s[0][0] + s[1][0]) / 2)        # left → right
        size = max(1, math.ceil(len(lines) / n))
        for i in range(0, len(lines), size):
            yield lines[i:i + size]

    def d_of(lines):
        return " ".join(f"M{p[0]:.1f} {p[1]:.1f}L{q[0]:.1f} {q[1]:.1f}" for p, q in lines)

    def along(u, v, n=6):                               # mean edge strength along a segment
        p, q = pts[u], pts[v]
        return np.mean([edges[int(min(H - 1, p[1] + (q[1] - p[1]) * t)), int(min(W - 1, p[0] + (q[0] - p[0]) * t))]
                        for t in np.linspace(0, 1, n)])
    # keep only lines that follow real edges in the photo: the subject's outline emerges
    mesh = [(pts[u], pts[v]) for u, v in segs if along(u, v) > edge_keep]
    out = [f'<path class="fine" d="{d_of(g)}" pathLength="1"/>' for g in chunks(mesh, groups)]
    out += [f'<path class="hatch" d="{d_of(g)}" pathLength="1"/>' for g in chunks(hatches, max(4, groups // 3))]
    return "\n".join(out)


if __name__ == "__main__":
    ap = argparse.ArgumentParser()
    ap.add_argument("photo")
    ap.add_argument("out")
    ap.add_argument("--points", type=int, default=1100)
    ap.add_argument("--focus", type=float, default=0.5)
    args = ap.parse_args()
    svg = build(args.photo, args.points, focus_y=args.focus)
    open(args.out, "w").write(svg)
    print(f"{svg.count('<path')} paths, {len(svg) / 1024:.0f} KB")
