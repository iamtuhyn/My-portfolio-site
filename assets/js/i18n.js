// Languages: English (source), French, German.
// How it works: the pages are written in English. For French or German, translate() looks at every
// element and, when its English text is a key below, swaps in the translation. Text without an entry
// simply stays in English, so a missing line never breaks a page.
// To add or fix a line: copy the English exactly as it is in the HTML, then give [French, German].
// Covered so far: the menu, the footer, the home page and the contact page.

export const LANGS = [["en", "English"], ["fr", "Français"], ["de", "Deutsch"]];
// Switched off for now (2026-11-13): the switcher was removed until every page is translated.
// To bring it back: set ENABLED to true and restore the language buttons in site.js.
const ENABLED = false;
export const lang = (() => {
  if (!ENABLED) return "en";
  try { const l = localStorage.getItem("lang"); return LANGS.some(([c]) => c === l) ? l : "en"; } catch { return "en"; }
})();
export function setLang(code) {
  try { localStorage.setItem("lang", code); } catch {}
  location.reload();
}

const T = {
  // ── menu, footer, shared buttons
  "Open the menu": ["Ouvrir le menu", "Menü öffnen"],
  "Home": ["Accueil", "Start"],
  "Portfolio": ["Portfolio", "Portfolio"],
  "Work": ["Projets", "Arbeiten"],
  "Story": ["Parcours", "Werdegang"],
  "Expertise": ["Expertise", "Expertise"],
  "Frames": ["Autres cadres", "Weitere Bilder"],
  "Contact": ["Contact", "Kontakt"],
  "Contact me": ["Me contacter", "Kontakt aufnehmen"],
  "Book a conversation": ["Réserver un échange", "Gespräch buchen"],
  "Book a 30-minute conversation": ["Réserver un échange de 30 minutes", "30-Minuten-Gespräch buchen"],
  "Email me": ["M'écrire", "E-Mail schreiben"],
  "Download résumé": ["Télécharger le CV", "Lebenslauf herunterladen"],
  "View résumé": ["Voir le CV", "Lebenslauf ansehen"],
  "LinkedIn": ["LinkedIn", "LinkedIn"],
  "© 2026 Joacim Tuhin Gain · Clermont-Ferrand, France": ["© 2026 Joacim Tuhin Gain · Clermont-Ferrand, France", "© 2026 Joacim Tuhin Gain · Clermont-Ferrand, Frankreich"],

  // ── home · hero
  '<span class="rec"></span>Clermont-Ferrand, France · open to roles and projects across Europe': [
    '<span class="rec"></span>Clermont-Ferrand, France · ouvert aux postes et aux projets en Europe',
    '<span class="rec"></span>Clermont-Ferrand, Frankreich · offen für Stellen und Projekte in Europa'],
  "I design complex products, and <em>build them</em> with AI.": [
    "Je conçois des produits complexes, et je <em>les construis</em> avec l'IA.",
    "Ich gestalte komplexe Produkte und <em>baue sie</em> mit KI."],
  "<strong>Design Engineer and UX lead.</strong> For ten years I have turned complicated operations in logistics, finance and energy into products people can use without a manual. I lead the UX from research to design system, then build working prototypes with AI, so a team can test an idea before committing to it.": [
    "<strong>Design Engineer et lead UX.</strong> Depuis dix ans, je transforme des opérations complexes de la logistique, de la finance et de l'énergie en produits que l'on utilise sans mode d'emploi. Je pilote l'UX, de la recherche au design system, puis je construis des prototypes fonctionnels avec l'IA, pour qu'une équipe puisse tester une idée avant de s'engager.",
    "<strong>Design Engineer und UX-Lead.</strong> Seit zehn Jahren mache ich aus komplizierten Abläufen in Logistik, Finanzen und Energie Produkte, die man ohne Handbuch bedienen kann. Ich verantworte die UX von der Recherche bis zum Designsystem und baue dann funktionierende Prototypen mit KI, damit ein Team eine Idee testen kann, bevor es sich festlegt."],
  "See my works": ["Voir mes projets", "Meine Arbeiten ansehen"],
  "10 yrs": ["10 ans", "10 Jahre"],
  "8 h": ["8 h", "8 Std."],
  "in product and UX design, from intern to unit lead": ["de design produit et UX, de stagiaire à responsable d'unité", "Produkt- und UX-Design, vom Praktikanten zum Teamleiter"],
  "connected products led as one ecosystem: 3 web apps, 2 mobile apps": ["produits connectés pilotés comme un seul écosystème : 3 applications web, 2 applications mobiles", "vernetzte Produkte als ein Ökosystem geführt: 3 Web-Apps, 2 Mobile-Apps"],
  "from a client brief to two working portal prototypes": ["d'un brief client à deux prototypes de portail fonctionnels", "vom Kundenbriefing zu zwei funktionierenden Portal-Prototypen"],
  "degrees: graphic design, then mass communication and film": ["diplômes : design graphique, puis communication et cinéma", "Abschlüsse: Grafikdesign, danach Massenkommunikation und Film"],

  // ── home · work list
  "My work": ["Mes projets", "Meine Arbeiten"],
  "<b>One ecosystem, from plan to move-in</b><small>Five products for the whole life of a building: LIM plans the site, CLM runs its logistics every day, MoveIt moves people in.</small>": [
    "<b>Un écosystème, du plan à l'emménagement</b><small>Cinq produits pour toute la vie d'un bâtiment : LIM planifie le chantier, CLM gère sa logistique au quotidien, MoveIt organise l'emménagement.</small>",
    "<b>Ein Ökosystem, vom Plan bis zum Einzug</b><small>Fünf Produkte für den ganzen Lebenszyklus eines Gebäudes: LIM plant die Baustelle, CLM steuert täglich ihre Logistik, MoveIt organisiert den Einzug.</small>"],
  "Senior UX Engineer · Unit Lead<i>2019, 2022 – now</i>": ["Senior UX Engineer · Responsable d'unité<i>2019, 2022 – aujourd'hui</i>", "Senior UX Engineer · Teamleiter<i>2019, 2022 – heute</i>"],
  "<b>Designing a habit, not an app</b><small>A one-line brief became a five-role recycling product that people come back to: missions, handovers and rewards.</small>": [
    "<b>Concevoir une habitude, pas une application</b><small>Un brief d'une ligne est devenu un produit de recyclage à cinq rôles, auquel on revient : missions, remises et récompenses.</small>",
    "<b>Eine Gewohnheit gestalten, keine App</b><small>Aus einem einzeiligen Briefing wurde ein Recycling-Produkt mit fünf Rollen, zu dem man zurückkehrt: Missionen, Übergaben und Belohnungen.</small>"],
  "Product Consultant · UX Lead<i>2024 – 2025</i>": ["Consultant produit · Lead UX<i>2024 – 2025</i>", "Product Consultant · UX-Lead<i>2024 – 2025</i>"],
  "<b>From pitch to clickable product in 8 hours</b><small>A power-utility brief turned into two working portal prototypes in one day, so the client could try the proposal instead of imagining it.</small>": [
    "<b>Du pitch au produit cliquable en 8 heures</b><small>Le brief d'un distributeur d'électricité transformé en deux prototypes de portail fonctionnels en une journée, pour que le client essaie la proposition au lieu de l'imaginer.</small>",
    "<b>Vom Pitch zum klickbaren Produkt in 8 Stunden</b><small>Aus dem Briefing eines Energieversorgers wurden an einem Tag zwei funktionierende Portal-Prototypen, damit der Kunde den Vorschlag ausprobieren konnte, statt ihn sich vorzustellen.</small>"],
  "Product Consultant · AI-assisted<i>2026</i>": ["Consultant produit · assisté par l'IA<i>2026</i>", "Product Consultant · KI-gestützt<i>2026</i>"],
  "The story · 4 earlier frames": ["Le parcours · 4 cadres plus anciens", "Der Werdegang · 4 frühere Bilder"],
  "Everything I've made has been a <em>frame.</em>": ["Tout ce que j'ai créé a été un <em>cadre.</em>", "Alles, was ich gemacht habe, war ein <em>Bildausschnitt.</em>"],
  "<b>Kolkata, through a lens</b><small>A Master's in film on an ICCR scholarship, and two documentaries. A camera taught me to cut.</small>": [
    "<b>Calcutta, à travers l'objectif</b><small>Un master en cinéma avec une bourse de l'ICCR, et deux documentaires. Une caméra m'a appris à couper.</small>",
    "<b>Kalkutta, durch die Linse</b><small>Ein Master in Film mit ICCR-Stipendium und zwei Dokumentarfilme. Eine Kamera hat mir das Schneiden beigebracht.</small>"],
  "Documentaries · Videography": ["Documentaires · Vidéo", "Dokumentarfilme · Videografie"],
  "<b>Many screens, one language</b><small>Intern to UX Engineer at SELISE: insurance, finance, telecom and IoT products.</small>": [
    "<b>Beaucoup d'écrans, un seul langage</b><small>De stagiaire à UX Engineer chez SELISE : produits d'assurance, de finance, de télécoms et d'IoT.</small>",
    "<b>Viele Screens, eine Sprache</b><small>Vom Praktikanten zum UX Engineer bei SELISE: Produkte für Versicherung, Finanzen, Telekommunikation und IoT.</small>"],
  "UX Engineer · SELISE": ["UX Engineer · SELISE", "UX Engineer · SELISE"],
  "<b>Adam Surat: my first interface</b><small>DVD menus for Tareque Masud's film, designed before I knew to call them interfaces.</small>": [
    "<b>Adam Surat : ma première interface</b><small>Les menus DVD du film de Tareque Masud, conçus avant que je sache qu'on appelait cela des interfaces.</small>",
    "<b>Adam Surat: mein erstes Interface</b><small>DVD-Menüs für den Film von Tareque Masud, gestaltet, bevor ich wusste, dass man das Interface nennt.</small>"],
  "Designer · Tareque Masud Memorial Trust": ["Designer · Tareque Masud Memorial Trust", "Designer · Tareque Masud Memorial Trust"],
  "Childhood": ["Enfance", "Kindheit"],
  "<b>A village window</b><small>Narikelbari, Bangladesh. Before I knew anything about design, I knew how to look.</small>": [
    "<b>Une fenêtre de village</b><small>Narikelbari, Bangladesh. Avant de connaître le design, je savais regarder.</small>",
    "<b>Ein Dorffenster</b><small>Narikelbari, Bangladesch. Bevor ich etwas über Design wusste, konnte ich hinsehen.</small>"],
  "Where it starts": ["Là où tout commence", "Wo alles beginnt"],
  "Browse every project →": ["Voir tous les projets →", "Alle Projekte ansehen →"],
  "Watch the full story →": ["Voir tout le parcours →", "Den ganzen Werdegang ansehen →"],

  // ── home · what I bring
  "For teams and clients": ["Pour les équipes et les clients", "Für Teams und Kunden"],
  "What I bring to a product.": ["Ce que j'apporte à un produit.", "Was ich in ein Produkt einbringe."],
  "Services and toolkit →": ["Services et outils →", "Leistungen und Werkzeuge →"],
  "Product thinking": ["Vision produit", "Produktdenken"],
  "Understanding complex problems, users, business requirements and product opportunities.": ["Comprendre les problèmes complexes, les utilisateurs, les besoins métier et les opportunités produit.", "Komplexe Probleme, Nutzer, Geschäftsanforderungen und Produktchancen verstehen."],
  "UX leadership": ["Leadership UX", "UX-Führung"],
  "Guiding designers, facilitating collaboration and keeping quality consistent across products.": ["Guider les designers, faciliter la collaboration et garder une qualité constante d'un produit à l'autre.", "Designer anleiten, Zusammenarbeit ermöglichen und die Qualität über alle Produkte hinweg halten."],
  "Systems thinking": ["Pensée systémique", "Systemdenken"],
  "Connected workflows, reusable components and enterprise interfaces that scale.": ["Des parcours connectés, des composants réutilisables et des interfaces d'entreprise qui passent à l'échelle.", "Vernetzte Abläufe, wiederverwendbare Komponenten und Unternehmensoberflächen, die mitwachsen."],
  "Design engineering": ["Design engineering", "Design Engineering"],
  "Prototyping, front-end exploration and AI-assisted development that bring a design closer to shipped.": ["Prototypage, exploration front-end et développement assisté par l'IA, pour rapprocher un design de la mise en production.", "Prototyping, Front-End-Exploration und KI-gestützte Entwicklung, die ein Design näher an die Auslieferung bringen."],

  // ── home · built with AI
  "Built with AI": ["Construit avec l'IA", "Mit KI gebaut"],
  "AI speeds it up. <em>Judgment</em> sets the direction.": ["L'IA accélère. Le <em>jugement</em> donne la direction.", "KI beschleunigt. <em>Urteilsvermögen</em> gibt die Richtung vor."],
  "I use AI to shorten the distance between understanding a problem and testing a solution. This website is one of those experiments.": ["J'utilise l'IA pour réduire la distance entre comprendre un problème et tester une solution. Ce site est l'une de ces expériences.", "Ich nutze KI, um den Weg vom Verstehen eines Problems zum Testen einer Lösung zu verkürzen. Diese Website ist eines dieser Experimente."],
  "Case study 03 · Power utility": ["Étude de cas 03 · Distribution d'électricité", "Fallstudie 03 · Energieversorger"],
  "8 hours": ["8 heures", "8 Stunden"],
  "GridOps: from proposal to working prototype": ["GridOps : de la proposition au prototype fonctionnel", "GridOps: vom Angebot zum funktionierenden Prototyp"],
  "Two working portals from one brief, built with AI-assisted research, design and development.": ["Deux portails fonctionnels à partir d'un seul brief, construits avec une recherche, un design et un développement assistés par l'IA.", "Zwei funktionierende Portale aus einem Briefing, gebaut mit KI-gestützter Recherche, Gestaltung und Entwicklung."],
  "Manufacturing": ["Industrie", "Fertigung"],
  "The prototype became the spec": ["Le prototype est devenu la spécification", "Der Prototyp wurde zur Spezifikation"],
  "A one-paragraph brief became five working modules that exposed the decisions the brief had left open.": ["Un brief d'un paragraphe est devenu cinq modules fonctionnels, qui ont révélé les décisions que le brief laissait ouvertes.", "Aus einem Briefing von einem Absatz wurden fünf funktionierende Module, die die offenen Entscheidungen sichtbar machten."],
  "30 min": ["30 min", "30 Min."],
  "One trustworthy screen": ["Un écran digne de confiance", "Ein Screen, dem man vertraut"],
  "A single reference for logistics KPIs: definitions, formulas, data sources and reconciliation rules.": ["Une référence unique pour les indicateurs logistiques : définitions, formules, sources de données et règles de rapprochement.", "Eine einzige Referenz für Logistik-Kennzahlen: Definitionen, Formeln, Datenquellen und Abgleichsregeln."],

  // ── home · other frames, education
  "The other frames · Film, photo, print, pencil": ["Les autres cadres · Film, photo, imprimé, crayon", "Die anderen Bilder · Film, Foto, Druck, Bleistift"],
  "Before screens, I framed <em>everything else.</em>": ["Avant les écrans, je cadrais <em>tout le reste.</em>", "Vor den Screens habe ich <em>alles andere</em> gerahmt."],
  "Documentaries, photography, brand identities and drawings. This is where my eye for composition, pacing and editing comes from.": ["Documentaires, photographie, identités de marque et dessins. C'est de là que vient mon œil pour la composition, le rythme et le montage.", "Dokumentarfilme, Fotografie, Markenidentitäten und Zeichnungen. Daher kommt mein Blick für Komposition, Rhythmus und Schnitt."],
  "Documentaries": ["Documentaires", "Dokumentarfilme"],
  "Photography": ["Photographie", "Fotografie"],
  "52 frames": ["52 images", "52 Bilder"],
  "Graphic design": ["Design graphique", "Grafikdesign"],
  "6 identity sets": ["6 identités visuelles", "6 Markenauftritte"],
  "Videography": ["Vidéo", "Videografie"],
  "Music videos · motion": ["Clips musicaux · animation", "Musikvideos · Motion"],
  "Drawings": ["Dessins", "Zeichnungen"],
  "Pencil first": ["Le crayon d'abord", "Zuerst der Bleistift"],
  "2019 – 2021 · Kolkata, India": ["2019 – 2021 · Calcutta, Inde", "2019 – 2021 · Kalkutta, Indien"],
  "Master's, Mass Communication and Videography": ["Master, communication de masse et vidéographie", "Master, Massenkommunikation und Videografie"],
  "Rabindra Bharati University. ICCR scholarship, graduated A+, two documentaries.": ["Université Rabindra Bharati. Bourse de l'ICCR, diplômé avec la mention A+, deux documentaires.", "Rabindra Bharati University. ICCR-Stipendium, Abschluss mit A+, zwei Dokumentarfilme."],
  "2012 – 2016 · Dhaka, Bangladesh": ["2012 – 2016 · Dacca, Bangladesh", "2012 – 2016 · Dhaka, Bangladesch"],
  "BA (Hons), Graphic Design &amp; Multimedia": ["Licence (Hons), design graphique et multimédia", "BA (Hons), Grafikdesign &amp; Multimedia"],
  "Shanto-Mariam University of Creative Technology. Typography, branding, motion and copywriting.": ["Shanto-Mariam University of Creative Technology. Typographie, image de marque, animation et rédaction.", "Shanto-Mariam University of Creative Technology. Typografie, Branding, Motion und Text."],

  // ── home · contact block
  '<span class="rec"></span>Contact me': ['<span class="rec"></span>Me contacter', '<span class="rec"></span>Kontakt aufnehmen'],
  "Let's frame<br> what's <em>next</em>.": ["Cadrons<br> la <em>suite</em>.", "Rahmen wir,<br> was als <em>Nächstes</em> kommt."],
  "A complex product problem, an idea worth exploring, or a team that wants design and engineering closer together. I'm open to roles and projects across Europe.": ["Un problème produit complexe, une idée à explorer, ou une équipe qui veut rapprocher design et ingénierie. Je suis ouvert aux postes et aux projets partout en Europe.", "Ein komplexes Produktproblem, eine Idee, die es wert ist, oder ein Team, das Design und Entwicklung näher zusammenbringen will. Ich bin offen für Stellen und Projekte in ganz Europa."],

  // ── contact page
  "Clermont-Ferrand, France · French time (CET)": ["Clermont-Ferrand, France · heure française (CET)", "Clermont-Ferrand, Frankreich · französische Zeit (MEZ)"],
  "A role, a project, a comment on this site, or just a conversation.": ["Un poste, un projet, une remarque sur ce site, ou simplement un échange.", "Eine Stelle, ein Projekt, eine Anmerkung zu dieser Website oder einfach ein Gespräch."],
  "What brings you here?": ["Qu'est-ce qui vous amène ?", "Was führt Sie hierher?"],
  "<b>Work together</b><small>A role on your team, or a project</small>": ["<b>Travailler ensemble</b><small>Un poste dans votre équipe, ou un projet</small>", "<b>Zusammenarbeiten</b><small>Eine Stelle in Ihrem Team oder ein Projekt</small>"],
  "<b>Give feedback</b><small>On this site or any of my work</small>": ["<b>Donner un avis</b><small>Sur ce site ou sur mon travail</small>", "<b>Feedback geben</b><small>Zu dieser Website oder meiner Arbeit</small>"],
  "<b>Book a call</b><small>30 minutes, pick a time slot</small>": ["<b>Réserver un appel</b><small>30 minutes, choisissez un créneau</small>", "<b>Gespräch buchen</b><small>30 Minuten, Termin auswählen</small>"],
  "Your name": ["Votre nom", "Ihr Name"],
  "Your email": ["Votre e-mail", "Ihre E-Mail"],
  "Message": ["Message", "Nachricht"],
  "Send message": ["Envoyer le message", "Nachricht senden"],
  "Thank you.": ["Merci.", "Vielen Dank."],
  "Email": ["E-mail", "E-Mail"],
  "Résumé": ["CV", "Lebenslauf"],
  "One page, PDF ↗": ["Une page, PDF ↗", "Eine Seite, PDF ↗"],
  "Tell me about the role or the project: what it is, the timing, and what you need from me.": ["Parlez-moi du poste ou du projet : de quoi il s'agit, le calendrier, et ce que vous attendez de moi.", "Erzählen Sie mir von der Stelle oder dem Projekt: worum es geht, den Zeitrahmen und was Sie von mir brauchen."],
  "What worked, what didn't, what you would change.": ["Ce qui a fonctionné, ce qui n'a pas fonctionné, ce que vous changeriez.", "Was funktioniert hat, was nicht, und was Sie ändern würden."],
  "Sending opens your email app with everything filled in.": ["L'envoi ouvre votre messagerie avec tout déjà rempli.", "Beim Senden öffnet sich Ihr E-Mail-Programm, alles ist bereits ausgefüllt."],
  "Please add your name.": ["Merci d'indiquer votre nom.", "Bitte geben Sie Ihren Namen an."],
  "Please add an email address I can reply to.": ["Merci d'indiquer une adresse e-mail à laquelle je peux répondre.", "Bitte geben Sie eine E-Mail-Adresse an, an die ich antworten kann."],
  "Please write a short message.": ["Merci d'écrire un court message.", "Bitte schreiben Sie eine kurze Nachricht."],
  "Your email app should have opened with the message ready to send. If nothing opened, write to": ["Votre messagerie devrait s'être ouverte avec le message prêt à envoyer. Si rien ne s'est ouvert, écrivez à", "Ihr E-Mail-Programm sollte sich mit der fertigen Nachricht geöffnet haben. Falls nicht, schreiben Sie an"],
  "Your message is on its way. I'll reply to": ["Votre message est parti. Je répondrai à", "Ihre Nachricht ist unterwegs. Ich antworte an"],
  "I reply from": ["Je réponds depuis", "Ich antworte von"],
};

const col = lang === "fr" ? 0 : 1;
export const t = (en) => (lang === "en" || !T[en] ? en : T[en][col]);

const norm = (s) => s.replace(/\s+/g, " ").trim();
export function translate(root = document) {
  document.documentElement.lang = lang;
  if (lang === "en") return;
  const scope = root.body || root;
  for (const el of scope.querySelectorAll("*")) {
    if (!el.isConnected || el.closest("script, style, svg")) continue;
    const hit = T[norm(el.innerHTML)];
    if (hit) el.innerHTML = hit[col];
  }
  scope.querySelectorAll("[placeholder]").forEach((el) => { const hit = T[norm(el.placeholder)]; if (hit) el.placeholder = hit[col]; });
}
