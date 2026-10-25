// FRAMES · site settings you can edit without touching the rest of the code.

export const CONTACT = {
  email: "iamtuhyn@gmail.com",
  linkedin: "https://www.linkedin.com/in/tuhyngain",
  resume: "assets/Joacim-Tuhin-Gain-Resume.pdf",   // downloaded by "Download resume"
};

export const BOOKING = {
  timeZone: "Europe/Paris",     // slots are offered in French time
  startHour: 8,                 // first slot 08:00
  endHour: 20,                  // last slot ends 20:00
  slotMinutes: 30,
  daysAhead: 60,                // how far ahead people can book
  weekdays: [0, 1, 2, 3, 4, 5, 6], // 0 = Sunday … 6 = Saturday. Remove days you don't take calls.
  minNoticeHours: 12,           // no bookings closer than this
  // How requests reach your inbox:
  //  • endpoint empty → the visitor's email app opens with everything filled in, addressed to you.
  //  • endpoint set   → the request is sent silently by a form service (e.g. Web3Forms or Formspree)
  //                     and lands in your Gmail. Create the account yourself and paste its URL/key here.
  endpoint: "",                 // e.g. "https://api.web3forms.com/submit"
  accessKey: "",                // the service's public access key, if it needs one
};
