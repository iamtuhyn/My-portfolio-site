"""Build web-ready media for the site from the original portfolio folders.

Originals are never modified. Output goes to site/assets/img/ (WebP) and
site/assets/video/ (MP4). Run from anywhere:

    python3 site/tools/build_images.py

Needs Pillow; PyMuPDF for writing covers; ffmpeg (on PATH, or via the
imageio-ffmpeg package) for the GIF/AVI/WMV → MP4 conversions.
"""
import fnmatch
import shutil
import subprocess
from pathlib import Path

from PIL import Image, ImageChops, ImageFilter

Image.MAX_IMAGE_PIXELS = None

ROOT = Path(__file__).resolve().parents[2]          # My_Portfolio/
OUT = ROOT / "site" / "assets" / "img"
VOUT = ROOT / "site" / "assets" / "video"
UX = ROOT / "My works" / "01 - main - UX"
CS1 = UX / "Case Study 1 - Recyclium - 2025"
CS2 = UX / "Case Study 2 - Construction Logistics Management 2022-present"
HUB = next(CS2.glob("CLM Hub Mobile App*"))
SITE_APP = next(CS2.glob("CLM Mobile app*"))
LIM = CS2 / "LIM - WebApp Screenshots"
MOVEIT = CS2 / "MoveIt - WebApp Screenshots"
DOCS = ROOT / "My works" / "02 - Documentaries"
GFX = ROOT / "My works" / "03 Graphics"
PHOTO = ROOT / "My works" / "04 Photography"
FLASH = ROOT / "My works" / "05 Flash Animations- 2015"
LIFE = ROOT / "My life's photos"
INS = UX / "UX - Web app (Insurance & Finance) - 2017"
TEL = UX / "UX -Web App (Telecom) - 2018"
CON = UX / "UX -Web App (Constructions & Logistics) - 2019"
WEB16 = UX / "UX -Website - 2016"
MINE = UX / "GlenCore 2022"
FLEET = UX / "LafargeHolcim_Pitch 2022"
HERO = ROOT / "Hero section"
GRIDOPS_PITCH = HERO / "WZPDC Pitch 2022-2026.jpg"
CLM_WEB = CS2 / "CLM Web screens"
OLD_UTILITY = UX / "Case Study 3 - PowerGrip web app" / "Old site"

# ── CLM web app screens (2× exports). The client logo sits in the header's right cell
#    (≈128 px tall at 2×): masked per file below, with any extra boxes in source pixels.
CLM_WEB_SCREENS = {
    "clm/web-cockpit": ("Cockpit.png", []),
    "clm/web-login": ("Login Page.png", ("only", [(2110, 588, 2560, 646), (2290, 1668, 2560, 1716)])),   # client email + web address
    "clm/web-status": ("Overview - Status Overview.png", []),
    "clm/web-logistics": ("Overview - Logistics.png", []),
    "clm/web-equipment": ("Overview - Equipment.png", []),
    "clm/web-performance": ("Overview - Performance.png", []),
    "clm/web-glossary": ("Overview - KPI Glossary.png", []),
    "clm/web-packages": ("Shipments - Working packages 01.png", []),
    "clm/web-packages-list": ("Shipments - Working packages 02.png", []),
    "clm/web-gantt": ("Shipments - Working packages Gantt chart.png", []),
    "clm/web-gantt-drawer": ("Shipments - Working packages Gantt chart - details right drawer.png", []),
    "clm/web-shipment": ("Shipments - Details.png", [(2650, 180, 2800, 260)]),   # partner logo
    "clm/web-sender": ("Shipments - Sender Team.png", []),
    "clm/web-create-1": ("Shipment Creation 1.png", []),
    "clm/web-create-2": ("Shipment Creation 2.png", []),
    "clm/web-create-3": ("Shipment Creation 3.png", []),
    "clm/web-create-4": ("Shipment Creation 4.png", []),
    "clm/web-create-5": ("Shipment Creation 5.png", []),
    "clm/web-booking-1": ("Equipment booking 01.png", "amberg"),
    "clm/web-booking-2": ("Equipment booking 02.png", "amberg"),
    "clm/web-booking-3": ("Equipment booking 03.png", "amberg"),
    "clm/web-booking-4": ("Equipment booking 04.png", "amberg"),
    "clm/web-booking-5": ("Equipment booking 05.png", "amberg"),
    "clm/web-site": ("Site.png", []),
    "clm/web-zone": ("Site - zone update.png", []),
    "clm/web-waiting": ("Site - Waiting area details.png", []),
}

# ── The utility's old self-service site (GridOps "before"), white-labelled: (file, fractional masks)
OLD_UTILITY_SHOTS = {
    "work/gridops-old-login": ("Screenshot 2026-10-07 at 12.19.37\u202fAM.png", [(0.45, 0.265, 0.55, 0.405, 0.4, 0.3)]),
    "work/gridops-old-form": ("Screenshot 2026-10-07 at 12.22.37\u202fAM.png", [(0.005, 0.0, 0.09, 0.105, "blur"), (0.0, 0.93, 0.238, 1.0, 0.1, 0.92)]),
    "work/gridops-old-pay": ("Screenshot 2026-10-07 at 12.23.11\u202fAM.png", [(0.005, 0.0, 0.09, 0.105, "blur"), (0.0, 0.93, 0.238, 1.0, 0.1, 0.92)]),
    "work/gridops-old-portal": ("Screenshot 2026-10-07 at 12.23.35\u202fAM.png", [(0.1, 0.12, 0.73, 0.26, "blur"), (0.1, 0.005, 0.255, 0.055, "blur"),
                                                                              (0.39, 0.012, 0.46, 0.05, "blur"), (0.59, 0.32, 0.75, 0.375, "blur")]),
}

# ── Single images: output name → (source, max width)
SINGLES = {
    # Case study 02
    "clm/lim-login": (LIM / "Login Page.png", 1800),
    "clm/lim-projects": (LIM / "Desktop - 14.png", 1800),
    "clm/lim-overview": (LIM / "Desktop - 10.png", 1800),
    "clm/lim-org": (LIM / "Project - Organization.png", 1800),
    "clm/lim-report": (LIM / "Project - Report.png", 1800),
    "clm/lim-map": (LIM / "Monthly.png", 1800),
    "clm/lim-floorplan": (LIM / "Monthly@2x-1.png", 1800),
    "clm/lim-gantt": (LIM / "Monthly@2x-2.png", 1800),
    "clm/lim-gantt-year": (LIM / "Yearly.png", 1800),
    "clm/lim-teams": (LIM / "Teams.png", 1800),
    "clm/kpi-glossary": (UX / "AI-integrated projects/Designed in 30mins using AI.png", 1400),
    "clm/site-shipments": (SITE_APP / "Shipments Page.png", 800),
    "clm/hub-splash": (HUB / "Splash.png", 700),
    "clm/hub-login": (HUB / "Login.png", 700),
    "clm/hub-home": (HUB / "Shipments home.png", 700),
    "clm/hub-scan": (HUB / "Scanning page.png", 700),
    "clm/hub-storage": (HUB / "Storage.png", 700),
    "clm/hub-location": (HUB / "Storage ex..png", 700),
    "clm/hub-assign": (HUB / "Assign Locations-2.png", 700),
    "clm/hub-split": (HUB / "Assign Locations.png", 700),
    "clm/hub-not-arrived": (HUB / "Mark not Arrived.png", 700),
    "clm/hub-putaway": (HUB / "Put Away.png", 700),
    "clm/hub-form": (HUB / "Generic Form.png", 700),
    "clm/hub-annotation": (HUB / "Shipments Page-1.png", 700),
    "clm/moveit-destination": (MOVEIT / "Destination.png", 1800),
    "clm/moveit-destination-2": (MOVEIT / "Destination-2.png", 1800),
    "clm/moveit-device": (MOVEIT / "Device Details.png", 1800),
    "clm/moveit-devices": (MOVEIT / "Device list.png", 1800),
    "clm/moveit-projects": (MOVEIT / "Project.png", 1800),
    "clm/moveit-tracking": (MOVEIT / "Tracking table 2.png", 1800),
    "clm/moveit-tracking-3": (MOVEIT / "Tracking table 3.png", 1800),
    "clm/2019-landing": (CON / "2 Landing page.png", 1800),
    "clm/2019-zone": (CON / "3.1 CZ-East Zone.jpg", 1800),
    "clm/2019-bundle": (CON / "10 Gate West Bundle_Compare.png", 1800),
    # Case study 01: whole desktop screens
    "recyclium/producer-dashboard": (CS1 / "Producer role/Producer's Dashboard.png", 1800),
    # Adam Surat
    "adam-surat/menu": (DOCS / "Adam Surat/Main-Menu.jpg", 1400),
    "adam-surat/play": (DOCS / "Adam Surat/Play-movie.jpg", 1400),
    "adam-surat/paintings": (DOCS / "Adam Surat/Paintings-fullview.jpg", 1400),
    "adam-surat/letter": (DOCS / "Adam Surat/Letter-fullview.jpg", 1400),
    "adam-surat/drawing": (DOCS / "Adam Surat/Charcoal-&-Ink-Drawing-fullview.jpg", 1400),
    "adam-surat/sultan": (DOCS / "Adam Surat/Sultan-Exclusives-fullview.jpg", 1400),
    "adam-surat/poster": (DOCS / "Adam Surat/Poster-for-Adam-Surot.jpg", 1400),
    "adam-surat/book": (DOCS / "Adam Surat/P_20200124_202820.jpg", 1200),
    "adam-surat/dedication": (DOCS / "Adam Surat/P_20200124_202949.jpg", 1200),
    "adam-surat/team": (DOCS / "Adam Surat/Team photo/FB_IMG_1608268982117.jpg", 1400),
    "adam-surat/packaging": (GFX / "Adam Surat 1.jpg", 1200),
    # Documentaries & life
    "docs/theatre-1": (DOCS / "TheatreSpace - Amal Alo (2021)/IMG_8225-01.jpeg", 1400),
    "docs/theatre-2": (DOCS / "TheatreSpace - Amal Alo (2021)/IMG_20210121_124638666-02-01.jpeg", 1400),
    "docs/on-set": (DOCS / "IMG-20210121-WA0017-01.jpeg", 1000),
    "life/rbu": (LIFE / "Rabindra Bharati University_entrance_Statue of Rabindranath Tagore.jpg", 1800),
    "life/selise-2018": (LIFE / "At SELISE - 2018.JPG", 1000),
    "life/kolkata-friends": (LIFE / "IMG-20200127-WA0015.jpg", 1400),
    # Graphics
    "gfx/rickshaw-logo": (GFX / "Branding -Set 1 - 2014/1 Rick Logo.jpg", 1000),
    "gfx/rickshaw-cd": (GFX / "Branding -Set 1 - 2014/5 Rick CD Level.jpg", 1000),
    "gfx/rongin-admission": (GFX / "Branding -Set 2 - 2014/12.jpg", 1000),
    "gfx/rongin-guide": (GFX / "Branding -Set 2 - 2014/3.jpg", 1000),
    "gfx/coffee-hub-logo": (GFX / "my graphic design/Logo Moc.jpg", 1200),
    "gfx/coffee-hub-billboard": (GFX / "my graphic design/Music billboard.jpg", 1200),
    "gfx/coffee-hub-magazine": (GFX / "my graphic design/Magazine add.jpg", 1200),
    "gfx/mother-language-day": (GFX / "my graphic design/P_20200221_113913.jpg", 1200),
    "gfx/independence-day": (GFX / "my graphic design/28.jpg", 1200),
    "gfx/victory-day": (GFX / "my graphic design/Victory day.jpg", 1200),
    "gfx/new-year-2015": (GFX / "my graphic design/1.jpg", 1200),
    "gfx/football": (GFX / "my graphic design/Posters_Football game.jpg", 1000),
    "gfx/tareque-festival": (GFX / "FB_IMG_1575353124017.jpg", 1000),
    # Photography & drawings
    "photo/theatre-red": (PHOTO / "20210114202555_IMG_8148-01.jpeg", 1800),
    "photo/theatre-floor": (PHOTO / "20210114210737_IMG_8180_1-01.jpeg", 1800),
    "photo/palms": (PHOTO / "FB_IMG_1585837657683.jpg", 1800),
    "photo/hills-mist": (PHOTO / "FB_IMG_1585837839640.jpg", 1800),
    "photo/dusk-bridge": (PHOTO / "FB_IMG_1585837872411.jpg", 1800),
    "photo/himalaya": (PHOTO / "IMG-20201201-WA0005~2-01.jpeg", 1800),
    "photo/ridge": (PHOTO / "IMG_20201128_131655669.jpg", 1800),
    "photo/lock": (PHOTO / "P_20190922_162725_1_1_1_1_1.jpg", 1400),
    "photo/figure": (PHOTO / "P_20190916_094632_1.jpg", 1400),
    "draw/portrait": (PHOTO / "FB_IMG_1589124867468.jpg", 1400),
    "draw/calligraphy": (ROOT / "My works/06 Drawings/P_20190625_023046.jpg", 1000),
}

SITE_APP_SHOTS = {   # the CLM site-manager app (receive, check, confirm)
    "clm/site-details": "Shipments/Details.png", "clm/site-annotation": "Shipments/Annotation.png",
    "clm/site-handover": "Shipments/Handovers Details.png", "clm/site-handover-2": "Shipments/Handovers Details-1.png",
    "clm/site-booking": "Equipment Booking.png",
}
for _k, _v in SITE_APP_SHOTS.items():
    SINGLES[_k] = (SITE_APP / _v, 700)

# ── Graphic-design sets for /more (each opens as a gallery)
GFX_SETS = {
    "gfx/set-rickshaw": [GFX / "Branding -Set 1 - 2014" / f for f in ["1 Rick Logo.jpg", "2 Rick B. Card.jpg", "2a Rick I Card.jpg", "3 Rick LetterHead.jpg", "4 Rick Envelope.jpg", "5 Rick CD Level.jpg", "6 Rick brochure.jpg", "7 Rick Calender.jpg"]],
    "gfx/set-ronggin": [GFX / "Branding -Set 2 - 2014/Selected" / f"{n}.jpg" for n in [2, 3, 4, 5, 10, 6, 7, 8, 9, 11]],
    "gfx/set-coffee-hub": [GFX / "my graphic design" / f for f in ["Logo Moc.jpg", "L head.jpg", "Mailing Envelope.jpg", "Magazine add.jpg", "Music billboard.jpg", "Posters_music Show.jpg", "Posters_Football game.jpg"]],
    "gfx/set-occasions": [GFX / "my graphic design" / f for f in ["P_20200221_113913.jpg", "28.jpg", "Indepedence day.jpg", "Victory day.jpg", "May day 1.jpg", "1.jpg", "New Year card.jpg"]],
    "gfx/set-catalyst": [GFX / "my graphic design" / f for f in ["14.jpg", "8.jpg"]],
    "gfx/set-collage": [GFX / "my graphic design" / "Each photo Created & Collaged by photoshop_2015.jpg"],
}

# ── Photography: (series, source). HEIC originals are converted first with macOS sips into lab/photo-jpg.
PHOTO_JPG = ROOT / "lab" / "photo-jpg"
PHOTOS = [
    ("small", PHOTO_JPG / "IMG_6503.jpg"),
    ("mono", PHOTO / "IMG-20201201-WA0005~2-01.jpeg"), ("stage", PHOTO / "20210114202555_IMG_8148-01.jpeg"), ("arch", PHOTO_JPG / "IMG_1964.jpg"),
    ("land", PHOTO / "FB_IMG_1585837657683.jpg"), ("mono", PHOTO_JPG / "IMG_3822.jpg"), ("stage", PHOTO / "PHOTO-2026-09-10-10-24-18.jpg"),
    ("arch", PHOTO_JPG / "IMG_3742.jpg"), ("small", PHOTO_JPG / "IMG_6523 2.jpg"), ("mono", PHOTO_JPG / "IMG_2062.jpg"),
    ("land", PHOTO / "FB_IMG_1585837839640.jpg"), ("arch", PHOTO_JPG / "IMG_1830.jpg"), ("mono", PHOTO_JPG / "IMG_5174.jpg"),
    ("stage", PHOTO / "20210114210737_IMG_8180_1-01.jpeg"), ("land", PHOTO_JPG / "IMG_6844 2.jpg"), ("arch", PHOTO_JPG / "IMG_1962.jpg"),
    ("mono", PHOTO_JPG / "IMG_1839.jpg"), ("small", PHOTO_JPG / "IMG_6080 2.jpg"), ("arch", PHOTO_JPG / "IMG_3726.jpg"),
    ("mono", PHOTO_JPG / "IMG_7406.jpg"), ("land", PHOTO / "FB_IMG_1585837872411.jpg"), ("arch", PHOTO_JPG / "IMG_4315.jpg"),
    ("mono", PHOTO_JPG / "IMG_4319.jpg"), ("small", PHOTO_JPG / "IMG_3956.jpg"), ("stage", PHOTO / "P_20190505_215717.jpg"),
    ("land", PHOTO / "IMG_20201128_131655669.jpg"), ("mono", PHOTO_JPG / "IMG_2431.jpg"), ("arch", PHOTO_JPG / "IMG_3905.jpg"),
    ("small", PHOTO_JPG / "IMG_2664.jpg"), ("mono", PHOTO_JPG / "IMG_5274.jpg"), ("land", PHOTO_JPG / "IMG_2649.jpg"),
    ("arch", PHOTO_JPG / "IMG_3428.jpg"), ("mono", PHOTO / "P_20190922_162725_1_1_1_1_1.jpg"), ("stage", PHOTO_JPG / "IMG_0741.jpg"),
    ("arch", PHOTO_JPG / "IMG_4179.jpg"), ("mono", PHOTO_JPG / "IMG_1808.jpg"), ("land", PHOTO / "FB_IMG_1585837854126.jpg"),
    ("small", PHOTO_JPG / "IMG_6311 2.jpg"), ("mono", PHOTO_JPG / "IMG_3468.jpg"), ("arch", PHOTO_JPG / "IMG_3557.jpg"),
    ("stage", PHOTO_JPG / "IMG_5151.jpg"), ("mono", PHOTO / "P_20190916_094632_1.jpg"), ("land", PHOTO_JPG / "IMG_7630.jpg"),
    ("mono", PHOTO_JPG / "IMG_8529.jpg"), ("arch", PHOTO_JPG / "IMG_4293.jpg"), ("mono", PHOTO_JPG / "IMG_4038.jpg"),
    ("land", PHOTO_JPG / "IMG_1711.jpg"), ("mono", PHOTO_JPG / "IMG_2141.jpg"), ("arch", PHOTO_JPG / "IMG_3631.jpg"),
    ("mono", PHOTO_JPG / "IMG_1901.jpg"), ("stage", PHOTO_JPG / "IMG_4217.jpg"), ("mono", PHOTO_JPG / "IMG_5202.jpg"),
]

# ── Galleries for /work modals: name → list of sources (→ name-01.webp, name-02.webp…)
GALLERIES = {
    "work/smart-parking": [WEB16 / f for f in ["1 Home.jpg", "2 Smart parking.jpg", "3.1 Our Solution_What Our Software.jpg", "3.2 Our Solution_Why The Benefits.jpg", "5 About us.jpg", "6 Contact Us.jpg"]],
    # browser tabs cropped off (they showed a personal email)
    "work/banners": [("crop", UX / "UX Web Banner - 2016" / f, (0, 0.08, 1, 1)) for f in ["Web_Banner 1.jpg", "Web_Banner 2.jpg", "Web_Banner 3.jpg"]],
    "work/gridops": [GRIDOPS_PITCH],
    "work/coffee-hub": [UX / "UX - Coffe hub website - 2016.webp"],
    "work/insurance": [INS / "1 Customer Portal" / f for f in ["SLSM 01-Landing.jpg", "SLSM 02.1-Find a solution.jpg", "SLSM 03.2-Receive Pricing-Breakdown.jpg", "SLSM 04-KYC Dashboard.jpg", "SLSM 07-KYC_Company Information.jpg", "SLSM 10-KYC_Upload Legal Documents.jpg", "SLSM 12-Awaiting for Approval.jpg", "SLSM 15.4-KYC Dashboard- Activity.jpg"]]
                    + [INS / "2 Admin Portal" / f for f in ["SLSM Admin 01.1-Ops.jpg", "SLSM Admin 03.1-Customers.jpg", "SLSM Admin 05.1-Approval.jpg", "SLSM Admin 06-Payment.jpg"]],
    "work/telecom": [TEL / f for f in [  # login screen skipped: client brand
        "Opt 2_Dashboard-Pt Employee _ Admin.jpg", "UPC 1-Mobile-Product-Selection.png", "UPC 3-mobile-package-selection-selected.png", "UPC 5-mobile-package-selection-modal-internet.png", "UPC _ My Company.png", "UPC _ My Project.png", "UPC _ Support.png", "Project Mgt flow.jpg"]],
    "work/profile": [UX / "UX - Profile setup - web app - 2018" / f for f in ["screen 01.png", "screen 02.png", "screen 03.png"]],
    "work/construction-2019": [CON / f for f in ["1 Signin page.png", "2 Landing page.png", "2 Landing page_searchSuggetion.png", "3.1 CZ-East Zone.jpg", "3.1.3 CZ-East Zone Analysis Tab Before Change Graphical.jpg", "4.1 CZ-South Gate.png", "7 Gate West Details.png", "10 Gate West Bundle_Compare.png", "Unloading machinery (CRANE) Modal.png", "14.1 Vendor_Simillar.png"]],
    "work/boroline": [UX / "Proposed for Boroline - 2021" / f for f in ["The site design.jpg", "Banner.jpg"]],
    "work/farming": [UX / "UX 2022- Mobile app - Firming with iot that prevent risks like fire and more .jpg"],
    # Tall single-frame design boards: ("split", file) cuts them into separate screens
    "work/world-cup": [("split", UX / "UI - mobile app - World cup Russia - 2018/Design.gif")],
    "work/car-exhibition": [("split", UX / "UX - Mobile app - car exhibition guide app that interacts with nearby iot devices - 2019/Design.gif")],
    "work/mining": [MINE / f for f in ["Tracking page 03.png", "Shipments page 03.png", "Shipments page 02.png", "Tracking page 02.png", "Tracking page 04.png", "Alerts page 02.png", "Alerts page 03.png", "Shipments page 05.png"]],
    "work/fleet": [FLEET / f for f in ["13 Pro - 4.png", "13 Pro - 7.png", "13 Pro - 8.png", "13 Pro - 12.png", "13 Pro - 17.png"]],
}

# ── Individual phones cut out of the big Recyclium canvases: name → (canvas, index)
RC = CS1 / "Consumer role"
PICKS = {
    "recyclium/p-scan": (RC / "Consumer Onboarding.png", 0),
    "recyclium/p-reward-offer": (RC / "Consumer Onboarding.png", 1),
    "recyclium/p-get-started": (RC / "Consumer Onboarding.png", 2),
    "recyclium/p-about-you": (RC / "Consumer Onboarding.png", 3),
    "recyclium/p-secure": (RC / "Consumer Onboarding.png", 6),
    "recyclium/p-quiz-scan": (RC / "Scaned QR.png", 0),
    "recyclium/p-scanned": (RC / "Scaned QR.png", 1),
    "recyclium/p-mission": (RC / "Scaned QR.png", 4),
    "recyclium/p-aggregate": (RC / "Scaned QR.png", 7),
    "recyclium/p-confirmed": (RC / "Social Media Post.png", 0),
    "recyclium/p-share-mission": (RC / "Social Media Post.png", 3),
    "recyclium/p-tweet": (RC / "Social Media Post.png", 2),
    "recyclium/p-wallet": (RC / "Reward- Points and Vouchers.png", 0),
    "recyclium/p-claim": (RC / "Reward- Points and Vouchers.png", 1),
    "recyclium/p-share-search": (RC / "Reward- Points and Vouchers.png", 2),
    "recyclium/p-transfer": (RC / "Reward- Points and Vouchers.png", 3),
    "recyclium/p-vouchers": (RC / "Reward- Points and Vouchers.png", 4),
    "recyclium/p-leaderboard": (RC / "Gamification - Mission/Leaderboard/Achievements.png", 0),
    "recyclium/p-leaderboard-storers": (RC / "Gamification - Mission/Leaderboard/Achievements.png", 2),
    "recyclium/p-milestones": (RC / "Gamification - Mission/Leaderboard/Achievements.png", 3),
    "recyclium/p-warrior": (RC / "Gamification - Mission/Leaderboard/Achievements.png", 4),
    "recyclium/p-profile": (RC / "Become a Storer.png", 0),
    "recyclium/p-storer-setup": (RC / "Become a Storer.png", 1),
    "recyclium/p-storer-wait": (RC / "Become a Storer.png", 2),
    "recyclium/p-learning": (RC / "Learning.png", 0),
    "recyclium/p-quiz": (RC / "Learning.png", 3),
    "recyclium/p-quiz-done": (RC / "Learning.png", 4),
    "recyclium/p-invited": (RC / "Referrals.png", 2),
    "recyclium/p-awesome": (RC / "Referrals.png", 3),
    "recyclium/d-handover-1": (CS1 / "Producer role/Handover Request.png", 0),
    "recyclium/d-handover-2": (CS1 / "Producer role/Handover Request.png", 2),
    "recyclium/d-users": (CS1 / "Producer role/Add and Request User.png", 1),
}

# ── Videos: GIF / old formats → small looping MP4 (+ a poster frame)
VIDEOS = {
    "flash-water-drops": FLASH / "Water drops_Flash drawing & animation.avi",
    "flash-ant": FLASH / "Ant Animation.wmv",
}

# ── Clean full-size phone screens embedded in the Recyclium case-study PDF: name → image index
RECYCLIUM_PDF = CS1 / "Recyclium case study - consumer role.pdf"
PDF_SCREENS = {
    "recyclium/s-dashboard": 4, "recyclium/s-reward-offer": 3, "recyclium/s-camera": 5, "recyclium/s-item": 6,
    "recyclium/s-storers-map": 2, "recyclium/s-scan": 8, "recyclium/s-aggregate": 14, "recyclium/s-handover": 18,
    "recyclium/s-wallet": 11, "recyclium/s-transfer": 10, "recyclium/s-claim": 9, "recyclium/s-claimed": 37,
    "recyclium/s-share": 34, "recyclium/s-get-started": 24, "recyclium/s-about-you": 23, "recyclium/s-secure": 26,
    # 3D illustrations (on black) and the wordmark
    "recyclium/art-walker": 51, "recyclium/art-family": 0, "recyclium/art-hand-scan": 22,
    "recyclium/art-sharing": 33, "recyclium/art-shop": 43, "recyclium/logo": 13,
}

# ── Device mockups from the previous portfolio (joacim-portfolio.html), transparent PNGs, in order
OLD_SITE = ROOT / "joacim-portfolio.html"
OLD_MOCKUPS = ["recyclium/mock-imac", "recyclium/mock-macbook", "recyclium/mock-iphone", "recyclium/journey"]

# ── Landing viewfinder: one panel per era, each shown whole (never cropped)
HERO_PANELS = {
    "hero/era-1": PHOTO / "FB_IMG_1585837657683.jpg",           # Childhood
    "hero/era-2": DOCS / "Adam Surat/Main-Menu.jpg",            # 2013
    "hero/era-3": HERO / "SLSM - Receive Pricing 2016-2019.jpg", # 2016–2019
    "hero/era-4": GRIDOPS_PITCH,                                # 2022–present
}

# ── White-label masks: name or glob → boxes as fractions (x0, y0, x1, y1[, sx, sy]).
# Filled with the colour just left of the box, or at the optional sample point.
MASKS = {
    "clm/lim-gantt*": [(0.875, 0.02, 0.992, 0.085)],          # Amberg Loglay logo
    "clm/lim-map": [(0.875, 0.008, 0.992, 0.072)],
    "hero/era-4": [(0.01, 0.003, 0.19, 0.037, 0.25, 0.02)],                        # utility logo + name
    "work/gridops-01": [(0.01, 0.003, 0.19, 0.037, 0.25, 0.02)],
    "clm/lim-login": [(0.73, 0.365, 0.94, 0.4), (0.78, 0.955, 0.92, 0.99)],      # client email + web address
    "clm/lim-floorplan": [(0.875, 0.03, 0.992, 0.088)],
    "clm/lim-org": [(0.875, 0.008, 0.992, 0.072)],
    "clm/lim-report": [(0.875, 0.008, 0.992, 0.072)],
    "clm/kpi-glossary": [(0.835, 0.001, 0.985, 0.022), (0.205, 0.001, 0.355, 0.022)],
    "work/mining-*": [(0.0, 0.0, 0.215, 0.058, 0.3, 0.03), (0.725, 0.004, 0.905, 0.056)],  # logo + user name
    "work/fleet-01": [(0.62, 0.048, 0.99, 0.092, 0.45, 0.07)],                          # client logo
    "hero/*": [],
}

PDF_COVERS = {  # writing covers: (pdf, page index). Never the cover page: it shows student IDs.
    "writing/copywriting": ("Study & Writings/Copywriting - EFFICIENCY IN ADVERTISEMENT - BA.pdf", 1),
    "writing/copywriting-scripts": ("Study & Writings/CopyWriting - BA.pdf", 5),
    "writing/fakiri-gaan": ("Study & Writings/Fakiri Gaan in Bengal - Field Study Project - MA.pdf", 3),
    "writing/deathless-heart": ("Study & Writings/মৃত্যুঞ্জয়ী হৃদয় - MA.pdf", 1),
    "writing/rohingya": ("Study & Writings/Dissertation 01 - MA.pdf", 3),
}

MANIFEST_JS = ROOT / "site" / "assets" / "js" / "media.js"


def masks_for(name):
    return [b for pattern, boxes in MASKS.items() if fnmatch.fnmatch(name, pattern) for b in boxes]


def knockout(im: Image.Image, thresh=22) -> Image.Image:
    """Make the flat background around an object transparent (flood-filled from the corners)."""
    from PIL import ImageDraw
    rgb = im.convert("RGB")
    key = (255, 0, 255)
    w, h = rgb.size
    for xy in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        if rgb.getpixel(xy) != key:
            ImageDraw.floodfill(rgb, xy, key, thresh=thresh)
    alpha = Image.eval(ImageChops.difference(rgb, Image.new("RGB", rgb.size, key)).convert("L"), lambda v: 0 if v == 0 else 255)
    out = im.convert("RGBA")
    out.putalpha(alpha)
    return out


KNOCKOUT = ("recyclium/mock-*", "recyclium/art-*")


def save(im: Image.Image, name: str, max_w: int):
    from PIL import ImageOps
    im = ImageOps.exif_transpose(im)                  # phone photos carry their rotation in EXIF
    if any(fnmatch.fnmatch(name, k) for k in KNOCKOUT):
        im = knockout(im)
    alpha = im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info)
    im = im.convert("RGBA" if alpha else "RGB")
    if im.width > max_w:
        im = im.resize((max_w, round(im.height * max_w / im.width)), Image.LANCZOS)
    for x0, y0, x1, y1, *at in masks_for(name):
        w, h = im.size
        box = (round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h))
        if at and at[0] == "blur":                                   # photo backgrounds: blur, don't patch
            im.paste(im.crop(box).filter(ImageFilter.GaussianBlur(max(8, (box[3] - box[1]) // 3))), box)
            continue
        point = (round(at[0] * w), round(at[1] * h)) if at else (max(0, box[0] - 3), (box[1] + box[3]) // 2)
        im.paste(im.getpixel(point), box)
    dest = OUT / f"{name}.webp"
    dest.parent.mkdir(parents=True, exist_ok=True)
    im.save(dest, "WEBP", quality=80, method=6)
    return im.size


def _runs(vals, thresh, min_len):
    runs, start = [], None
    for i, v in enumerate(list(vals) + [0]):
        if v > thresh and start is None:
            start = i
        elif v <= thresh and start is not None:
            if i - start >= min_len:
                runs.append((start, i))
            start = None
    return runs


def split_canvas(im, work_w=1600, tol=18):
    """Find separate screens on a flat-colour design canvas (full-res boxes)."""
    im = im.convert("RGB")
    W, H = im.size
    sc = work_w / W
    sm = im.resize((work_w, max(1, int(H * sc))))
    bg = sm.getpixel((2, 2))
    mask = ImageChops.difference(sm, Image.new("RGB", sm.size, bg)).convert("L").point(lambda v: 255 if v > tol else 0)
    w, h = mask.size
    px = mask.load()
    boxes = []
    cols = [sum(1 for y in range(h) if px[x, y]) for x in range(w)]
    for x0, x1 in _runs(cols, h * 0.03, 12):
        rows = [sum(1 for x in range(x0, x1) if px[x, y]) for y in range(h)]
        for y0, y1 in _runs(rows, (x1 - x0) * 0.25, 12):
            boxes.append((x0, y0, x1, y1))
    if not boxes:
        return []
    big = max((b[2] - b[0]) * (b[3] - b[1]) for b in boxes)
    return [(int(x0 / sc), int(y0 / sc), min(W, int(x1 / sc) + 1), min(H, int(y1 / sc) + 1))
            for x0, y0, x1, y1 in boxes if (x1 - x0) * (y1 - y0) >= big * 0.35]


def ffmpeg_path():
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    try:
        import imageio_ffmpeg
        return imageio_ffmpeg.get_ffmpeg_exe()
    except Exception:
        return None


def build_clm_web(sizes, missing):
    """CLM web app screens: client logos and names masked, the Overview exports' border trimmed."""
    for name, (file, extra) in CLM_WEB_SCREENS.items():
        src = CLM_WEB / file
        if not src.exists():
            missing.append(str(src)); continue
        im = Image.open(src).convert("RGB"); w, h = im.size
        if w == 2904:                            # the Overview exports carry a 12 px dark border: trim it
            im = im.crop((12, 12, w - 12, h - 12)); w, h = im.size
        if extra == "amberg":                    # older header: Amberg logo right, construction-site name left
            boxes = [(int(w * 0.862), 0, w, 112), (int(w * 0.245), 0, int(w * 0.375), 112)]
        elif extra is None:
            boxes = []
        elif isinstance(extra, tuple) and extra[0] == "only":   # no app header on this screen: just these boxes
            boxes = extra[1]
        else:
            boxes = [(int(w * 0.835), 0, w - 4, 126)] + extra
        for b in boxes:
            im.paste(im.getpixel((max(0, b[0] - 6), (b[1] + b[3]) // 2)), b)   # sample the header beside the box
        sizes[name] = save(im, name, 1800)

    for name, (file, boxes) in OLD_UTILITY_SHOTS.items():
        src = OLD_UTILITY / file
        if not src.exists():
            missing.append(str(src)); continue
        MASKS[name] = boxes
        sizes[name] = save(Image.open(src), name, 1600)



def main():
    sizes, missing = {}, []
    for name, (src, max_w) in SINGLES.items():
        if not src.exists():
            missing.append(str(src)); continue
        im = Image.open(src); im.seek(0)
        sizes[name] = save(im, name, max_w)

    galleries = {}
    for name, srcs in GALLERIES.items():
        galleries[name] = []
        crops = []
        for src in srcs:
            if isinstance(src, tuple) and src[0] == "crop":   # ("crop", file, fractional box)
                im = Image.open(src[1]); w, h = im.size; x0, y0, x1, y1 = src[2]
                crops.append(im.crop((round(x0 * w), round(y0 * h), round(x1 * w), round(y1 * h))))
            elif isinstance(src, tuple):  # ("split", board)
                board = Image.open(src[1]).convert("RGB")
                crops += [board.crop(b) for b in split_canvas(board)]
            elif src.exists():
                im = Image.open(src); im.seek(0); crops.append(im)
            else:
                missing.append(str(src))
        for i, im in enumerate(crops, 1):
            out = f"{name}-{i:02d}"
            sizes[out] = save(im, out, 1600)
            galleries[name].append(out)

    cache = {}
    for name, (canvas, idx) in PICKS.items():
        if canvas not in cache:
            im = Image.open(canvas)
            cache[canvas] = (im, split_canvas(im))
        im, boxes = cache[canvas]
        if idx >= len(boxes):
            missing.append(f"{canvas} #{idx}"); continue
        sizes[name] = save(im.crop(boxes[idx]), name, 900 if "/p-" in name else 1800)

    for name, srcs in GFX_SETS.items():
        galleries[name] = []
        for i, src in enumerate(srcs, 1):
            if not src.exists():
                missing.append(str(src)); continue
            out = f"{name}-{i:02d}"
            sizes[out] = save(Image.open(src), out, 1600)
            galleries[name].append(out)

    photos = []
    for i, (series, src) in enumerate(PHOTOS, 1):
        if not src.exists():
            missing.append(str(src)); continue
        im = Image.open(src)
        key = f"photo/f{i:02d}"
        sizes[key] = save(im, key, 1800)                       # lightbox
        save(Image.open(src), f"photo/g/f{i:02d}", 760)        # grid
        photos.append([key, series, *sizes[key]])

    build_clm_web(sizes, missing)

    for name, src in HERO_PANELS.items():
        sizes[name] = save(Image.open(src), name, 1400)

    import base64, re as _re, io
    blobs = _re.findall(r'<img src="data:image/png;base64,([A-Za-z0-9+/=]+)"', OLD_SITE.read_text())
    for name, blob in zip(OLD_MOCKUPS, [blobs[0], blobs[1], blobs[2], blobs[3]]):
        sizes[name] = save(Image.open(io.BytesIO(base64.b64decode(blob))), name, 1600)

    try:
        import fitz
        doc = fitz.open(RECYCLIUM_PDF)
        imgs = doc[0].get_images(full=True)
        for name, idx in PDF_SCREENS.items():
            pix = fitz.Pixmap(doc, imgs[idx][0])
            if pix.n - pix.alpha >= 4:
                pix = fitz.Pixmap(fitz.csRGB, pix)
            mode = "RGBA" if pix.alpha else "RGB"
            im = Image.frombytes(mode, (pix.width, pix.height), pix.samples)
            sizes[name] = save(im, name, 800 if "/s-" in name else 1000)
    except ImportError:
        print("PyMuPDF not installed: skipped Recyclium PDF screens")

    ff = ffmpeg_path()
    if ff:
        VOUT.mkdir(parents=True, exist_ok=True)
        for name, src in VIDEOS.items():
            if not src.exists():
                missing.append(str(src)); continue
            dest = VOUT / f"{name}.mp4"
            subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-i", str(src), "-t", "40",
                            "-vf", "scale='min(900,iw)':-2,fps=24", "-an", "-c:v", "libx264", "-pix_fmt", "yuv420p",
                            "-crf", "28", "-movflags", "+faststart", str(dest)], check=True)
            subprocess.run([ff, "-hide_banner", "-loglevel", "error", "-y", "-i", str(dest), "-frames:v", "1",
                            str(OUT / f"video-{name}.png")], check=True)
            save(Image.open(OUT / f"video-{name}.png"), f"video/{name}", 900)
            (OUT / f"video-{name}.png").unlink()
    else:
        print("ffmpeg not found: skipped video conversions")

    try:
        import fitz
        for name, (rel, page) in PDF_COVERS.items():
            doc = fitz.open(ROOT / rel)
            pix = doc[min(page, doc.page_count - 1)].get_pixmap(matrix=fitz.Matrix(1.6, 1.6))
            sizes[name] = save(Image.frombytes("RGB", (pix.width, pix.height), pix.samples), name, 900)
    except ImportError:
        print("PyMuPDF not installed: skipped writing covers")

    # Width/height for every image, so pages can reserve space (no layout shift).
    import json
    MANIFEST_JS.write_text(
        "// Generated by site/tools/build_images.py — do not edit by hand.\n"
        f"export const sizes = {json.dumps({k: list(v) for k, v in sorted(sizes.items())}, separators=(',', ':'))};\n"
        f"export const galleries = {json.dumps(galleries, separators=(',', ':'))};\n"
        f"export const photos = {json.dumps(photos, separators=(',', ':'))};\n"
    )
    total = sum(f.stat().st_size for f in OUT.rglob("*.webp"))
    vids = sum(f.stat().st_size for f in VOUT.rglob("*.mp4")) if VOUT.exists() else 0
    print(f"{len(list(OUT.rglob('*.webp')))} images, {total / 1e6:.1f} MB · videos {vids / 1e6:.1f} MB")
    for m in missing:
        print("MISSING:", m)


if __name__ == "__main__":
    main()
