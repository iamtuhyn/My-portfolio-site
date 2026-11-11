// Case studies: an "on this page" bar built from the chapters' phases, with reading progress.
const chapters = [...document.querySelectorAll("section.chapter[data-phase]")];
if (chapters.length) {
  const phases = [];
  chapters.forEach((c) => {
    const name = c.dataset.phase;
    if (!phases.find((p) => p.name === name)) {
      c.id ||= `cs-${name.toLowerCase().replace(/[^a-z]+/g, "-")}`;
      phases.push({ name, el: c });
    }
  });
  const nav = document.createElement("nav");
  nav.className = "cs-nav";
  nav.setAttribute("aria-label", "On this page");
  nav.innerHTML = `<div class="cs-nav__in"><a href="#main" data-k="top">Overview</a>${phases.map((p) => `<a href="#${p.el.id}" data-k="${p.name}">${p.name}</a>`).join("")}</div><span class="cs-nav__bar" aria-hidden="true"></span>`;
  document.querySelector("article").before(nav);

  const links = [...nav.querySelectorAll("a")], bar = nav.querySelector(".cs-nav__bar");
  const article = document.querySelector("article");
  const update = () => {
    const line = innerHeight * 0.35;
    let current = "top";
    for (const c of chapters) if (c.getBoundingClientRect().top <= line) current = c.dataset.phase;
    links.forEach((a) => {
      const on = a.dataset.k === current;
      if (on && !a.hasAttribute("aria-current")) {          // keep the active phase in view on narrow screens
        const row = a.parentElement;
        row.scrollLeft = a.offsetLeft - (row.clientWidth - a.offsetWidth) / 2;
      }
      if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
    });
    const r = article.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (line - r.top) / Math.max(1, r.height)));
    bar.style.transform = `scaleX(${p})`;
    nav.classList.toggle("is-stuck", nav.getBoundingClientRect().top <= parseFloat(getComputedStyle(nav).top) + 1);
  };
  addEventListener("scroll", update, { passive: true });
  addEventListener("resize", update);
  update();
}
