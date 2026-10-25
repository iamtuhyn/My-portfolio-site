"""One-page resume in the FRAMES design language → site/assets/Joacim-Tuhin-Gain-Resume.pdf

    python3 site/tools/resume.py      (needs ReportLab)
Fonts: Young Serif + Space Mono (SIL Open Font License), in site/tools/fonts/.
"""
from pathlib import Path

from reportlab.lib.colors import HexColor
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

HERE = Path(__file__).resolve().parent
OUT = HERE.parent / "assets" / "Joacim-Tuhin-Gain-Resume.pdf"
for name, file in [("Serif", "YoungSerif-Regular.ttf"), ("Mono", "SpaceMono-Regular.ttf"), ("MonoB", "SpaceMono-Bold.ttf")]:
    pdfmetrics.registerFont(TTFont(name, str(HERE / "fonts" / file)))

INK, PAPER, MUTED, LINE = HexColor("#16141a"), HexColor("#FAF6EE"), HexColor("#6f6878"), HexColor("#d9d2c4")
PLUM, MINT, MINT_D = HexColor("#593c8f"), HexColor("#A8D5BA"), HexColor("#2f7a57")
W, H = A4
M = 40


def wrap(c, text, font, size, width):
    words, lines, cur = text.split(), [], ""
    for w in words:
        t = (cur + " " + w).strip()
        if c.stringWidth(t, font, size) <= width:
            cur = t
        else:
            lines.append(cur); cur = w
    if cur:
        lines.append(cur)
    return lines


def para(c, x, y, text, font="Mono", size=7.6, width=300, lead=11, color=INK):
    c.setFont(font, size); c.setFillColor(color)
    for line in wrap(c, text, font, size, width):
        c.drawString(x, y, line); y -= lead
    return y


def label(c, x, y, text, color=MUTED):
    c.setFont("MonoB", 6.4); c.setFillColor(color)
    c.drawString(x, y, text.upper())


def crop_marks(c, x, y, w, h, s=7, color=PLUM):
    c.setStrokeColor(color); c.setLineWidth(1)
    for (px, py, dx, dy) in [(x, y + h, 1, -1), (x + w, y + h, -1, -1), (x, y, 1, 1), (x + w, y, -1, 1)]:
        c.line(px, py, px + dx * s, py); c.line(px, py, px, py + dy * s)


def cube(c, x, y, size, color=INK):
    """The J·T·G cube: three faces, a letter cut out of each (drawn in paper colour)."""
    faces = {  # (origin, u-vector, v-vector) in a 100-unit box, y up
        "J": ((11, 72.5), (39, 22.5), (39, -22.5)),
        "T": ((11, 72.5), (39, -22.5), (0, -45)),
        "G": ((50, 50), (39, 22.5), (0, -45)),
    }
    letters = {
        "J": [(30, 16, 54, 17), (62, 16, 22, 68), (16, 67, 68, 17), (16, 50, 20, 34)],
        "T": [(16, 16, 68, 20), (40, 16, 20, 68)],
        "G": [(16, 16, 68, 17), (16, 16, 20, 68), (16, 67, 68, 17), (64, 48, 20, 36), (48, 48, 36, 15)],
    }
    k = size / 100
    def P(o, u, v, a, b):  # a, b in 0..100 face space
        return (x + (o[0] + u[0] * a / 100 + v[0] * b / 100) * k, y + (o[1] + u[1] * a / 100 + v[1] * b / 100) * k)
    for f, (o, u, v) in faces.items():
        p = c.beginPath()
        for i, (a, b) in enumerate([(5, 5), (95, 5), (95, 95), (5, 95)]):
            (p.moveTo if i == 0 else p.lineTo)(*P(o, u, v, a, b))
        p.close(); c.setFillColor(color); c.drawPath(p, stroke=0, fill=1)
        for (rx, ry, rw, rh) in letters[f]:
            q = c.beginPath()
            for i, (a, b) in enumerate([(rx, ry), (rx + rw, ry), (rx + rw, ry + rh), (rx, ry + rh)]):
                (q.moveTo if i == 0 else q.lineTo)(*P(o, u, v, a, b))
            q.close(); c.setFillColor(PAPER); c.drawPath(q, stroke=0, fill=1)


def build():
    OUT.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(OUT), pagesize=A4)
    c.setTitle("Joacim Tuhin Gain · Design Engineer · Resume")
    c.setAuthor("Joacim Tuhin Gain")
    c.setFillColor(PAPER); c.rect(0, 0, W, H, stroke=0, fill=1)
    c.setFillColor(HexColor("#e6dfd1"))                                   # the dotted canvas
    for gx in range(12, int(W), 14):
        for gy in range(12, int(H), 14):
            c.circle(gx, gy, 0.45, stroke=0, fill=1)

    # ── Header
    top = H - M
    cube(c, M, top - 50, 52)
    c.setFont("Serif", 30); c.setFillColor(INK)
    c.drawString(M + 66, top - 26, "Joacim Tuhin Gain")
    c.setFillColor(MINT); c.roundRect(M + 66, top - 50, 104, 15, 2, stroke=0, fill=1)
    c.setFont("MonoB", 7.4); c.setFillColor(INK); c.drawString(M + 72, top - 45.5, "DESIGN ENGINEER")
    c.setFont("Mono", 7.4); c.setFillColor(MUTED)
    c.drawString(M + 178, top - 45.5, "UX since 2016 · Clermont-Ferrand, France")
    c.setFont("Mono", 7.2); c.setFillColor(INK)
    rx = W - M
    for i, t in enumerate(["iamtuhyn@gmail.com", "+33 6 05 50 90 03", "linkedin.com/in/tuhyngain"]):
        c.drawRightString(rx, top - 41 - i * 11, t)
        if "linkedin" in t: c.linkURL("https://www.linkedin.com/in/tuhyngain", (rx - c.stringWidth(t, "Mono", 7.2), top - 43 - i * 11, rx, top - 34 - i * 11))
    c.setFont("Serif", 14); c.setFillColor(INK)
    c.drawString(M, top - 82, "I design interfaces, orchestrate AI, and ship the front end.")
    para(c, M, top - 98, "Ten years of UX across fintech, insurance, construction logistics and the circular economy: from a DVD menu in 2013 to enterprise eco-systems and AI-built prototypes. I frame the problem, design the system, and build what can be built.", size=7.6, width=W - 2 * M, lead=11, color=MUTED)
    c.setStrokeColor(LINE); c.setLineWidth(0.8); c.line(M, top - 126, W - M, top - 126)

    # ── Left: experience as a reel
    lx, lw = M, 318
    y = top - 146
    label(c, lx, y, "Experience · the reel"); y -= 16
    roles = [
        ("May 2024 – now", "Product Consultant, Unit Lead", "SELISE Digital Platforms · remote from France",
         ["Recyclium: led consumer UX for a blockchain-backed circular-economy platform, 0 → 1, five roles, PWA + web dashboards.",
          "GridOps: designed and built a working utility-management prototype in 8 hours with AI (Figma Make, Stitch, ChatGPT) for a revamp proposal.",
          "Product costing: turned a one-paragraph brief into five working modules with AI to align the team on requirements."], True),
        ("Feb 2022 – Apr 2024", "Senior UX Engineer, Unit Lead", "SELISE Digital Platforms",
         ["Led UX for a construction-logistics eco-system: LIM (plan), the CLM web app and two mobile apps (build), MoveIt (move in).",
          "Ran a design unit: critiques, planning, UX audits, presenting direction to senior stakeholders. One design language across five surfaces."], False),
        ("Mar 2016 – Jul 2019", "UX Engineer", "SELISE Rockin' Software",
         ["Fintech and insurance suite: wealth management, insurance, marketplace, talent portal, audit app, mobile wallet.",
          "Designed the first version of the construction-logistics system (2019) and an IoT car-exhibition guide."], False),
        ("Jul 2013 – Oct 2014", "Designer", "Tareque Masud Memorial Trust",
         ["Adam Surat, a film by Tareque Masud: post-production, the interactive DVD menus (my first interface), book design and cover."], False),
    ]
    for when, role, org, bullets, now in roles:
        y0 = y
        c.setFont("Mono", 6.6); c.setFillColor(MUTED); c.drawString(lx + 10, y, when.upper())
        y -= 13
        c.setFont("Serif", 11.5); c.setFillColor(INK); c.drawString(lx + 10, y, role)
        y -= 11
        c.setFont("Mono", 7); c.setFillColor(PLUM if now else MUTED); c.drawString(lx + 10, y, org)
        y -= 12
        for b in bullets:
            c.setFillColor(MINT_D); c.rect(lx + 10, y + 2, 3, 3, stroke=0, fill=1)
            y = para(c, lx + 18, y, b, size=7.4, width=lw - 24, lead=10.6)
            y -= 2
        c.setStrokeColor(MINT if now else LINE); c.setLineWidth(2 if now else 1)
        c.line(lx, y0 + 6, lx, y + 6)                                    # the clip on the track
        if now:
            crop_marks(c, lx - 4, y + 2, lw + 4, y0 - y + 12)
        y -= 16

    # ── Highlights: a row of frames above the timeline
    hy = M + 66
    stats = [("10", "years in UX, since 2016"), ("5", "surfaces in one logistics eco-system"), ("0 → 1", "products from one-line briefs"), ("8 h", "from brief to a working AI-built prototype")]
    cw = (W - 2 * M - 3 * 10) / 4
    for i, (n, t) in enumerate(stats):
        bx = M + i * (cw + 10)
        c.setFillColor(HexColor("#f1ebdf")); c.roundRect(bx, hy, cw, 46, 4, stroke=0, fill=1)
        crop_marks(c, bx, hy, cw, 46, 5, MINT_D)
        c.setFont("MonoB" if "→" in n else "Serif", 15 if "→" in n else 18); c.setFillColor(PLUM); c.drawString(bx + 10, hy + 24, n)
        para(c, bx + 10, hy + 12, t, size=6.2, width=cw - 18, lead=8, color=MUTED)

    # ── Right column
    rx0, rw = M + lw + 26, W - 2 * M - lw - 26
    y = top - 146
    label(c, rx0, y, "Selected case studies"); y -= 14
    for title, line in [("From plan to move-in", "A construction-logistics eco-system: LIM, CLM web + mobile, MoveIt."),
                        ("Designing a habit", "Recyclium: a one-sentence brief became a five-role product."),
                        ("A pitch in 8 hours", "GridOps: a clickable product instead of slides, built with AI.")]:
        c.setFont("Serif", 10); c.setFillColor(INK); c.drawString(rx0, y, title); y -= 10
        y = para(c, rx0, y, line, size=6.8, width=rw, lead=9, color=MUTED) - 5
    y -= 4
    label(c, rx0, y, "How I work"); y -= 13
    for i, (h, t) in enumerate([("Frame", "research, benchmark, requirements"), ("Generate", "Figma Make, Claude, Stitch"),
                                ("Judge", "compare, validate, cut"), ("Ship", "a prototype, or the front end")]):
        c.setFillColor(MINT); c.roundRect(rx0, y - 3, 14, 11, 2, stroke=0, fill=1)
        c.setFont("MonoB", 6.4); c.setFillColor(INK); c.drawCentredString(rx0 + 7, y, f"0{i + 1}")
        c.setFont("MonoB", 7); c.drawString(rx0 + 20, y, h)
        c.setFont("Mono", 6.3); c.setFillColor(MUTED); c.drawString(rx0 + 58, y, t)
        y -= 13
    y -= 6
    label(c, rx0, y, "Skills"); y -= 12
    y = para(c, rx0, y, "Product discovery · UX strategy · information architecture · interaction design · design systems · prototyping · UX audits & heuristics · requirement engineering · leading design teams · AI-assisted design & front end",
             size=6.8, width=rw, lead=9.4) - 6
    label(c, rx0, y, "Tools"); y -= 12
    y = para(c, rx0, y, "Figma (Design, Make, FigJam) · Claude · ChatGPT · Google Stitch · GitHub · VS Code · Storybook · Miro · Notion · Illustrator · Photoshop · Premiere · After Effects · DaVinci Resolve",
             size=6.8, width=rw, lead=9.4) - 6
    label(c, rx0, y, "Education"); y -= 13
    for deg, school in [("Master's, Mass Communication and Videography", "Rabindra Bharati University, Kolkata · 2019–2021 · ICCR scholarship · A+"),
                        ("BA (Hons), Graphic Design & Multimedia", "Shanto-Mariam University of Creative Technology, Dhaka · 2012–2016")]:
        c.setFont("Serif", 8.6); c.setFillColor(INK)
        for ln in wrap(c, deg, "Serif", 8.6, rw):
            c.drawString(rx0, y, ln); y -= 10
        y = para(c, rx0, y, school, size=6.6, width=rw, lead=9, color=MUTED) - 5
    y -= 2
    label(c, rx0, y, "Languages"); y -= 12
    y = para(c, rx0, y, "English · Bangla (native) · French (learning) · German (basics)", size=6.8, width=rw, lead=9.4) - 6
    label(c, rx0, y, "Also"); y -= 12
    para(c, rx0, y, "Documentary filmmaker (The Journey of BOROLINE, TheatreSpace), photographer, graphic designer.", size=6.8, width=rw, lead=9.4, color=MUTED)

    # ── Footer: the timeline, Premiere-style
    fy = M + 18
    c.setStrokeColor(INK); c.setLineWidth(0.8); c.line(M, fy, W - M, fy)
    years = [(2006, "SSC"), (2008, "HSC"), (2010, "Diploma"), (2012, "BA"), (2013, "Adam Surat"), (2016, "SELISE"),
             (2019, "Master's"), (2022, "SELISE again"), (2024, "France"), (2026, "Now")]
    x0, x1 = M, W - M
    for i in range(0, 21):
        tx = x0 + (x1 - x0) * i / 20
        c.line(tx, fy, tx, fy + (5 if i % 2 == 0 else 2.5))
    for yr, lab in years:
        tx = x0 + (x1 - x0) * (yr - 2006) / 20
        c.setFillColor(PLUM if yr == 2026 else MINT_D); c.rect(tx - 1.6, fy - 1.6, 3.2, 3.2, stroke=0, fill=1)
        c.setFont("MonoB", 6); c.setFillColor(INK)
        if yr == 2026: c.drawRightString(tx + 2, fy + 9, str(yr))
        elif yr == 2006: c.drawString(tx - 2, fy + 9, str(yr))
        else: c.drawCentredString(tx, fy + 9, str(yr))
        c.setFont("Mono", 5.6); c.setFillColor(MUTED)
        if yr == 2026: c.drawRightString(tx + 2, fy - 10, lab)
        else: c.drawCentredString(tx, fy - 10, lab)
    c.setFont("Mono", 6); c.setFillColor(MUTED)
    c.drawString(M, M - 8, "FRAMES · the full story, case studies and a call booking live on my portfolio site.")
    c.drawRightString(W - M, M - 8, "© 2026 Joacim Tuhin Gain")
    c.showPage(); c.save()
    print("wrote", OUT)


if __name__ == "__main__":
    build()
