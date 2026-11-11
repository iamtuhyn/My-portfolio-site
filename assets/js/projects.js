// FRAMES · every project in one place. Add a project = add an entry here.
// Images come from the media build (site/tools/build_images.py):
//   gallery: "work/xyz" → every image in that gallery, in order
//   images:  ["clm/…", …] → a hand-picked list
//   video:   "flash-ant" → assets/video/flash-ant.mp4
// Client names are white-labeled on purpose.
//
// tier: "selected" → a story card · "archive" → a frame on the contact sheet
// cats: used by the filters on /work
export const projects = [
  {
    id: "2026-kpi-glossary", year: 2026, tier: "selected",
    title: "One trustworthy screen", kicker: "CLM · Web · AI-built", role: "Senior UX Engineer",
    cats: ["enterprise", "web", "ai"], images: ["clm/kpi-glossary"],
    problem: "Site managers didn't trust dashboard totals they couldn't reconcile.",
    did: "A single reference for logistics KPIs, bringing definitions, formulas, data sources and reconciliation rules together. Every calculation was reviewed for consistency.",
    learned: "A number is only useful when people understand what it means.",
    link: "work/clm.html",
  },
  {
    id: "2026-product-costing", year: 2026, tier: "selected",
    title: "The prototype became the spec", kicker: "Manufacturing · Web · AI-built", role: "Product Consultant",
    cats: ["enterprise", "web", "ai"], images: [],
    problem: "A one-paragraph brief for a product-costing tool, and a team that needed to agree on what it should do.",
    did: "Built five working modules with Figma Make (decision cockpit, project setup, bill-of-materials management, simulation, scenario comparison) and used them to clarify requirements.",
    learned: "A working prototype exposes the decisions a brief leaves open.",
  },
  {
    id: "2022-mining-tracking", year: 2022, tier: "selected",
    title: "Smart-bag shipment tracking", kicker: "Commodities · Web app", role: "Senior UX Engineer",
    cats: ["enterprise", "web"], gallery: "work/mining",
    problem: "High-value mineral shipments crossing borders, with little visibility between mine and port.",
    did: "Designed shipment overviews, route tracking on a map, and an alerts view for smart-bag events like openings and delays.",
    learned: "In logistics, the map is the interface: people think in routes, not rows.",
  },
  {
    id: "2022-fleet-app", year: 2022, tier: "selected",
    title: "Fleet maintenance app (pitch)", kicker: "Construction materials · Mobile", role: "Senior UX Engineer",
    cats: ["enterprise", "mobile"], gallery: "work/fleet",
    problem: "Truck and mixer maintenance tracked on paper, so issues surfaced late.",
    did: "Designed a pitch app for drivers: each vehicle's overview, a maintenance checklist, and one-tap fix requests.",
    learned: "For drivers, the best UI is one screen and one obvious next action.",
  },
  {
    id: "2022-farming", year: 2022, tier: "selected",
    title: "Smart farming with IoT", kicker: "Agriculture · Mobile · IoT", role: "UX",
    cats: ["consumer", "mobile"], gallery: "work/farming",
    problem: "Farm risks like fire are detected too late to act.",
    did: "Designed a mobile app that turns IoT sensor data into clear alerts and farm status at a glance.",
    learned: "Alerts are only useful if they say what to do next.",
  },
  {
    id: "2021-boroline", year: 2021, tier: "selected",
    title: "Boroline: website proposal", kicker: "Brand · Web", role: "Designer",
    cats: ["consumer", "web"], gallery: "work/boroline",
    problem: "A beloved heritage brand with a dated web presence.",
    did: "Proposed a new brand website, made alongside my documentary about the same brand, The Journey of BOROLINE.",
    learned: "Knowing a brand's story makes the interface easier to design.",
  },
  {
    id: "2019-construction", year: 2019, tier: "selected",
    title: "Construction logistics, version 1", kicker: "Construction · Web app", role: "UX Engineer",
    cats: ["enterprise", "web"], gallery: "work/construction-2019",
    problem: "City-scale construction sites with no shared picture of gates, zones and deliveries.",
    did: "Designed the first version of what became the CLM ecosystem: zones, gates, bundled transport and cranes on a map.",
    learned: "I drew its first map. Three years later I came back to lead it.",
    link: "work/clm.html",
  },
  {
    id: "2019-car-exhibition", year: 2019, tier: "selected",
    title: "Car exhibition guide", kicker: "Events · Mobile · IoT", role: "UX Engineer",
    cats: ["consumer", "mobile"], gallery: "work/car-exhibition",
    problem: "Visitors at a car show had no easy way to learn about what they were standing next to.",
    did: "Designed a mobile guide that reacts to nearby IoT beacons and shows the right car, in the right place, plus an admin portal.",
    learned: "The physical world is the best navigation, if the app listens to it.",
  },
  {
    id: "2017-telecom", year: 2017, tier: "selected",
    title: "Telecom business portal", kicker: "Telecom · Web app", role: "UX Engineer",
    cats: ["enterprise", "web"], gallery: "work/telecom",
    problem: "Business customers needed to manage products, packages, employees and support in one place.",
    did: "Designed a B2B self-service portal with step-by-step product and package selection.",
    learned: "Complex choices feel simple when you only ask one question at a time.",
  },
  {
    id: "2017-insurance", year: 2017, tier: "selected",
    title: "Insurance & finance portals", kicker: "Insurance · Web app", role: "UX Engineer",
    cats: ["enterprise", "web"], gallery: "work/insurance", cover: 3,
    problem: "Business insurance onboarding meant long forms and legal documents.",
    did: "Split KYC into five clear steps with a live status dashboard, plus an admin side to approve or reject.",
    learned: "In finance, trust is a UX feature: show people where they are and what happens next.",
  },
  // ── Archive: the contact sheet
  { id: "2018-profile", year: 2018, tier: "archive", title: "Professional profile onboarding", kicker: "Web app", cats: ["consumer", "web"], gallery: "work/profile" },
  { id: "2018-world-cup", year: 2018, tier: "archive", title: "World Cup 2018 app", kicker: "Mobile · UI", cats: ["consumer", "mobile"], gallery: "work/world-cup" },
  { id: "2016-smart-parking", year: 2016, tier: "archive", title: "Smart-parking website", kicker: "Web", cats: ["enterprise", "web"], gallery: "work/smart-parking" },
  { id: "2016-coffee-hub", year: 2016, tier: "archive", title: "Coffee Hub website", kicker: "Web · Brand", cats: ["consumer", "web"], gallery: "work/coffee-hub" },
  { id: "2016-banners", year: 2016, tier: "archive", title: "Web banners", kicker: "Web", cats: ["web"], gallery: "work/banners" },
  { id: "2015-flash", year: 2015, tier: "archive", title: "Flash animations", kicker: "Motion", cats: ["before"], images: ["video/flash-water-drops", "video/flash-ant"], videos: ["flash-water-drops", "flash-ant"] },
];

export const filters = [
  ["all", "All"], ["enterprise", "Enterprise"], ["consumer", "Consumer"], ["web", "Web"],
  ["mobile", "Mobile"], ["ai", "AI-built"], ["before", "Before UX"],
];
