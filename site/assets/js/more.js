// FRAMES v0.7 · Frames page: graphic-design sets and the photography grid, both opening in one lightbox.
import { galleries, photos, sizes } from "./media.js";
import { makeDialog, observeReveals } from "./site.js";

const SETS = [
  ["gfx/set-rickshaw", "Rickshaw Travels", "Brand identity · 2014"],
  ["gfx/set-ronggin", "Ronggin Canvas Academy", "Brand guidelines · 2014"],
  ["gfx/set-coffee-hub", "Coffee Hub", "Identity & campaign · 2016"],
  ["gfx/set-occasions", "Occasions", "Greeting cards & posters · 2015–2017"],
  ["gfx/set-catalyst", "Catalyst", "Print ads · 2015"],
  ["gfx/set-collage", "Photo manipulation", "Photoshop studies · 2015"],
];
const SERIES = [["all", "All"], ["mono", "Monochrome"], ["stage", "Light & stage"], ["land", "Landscapes"], ["arch", "Architecture"], ["small", "Small things"]];
const src = (key) => `assets/img/${key}.webp`;

/* ── Lightbox: one dialog for everything on this page */
const box = makeDialog("modal--lightbox", "Image viewer");
box.innerHTML = `
  <button class="modal__close" type="button" aria-label="Close">✕</button>
  <figure class="lb"><div class="lb__stage"><img alt=""></div>
    <figcaption class="lb__cap"><span class="lb__title"></span><span class="lb__count mono"></span></figcaption></figure>
  <button class="pm__nav pm__nav--prev" type="button" aria-label="Previous">←</button>
  <button class="pm__nav pm__nav--next" type="button" aria-label="Next">→</button>`;
let list = [], at = 0, title = "";
const lbImg = box.querySelector("img");
function show(i) {
  at = (i + list.length) % list.length;
  lbImg.src = src(list[at]); lbImg.alt = `${title}, ${at + 1} of ${list.length}`;
  box.querySelector(".lb__title").textContent = title;
  box.querySelector(".lb__count").textContent = `${String(at + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
  box.querySelectorAll(".pm__nav").forEach((b) => (b.hidden = list.length < 2));
}
function openBox(items, i, name) { list = items; title = name; show(i); if (!box.open) box.showModal(); }
box.querySelector(".modal__close").addEventListener("click", () => box.close());
box.querySelector(".pm__nav--prev").addEventListener("click", () => show(at - 1));
box.querySelector(".pm__nav--next").addEventListener("click", () => show(at + 1));
box.addEventListener("keydown", (e) => { if (e.key === "ArrowLeft") show(at - 1); if (e.key === "ArrowRight") show(at + 1); });
let sx = null;
box.addEventListener("touchstart", (e) => { sx = e.touches[0].clientX; }, { passive: true });
box.addEventListener("touchend", (e) => { if (sx === null) return; const dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 40) show(at + (dx < 0 ? 1 : -1)); sx = null; });

/* ── Graphic-design sets */
const setsEl = document.querySelector("[data-sets]");
if (setsEl) {
  setsEl.innerHTML = SETS.filter(([k]) => galleries[k]?.length).map(([k, name, meta]) => {
    const items = galleries[k];
    return `<button type="button" class="set reveal" data-set="${k}" aria-label="Open ${name}, ${items.length} pieces">
      <span class="set__media" data-discover><img src="${src(items[0])}" alt="" loading="lazy"><span class="discover" aria-hidden="true">Open set</span></span>
      <span class="set__foot"><span class="set__title">${name}</span><span class="set__meta mono">${meta} · ${items.length} ${items.length > 1 ? "pieces" : "piece"}</span></span>
    </button>`;
  }).join("");
  setsEl.addEventListener("click", (e) => {
    const b = e.target.closest("[data-set]");
    if (b) openBox(galleries[b.dataset.set], 0, SETS.find(([k]) => k === b.dataset.set)[1]);
  });
}

/* ── Photography: series filter + justified rows (each photo keeps its own shape) */
const grid = document.querySelector("[data-photos]");
if (grid && photos?.length) {
  const name = { mono: "Monochrome", stage: "Light & stage", land: "Landscapes", arch: "Architecture", small: "Small things" };
  grid.innerHTML = photos.map(([key, series, w, h], i) =>
    `<button type="button" class="jgrid__item" data-i="${i}" data-series="${series}" style="--r:${(w / h).toFixed(4)}" aria-label="Open photo ${i + 1}, ${name[series]}">
      <img src="assets/img/${key.replace("photo/", "photo/g/")}.webp" alt="" loading="lazy" width="${w}" height="${h}">
      <span class="jgrid__n mono">FR ${String(i + 1).padStart(3, "0")}</span>
    </button>`).join("") + '<span class="jgrid__fill" aria-hidden="true"></span>';
  let visible = photos.map((_, i) => i);
  grid.addEventListener("click", (e) => {
    const b = e.target.closest("[data-i]");
    if (!b) return;
    openBox(visible.map((i) => photos[i][0]), visible.indexOf(+b.dataset.i), "Photography");
  });
  const bar = document.getElementById("ph-filters");
  bar.innerHTML = SERIES.map(([k, label], i) => `<button type="button" data-f="${k}" aria-pressed="${i === 0}">${label}</button>`).join("");
  bar.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    bar.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    const f = b.dataset.f;
    visible = [];
    grid.querySelectorAll("[data-i]").forEach((el) => { const on = f === "all" || el.dataset.series === f; el.hidden = !on; if (on) visible.push(+el.dataset.i); });
  });
}
observeReveals();
