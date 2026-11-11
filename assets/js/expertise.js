// FRAMES v0.7 · Expertise: the services dial. Scrolling through the section turns the list;
// the current service sits on the centre line, with its one-line description.
import { reducedMotion } from "./site.js";

const svc = document.querySelector("[data-svc]");
if (svc) {
  const list = svc.querySelector(".svc__list");
  const items = [...list.children];
  let current = -1;
  function update() {
    const r = svc.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height - innerHeight)));
    const i = Math.round(p * (items.length - 1));
    if (i === current) return;
    current = i;
    items.forEach((li, k) => { li.classList.toggle("is-on", k === i); li.dataset.d = String(Math.min(3, Math.abs(k - i))); });
    const on = items[i];
    list.style.transform = `translateY(${-(on.offsetTop + on.offsetHeight / 2)}px)`;
  }
  let ticking = false;
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(() => { ticking = false; update(); }); } }, { passive: true });
  addEventListener("resize", () => { current = -1; update(); });
  document.fonts?.ready.then(() => { current = -1; update(); });
  if (reducedMotion) list.style.transition = "none";
  update();
}
