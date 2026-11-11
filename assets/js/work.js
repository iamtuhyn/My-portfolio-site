// FRAMES v0.5 · /work: cards + contact sheet from projects.js, filters,
// view toggle, and a gallery modal for every project.
import { projects, filters } from "./projects.js?v=1.2.1";
import { galleries } from "./media.js";
import { makeDialog, enhanceButtons, observeReveals } from "./site.js";

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const imagesOf = (p) => (p.images ? p.images : galleries[p.gallery] || []);
const coverOf = (p) => imagesOf(p)[p.cover ?? 0];
const img = (key, alt, extra = "") => `<img src="assets/img/${key}.webp" alt="${esc(alt)}" loading="lazy" ${extra}>`;

// A card is a frame, not a paragraph: number ↔ year and type ↔ frame count swap on hover,
// an arrow slides in before the title, and a "Discover" chip follows the cursor over the image.
function card(p, i) {
  const imgs = imagesOf(p);
  return `<button type="button" class="card reveal" id="p-${p.id}" data-id="${p.id}" data-cats="${p.cats.join(" ")}" aria-haspopup="dialog" aria-label="${esc(p.title)}, ${p.year}. ${esc(p.kicker)}">
    <span class="card__top mono" aria-hidden="true"><span class="swap"><span>${String(i + 1).padStart(2, "0")}</span><span>${p.year}</span></span></span>
    <span class="card__media" data-discover>${coverOf(p) ? img(coverOf(p), "") : `<span class="ph"><strong>${esc(p.kicker.split(" · ").pop())}</strong>${esc(p.did ? p.did.split(" (")[0] : "")}</span>`}
      <span class="discover" aria-hidden="true">Discover</span></span>
    <span class="card__foot" aria-hidden="true">
      <span class="card__title"><i>→</i>${esc(p.title)}</span>
      <span class="swap card__type"><span>${esc(p.kicker.split(" · ")[0])}</span><span>${imgs.length > 1 ? `${imgs.length} screens` : "Open"}</span></span>
    </span>
  </button>`;
}
function cell(p, idAttr = "id") {
  return `<button type="button" class="frame-cell" ${idAttr}="p-${p.id}" data-id="${p.id}" data-cats="${p.cats.join(" ")}" aria-haspopup="dialog">
    <div class="thumb">${coverOf(p) ? img(coverOf(p), p.title) : '<span class="mono muted">Soon</span>'}</div>
    <p><small>${p.year} · ${esc(p.kicker)}</small>${esc(p.title)}</p>
  </button>`;
}

$("#selected").innerHTML = projects.filter((p) => p.tier === "selected").map((p, i) => card(p, i)).join("");
$("#sheet").innerHTML = projects.filter((p) => p.tier === "archive").map((p) => cell(p)).join("");
const years = [...new Set(projects.map((p) => p.year))].sort((a, b) => a - b);
$("#timeline").innerHTML = years.map((y) =>
  `<div class="year-col"><h3>${y}</h3>${projects.filter((p) => p.year === y).map((p) => cell(p, "data-anchor")).join("")}</div>`).join("");

/* Filters */
const bar = $("#filters");
bar.innerHTML = filters.map(([key, label], i) => `<button type="button" data-f="${key}" aria-pressed="${i === 0}">${label}</button>`).join("");
bar.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;
  bar.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  const f = btn.dataset.f;
  document.querySelectorAll("[data-cats]").forEach((el) => { el.hidden = f !== "all" && !el.dataset.cats.split(" ").includes(f); });
});

/* View toggle */
document.querySelectorAll(".view-toggle button").forEach((btn) => btn.addEventListener("click", () => {
  document.querySelectorAll(".view-toggle button").forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
  const tl = btn.dataset.view === "timeline";
  $("#timeline").hidden = !tl; $("#archive-block").hidden = tl; $("#selected-block").hidden = tl;
}));

/* Project modal: a gallery with thumbnails, arrows, keyboard and swipe */
const dlg = makeDialog("modal--project", "Project");
let current = null, index = 0;
function openProject(p, at = 0) {
  current = p; index = at;
  const imgs = imagesOf(p);
  dlg.innerHTML = `
    <button class="modal__close" type="button" aria-label="Close">✕</button>
    <div class="pm">
      <div class="pm__stage">
        <div class="pm__view" aria-live="polite"></div>
        ${imgs.length > 1 ? `<button class="pm__nav pm__nav--prev" type="button" aria-label="Previous image">←</button><button class="pm__nav pm__nav--next" type="button" aria-label="Next image">→</button>
        <span class="pm__count chip"></span>
        <div class="pm__thumbs" role="group" aria-label="Images">${imgs.map((k, i) => `<button type="button" data-i="${i}" aria-label="Image ${i + 1}">${img(k, "")}</button>`).join("")}</div>` : ""}
      </div>
      <div class="pm__info">
        <span class="mono muted">${p.year} · ${esc(p.kicker)}</span>
        <h2>${esc(p.title)}</h2>
        <div class="pm__chips">${p.role ? `<span class="chip chip--solid">${esc(p.role)}</span>` : ""}${p.cats.map((c) => `<span class="chip">${esc(c)}</span>`).join("")}</div>
        ${p.problem ? `<dl><div><dt>Problem</dt><dd>${esc(p.problem)}</dd></div><div><dt>What I did</dt><dd>${esc(p.did)}</dd></div><div><dt>Learned</dt><dd>${esc(p.learned)}</dd></div></dl>`
          : `<p class="muted" style="font-size:.8rem; margin-top:16px">From the archive. Short on words, long on visuals.</p>`}
        ${p.link ? `<a class="btn btn--primary btn--sm" href="${p.link}" data-icon="→">${p.link.includes("work/") ? "Read the case study" : "See it in the story"}</a>` : ""}
      </div>
    </div>`;
  enhanceButtons(dlg);
  dlg.querySelector(".modal__close").addEventListener("click", () => dlg.close());
  dlg.querySelector(".pm__prev, .pm__nav--prev")?.addEventListener("click", () => show(index - 1));
  dlg.querySelector(".pm__nav--next")?.addEventListener("click", () => show(index + 1));
  dlg.querySelector(".pm__thumbs")?.addEventListener("click", (e) => { const b = e.target.closest("[data-i]"); if (b) show(Number(b.dataset.i)); });
  show(at);
  dlg.showModal();
  history.replaceState(null, "", `#p-${p.id}`);
}
function show(i) {
  const imgs = imagesOf(current);
  const view = dlg.querySelector(".pm__view");
  if (!imgs.length) { view.innerHTML = `<div class="ph" style="width:100%"><strong>No public screens</strong>The screens for this project aren't published here</div>`; return; }
  index = (i + imgs.length) % imgs.length;
  const key = imgs[index];
  const vid = current.videos?.[index];
  view.innerHTML = vid
    ? `<video src="assets/video/${vid}.mp4" poster="assets/img/${key}.webp" controls autoplay muted loop playsinline></video>`
    : `<img src="assets/img/${key}.webp" alt="${esc(current.title)}, image ${index + 1} of ${imgs.length}" data-zoom>`;
  dlg.querySelectorAll(".pm__thumbs button").forEach((b, n) => b.setAttribute("aria-current", String(n === index)));
  dlg.querySelector(".pm__thumbs button[aria-current=true]")?.scrollIntoView({ block: "nearest", inline: "nearest" });
  const count = dlg.querySelector(".pm__count");
  if (count) count.textContent = `${index + 1} / ${imgs.length}`;
}
dlg.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") show(index + 1);
  if (e.key === "ArrowLeft") show(index - 1);
});
let touchX = null;
dlg.addEventListener("touchstart", (e) => { if (e.target.closest(".pm__view")) touchX = e.touches[0].clientX; }, { passive: true });
dlg.addEventListener("touchend", (e) => {
  if (touchX === null) return;
  const dx = e.changedTouches[0].clientX - touchX;
  if (Math.abs(dx) > 40) show(index + (dx < 0 ? 1 : -1));
  touchX = null;
});
dlg.addEventListener("close", () => history.replaceState(null, "", location.pathname));

document.addEventListener("click", (e) => {
  const el = e.target.closest("[data-id]");
  if (!el || e.target.closest("dialog")) return;
  const p = projects.find((x) => x.id === el.dataset.id);
  if (p) openProject(p);
});

observeReveals();
// Deep links (#p-…) from the story: scroll to the project and highlight it.
if (location.hash.startsWith("#p-")) {
  const el = document.getElementById(location.hash.slice(1));
  if (el) { el.classList.add("is-target"); requestAnimationFrame(() => el.scrollIntoView({ block: "center" })); }
}
