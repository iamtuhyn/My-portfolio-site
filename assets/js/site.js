// FRAMES v0.5 · shared behaviour for every page.
import { CONTACT } from "./config.js";
import { LANGS, lang, t, translate, setLang } from "./i18n.js";

document.documentElement.classList.replace("no-js", "js");
translate();                                  // swap page text before buttons and reveals are set up
export const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;
const BASE = document.body.dataset.base || "";
const PAGE = document.body.dataset.page || "";

/* ── HUD: centred pill nav (a camera frame travels over it) + "Get in touch" card */
// The J·T·G cube: three faces of an isometric cube, a letter cut out of each.
const LOGO = `<svg class="cube" viewBox="0 0 100 100" aria-hidden="true">
  <defs>
    <mask id="lgJ" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g fill="#000"><rect x="30" y="16" width="54" height="17"/><rect x="62" y="16" width="22" height="68"/><rect x="16" y="67" width="68" height="17"/><rect x="16" y="50" width="20" height="34"/></g></mask>
    <mask id="lgT" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g fill="#000"><rect x="16" y="16" width="68" height="20"/><rect x="40" y="16" width="20" height="68"/></g></mask>
    <mask id="lgG" maskUnits="userSpaceOnUse" x="0" y="0" width="100" height="100"><rect width="100" height="100" fill="#fff"/><g fill="#000"><rect x="16" y="16" width="68" height="17"/><rect x="16" y="16" width="20" height="68"/><rect x="16" y="67" width="68" height="17"/><rect x="64" y="48" width="20" height="36"/><rect x="48" y="48" width="36" height="15"/></g></mask>
  </defs>
  <g transform="matrix(.39 -.225 .39 .225 11 27.5)"><rect x="5" y="5" width="90" height="90" mask="url(#lgJ)"/></g>
  <g transform="matrix(.39 .225 0 .45 11 27.5)"><rect x="5" y="5" width="90" height="90" mask="url(#lgT)"/></g>
  <g transform="matrix(.39 -.225 0 .45 50 50)"><rect x="5" y="5" width="90" height="90" mask="url(#lgG)"/></g>
</svg>`;

/* ── Theme: system · light · dark (the choice is remembered; "system" follows the OS) */
const THEMES = ["system", "light", "dark"];
const THEME_ICONS = {
  system: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 1 0 16z" class="fill"/></svg>',
  light: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8"/></svg>',
  dark: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/></svg>',
};
const getTheme = () => { try { return localStorage.getItem("theme") || "system"; } catch { return "system"; } };
function applyTheme(t) {
  if (t === "system") document.documentElement.removeAttribute("data-theme");
  else document.documentElement.dataset.theme = t;
  try { t === "system" ? localStorage.removeItem("theme") : localStorage.setItem("theme", t); } catch {}
  document.querySelectorAll("[data-theme-set]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.themeSet === t)));
  dispatchEvent(new CustomEvent("themechange"));
}

const NAV = [["work.html", "Work", "work"], ["story.html", "Story", "story"], ["expertise.html", "Expertise", "expertise"], ["more.html", "Frames", "more"], ["contact.html", "Contact", "contact"]];
const CASES = [["work/clm.html", "CLM ecosystem"], ["work/recyclium.html", "Recyclium"], ["work/gridops.html", "GridOps"], ["work.html", "All projects"]];

function renderHud() {
  const here = (key) => (PAGE === key ? ' aria-current="page"' : "");
  const links = NAV.map(([href, label, key]) => `<a href="${BASE}${href}"${here(key)}><span data-scramble>${label}</span></a>`).join("");
  const hud = document.createElement("header");
  hud.className = "hud";
  hud.innerHTML = `
    <a class="brand" href="${BASE}index.html" aria-label="Joacim Tuhin Gain, Design Engineer: home">${LOGO}<span class="brand__text"><b>Joacim Tuhin Gain</b><span>Design Engineer</span></span></a>
    <div class="me">
      <button class="navbtn" type="button" aria-expanded="false" aria-controls="drawer" aria-label="${t("Open the menu")}">
        <span class="navbtn__me"><img src="${BASE}assets/img/docs/on-set.webp" alt="" width="36" height="36"><span class="me__dot" aria-hidden="true"></span></span>
        <svg class="navbtn__icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7h18M3 12h18M3 17h18"/></svg>
      </button>
    </div>`;
  document.body.prepend(hud);

  // Side drawer: everything in one place (home, portfolio, pages, contact, quick links, theme)
  const at = (key) => (PAGE === key ? ' aria-current="page"' : "");
  const drawer = document.createElement("div");
  drawer.className = "drawer"; drawer.id = "drawer"; drawer.inert = true;
  drawer.innerHTML = `
    <div class="drawer__scrim" data-drawer-close></div>
    <aside class="drawer__panel" role="dialog" aria-modal="true" aria-label="Menu">
      <button class="drawer__close" type="button" data-drawer-close aria-label="Close the menu"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 5l14 14M19 5L5 19"/></svg></button>
      <nav class="drawer__nav" aria-label="All pages">
        <a class="drawer__top" href="${BASE}index.html"${at("home")}>${t("Home")}</a>
        <a class="drawer__top" href="${BASE}work.html"${at("work")}>${t("Portfolio")}</a>
        ${CASES.map(([href, label]) => `<a class="drawer__sub" href="${BASE}${href}">${label}</a>`).join("")}
        <a class="drawer__top" href="${BASE}story.html"${at("story")}>${t("Story")}</a>
        <a class="drawer__top" href="${BASE}expertise.html"${at("expertise")}>${t("Expertise")}</a>
        <a class="drawer__top" href="${BASE}more.html"${at("more")}>${t("Frames")}</a>
        <a class="drawer__top" href="${BASE}contact.html"${at("contact")}>${t("Contact")}</a>
      </nav>
      <ul class="me__list">
        <li><a href="${BASE}contact.html#book"><span data-scramble>${t("Book a conversation")}</span><span aria-hidden="true">( + )</span></a></li>
        <li><a href="mailto:${CONTACT.email}"><span data-scramble>${t("Email me")}</span><span aria-hidden="true">( + )</span></a></li>
        <li><a href="${BASE}${CONTACT.resume}" download="Joacim-Tuhin-Gain-Resume.pdf"><span data-scramble>${t("Download résumé")}</span><span aria-hidden="true">( ↓ )</span></a></li>
        ${CONTACT.linkedin ? `<li><a href="${CONTACT.linkedin}" target="_blank" rel="noopener"><span data-scramble>LinkedIn</span><span aria-hidden="true">( ↗ )</span></a></li>` : ""}
      </ul>
      <div class="theme" role="group" aria-label="Theme">
        ${THEMES.map((t) => `<button type="button" data-theme-set="${t}" aria-pressed="false">${THEME_ICONS[t]}<span>${t[0].toUpperCase() + t.slice(1)}</span></button>`).join("")}
      </div>
    </aside>`;
  document.body.append(drawer);

  applyTheme(getTheme());
  drawer.querySelectorAll("[data-theme-set]").forEach((b) => b.addEventListener("click", () => applyTheme(b.dataset.themeSet)));
  matchMedia("(prefers-color-scheme: light)").addEventListener?.("change", () => dispatchEvent(new CustomEvent("themechange")));

  // the bar gets its glass once the page moves
  const onScroll = () => hud.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();

  // the drawer opens from the photo button, closes on the scrim, the close button, a link or Escape
  const btn = hud.querySelector(".navbtn");
  const setOpen = (open) => {
    drawer.classList.toggle("is-open", open); drawer.inert = !open;
    btn.setAttribute("aria-expanded", String(open));
    document.documentElement.classList.toggle("has-drawer", open);
    if (open) drawer.querySelector(".drawer__close").focus(); else btn.focus();
  };
  btn.addEventListener("click", () => setOpen(true));
  drawer.addEventListener("click", (e) => { if (e.target.closest("[data-drawer-close], a")) setOpen(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && drawer.classList.contains("is-open")) setOpen(false); });
}

/* ── Buttons: add the ( + ) icon and a scramble label automatically */
export function enhanceButtons(root = document) {
  root.querySelectorAll(".btn").forEach((b) => {
    if (b.querySelector("[data-scramble]")) return;
    const text = b.textContent.trim();
    const icon = b.dataset.icon ?? "+";
    b.textContent = "";
    const label = Object.assign(document.createElement("span"), { textContent: text });
    label.dataset.scramble = "";
    b.append(label);
    if (icon) b.insertAdjacentHTML("beforeend", `<span class="btn__icon" aria-hidden="true">( <b>${icon}</b> )</span>`);
    if (!b.getAttribute("aria-label")) b.setAttribute("aria-label", text);
  });
}
enhanceButtons();

/* ── Text scramble on hover/focus (like a reel searching for the frame) */
const GLYPHS = "!<>-_\\/[]{}=+*^?#$%&@01";
function scramble(el) {
  if (reducedMotion || el._busy) return;
  const final = el.dataset.text || (el.dataset.text = el.textContent);
  el._busy = true;
  el.style.minWidth = `${el.offsetWidth}px`;
  const start = performance.now();
  const dur = Math.min(650, 160 + final.length * 28);
  const frame = (t) => {
    const p = Math.min(1, (t - start) / dur);
    const fixed = Math.floor(p * final.length);
    let out = final.slice(0, fixed);
    for (let i = fixed; i < final.length; i++) out += final[i] === " " ? " " : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    el.textContent = out;
    if (p < 1) requestAnimationFrame(frame);
    else { el.textContent = final; el._busy = false; }
  };
  requestAnimationFrame(frame);
}
renderHud();
document.addEventListener("pointerover", (e) => {
  const host = e.target.closest(".btn, .me__list a, .me__list button, [data-scramble-host]");
  if (host && !host.contains(e.relatedTarget)) host.querySelectorAll("[data-scramble]").forEach(scramble);
});
document.addEventListener("focusin", (e) => e.target.querySelectorAll?.("[data-scramble]").forEach(scramble));

/* ── Dot bloom: brighter canvas dots follow the cursor, and the dot under it
      turns into a tiny Figma tool for a moment (desktop only) */
const TOOLS = [
  "M5 3l14 7-6 1.6L10.2 18z",                                   // move
  "M8 3v18M16 3v18M3 8h18M3 16h18",                             // frame
  "M5 5h14v14H5z",                                              // rectangle
  "M5 19L19 5",                                                 // line
  "M5 19L19 5M11 5h8v8",                                        // arrow
  "M12 4a8 8 0 1 0 0.01 0z",                                    // ellipse
  "M12 4l8 15H4z",                                              // polygon
  "M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.4 6.7 19.4l1.2-6L3.4 9.3l6-.7z", // star
  "M5 19l2-6 8-8 4 4-8 8zM13 7l4 4",                            // pen
  "M5 5h14M12 5v14M9 19h6",                                     // text
  "M5 5h14v10H11l-4 4v-4H5z",                                   // comment
  "M4 5h16v14H4zM4 15l5-4 4 3 3-2 4 3M15 9.5a1.2 1.2 0 1 0 .01 0",       // image
].map((d) => new Path2D(d));

if (finePointer && !reducedMotion) {
  const cvs = Object.assign(document.createElement("canvas"), { className: "dotfx" });
  cvs.setAttribute("aria-hidden", "true");
  document.body.prepend(cvs);
  const ctx = cvs.getContext("2d");
  const G = 24, R = 120, LIFE = 650, STAMP = 1100;
  let dpr = 1, trail = [], stamps = [], raf = 0, lastCell = "", tint = "168,213,186";
  const readTint = () => {
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().replace("#", "");
    if (hex.length === 6) tint = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
  };
  readTint();
  addEventListener("themechange", readTint);
  const size = () => {
    dpr = Math.min(2, devicePixelRatio || 1);
    cvs.width = innerWidth * dpr; cvs.height = innerHeight * dpr;
    cvs.style.width = `${innerWidth}px`; cvs.style.height = `${innerHeight}px`;
  };
  size();
  addEventListener("resize", size);
  addEventListener("pointermove", (e) => {
    const now = performance.now();
    trail.push({ x: e.clientX, y: e.clientY, t: now });
    if (trail.length > 18) trail.shift();
    const gx = Math.floor(e.clientX / G) * G + G / 2, gy = Math.floor(e.clientY / G) * G + G / 2;
    const key = `${gx},${gy}`;
    if (key !== lastCell) {                                       // a new dot under the cursor → a new tool
      lastCell = key;
      stamps.push({ gx, gy, tool: TOOLS[(Math.random() * TOOLS.length) | 0], t: now });
      if (stamps.length > 14) stamps.shift();
    }
    if (!raf) raf = requestAnimationFrame(draw);
  }, { passive: true });
  function draw(now) {
    raf = 0;
    trail = trail.filter((p) => now - p.t < LIFE);
    stamps = stamps.filter((s) => now - s.t < STAMP);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    if (!trail.length && !stamps.length) return;
    const taken = new Set(stamps.map((s) => `${s.gx},${s.gy}`));
    if (trail.length) {
      const minX = Math.min(...trail.map((p) => p.x)) - R, maxX = Math.max(...trail.map((p) => p.x)) + R;
      const minY = Math.min(...trail.map((p) => p.y)) - R, maxY = Math.max(...trail.map((p) => p.y)) + R;
      for (let gx = Math.floor(minX / G) * G + G / 2; gx < maxX; gx += G) {
        for (let gy = Math.floor(minY / G) * G + G / 2; gy < maxY; gy += G) {
          if (taken.has(`${gx},${gy}`)) continue;
          let k = 0;
          for (const p of trail) {
            const d = Math.hypot(gx - p.x, gy - p.y);
            if (d < R) k = Math.max(k, (1 - d / R) ** 2 * (1 - (now - p.t) / LIFE));
          }
          if (k < 0.03) continue;
          const sz = 1.4 + k * 3.4;
          ctx.fillStyle = `rgba(${tint},${0.15 + k * 0.75})`;
          ctx.fillRect(gx - sz / 2, gy - sz / 2, sz, sz);
        }
      }
    }
    for (const st of stamps) {                                    // tiny tools, fading back into dots
      const age = (now - st.t) / STAMP;
      const scale = 0.48 * (age < 0.15 ? age / 0.15 : 1);
      ctx.save();
      ctx.translate(st.gx, st.gy); ctx.scale(scale, scale); ctx.translate(-12, -12);
      ctx.strokeStyle = `rgba(${tint},${1 - age})`;
      ctx.lineWidth = 2.2; ctx.lineJoin = "round"; ctx.lineCap = "round";
      ctx.stroke(st.tool);
      ctx.restore();
    }
    raf = requestAnimationFrame(draw);
  }
}

/* ── "Discover" chip: follows the cursor inside any [data-discover] media */
document.addEventListener("pointermove", (e) => {
  const host = e.target.closest?.("[data-discover]");
  document.querySelectorAll("[data-discover].is-hot").forEach((h) => h !== host && h.classList.remove("is-hot"));
  if (!host || e.pointerType !== "mouse") return;
  const r = host.getBoundingClientRect();
  host.style.setProperty("--mx", `${e.clientX - r.left}px`);
  host.style.setProperty("--my", `${e.clientY - r.top}px`);
  host.classList.add("is-hot");
}, { passive: true });
document.addEventListener("pointerout", (e) => {
  const host = e.target.closest?.("[data-discover]");
  if (host && !host.contains(e.relatedTarget)) host.classList.remove("is-hot");
});

/* ── Reveal */
const revealer = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); revealer.unobserve(e.target); }
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
export const observeReveals = (root = document) => root.querySelectorAll(".reveal:not(.is-in)").forEach((el) => revealer.observe(el));
observeReveals();

/* ── Long phone screens scroll on hover: set --scroll from the real image height */
export function fitPhones(root = document) {
  root.querySelectorAll(".phone__screen img").forEach((img) => {
    // pinned app bars: the top bar and the bottom actions stay put while the middle scrolls (same image, as overlays)
    if (img.dataset.pin && !img.parentElement.querySelector(".pin")) {
      const [top, bottom] = img.dataset.pin.split(",").map(Number);
      const screen = img.parentElement;
      screen.style.setProperty("--pin-src", `url("${img.currentSrc || img.src}")`);
      screen.insertAdjacentHTML("beforeend", `<span class="pin pin--top" style="--f:${top}" aria-hidden="true"></span><span class="pin pin--bottom" style="--f:${bottom}" aria-hidden="true"></span>`);
    }
    const set = () => {
      const box = img.parentElement.getBoundingClientRect().height;
      const h = img.getBoundingClientRect().height;
      img.style.setProperty("--scroll", `${Math.min(0, box - h)}px`);
    };
    img.complete ? set() : img.addEventListener("load", set, { once: true });
  });
}
fitPhones();
addEventListener("resize", () => fitPhones());

/* ── Dialog helper */
export function makeDialog(className, label) {
  const d = document.createElement("dialog");
  d.className = `modal ${className}`;
  d.setAttribute("aria-label", label);
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });   // click backdrop to close
  document.body.append(d);
  return d;
}

/* ── Image zoom: any <img data-zoom> */
const zoom = makeDialog("zoom", "Image preview");
zoom.innerHTML = '<button class="modal__close" type="button" aria-label="Close">✕</button><div class="zoom__body"><img alt=""></div>';
zoom.querySelector(".modal__close").addEventListener("click", () => zoom.close());
document.addEventListener("click", (e) => {
  const img = e.target.closest("img[data-zoom]");
  if (!img) return;
  const z = zoom.querySelector("img");
  z.src = img.currentSrc || img.src; z.alt = img.alt;
  zoom.showModal();
});

/* ── Screen player: tabs for flows, thumbnails for steps */
document.querySelectorAll("[data-player]").forEach((pl) => {
  const tabs = [...pl.querySelectorAll('[role="tab"]')];
  const select = (t, focus = false) => {
    tabs.forEach((x) => { const on = x === t; x.setAttribute("aria-selected", String(on)); x.tabIndex = on ? 0 : -1;
      pl.querySelector(`#${x.getAttribute("aria-controls")}`).hidden = !on; });
    if (focus) t.focus();
    t.scrollIntoView({ block: "nearest", inline: "nearest" });
  };
  tabs.forEach((t, i) => {
    t.tabIndex = i ? -1 : 0;
    t.addEventListener("click", () => select(t));
    t.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
  // tall product pages keep their own header (and tab bar) and sidebar pinned while the content scrolls
  const PINNED = { "web-status": [.081, .173], "web-logistics": [.081, .173], "web-equipment": [.081, .173], "web-performance": [.081, .173], "web-glossary": [.081, .173], "web-booking-3": [.04, .178] };
  const pin = (screen) => {
    const view = screen.querySelector(".player__view"), img = view.querySelector("img");
    const key = img?.src.split("/").pop().replace(".webp", "");
    const spec = img && PINNED[key];
    screen.classList.toggle("is-pinned", !!spec);
    if (!spec) return;
    const w = view.clientWidth;
    screen.style.setProperty("--pv-src", `url("${img.currentSrc || img.src}")`);
    screen.style.setProperty("--pv-w", `${w}px`);
    screen.style.setProperty("--pv-head", `${Math.round(w * spec[0])}px`);
    screen.style.setProperty("--pv-side", `${Math.round(w * spec[1])}px`);
  };
  pl.querySelectorAll(".player__screen").forEach((screen) => {
    const img = screen.querySelector("img");
    if (img) (img.complete ? pin(screen) : img.addEventListener("load", () => pin(screen), { once: true }));
  });
  addEventListener("resize", () => pl.querySelectorAll(".player__screen").forEach(pin));
  tabs.forEach((t) => t.addEventListener("click", () => requestAnimationFrame(() => pl.querySelectorAll(".player__screen").forEach(pin))));

  pl.querySelectorAll(".player__steps").forEach((steps) => steps.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (!b) return;
    const panel = steps.closest(".player__panel"), screen = panel.querySelector(".player__screen"), view = panel.querySelector(".player__view");
    steps.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    view.scrollTop = 0;
    if (b.dataset.video) {                                   // back to the flow video
      view.innerHTML = `<video src="${b.dataset.video}" poster="${b.dataset.poster}" autoplay muted loop playsinline aria-label="Screen recording"></video>`;
      screen.classList.remove("is-pinned");
    } else {
      view.innerHTML = `<img src="${b.dataset.src}" alt="CLM web app: ${b.dataset.cap}" data-zoom>`;
      const img = view.querySelector("img");
      img.complete ? pin(screen) : img.addEventListener("load", () => pin(screen), { once: true });
    }
    panel.querySelector(".player__cap").textContent = b.dataset.cap;
  }));
});

/* ── Before / after slider */
document.querySelectorAll(".ba").forEach((ba) => {
  const input = ba.querySelector("input");
  const set = () => ba.style.setProperty("--x", `${input.value}%`);
  input.addEventListener("input", set);
  set();
});

/* ── YouTube: load the player only when someone presses play */
document.querySelectorAll("[data-yt]").forEach((btn) => {
  btn.addEventListener("click", () => {
    const frame = document.createElement("iframe");
    frame.src = `https://www.youtube-nocookie.com/embed/${btn.dataset.yt}?autoplay=1&rel=0`;
    frame.title = btn.getAttribute("aria-label") || "Video";
    frame.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    frame.className = btn.className;
    btn.replaceWith(frame);
  });
});

/* ── Booking: inline widgets + the "Book a call" modal (loaded on demand) */
let bookingDialog = null;
document.addEventListener("click", async (e) => {
  if (!e.target.closest("[data-book]")) return;
  e.preventDefault();
  const { mountBooking } = await import("./booking.js");
  if (!bookingDialog) {
    bookingDialog = makeDialog("modal--booking", "Book a conversation");
    bookingDialog.innerHTML = '<button class="modal__close" type="button" aria-label="Close">✕</button><div></div>';
    bookingDialog.querySelector(".modal__close").addEventListener("click", () => bookingDialog.close());
    mountBooking(bookingDialog.querySelector("div"), BASE);
  }
  bookingDialog.showModal();
});
if (document.querySelector("[data-booking]")) {
  import("./booking.js").then(({ mountBooking }) =>
    document.querySelectorAll("[data-booking]").forEach((el) => mountBooking(el, BASE)));
}
