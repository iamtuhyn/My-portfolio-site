// FRAMES · live specimens inside case studies: small, real interactions
// that explain a design decision better than a screenshot.

/* ── Recyclium: tiers that make each return worth more */
document.querySelectorAll("[data-tier]").forEach((tier) => {
  const root = tier.closest(".specimen");
  const tiers = [
    { name: "Eco Newbie", from: 0, mult: 1.0 },
    { name: "Waste Warrior", from: 1001, mult: 1.1 },
    { name: "Planet Protector", from: 3001, mult: 1.25 },
  ];
  const max = 5000;
  let points = 0;
  const current = () => tiers.findLast((t) => points >= t.from);
  const render = () => {
    const t = current();
    tier.querySelector(".tier__fill").style.width = `${Math.min(100, (points / max) * 100)}%`;
    tier.querySelector("[data-mult]").textContent = `${t.mult === 1 ? "1.0" : String(t.mult)}×`;
    tier.querySelector("[data-tiername]").textContent = t.name;
    tier.querySelectorAll(".tier__marks span").forEach((s, i) => s.classList.toggle("is-on", tiers[i] === t));
    root.querySelector("[data-points]").textContent = points.toLocaleString("en");
  };
  root.querySelectorAll("[data-earn]").forEach((b) =>
    b.addEventListener("click", () => {
      points = Math.min(max, points + Math.round(Number(b.dataset.earn) * current().mult));
      render();
    })
  );
  root.querySelector("[data-reset]").addEventListener("click", () => { points = 0; render(); });
  render();
});

/* ── CLM: book a delivery against real capacity (the pull principle) */
document.querySelectorAll("[data-slots]").forEach((board) => {
  const root = board.closest(".specimen");
  const out = root.querySelector("[data-slot-msg]");
  const trucks = ["Concrete", "Steel", "Façade", "Windows", "Drywall", "Pipes"];
  const initial = board.innerHTML;
  let n = 0;
  board.addEventListener("click", (e) => {
    const cell = e.target.closest("button.cell");
    if (!cell) return;
    const express = Number(cell.dataset.day) < 2; // booked inside 48 h
    const truck = trucks[n++ % trucks.length];
    const div = document.createElement("div");
    div.className = `booked${express ? " express" : ""}`;
    div.textContent = truck;
    cell.replaceWith(div);
    out.textContent = express
      ? `${truck}: booked inside 48 h → flagged Express for the site manager to approve.`
      : `${truck}: booked. Gate, zone and crane are reserved for this slot.`;
  });
  root.querySelector("[data-slot-reset]")?.addEventListener("click", () => {
    board.innerHTML = initial;
    n = 0;
    out.textContent = "Tap an empty slot to book a delivery.";
  });
});
