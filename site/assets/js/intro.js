// FRAMES v0.9 · first glance: the window opens and becomes a MacBook Pro whose screen IS the live site
// (the real page, scaled into the screen), then the camera pushes in until the page is simply full size.
// Plays by itself on the first visit. Later, three upward scrolls at the top play it backwards: the live
// page shrinks back into the laptop, which turns back into the closed window. Scroll down or tap to open.
import { reducedMotion } from "./site.js";
import { draw, W, H } from "./intro-engine.js?v=0.9";

const root = document.querySelector("[data-intro]");
if (root) {
  window.__introReady = true;
  const html = document.documentElement;
  const KEY = "frames-intro-seen";
  const cvs = root.querySelector("canvas"), ctx = cvs.getContext("2d");
  const skip = root.querySelector("[data-intro-skip]"), cue = root.querySelector("[data-intro-cue]");
  const L = (a, b, t) => a + (b - a) * t;
  const OPT = { room: false, flow: true, live: true };

  /* ── the page parts that appear inside the laptop: top bar, the page, the timeline */
  const parts = () => [document.querySelector(".hud"), document.querySelector("main"), document.querySelector(".timeline")].filter(Boolean);
  let base = [];
  function reset() { for (const el of parts()) { el.style.transform = el.style.transformOrigin = el.style.clipPath = el.style.filter = el.style.willChange = ""; } }
  function measureParts() { reset(); base = parts().map((el) => { const r = el.getBoundingClientRect(); return { el, x: r.left, y: r.top, w: r.width, h: r.height }; }); }
  // place every part as if the whole viewport were scaled by sigma and moved to (tx, ty), visible only inside C
  function placePage(sigma, tx, ty, C, radius, filter) {
    for (const b of base) {
      const s = b.el.style;
      s.willChange = "transform, clip-path, filter";
      s.transformOrigin = "0 0";
      s.transform = `translate(${sigma * b.x + tx - b.x}px, ${sigma * b.y + ty - b.y}px) scale(${sigma})`;
      const top = Math.max(0, (C[1] - ty) / sigma - b.y), left = Math.max(0, (C[0] - tx) / sigma - b.x);
      const right = Math.max(0, b.w - ((C[2] - tx) / sigma - b.x)), bottom = Math.max(0, b.h - ((C[3] - ty) / sigma - b.y));
      s.clipPath = `inset(${top}px ${right}px ${bottom}px ${left}px round ${radius / sigma}px)`;
      s.filter = filter;
    }
  }

  /* ── drawing */
  let dpr = 1, cover = 1, p = 0;
  const size = () => { dpr = Math.min(2, devicePixelRatio || 1); cvs.width = innerWidth * dpr; cvs.height = innerHeight * dpr; };
  function measureCover() {                       // how far the camera must push so the laptop's screen covers the whole window
    const off = document.createElement("canvas"); off.width = cvs.width; off.height = cvs.height;
    const o = off.getContext("2d"), fs = Math.min(off.width / W, off.height / H);
    o.setTransform(fs, 0, 0, fs, (off.width - W * fs) / 2, (off.height - H * fs) / 2);
    const { screen } = draw(o, 1, { ...OPT, slate: false });
    cover = Math.max(off.width / (screen[2] - screen[0]), off.height / (screen[3] - screen[1]));
  }
  function frame(v) {
    const vw = innerWidth, vh = innerHeight;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "#0d0c0b"; ctx.fillRect(0, 0, cvs.width, cvs.height);
    const fs = Math.min(cvs.width / W, cvs.height / H);
    const zt = Math.min(1, Math.max(0, (v - .58) / .42)), z = zt * zt * (3 - zt) / 2;   // the engine's zoom progress
    const e = L(1, cover, z * z);                                               // extra push so the screen ends up covering the window
    const cx0 = cvs.width / 2, cy0 = cvs.height / 2;
    ctx.setTransform(fs * e, 0, 0, fs * e, cx0 + ((cvs.width - W * fs) / 2 - cx0) * e, cy0 + ((cvs.height - H * fs) / 2 - cy0) * e);
    const { screen, dev, radius } = draw(ctx, v, OPT);

    // the live page sits inside the laptop's screen (whole page fits the screen; full size at the end)
    const S = screen.map((n) => n / dpr), sw = S[2] - S[0], sh = S[3] - S[1];
    const sigma = Math.min(sw / vw, sh / vh);
    const tx = (S[0] + S[2]) / 2 - sigma * vw / 2, ty = (S[1] + S[3]) / 2 - sigma * vh / 2;
    const C = [Math.max(S[0], tx), Math.max(S[1], ty), Math.min(S[2], tx + sigma * vw), Math.min(S[3], ty + sigma * vh)];
    const r = radius * e / dpr;
    placePage(sigma, tx, ty, C, r, dev < 1 ? `sepia(${(1 - dev).toFixed(3)}) blur(${((1 - dev) * 5).toFixed(2)}px) brightness(${(.55 + dev * .45).toFixed(3)})` : "none");

    // open exactly that area in the drawing; the page "develops" as the opening fades in
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = dev;
    ctx.beginPath(); ctx.roundRect(C[0] * dpr, C[1] * dpr, (C[2] - C[0]) * dpr, (C[3] - C[1]) * dpr, radius * e); ctx.fill();
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = "source-over";
  }

  /* ── timing (approved draft): the window draws in, a beat, then one run that never brakes at the end */
  const CLOSED = .12, DRAW = .9, BEAT = .15, RUN = 3.8, RAMP = .12;
  const pace = (k) => { const v = 1 / (1 - RAMP / 2); return k < RAMP ? v * k * k / (2 * RAMP) : v * (k - RAMP / 2); };
  let raf = 0, state = "idle";
  function run(curve, total, done) {                    // drive p along a curve over time; Skip speeds it up
    cancelAnimationFrame(raf);
    let t = 0, last = performance.now();
    const step = (now) => {
      t += ((now - last) / 1000) * (state === "skipping" ? 6 : 1); last = now;
      if (t >= total) { p = curve(1, total); frame(p); raf = 0; done?.(); return; }
      p = curve(t / total, t); frame(p);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }
  function show() {
    html.classList.add("intro-on", "intro-playing"); root.classList.remove("is-leaving"); root.classList.add("is-live");
    cue.hidden = true; skip.hidden = false;
    scrollTo(0, 0); size(); measureParts(); measureCover();
  }
  function finish() {                                    // the screen covers the window: it's simply the site now
    state = "idle";
    reset();
    html.classList.remove("intro-on", "intro-playing");
    try { localStorage.setItem(KEY, "1"); } catch {}
  }
  function forward(fromClosed = false) {
    state = "playing"; show();
    const total = fromClosed ? BEAT + RUN : DRAW + BEAT + RUN;
    run((_, t) => {
      if (!fromClosed && t < DRAW) return CLOSED * (t / DRAW);
      const tt = fromClosed ? t : t - DRAW;
      return tt < BEAT ? CLOSED : CLOSED + (1 - CLOSED) * pace(Math.min(1, (tt - BEAT) / RUN));
    }, total, finish);
  }
  function closeWindow() {                               // the same film backwards: the live page shrinks into the laptop, then the window closes
    state = "closing"; show(); skip.hidden = true;
    run((k) => 1 - (1 - CLOSED) * pace(k), RUN, () => { state = "closed"; cue.hidden = false; });
  }
  addEventListener("resize", () => { if (html.classList.contains("intro-on")) { size(); measureParts(); measureCover(); frame(p); } });

  skip.addEventListener("click", () => { if (state === "playing") state = "skipping"; });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && state === "playing") state = "skipping"; });

  // closed window: scroll down, tap, or press a key to open it again
  const reopen = () => { if (state === "closed") forward(true); };
  root.addEventListener("wheel", (e) => { if (e.deltaY > 4) reopen(); }, { passive: true });
  root.addEventListener("click", (e) => { if (!e.target.closest("[data-intro-skip]")) reopen(); });
  let ty0 = 0;
  root.addEventListener("touchstart", (e) => { ty0 = e.touches[0].clientY; }, { passive: true });
  root.addEventListener("touchend", (e) => { if (ty0 - e.changedTouches[0].clientY > 30) reopen(); }, { passive: true });
  addEventListener("keydown", (e) => { if (["ArrowDown", "PageDown", " ", "Enter"].includes(e.key) && state === "closed") { e.preventDefault(); reopen(); } });

  // at the top of the page, three upward scrolls bring the window back (no on-screen hint)
  let count = 0, first = 0, lastUp = 0;
  function upIntent() {
    if (state !== "idle" || scrollY > 2 || reducedMotion) return;
    const now = performance.now();
    if (now - lastUp < 450) return;                      // one count per gesture
    if (now - first > 6000) { count = 0; first = now; }
    lastUp = now; count++;
    if (count >= 3) { count = 0; closeWindow(); }
  }
  addEventListener("wheel", (e) => { if (e.deltaY < -4 && !html.classList.contains("intro-on")) upIntent(); }, { passive: true });
  let sy = 0, counted = false;
  addEventListener("touchstart", (e) => { sy = e.touches[0].clientY; counted = false; }, { passive: true });
  addEventListener("touchmove", (e) => { if (!counted && !html.classList.contains("intro-on") && e.touches[0].clientY - sy > 50) { counted = true; upIntent(); } }, { passive: true });
  addEventListener("keydown", (e) => { if (["ArrowUp", "PageUp", "Home"].includes(e.key) && !html.classList.contains("intro-on")) upIntent(); });

  window.__introAt = (v) => { cancelAnimationFrame(raf); state = "debug"; show(); p = v; frame(p); };   // review aid

  // first visit: play
  if (html.classList.contains("intro-on")) document.fonts.load('400 15px "Space Mono"').finally(() => forward());
}
