// FRAMES · "Book a call": pick a date → pick a slot (French time) → email + note.
// Requests go to CONTACT.email: silently via BOOKING.endpoint if set, otherwise
// through the visitor's email app with everything pre-filled.
import { CONTACT, BOOKING } from "./config.js";

const TZ = BOOKING.timeZone;
const LOCAL_TZ = Intl.DateTimeFormat().resolvedOptions().timeZone;
const pad = (n) => String(n).padStart(2, "0");
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

// Wall-clock parts of an instant in a time zone.
function partsIn(t, tz) {
  const f = new Intl.DateTimeFormat("en-GB", { timeZone: tz, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" });
  const o = Object.fromEntries(f.formatToParts(new Date(t)).map((p) => [p.type, p.value]));
  return { y: +o.year, m: +o.month, d: +o.day, h: +o.hour, mi: +o.minute };
}
const offsetAt = (t, tz) => { const p = partsIn(t, tz); return Date.UTC(p.y, p.m - 1, p.d, p.h, p.mi) - Math.floor(t / 60000) * 60000; };
// A wall-clock time in TZ → the real instant (handles summer/winter time).
function zonedToUtc(y, m, d, h, mi, tz = TZ) {
  const guess = Date.UTC(y, m - 1, d, h, mi);
  let t = guess - offsetAt(guess, tz);
  return guess - offsetAt(t, tz);
}
const fmtLocal = (t, opts) => new Intl.DateTimeFormat(undefined, { timeZone: LOCAL_TZ, ...opts }).format(new Date(t));
const fmtParis = (t, opts) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...opts }).format(new Date(t));

export function mountBooking(root, base = "") {
  const now = Date.now();
  const today = partsIn(now, TZ);
  const last = new Date(Date.UTC(today.y, today.m - 1, today.d + BOOKING.daysAhead));
  const state = { y: today.y, m: today.m, date: null, slot: null, step: "pick" };
  const showLocal = LOCAL_TZ !== TZ && offsetAt(now, LOCAL_TZ) !== offsetAt(now, TZ);

  root.innerHTML = `<div class="booking">
    <aside class="bk__intro">
      <img src="${base}assets/img/docs/on-set.webp" alt="" width="48" height="48">
      <span class="mono muted">Joacim Tuhin Gain</span>
      <h3>A 30-minute call</h3>
      <p>Tell me about your product, your team, or an idea. Pick a time that suits you and I'll confirm by email.</p>
      <ul class="bk__meta">
        <li><i></i>${BOOKING.slotMinutes} min</li>
        <li><i></i>Video or phone, your choice</li>
        <li><i></i>${pad(BOOKING.startHour)}:00 – ${pad(BOOKING.endHour)}:00 · French time</li>
        ${showLocal ? `<li><i></i>Times also shown in your time (${esc(LOCAL_TZ.replace("_", " "))})</li>` : ""}
      </ul>
    </aside>
    <div class="bk__body" style="display:contents"></div>
  </div>`;
  const body = root.querySelector(".bk__body");

  const slotsFor = (y, m, d) => {
    const out = [];
    for (let min = BOOKING.startHour * 60; min + BOOKING.slotMinutes <= BOOKING.endHour * 60; min += BOOKING.slotMinutes) {
      const t = zonedToUtc(y, m, d, Math.floor(min / 60), min % 60);
      out.push({ t, label: `${pad(Math.floor(min / 60))}:${pad(min % 60)}`, ok: t >= now + BOOKING.minNoticeHours * 3600e3 });
    }
    return out;
  };
  const dayOk = (y, m, d) => {
    const wd = new Date(Date.UTC(y, m - 1, d)).getUTCDay();
    const dt = Date.UTC(y, m - 1, d);
    if (dt < Date.UTC(today.y, today.m - 1, today.d) || dt > last.getTime()) return false;
    if (!BOOKING.weekdays.includes(wd)) return false;
    return slotsFor(y, m, d).some((s) => s.ok);
  };

  function renderPick() {
    const { y, m } = state;
    const first = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();          // 0 = Sunday
    const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
    const lead = (first + 6) % 7;                                         // weeks start on Monday
    const monthName = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(y, m - 1, 1)));
    const canPrev = y > today.y || m > today.m;
    const canNext = Date.UTC(y, m, 1) <= last.getTime();
    let cells = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => `<span class="dow">${d}</span>`).join("");
    cells += "<span></span>".repeat(lead);
    for (let d = 1; d <= days; d++) {
      const key = `${y}-${pad(m)}-${pad(d)}`;
      const isToday = y === today.y && m === today.m && d === today.d;
      cells += `<button type="button" data-day="${key}" ${dayOk(y, m, d) ? "" : "disabled"} aria-pressed="${state.date === key}" class="${isToday ? "is-today" : ""}" aria-label="${key}">${d}</button>`;
    }
    let slots = `<p class="bk__empty">Pick a date to see the available times.</p>`;
    if (state.date) {
      const [sy, sm, sd] = state.date.split("-").map(Number);
      const list = slotsFor(sy, sm, sd);
      slots = list.map((s) => `<button type="button" data-slot="${s.t}" ${s.ok ? "" : "disabled"}>${s.label}${showLocal ? `<small>${fmtLocal(s.t, { hour: "2-digit", minute: "2-digit" })}</small>` : ""}</button>`).join("");
    }
    const dayLabel = state.date ? new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" }).format(new Date(`${state.date}T12:00:00Z`)) : "Times";
    body.innerHTML = `
      <div class="bk__cal">
        <div class="bk__head"><b>${monthName}</b><div>
          <button type="button" data-month="-1" aria-label="Previous month" ${canPrev ? "" : "disabled"}>‹</button>
          <button type="button" data-month="1" aria-label="Next month" ${canNext ? "" : "disabled"}>›</button></div></div>
        <div class="bk__grid" role="group" aria-label="Choose a date">${cells}</div>
      </div>
      <div class="bk__slots">
        <div class="bk__slots-head"><b>${dayLabel}</b><span class="muted">Paris${showLocal ? " · yours" : ""}</span></div>
        <div class="bk__list" role="group" aria-label="Choose a time">${slots}</div>
      </div>`;
  }

  function renderForm() {
    const when = `${fmtParis(state.slot, { weekday: "long", day: "numeric", month: "long" })} · ${fmtParis(state.slot, { hour: "2-digit", minute: "2-digit" })} French time`;
    body.innerHTML = `
      <form class="bk__form" novalidate>
        <div><span class="mono mint">Your slot</span><p style="margin:6px 0 0; font-family:var(--f-display); font-size:1.3rem">${esc(when)}</p>
        ${showLocal ? `<p class="bk__note">That's ${esc(fmtLocal(state.slot, { weekday: "long", hour: "2-digit", minute: "2-digit" }))} where you are.</p>` : ""}</div>
        <label>Your name <input name="name" autocomplete="name" maxlength="80"></label>
        <label>Email address * <input name="email" type="email" autocomplete="email" required maxlength="120"></label>
        <label>A short note * <textarea name="note" required maxlength="600" placeholder="What would you like to talk about?"></textarea></label>
        <p class="bk__err" role="alert" hidden></p>
        <div class="bk__actions">
          <button class="btn btn--ghost btn--sm" type="button" data-back data-icon="←">Back</button>
          <button class="btn btn--primary" type="submit" data-icon="→">Request this slot</button>
        </div>
        <p class="bk__note">I'll reply from ${esc(CONTACT.email)} to confirm. ${BOOKING.endpoint ? "" : "Sending opens your email app with everything filled in."}</p>
      </form>`;
    body.querySelector("input[name=email]").focus();
  }

  function renderDone(sent) {
    const start = new Date(state.slot), end = new Date(state.slot + BOOKING.slotMinutes * 60000);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FRAMES//EN", "BEGIN:VEVENT",
      `UID:${state.slot}@frames`, `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      `DTSTART:${start.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`, `DTEND:${end.toISOString().replace(/[-:]/g, "").slice(0, 15)}Z`,
      "SUMMARY:Call with Joacim Tuhin Gain (to be confirmed)", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    body.innerHTML = `
      <div class="bk__done">
        <span class="mono mint">${sent ? "Request sent" : "Almost there"}</span>
        <h3>${sent ? "Thank you. I'll confirm by email." : "Your email app should be open."}</h3>
        <p class="lead" style="margin:0">${esc(fmtParis(state.slot, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }))} · French time</p>
        ${sent ? "" : `<p class="bk__note">If nothing opened, write to <a href="mailto:${CONTACT.email}">${esc(CONTACT.email)}</a>.</p>`}
        <div class="bk__actions">
          <a class="btn btn--sm" download="call-joacim.ics" href="data:text/calendar;charset=utf-8,${encodeURIComponent(ics)}" data-icon="↓">Add to my calendar</a>
          <button class="btn btn--ghost btn--sm" type="button" data-restart data-icon="↺">Pick another time</button>
        </div>
      </div>`;
  }

  const render = () => {
    if (state.step === "pick") renderPick(); else if (state.step === "form") renderForm(); else renderDone(state.sent);
    import("./site.js").then((m) => m.enhanceButtons?.(body));
  };

  root.addEventListener("click", (e) => {
    const t = e.target.closest("button, a");
    if (!t || !root.contains(t)) return;
    if (t.dataset.month) {
      const d = new Date(Date.UTC(state.y, state.m - 1 + Number(t.dataset.month), 1));
      state.y = d.getUTCFullYear(); state.m = d.getUTCMonth() + 1; render();
    } else if (t.dataset.day) { state.date = t.dataset.day; render(); root.querySelector(".bk__list button:not(:disabled)")?.focus(); }
    else if (t.dataset.slot) { state.slot = Number(t.dataset.slot); state.step = "form"; render(); }
    else if (t.hasAttribute("data-back")) { state.step = "pick"; render(); }
    else if (t.hasAttribute("data-restart")) { Object.assign(state, { step: "pick", slot: null }); render(); }
  });

  root.addEventListener("submit", async (e) => {
    e.preventDefault();
    const f = e.target;
    const err = f.querySelector(".bk__err");
    const data = Object.fromEntries(new FormData(f));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || "")) { err.hidden = false; err.textContent = "Please add a valid email address."; return; }
    if (!(data.note || "").trim()) { err.hidden = false; err.textContent = "Please add a short note."; return; }
    const whenParis = `${fmtParis(state.slot, { weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })} (French time)`;
    const subject = `Call request · ${fmtParis(state.slot, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })} Paris`;
    const message = `New call request from the portfolio\n\nWhen: ${whenParis}\nVisitor's time: ${fmtLocal(state.slot, { weekday: "long", hour: "2-digit", minute: "2-digit" })} (${LOCAL_TZ})\nName: ${data.name || "-"}\nEmail: ${data.email}\n\nNote:\n${data.note}`;
    if (BOOKING.endpoint) {
      const btn = f.querySelector("[type=submit]");
      btn.setAttribute("aria-disabled", "true");
      try {
        const res = await fetch(BOOKING.endpoint, {
          method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ access_key: BOOKING.accessKey || undefined, subject, from_name: data.name || data.email, email: data.email, replyto: data.email, message }),
        });
        if (!res.ok) throw new Error(res.status);
        state.sent = true;
      } catch {
        err.hidden = false; err.textContent = "Couldn't send just now. Opening your email app instead.";
        location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
        state.sent = false;
      }
    } else {
      location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(message)}`;
      state.sent = false;
    }
    state.step = "done";
    render();
  });

  render();
}
