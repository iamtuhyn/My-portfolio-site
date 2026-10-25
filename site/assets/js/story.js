// FRAMES v0.5 · the story: the sphere hero, scroll progress, line drawings,
// the scrubbable Premiere timeline and the DVD replica.
import { reducedMotion } from "./site.js";

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
const coarse = matchMedia("(hover: none), (pointer: coarse)").matches;

/* ══════════ HERO: a sphere of frames (ten years of work, in grey until you look at one)
              and a small "agent" frame where Claude thinks, Figma analyses, Make generates ══════════ */
const TILES = [
  ["clm-web-cockpit", "CLM · Cockpit", "2022–now"], ["photo-himalaya", "Photography", "2020"], ["work-insurance-04", "Insurance portal", "2017"],
  ["adam-surat-menu", "Adam Surat · DVD menu", "2013"], ["recyclium-producer-dashboard", "Recyclium", "2025"], ["clm-lim-gantt", "LIM · Planning", "2023"],
  ["gfx-rickshaw-cd", "Rickshaw · CD cover", "2014"], ["work-gridops-01", "GridOps", "2026"], ["clm-web-gantt", "CLM · Work packages", "2022–now"],
  ["docs-on-set", "Documentary · On set", "2020"], ["work-telecom-01", "Telecom portal", "2017"], ["work-mining-01", "Mine-to-port tracking", "2022"],
  ["video-flash-ant", "Flash animation", "2015"], ["clm-web-equipment", "CLM · Overview", "2022–now"], ["work-smart-parking-01", "Smart parking", "2016"],
  ["photo-palms", "Photography", "2019"], ["clm-2019-landing", "CLM v1", "2019"], ["gfx-coffee-hub-billboard", "Coffee Hub", "2016"],
  ["work-fleet-01", "Fleet app", "2022"], ["recyclium-journey", "Recyclium · Journey", "2024"], ["clm-web-site", "CLM · Site zones", "2022–now"],
  ["adam-surat-poster", "Adam Surat · Poster", "2013"], ["work-car-exhibition-01", "Car exhibition guide", "2019"], ["clm-web-create-3", "CLM · New shipment", "2022–now"],
  ["photo-theatre-red", "Theatre", "2020"], ["work-banners-01", "Web banners", "2016"], ["clm-lim-floorplan", "LIM · Floor plan", "2023"],
  ["gfx-mother-language-day", "Mother Language Day", "2015"], ["work-construction-2019-03", "Construction logistics", "2019"], ["clm-web-booking-1", "CLM · Equipment", "2022–now"],
  ["photo-hills-mist", "Photography", "2020"], ["recyclium-d-handover-1", "Recyclium · Handover approvals", "2025"],
];
const AGENTS = [
  { name: "Claude", state: "thinking", svg: `<svg viewBox="0 0 24 24" class="ag-claude">${[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((a, i) => `<path d="M12 12 L${(12 + Math.cos(a * Math.PI / 180) * (i % 2 ? 8 : 10.5)).toFixed(2)} ${(12 + Math.sin(a * Math.PI / 180) * (i % 2 ? 8 : 10.5)).toFixed(2)}"/>`).join("")}</svg>` },
  { name: "Figma", state: "building", svg: `<svg viewBox="-9 0 56 57" class="ag-figma"><path fill="#f24e1e" d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z"/><path fill="#ff7262" d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z"/><path fill="#a259ff" d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z"/><path fill="#1abcfe" d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z"/><path fill="#0acf83" d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 1 1-19 0z"/></svg>` },
  { name: "Figma Make", state: "generating", svg: `<svg viewBox="0 0 24 24" class="ag-make"><defs><linearGradient id="agMk" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a259ff"/><stop offset="1" stop-color="#ff7262"/></linearGradient></defs><rect x="2" y="2" width="20" height="20" rx="6" fill="url(#agMk)"/><path class="spark" d="M12 6.5l1.5 4 4 1.5-4 1.5-1.5 4-1.5-4-4-1.5 4-1.5z" fill="#fff"/><path class="spark spark--2" d="M17.2 5.2l.5 1.3 1.3.5-1.3.5-.5 1.3-.5-1.3-1.3-.5 1.3-.5z" fill="#fff"/></svg>` },
  { name: "Stitch", state: "stitching", svg: `<svg viewBox="0 0 24 24" class="ag-stitch"><rect x="2" y="2" width="20" height="20" rx="6" fill="#1a73e8"/><path class="thread" d="M6 15c2.5-6 5-6 6-3s3.5 3 6-3" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-dasharray="2.2 2.2"/><circle cx="18" cy="9" r="1.6" fill="#fbbc04"/></svg>` },
];

const hero = document.querySelector(".hero");
if (hero) {
  const sphere = hero.querySelector(".sphere");
  const world = sphere.querySelector(".sphere__world");
  const dots = sphere.querySelector(".sphere__dots");
  const dctx = dots.getContext("2d");
  const deg = Math.PI / 180;
  let W = 0, H = 0, R = 0, P = 0, dpr = 1, raf = 0, visible = true;
  const view = { rx: 0, ry: 0, tx: 0, ty: 0 };            // current and target tilt from the pointer
  let tint = "168,213,186";

  // Lay the tiles on the inside of a sphere; the viewer stands near its centre, so the wall curves around you.
  function build() {
    const r = hero.getBoundingClientRect();
    W = r.width; H = r.height; dpr = Math.min(2, devicePixelRatio || 1);
    const phone = W < 700;
    R = Math.max(W, H * 1.25) * (phone ? 1.05 : 0.9);
    P = R * 0.74;
    sphere.style.perspective = `${P}px`;
    const tw = Math.max(W, 560) * (phone ? 0.36 : 0.135) / (P / (P + R));    // front tiles ≈ 13.5% of the width
    const th = tw * 0.625;
    const stepT = (tw / R) * 1.22 / deg, stepP = (th / R) * 1.36 / deg;
    const cols = Math.ceil(78 / stepT), rows = Math.ceil(58 / stepP);
    let k = 0, html = "";
    for (let j = -rows; j <= rows; j++) {
      for (let i = -cols; i <= cols; i++) {
        const t = (i + (j % 2 ? 0.5 : 0)) * stepT, p = j * stepP;
        if (Math.abs(t) > 80 || Math.abs(p) > 62) continue;
        const [key, label, year] = TILES[(k * 7 + j * 3 + 64) % TILES.length]; k++;
        html += `<figure class="tile" style="width:${tw.toFixed(0)}px;height:${th.toFixed(0)}px;margin:${(-th / 2).toFixed(0)}px 0 0 ${(-tw / 2).toFixed(0)}px;transform:rotateY(${t.toFixed(2)}deg) rotateX(${(-p).toFixed(2)}deg) translateZ(${(-R).toFixed(0)}px)">
          <img src="assets/img/wall/${key}.webp" alt="" loading="${Math.abs(t) < 40 && Math.abs(p) < 30 ? "eager" : "lazy"}" decoding="async" draggable="false">
          <figcaption style="font-size:${(tw / 22).toFixed(0)}px"><span>${label}</span><b>${year}</b></figcaption></figure>`;
      }
    }
    world.innerHTML = html;
    dots.width = W * dpr; dots.height = H * dpr;
    dots.style.width = `${W}px`; dots.style.height = `${H}px`;
    const hex = getComputedStyle(document.documentElement).getPropertyValue("--accent").trim().replace("#", "");
    if (hex.length === 6) tint = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(",");
  }

  // Same projection as the CSS: rotateX(rx) · rotateY(ry + θ) · rotateX(φ) · translateZ(-R), seen from z = P.
  function paintDots(now) {
    dctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dctx.clearRect(0, 0, W, H);
    const cx = W / 2, cy = H / 2, rx = view.rx * deg, crx = Math.cos(rx), srx = Math.sin(rx);
    for (let p = -84; p <= 84; p += 3) {
      const sp = Math.sin(-p * deg), cp = Math.cos(-p * deg);
      for (let t = -96; t <= 96; t += 3) {
        const a = (view.ry + t) * deg;
        const x = -R * cp * Math.sin(a), y0 = R * sp, z0 = -R * cp * Math.cos(a);
        const y = y0 * crx - z0 * srx, z = y0 * srx + z0 * crx;
        if (z > P * 0.6) continue;
        const s = P / (P - z);
        const X = cx + x * s, Y = cy + y * s;
        if (X < -4 || X > W + 4 || Y < -4 || Y > H + 4) continue;
        const tw = 0.5 + 0.5 * Math.sin(now * 0.0012 + t * 1.7 + p * 2.3);     // a slow twinkle
        dctx.fillStyle = `rgba(${tint},${(0.1 + tw * 0.32) * Math.min(1, s * 1.2)})`;
        const d = Math.max(0.8, 1.6 * s);
        dctx.fillRect(X - d / 2, Y - d / 2, d, d);
      }
    }
  }

  function loop(now) {
    raf = 0;
    if (!visible) return;
    const drift = reducedMotion ? 0 : Math.sin(now * 0.00009) * 7;
    view.ry += (view.tx + drift - view.ry) * 0.05;
    view.rx += (view.ty - view.rx) * 0.05;
    world.style.transform = `rotateX(${view.rx.toFixed(3)}deg) rotateY(${view.ry.toFixed(3)}deg)`;
    paintDots(now);
    agentStep();
    if (!reducedMotion) raf = requestAnimationFrame(loop);
  }
  const kick = () => { if (!raf) raf = requestAnimationFrame(loop); };

  hero.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "mouse") return;
    const r = hero.getBoundingClientRect();
    view.tx = ((e.clientX - r.left) / r.width - 0.5) * -10;
    view.ty = ((e.clientY - r.top) / r.height - 0.5) * 6;
    agent.follow = true; agent.x = e.clientX - r.left + 18; agent.y = e.clientY - r.top + 20;
    kick();
  });
  hero.addEventListener("pointerleave", () => { view.tx = 0; view.ty = 0; agent.follow = false; kick(); });

  /* ── The agent frame: rests above the headline, follows the pointer on desktop */
  const agentEl = hero.querySelector(".agent");
  const slot = hero.querySelector(".agent-slot");
  const logoBox = agentEl.querySelector(".agent__logo");
  const nameEl = agentEl.querySelector(".agent__name");
  const stateEl = agentEl.querySelector(".agent__state");
  logoBox.innerHTML = AGENTS.map((a, i) => `<span data-i="${i}">${a.svg}</span>`).join("");
  const agent = { x: 0, y: 0, cx: null, cy: null, follow: false, i: -1 };
  function setAgent(i) {
    agent.i = i;
    const a = AGENTS[i];
    logoBox.querySelectorAll("span").forEach((s) => s.classList.toggle("is-on", +s.dataset.i === i));
    agentEl.dataset.agent = a.name.split(" ").pop().toLowerCase();
    nameEl.textContent = a.name;
    stateEl.textContent = "";
    [...`is ${a.state}`].forEach((ch, k) => setTimeout(() => { if (agent.i === i) stateEl.textContent += ch; }, 140 + k * 38));
    agentEl.classList.remove("is-cycling"); void agentEl.offsetWidth; agentEl.classList.add("is-cycling");
  }
  setAgent(0);
  setInterval(() => { if (visible && !document.hidden) setAgent((agent.i + 1) % AGENTS.length); }, 2800);
  function agentStep() {
    const hr = hero.getBoundingClientRect(), sr = slot.getBoundingClientRect();
    const rest = { x: sr.left - hr.left + (sr.width - agentEl.offsetWidth) / 2, y: sr.top - hr.top };
    const tx = agent.follow ? Math.min(agent.x, W - agentEl.offsetWidth - 8) : rest.x;
    const ty = agent.follow ? Math.min(agent.y, H - agentEl.offsetHeight - 8) : rest.y;
    if (agent.cx === null) { agent.cx = tx; agent.cy = ty; }
    agent.cx += (tx - agent.cx) * (reducedMotion ? 1 : 0.16);
    agent.cy += (ty - agent.cy) * (reducedMotion ? 1 : 0.16);
    agentEl.style.transform = `translate(${agent.cx.toFixed(1)}px, ${agent.cy.toFixed(1)}px)`;
  }

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(hero);
  let rw = 0;
  addEventListener("resize", () => { if (Math.abs(innerWidth - rw) > 40 || !rw) { rw = innerWidth; build(); } agent.cx = null; kick(); });
  addEventListener("themechange", () => { build(); kick(); });
  rw = innerWidth; build(); agentStep(); hero.classList.add("is-ready");
  if (reducedMotion) { paintDots(0); } else kick();
}

/* ══════════ Scroll progress: every [data-progress] gets --p from 0 to 1 ══════════ */
const tracked = [...document.querySelectorAll("[data-progress]")];
const steps = new Map(tracked.map((el) => [el, [...el.querySelectorAll("[data-step]")]]));
const drawings = new Map(tracked.map((el) => [el, [...el.querySelectorAll(".draw *")]]));
function progressOf(el) {
  const r = el.getBoundingClientRect();
  const travel = r.height - innerHeight;
  if (travel <= 0) return clamp((innerHeight - r.top) / innerHeight);
  return clamp(-r.top / travel);
}
function paintScenes() {
  for (const el of tracked) {
    const r = el.getBoundingClientRect();
    if (r.bottom < -200 || r.top > innerHeight + 200) continue;     // off-screen: skip
    const p = reducedMotion ? 1 : progressOf(el);
    el.style.setProperty("--p", p.toFixed(4));
    const drawP = clamp(p / 0.7);
    for (const node of drawings.get(el)) node.style.setProperty("--d", String(1 - drawP));
    const list = steps.get(el);
    list.forEach((s, i) => s.classList.toggle("is-on", p >= 0.08 + (i / Math.max(1, list.length)) * 0.7));
  }
}

/* ══════════ The timeline: clips, ruler, curve, a playhead you can hold and drag ══════════ */
const tl = document.querySelector(".timeline");
const scenes = [...document.querySelectorAll("[data-clip]")];
const RUNTIME = 11 * 60;          // the story "runs" 11 minutes on the timecode
let docH = 1, current = null;
const tc = (f) => {
  const s = f * RUNTIME, frames = Math.floor((s % 1) * 25);
  const p2 = (n) => String(Math.floor(n)).padStart(2, "0");
  return `${p2(s / 3600)}:${p2((s / 60) % 60)}:${p2(s % 60)}:${p2(frames)}`;
};

function buildTimeline() {
  if (!tl) return;
  docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
  const career = tl.querySelector(".track--career"), life = tl.querySelector(".track--life"), ruler = tl.querySelector(".ruler");
  career.replaceChildren(); life.replaceChildren(); ruler.replaceChildren();
  const pts = [], marks = [];
  const width = tl.querySelector(".timeline__tracks").clientWidth;
  for (const s of scenes) {
    const top = s.offsetTop;
    const x0 = clamp(top / docH) * 100;
    const x1 = clamp((top + s.offsetHeight - innerHeight * 0.5) / docH) * 100;
    // Milestones: "label|year|track|start|end; …" (fractions of the scene). Fallback: one clip per scene.
    const items = (s.dataset.clips || `${s.dataset.clip}|${s.dataset.year || ""}|${s.dataset.track || "career"}|0|1`)
      .split(";").map((c) => { const [label, year, track, a = 0, b = 1] = c.split("|"); return { label, year, track, a: +a, b: +b }; });
    s._clips = [];
    for (const it of items) {
      const cx0 = x0 + (x1 - x0) * it.a, cx1 = x0 + (x1 - x0) * it.b;
      const w = Math.max(0.5, cx1 - cx0 - 0.2);
      const name = [it.label, it.year].filter(Boolean).join(" · ");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tclip";
      btn.style.left = `${cx0}%`; btn.style.width = `${w}%`;
      if (name) { btn.title = name; btn.setAttribute("aria-label", `Jump to ${name}`); } else { btn.setAttribute("aria-label", `Jump to ${s.dataset.clip}`); btn.classList.add("is-blank"); }
      if (s.dataset.thumb && it.track === "career" && it.a === 0) btn.innerHTML = `<img src="assets/img/${s.dataset.thumb}.webp" alt="" loading="lazy">`;
      if (name) btn.insertAdjacentHTML("beforeend", `<span>${name}</span>`);
      if ((w / 100) * width < 64 || !name) btn.classList.add("is-tiny");
      const target = top + Math.max(0, (s.offsetHeight - innerHeight) * it.a) + 2;
      btn.addEventListener("click", (e) => { if (!tl._moved) scrollTo({ top: target, behavior: reducedMotion ? "auto" : "smooth" }); e.stopPropagation(); });
      btn._range = [top + (s.offsetHeight) * it.a, top + s.offsetHeight * it.b, name || s.dataset.clip];
      s._clips.push(btn);
      (it.track === "life" ? life : career).append(btn);
      const yr = (it.year || "").match(/\d{4}/)?.[0];
      if (yr && !marks.some((m) => m[1] === yr)) marks.push([cx0, yr]);                // each start year once
    }
    if (s.dataset.curve) pts.push([(x0 + x1) / 2, Number(s.dataset.curve)]);
  }
  for (const [x, y] of marks) {
    const m = document.createElement("span");
    m.style.left = `${x}%`; m.textContent = y;
    ruler.append(m);
  }
  let lastRight = -1;
  ruler.querySelectorAll("span").forEach((m) => {
    const left = m.offsetLeft;
    if (left < lastRight + 6) m.hidden = true; else lastRight = left + m.offsetWidth;
  });
  drawCurve(pts);
}
function drawCurve(pts) {
  const svg = tl.querySelector(".track--curve svg");
  if (!pts.length) return;
  const y = (v) => 92 - (v / 11) * 84;
  const P = [[0, y(pts[0][1])], ...pts.map(([x, v]) => [x, y(v)]), [100, y(pts.at(-1)[1])]];
  let d = `M${P[0][0]},${P[0][1]}`;
  for (let i = 0; i < P.length - 1; i++) {
    const [p0, p1, p2, p3] = [P[i - 1] || P[i], P[i], P[i + 1], P[i + 2] || P[i + 1]];
    d += ` C${p1[0] + (p2[0] - p0[0]) / 6},${p1[1] + (p2[1] - p0[1]) / 6},${p2[0] - (p3[0] - p1[0]) / 6},${p2[1] - (p3[1] - p1[1]) / 6},${p2}`;
  }
  svg.querySelector(".line").setAttribute("d", d);
  svg.querySelector(".fill").setAttribute("d", `${d} L100,100 L0,100 Z`);
}
function paintTimeline() {
  if (!tl) return;
  const f = clamp(scrollY / docH);
  const head = tl.querySelector(".playhead");
  head.style.left = `${f * 100}%`;
  head.setAttribute("aria-valuenow", String(Math.round(f * 100)));
  const code = tc(f);
  tl.querySelector("[data-tl-tc]").textContent = code;
  document.querySelector("[data-timecode]")?.replaceChildren(code);
  const mid = scrollY + innerHeight * 0.5;
  const s = scenes.findLast((sc) => sc.offsetTop <= mid) || scenes[0];
  const clip = (s._clips || []).find((c) => mid >= c._range[0] && mid < c._range[1]) || s._clips?.[0];
  if (clip === current) return;
  current?.classList.remove("is-now");
  clip?.classList.add("is-now");
  current = clip;
  const label = [s.dataset.seq, clip?._range[2]].filter(Boolean).join(" · ");
  tl.querySelector("[data-tl-name]").textContent = label;
  head.setAttribute("aria-valuetext", `${label}, ${code}`);
}

if (tl) {
  const area = tl.querySelector(".timeline__tracks");
  const head = tl.querySelector(".playhead");
  const seek = (clientX) => {
    const r = area.getBoundingClientRect();
    scrollTo({ top: clamp((clientX - r.left) / r.width) * docH, behavior: "instant" });
  };
  // Hold anywhere on the tracks (or the playhead) and drag: the page follows, like Premiere.
  // A press on a clip only jumps if you don't drag.
  let startX = 0, active = false;
  area.addEventListener("pointerdown", (e) => {
    if (e.button !== 0) return;
    startX = e.clientX; tl._moved = false; active = true;
    try { area.setPointerCapture(e.pointerId); } catch {}
    if (!e.target.closest(".tclip")) { tl.classList.add("is-scrubbing"); seek(e.clientX); }
    e.preventDefault();
  });
  addEventListener("pointermove", (e) => {
    if (!active) return;
    if (Math.abs(e.clientX - startX) > 4) { tl._moved = true; tl.classList.add("is-scrubbing"); }
    if (tl.classList.contains("is-scrubbing")) seek(e.clientX);
  });
  const end = () => {
    if (!active) return;
    active = false;
    tl.classList.remove("is-scrubbing");
    setTimeout(() => { tl._moved = false; }, 0);
  };
  addEventListener("pointerup", end);
  addEventListener("pointercancel", end);
  head.addEventListener("keydown", (e) => {
    const f = clamp(scrollY / docH);
    const step = { ArrowRight: 0.01, ArrowLeft: -0.01, PageDown: 0.1, PageUp: -0.1 }[e.key];
    if (step !== undefined) { e.preventDefault(); scrollTo({ top: clamp(f + step) * docH, behavior: "instant" }); }
    if (e.key === "Home") { e.preventDefault(); scrollTo({ top: 0, behavior: "instant" }); }
    if (e.key === "End") { e.preventDefault(); scrollTo({ top: docH, behavior: "instant" }); }
  });
}

/* ══════════ Loop ══════════ */
let ticking = false;
const frame = () => { paintScenes(); paintTimeline(); ticking = false; };
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
const rebuild = () => { buildTimeline(); current = null; frame(); };
addEventListener("resize", rebuild);
addEventListener("load", rebuild);
new ResizeObserver(() => rebuild()).observe(document.querySelector("main"));
rebuild();

/* ══════════ Frame 0: the Adam Surat DVD menu replica ══════════ */
document.querySelectorAll(".dvd").forEach((dvd) => {
  const shots = dvd.querySelectorAll(".dvd__screen img");
  const buttons = dvd.querySelectorAll(".dvd__menu button");
  const label = dvd.querySelector(".dvd__label");
  buttons.forEach((b) => b.addEventListener("click", () => {
    buttons.forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    shots.forEach((img) => img.classList.toggle("is-on", img.dataset.view === b.dataset.view));
    if (label) label.textContent = b.dataset.label || b.textContent.trim();
  }));
});
