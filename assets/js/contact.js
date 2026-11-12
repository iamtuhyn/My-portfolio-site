// Contact page: one form, three reasons. "Work together" and "Give feedback" send a message;
// "Book a call" swaps the message fields for the booking calendar.
// Messages go to CONTACT.email: silently through BOOKING.endpoint when one is set in config.js,
// otherwise the visitor's email app opens with everything filled in.
import { CONTACT, BOOKING } from "./config.js";
import { t } from "./i18n.js";

const form = document.getElementById("ct-form");
if (form) {
  const msg = document.getElementById("ct-msg"), book = document.getElementById("book");
  const err = document.getElementById("ct-err"), note = document.getElementById("ct-note");
  const done = document.getElementById("ct-done"), doneText = document.getElementById("ct-done-text");
  const SUBJECT = { work: "Let's work together", feedback: "Feedback on your portfolio" };
  const PLACEHOLDER = { work: t("Tell me about the role or the project: what it is, the timing, and what you need from me."), feedback: t("What worked, what didn't, what you would change.") };
  const why = () => form.elements.why.value;

  note.textContent = BOOKING.endpoint ? `${t("I reply from")} ${CONTACT.email}.` : t("Sending opens your email app with everything filled in.");

  function sync() {
    const booking = why() === "book";
    msg.hidden = booking; book.hidden = !booking;
    if (!booking) form.elements.message.placeholder = PLACEHOLDER[why()];
    err.hidden = true;
  }
  form.addEventListener("change", (e) => { if (e.target.name === "why") sync(); });

  // contact.html#book (and any link to it) opens straight on the calendar
  function fromHash() {
    if (location.hash === "#book") { form.elements.why.value = "book"; sync(); }
  }
  addEventListener("hashchange", fromHash);
  fromHash(); sync();

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = form.elements.name.value.trim(), email = form.elements.email.value.trim(), message = form.elements.message.value.trim();
    const fail = (text, field) => { err.textContent = text; err.hidden = false; field.focus(); };
    if (!name) return fail(t("Please add your name."), form.elements.name);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail(t("Please add an email address I can reply to."), form.elements.email);
    if (!message) return fail(t("Please write a short message."), form.elements.message);
    err.hidden = true;

    const subject = `${SUBJECT[why()]} · ${name}`;
    const body = `${message}\n\nFrom: ${name}\nEmail: ${email}`;
    const viaMail = () => { location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; };
    const finish = (sent) => {
      form.hidden = true; done.hidden = false;
      doneText.textContent = sent ? `${t("Your message is on its way. I'll reply to")} ${email}.` : `${t("Your email app should have opened with the message ready to send. If nothing opened, write to")} ${CONTACT.email}.`;
      done.scrollIntoView({ block: "center" });
    };
    if (!BOOKING.endpoint) { viaMail(); return finish(false); }
    const btn = form.querySelector('[type="submit"]'); btn.disabled = true;
    try {
      const res = await fetch(BOOKING.endpoint, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: BOOKING.accessKey || undefined, subject, from_name: name, email, replyto: email, message: body }),
      });
      if (!res.ok) throw new Error(String(res.status));
      finish(true);
    } catch {
      btn.disabled = false; viaMail(); finish(false);
    }
  });
}
