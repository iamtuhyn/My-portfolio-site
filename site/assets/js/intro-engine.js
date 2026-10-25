// FRAMES · intro engine (lab). One function, draw(ctx, p), renders any moment of the intro (p from 0 to 1):
// a window on the back wall of a room → its shutters open inward → it becomes a MacBook Pro → the screen develops
// → the camera pushes into the screen. Everything shares one vanishing point, so the window and the laptop are
// the same object in the same space: the frame becomes the lid, the opening becomes the display, the sill becomes the deck.

export const W = 1600, H = 1000;                       // the film frame (16:10)
const VP = [800, 470], F = 1400;                       // vanishing point, focal length
const C = {
  bg: "#0d0c0b", dot: "rgba(250,246,238,.055)", line: "#ddd7cb", fine: "rgba(221,215,203,.62)", faint: "rgba(221,215,203,.38)",
  accent: "#a8d5ba", wood: "#16131a", woodHi: "#1d1922", black: "#060608", deck: "#121016",
};

const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const seg = (p, a, b) => clamp((p - a) / (b - a));
const io = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);          // ease in-out (cubic)
const out = (t) => 1 - Math.pow(1 - t, 3);                                              // ease out (cubic)
const L = (a, b, t) => a + (b - a) * t;
const LA = (a, b, t) => a.map((v, i) => L(v, b[i], t));
const P = (X, Y, Z = 0) => { const s = F / (F + Z); return [VP[0] + (X - VP[0]) * s, VP[1] + (Y - VP[1]) * s]; };

/* ── pen: polylines subdivided and nudged a little (same offsets every frame, so nothing shimmers) */
function hash(i, s) { const n = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return n - Math.floor(n) - .5; }
function subdivide(pts, closed, step = 18) {
  const src = closed ? [...pts, pts[0]] : pts, outPts = [src[0]];
  for (let i = 1; i < src.length; i++) {
    const [x0, y0] = src[i - 1], [x1, y1] = src[i], n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0) / step));
    for (let k = 1; k <= n; k++) outPts.push([L(x0, x1, k / n), L(y0, y1, k / n)]);
  }
  return outPts;
}
let wobble = .55;
function pen(ctx, pts, { w = 1.6, color = C.line, t = 1, closed = false, seed = 1, amp = wobble, fill = null } = {}) {
  amp = Math.min(amp, wobble);
  if (t <= 0 || pts.length < 2) return;
  const q = subdivide(pts, closed).map(([x, y], i) => [x + hash(i, seed) * amp * 2, y + hash(i + 999, seed) * amp * 2]);
  if (fill) { ctx.beginPath(); q.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }
  let total = 0; const lens = [0];
  for (let i = 1; i < q.length; i++) { total += Math.hypot(q[i][0] - q[i - 1][0], q[i][1] - q[i - 1][1]); lens.push(total); }
  const stop = total * clamp(t);
  ctx.beginPath(); ctx.moveTo(q[0][0], q[0][1]);
  for (let i = 1; i < q.length; i++) {
    if (lens[i] <= stop) { ctx.lineTo(q[i][0], q[i][1]); continue; }
    const k = (stop - lens[i - 1]) / (lens[i] - lens[i - 1] || 1);
    ctx.lineTo(L(q[i - 1][0], q[i][0], k), L(q[i - 1][1], q[i][1], k)); break;
  }
  ctx.lineWidth = w; ctx.strokeStyle = color; ctx.lineCap = "round"; ctx.lineJoin = "round"; ctx.stroke();
}
// a rounded rectangle in a plane of constant depth Z, as a projected polyline
function rrect3([x0, y0, x1, y1], r, Z = 0) {
  r = Math.min(r, (x1 - x0) / 2, (y1 - y0) / 2);
  const pts = [], arc = (cx, cy, a0) => { for (let k = 0; k <= 6; k++) { const a = a0 + (k / 6) * Math.PI / 2; pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]); } };
  arc(x1 - r, y0 + r, -Math.PI / 2); arc(x1 - r, y1 - r, 0); arc(x0 + r, y1 - r, Math.PI / 2); arc(x0 + r, y0 + r, Math.PI);
  return pts.map(([x, y]) => P(x, y, Z));
}
const tracePath = (ctx, pts) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); };

/* ── the scene */
const ROOM = [300, 170, 1300, 760];                              // back wall
const WIN = { frame: [670, 300, 930, 510], open: [684, 314, 916, 496], sill: { x0: 650, x1: 950, y: 510, d: 36, lip: 12 } };
const MAC = { frame: [420, 150, 1180, 644], open: [438, 168, 1162, 620], sill: { x0: 420, x1: 1180, y: 644, d: 520, lip: 14 } };

let heroCanvas = null;                                           // the hero, pre-rendered once at film size
export function prepare(images) {
  const c = document.createElement("canvas"); c.width = W; c.height = H;
  const g = c.getContext("2d");
  g.fillStyle = C.bg; g.fillRect(0, 0, W, H);
  // a wall of work tiles, grey and dim
  const cols = 6, rows = 5, gap = 22, tw = (W + 160 - gap * (cols - 1)) / cols, th = tw * .625;
  g.filter = "grayscale(1) brightness(.5) contrast(1.05)";
  images.forEach((img, i) => {
    if (i >= cols * rows) return;
    const x = -80 + (i % cols) * (tw + gap), y = -40 + Math.floor(i / cols) * (th + gap);
    g.save(); g.beginPath(); g.roundRect(x, y, tw, th, 14); g.clip(); g.drawImage(img, x, y, tw, th); g.restore();
  });
  g.filter = "none";
  const veil = g.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * .5);
  veil.addColorStop(0, "rgba(13,12,11,1)"); veil.addColorStop(.42, "rgba(13,12,11,.95)"); veil.addColorStop(.75, "rgba(13,12,11,.55)"); veil.addColorStop(1, "rgba(13,12,11,.2)");
  g.fillStyle = veil; g.fillRect(0, 0, W, H);
  g.textAlign = "center"; g.fillStyle = C.accent; g.font = '400 19px "Space Mono"';
  g.fillText("JOACIM TUHIN GAIN  ·  DESIGN ENGINEER", W / 2, 352);
  g.font = '600 104px "Bricolage Grotesque"'; g.fillStyle = "#faf6ee";
  g.fillText("Everything I've", W / 2, 470); g.fillText("made has been a", W / 2, 572);
  g.fillStyle = C.accent; g.fillText("frame.", W / 2, 674);
  heroCanvas = c;
}

export function draw(ctx, p, { slate = true, room = true, flow = false, live = false } = {}) {
  // live: the screen is left open (not painted) so the real site can show through it; draw() returns where the screen is
  // timing: overlapping stages, so the motion never stops
  const drawIn = io(seg(p, 0, .12));                             // the room and window draw themselves
  const swing = out(seg(p, .115, .30));                          // shutters swing open, inward, toward us (starts promptly)
  const fold = io(seg(p, .27, .39));                              // …and fold back flat against the wall
  const lift = io(seg(p, .25, .37));                              // the bars slide up out of the opening
  // flow: no stop on the finished laptop — the push-in starts as the laptop forms, and the screen develops on the way in
  const T = flow ? { m: [.38, .62], keys: [.5, .62], dev: [.5, .76], z: [.58, 1] } : { m: [.38, .66], keys: [.56, .74], dev: [.58, .80], z: [.80, 1] };
  const m = io(seg(p, ...T.m));                                   // window → laptop
  const keys = out(seg(p, ...T.keys));                            // keyboard, trackpad, grilles draw in
  const dev = io(seg(p, ...T.dev));                               // the screen develops
  const zt = seg(p, ...T.z);
  const z = flow ? zt * zt * (3 - zt) / 2 : io(zt);              // flow: eases in and keeps accelerating into the screen (no settling, no stop)

  ctx.save();
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = C.dot;
  for (let x = 12; x < W; x += 24) for (let y = 12; y < H; y += 24) ctx.fillRect(x - .9, y - .9, 1.8, 1.8);

  // camera push: scale about the display's centre until it fills the frame
  const disp = LA(WIN.open, MAC.open, m);
  const dcx = (disp[0] + disp[2]) / 2, dcy = (disp[1] + disp[3]) / 2;
  const sFill = Math.min(W / (MAC.open[2] - MAC.open[0]), H / (MAC.open[3] - MAC.open[1]));
  const s = L(1, sFill, z);
  ctx.translate(L(dcx, W / 2, z), L(dcy, H / 2, z)); ctx.scale(s, s); ctx.translate(-dcx, -dcy);
  const lw = 1 / Math.max(1, s * .7);                             // lines don't fatten as we push in
  wobble = .55 / s;                                               // …and don't get shaky either

  // 1 · the room: back wall + the four lines that run toward us
  const roomA = room ? 1 - seg(p, .40, .56) : 0;           // room lines are optional (the draft without them)
  if (roomA > 0) {
    ctx.globalAlpha = roomA;
    const [x0, y0, x1, y1] = ROOM;
    pen(ctx, [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], { closed: true, t: drawIn, w: 1.2 * lw, color: C.fine, seed: 2 });
    [[x0, y0], [x1, y0], [x1, y1], [x0, y1]].forEach(([x, y], i) => pen(ctx, [P(x, y, 0), P(x, y, -1260)], { t: drawIn, w: 1.2 * lw, color: C.fine, seed: 3 + i }));
    ctx.globalAlpha = 1;
  }

  // 2 · window ↔ laptop geometry
  const frame = LA(WIN.frame, MAC.frame, m), open = disp;
  const sill = { x0: L(WIN.sill.x0, MAC.sill.x0, m), x1: L(WIN.sill.x1, MAC.sill.x1, m), y: L(WIN.sill.y, MAC.sill.y, m), d: L(WIN.sill.d, MAC.sill.d, m), lip: L(WIN.sill.lip, MAC.sill.lip, m) };
  const recess = L(40, 0, m);                                     // the wall's thickness, gone once it's a screen
  const inner = rrect3(open, L(2, 12, m), recess);

  // outside: the village, then the hero on the screen
  ctx.save(); tracePath(ctx, inner); ctx.clip();
  ctx.fillStyle = C.black; ctx.fillRect(0, 0, W, H);
  const viewA = swing * (1 - seg(p, .56, .68));
  if (viewA > 0) village(ctx, inner, viewA, lw);
  if (!live && dev > 0 && heroCanvas) {
    const [a, b] = [inner.reduce((m, q) => [Math.min(m[0], q[0]), Math.min(m[1], q[1])], [1e9, 1e9]), inner.reduce((m, q) => [Math.max(m[0], q[0]), Math.max(m[1], q[1])], [-1e9, -1e9])];
    ctx.globalAlpha = dev;
    ctx.filter = dev < 1 ? `sepia(${1 - dev}) blur(${(1 - dev) * 7}px) brightness(${.55 + dev * .45})` : "none";
    ctx.drawImage(heroCanvas, a[0], a[1], b[0] - a[0], b[1] - a[1]);
    ctx.filter = "none"; ctx.globalAlpha = 1;
  }
  ctx.restore();

  // the recess: depth of the wall around the opening
  if (recess > 1) {
    const front = rrect3(open, 2, 0);
    ctx.globalAlpha = drawIn;
    [0, 7, 14, 21].forEach((i) => pen(ctx, [front[i], inner[i]], { w: 1 * lw, color: C.fine, seed: 20 + i, amp: .3 }));
    ctx.globalAlpha = 1;
  }

  // iron bars, sliding up out of the opening
  const barsA = 1 - seg(p, .31, .38);
  if (barsA > 0) {
    ctx.save(); tracePath(ctx, inner); ctx.clip(); ctx.globalAlpha = barsA;
    const [ox0, oy0, ox1, oy1] = WIN.open, dy = -lift * (oy1 - oy0 + 20);
    for (let k = 1; k < 8; k++) { const x = L(ox0, ox1, k / 8); pen(ctx, [P(x, oy0 + dy, 20), P(x, oy1 + dy, 20)], { t: drawIn, w: 1.3 * lw, seed: 40 + k, amp: .3 }); }
    [.34, .68].forEach((v, k) => { const y = L(oy0, oy1, v) + dy; pen(ctx, [P(ox0, y, 20), P(ox1, y, 20)], { t: drawIn, w: 2 * lw, color: C.fine, seed: 60 + k, amp: .3 }); });
    ctx.restore(); ctx.globalAlpha = 1;
  }

  // the frame: wood → aluminium and black glass
  const outer = rrect3(frame, L(3, 28, m), 0), front = rrect3(open, L(2, 12, m), 0);
  ctx.beginPath(); [outer, front].forEach((poly) => { poly.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); });
  ctx.globalAlpha = drawIn; ctx.fillStyle = m < .5 ? C.wood : C.black; ctx.fill("evenodd"); ctx.globalAlpha = 1;
  pen(ctx, outer, { closed: true, t: drawIn, w: 1.8 * lw, seed: 7 });
  pen(ctx, front, { closed: true, t: drawIn, w: 1.1 * lw, color: C.fine, seed: 8 });
  if (m > .55) {                                                   // the lid's thin bezel line and the notch
    ctx.globalAlpha = seg(m, .55, 1);
    const n = [(open[0] + open[2]) / 2 - 38, open[1], (open[0] + open[2]) / 2 + 38, open[1] + 13];
    ctx.fillStyle = C.black; tracePath(ctx, rrect3(n, 6, 0)); ctx.fill();
    ctx.globalAlpha = 1;
  }

  // the sill → the keyboard deck (a horizontal slab coming toward us)
  const top = [P(sill.x0, sill.y, 0), P(sill.x1, sill.y, 0), P(sill.x1, sill.y, -sill.d), P(sill.x0, sill.y, -sill.d)];
  const lip = [P(sill.x0, sill.y, -sill.d), P(sill.x1, sill.y, -sill.d), P(sill.x1, sill.y + sill.lip, -sill.d), P(sill.x0, sill.y + sill.lip, -sill.d)];
  ctx.globalAlpha = drawIn;
  pen(ctx, top, { closed: true, t: drawIn, w: 1.6 * lw, seed: 9, fill: m < .5 ? C.wood : C.deck });
  pen(ctx, lip, { closed: true, t: drawIn, w: 1.4 * lw, seed: 10, fill: C.woodHi });
  ctx.globalAlpha = 1;
  if (keys > 0) laptopDetails(ctx, sill, keys, lw);

  // shutters: hinged at the opening's sides, they swing inward (toward us), then fold flat on the wall
  const shutA = 1 - seg(p, .33, .40);
  if (shutA > 0) {
    const th = (swing * 112 + fold * 66) * Math.PI / 180;
    ctx.globalAlpha = shutA;
    shutter(ctx, WIN.open[0], 1, th, drawIn, lw, 30);
    shutter(ctx, WIN.open[2], -1, th, drawIn, lw, 31);
    ctx.globalAlpha = 1;
  }
  // where the screen is, in canvas pixels (for the live site behind it)
  const M = ctx.getTransform(), pts = inner.map(([x, y]) => [M.a * x + M.c * y + M.e, M.b * x + M.d * y + M.f]);
  const screen = [Math.min(...pts.map((q) => q[0])), Math.min(...pts.map((q) => q[1])), Math.max(...pts.map((q) => q[0])), Math.max(...pts.map((q) => q[1]))];
  ctx.restore();

  if (slate) {
    ctx.font = '400 15px "Space Mono"'; ctx.textAlign = "left"; ctx.fillStyle = C.accent;
    const label = p < .5 ? ["FRAME 00", "  ·  A WINDOW  ·  NARIKELBARI"] : ["FRAME 01", "  ·  A SCREEN  ·  TODAY"];
    ctx.globalAlpha = 1 - seg(p, .86, .96);
    ctx.fillText(label[0], 40, H - 40); const w0 = ctx.measureText(label[0]).width;
    ctx.fillStyle = "rgba(154,147,163,1)"; ctx.fillText(label[1], 40 + w0, H - 40);
    ctx.globalAlpha = 1;
  }
  return { screen, dev, z, radius: L(2, 12, m) * s };
}

function shutter(ctx, hinge, dir, th, t, lw, seed) {
  const [, y0, , y1] = WIN.open, w = (WIN.open[2] - WIN.open[0]) / 2;
  const at = (u, v, dz = 0) => P(hinge + dir * u * w * Math.cos(th), L(y0, y1, v), -u * w * Math.sin(th) + dz);
  const quad = (u0, v0, u1, v1, dz = 0) => [at(u0, v0, dz), at(u1, v0, dz), at(u1, v1, dz), at(u0, v1, dz)];
  pen(ctx, quad(0, 0, 1, 1), { closed: true, t, w: 1.6 * lw, seed, fill: C.wood });
  pen(ctx, quad(.1, .07, .9, .93), { closed: true, t, w: 1 * lw, color: C.fine, seed: seed + 1, amp: .3 });
  for (let k = 1; k < 7; k++) { const v = L(.07, .93, k / 7); pen(ctx, [at(.1, v), at(.9, v)], { t, w: .9 * lw, color: C.faint, seed: seed + 2 + k, amp: .25 }); }
  // a pull handle, standing off the wood
  pen(ctx, [at(.93, .43), at(.93, .43, -6), at(.93, .57, -6), at(.93, .57)], { t, w: 1.6 * lw, seed: seed + 12, amp: .2 });
}

function village(ctx, inner, a, lw) {
  const xs = inner.map((q) => q[0]), ys = inner.map((q) => q[1]);
  const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys), w = x1 - x0, h = y1 - y0;
  const U = (u, v) => [x0 + u * w, y0 + v * h];
  ctx.globalAlpha = a;
  const sky = ctx.createLinearGradient(0, y0, 0, y1);
  sky.addColorStop(0, "rgba(168,213,186,.16)"); sky.addColorStop(.62, "rgba(168,213,186,.05)"); sky.addColorStop(1, "rgba(168,213,186,.02)");
  ctx.fillStyle = sky; ctx.fillRect(x0, y0, w, h);
  const [sx, sy] = U(.76, .26), r = h * .09;
  ctx.beginPath(); ctx.arc(sx, sy, r, 0, Math.PI * 2); ctx.strokeStyle = C.accent; ctx.lineWidth = 1.4 * lw; ctx.stroke();
  pen(ctx, [U(0, .64), U(.2, .6), U(.42, .66), U(.66, .61), U(.86, .65), U(1, .62)], { w: 1 * lw, color: C.fine, seed: 80 });
  [[.08, .84], [.6, .8]].forEach(([u, v], k) => pen(ctx, [U(u, v), U(u + .05, v - .025), U(u + .1, v), U(u + .15, v - .025), U(u + .2, v)], { w: .9 * lw, color: C.faint, seed: 81 + k }));
  const palm = (bx, top, lean, size, sd) => {
    const base = U(bx, 1.02), crown = U(bx + lean, top);
    pen(ctx, [base, U(bx + lean * .3, (1 + top) / 2 + .05), crown], { w: 1.5 * lw, seed: sd });
    [[-.16, .05], [-.11, -.06], [.12, -.05], [.16, .06], [.02, -.11], [-.05, .1]].forEach(([du, dv], k) =>
      pen(ctx, [crown, [crown[0] + du * w * size * .55, crown[1] + (dv - .03) * h * size * .55], [crown[0] + du * w * size, crown[1] + dv * h * size]], { w: 1 * lw, color: C.fine, seed: sd + k + 1 }));
  };
  palm(.3, .3, .05, 1, 90); palm(.62, .46, .04, .8, 100);
  ctx.globalAlpha = 1;
}

function laptopDetails(ctx, sill, k, lw) {
  const y = sill.y, at = (x, z) => P(x, y, z);
  const n = (i, total) => clamp(k * total - i);                      // stagger: things draw in one after another
  // keyboard well
  pen(ctx, [at(530, -48), at(1070, -48), at(1070, -282), at(530, -282)], { closed: true, t: n(0, 3), w: 1 * lw, color: C.fine, seed: 120, amp: .25 });
  // keys: 6 rows × 14
  ctx.globalAlpha = .55;
  const rows = 6, cols = 14;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const i = r * cols + c; if (i / (rows * cols) > k * 1.15) continue;
    const xa = L(540, 1060, c / cols) + 3, xb = L(540, 1060, (c + 1) / cols) - 3, za = L(-56, -274, r / rows) - 3, zb = L(-56, -274, (r + 1) / rows) + 3;
    const q = [at(xa, za), at(xb, za), at(xb, zb), at(xa, zb)];
    ctx.beginPath(); q.forEach(([x, yy], j) => (j ? ctx.lineTo(x, yy) : ctx.moveTo(x, yy))); ctx.closePath();
    ctx.lineWidth = .8 * lw; ctx.strokeStyle = C.fine; ctx.stroke();
  }
  ctx.globalAlpha = 1;
  // trackpad
  pen(ctx, [at(680, -322), at(920, -322), at(920, -478), at(680, -478)], { closed: true, t: n(1, 3), w: 1.1 * lw, color: C.fine, seed: 121, amp: .25 });
  // speaker grilles
  ctx.fillStyle = C.faint;
  for (let z = -56; z > -274; z -= 9) for (const x of [462, 478, 1122, 1138]) { if (k < .4) break; const [px, py] = at(x, z); ctx.fillRect(px - .7, py - .7, 1.4, 1.4); }
  // the thumb scoop on the front lip
  const [cx, cy] = P(800, y + 2, -sill.d);
  ctx.beginPath(); ctx.ellipse(cx, cy, 46 * F / (F - sill.d), 6, 0, 0, Math.PI); ctx.lineWidth = 1 * lw; ctx.strokeStyle = C.fine; ctx.globalAlpha = k; ctx.stroke(); ctx.globalAlpha = 1;
}
