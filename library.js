/* ============================================================
   library.js — brand asset library + slide definitions
   Plain JS, attaches everything to window.
   ============================================================ */

// ---- Icon library (Covetrus brand set, teal variant) ----
const ICON_LIBRARY = [
  { name: 'practice-heart',      label: 'Practice' },
  { name: 'productive-workflow', label: 'Workflow' },
  { name: 'delivery-check',      label: 'Delivery' },
  { name: 'analytics',           label: 'Analytics' },
  { name: 'platform-revenue',    label: 'Revenue' },
  { name: 'pulse',               label: 'Pulse' },
  { name: 'rx',                  label: 'Prescription' },
  { name: 'vet',                 label: 'Veterinarian' },
  { name: 'pets',                label: 'Pets' },
  { name: 'heal',                label: 'Healing' },
  { name: 'vaccine',             label: 'Vaccine' },
  { name: 'shield',              label: 'Protection' },
  { name: 'security',            label: 'Security' },
  { name: 'partner',             label: 'Partner' },
  { name: 'chat',                label: 'Chat' },
  { name: 'testimonial',         label: 'Testimonial' },
  { name: 'cs-star',             label: 'Star' },
  { name: 'case-study',          label: 'Case study' },
  { name: 'calendar-day',        label: 'Calendar' },
  { name: 'clock-check',         label: 'Scheduling' },
  { name: 'billing',             label: 'Billing' },
  { name: 'payment',             label: 'Payment' },
  { name: 'ecommerce',           label: 'E-commerce' },
  { name: 'mobile-email',        label: 'Mobile' },
  { name: 'compounds-check',     label: 'Compounds' },
  { name: 'tick',                label: 'Check' },
  { name: 'avimark',             label: 'Avimark' },
  { name: 'impromed',            label: 'Impromed' },
  { name: 'vetsuite',            label: 'VetSuite' },
  { name: 'heartworm',           label: 'Heartworm' },
  { name: 'flea',                label: 'Flea & tick' },
  { name: 'worms',               label: 'Parasites' },
];
const ICON_SRC = (name) => `assets/icons/${name}-black-teal.svg`;

// ---- Image library (curated on-brand placeholders) ----
// value = a CSS background. kind 'preset' uses css, 'upload' uses url(dataURL).
const IMAGE_LIBRARY = [
  { id: 'care',     label: 'Veterinary care',  css: 'linear-gradient(135deg,#021660,#0a2480 55%,#27BDBE)' },
  { id: 'team',     label: 'Care team',         css: 'linear-gradient(160deg,#0a2480,#021660 60%,#011040)' },
  { id: 'tech',     label: 'Technology',        css: 'linear-gradient(135deg,#021660 40%,#27BDBE)' },
  { id: 'pharmacy', label: 'Pharmacy',          css: 'radial-gradient(circle at 30% 25%,#27BDBE,transparent 55%),linear-gradient(135deg,#021660,#0a2480)' },
  { id: 'clinic',   label: 'Clinic',            css: 'linear-gradient(120deg,#75C1FF,#0055E7 70%,#021660)' },
  { id: 'pets',     label: 'Pets',              css: 'radial-gradient(circle at 70% 30%,#27BDBE,transparent 50%),linear-gradient(160deg,#0a2480,#021660)' },
  { id: 'growth',   label: 'Growth',            css: 'linear-gradient(135deg,#008556,#27BDBE 70%,#021660)' },
  { id: 'abstract', label: 'Abstract teal',     css: 'conic-gradient(from 200deg at 60% 40%,#021660,#27BDBE,#0a2480,#021660)' },
];

// Resolve an image field {kind,value} -> CSS background string (or null)
function imageBg(img) {
  if (!img || img.kind === 'none') return null;
  if (img.kind === 'upload') return `url("${img.value}")`;
  return img.value; // preset css
}

// ---- Slide type catalog ----
const SLIDE_TYPES = [
  { type: 'cover',      name: 'Title cover',        group: 'Open',    hint: 'Big title, subtitle, author + date' },
  { type: 'agenda',     name: 'Agenda',             group: 'Open',    hint: 'Numbered list of what you\u2019ll cover' },
  { type: 'divider',    name: 'Section divider',    group: 'Open',    hint: 'Section break with image or number' },
  { type: 'pillars',    name: 'Three pillars',      group: 'Content', hint: 'Three icon cards, short text' },
  { type: 'summary',    name: 'Executive summary',  group: 'Content', hint: 'Long-form, two-column body' },
  { type: 'mockup',     name: 'Product mockup',     group: 'Content', hint: 'Talking points beside a UI mockup' },
  { type: 'quote',      name: 'Quote',              group: 'Content', hint: 'Pull quote with attribution' },
  { type: 'barchart',   name: 'Bar chart',          group: 'Data',    hint: 'Grouped bars + side KPIs' },
  { type: 'kpi',        name: 'KPI dashboard',      group: 'Data',    hint: 'Four metric cards + trend line' },
  { type: 'timeline',   name: 'Timeline',           group: 'Data',    hint: 'Milestones along a rail' },
  { type: 'comparison', name: 'Comparison table',   group: 'Data',    hint: 'Plans / options side by side' },
  { type: 'team',       name: 'Team',               group: 'Close',   hint: 'People grid with roles' },
  { type: 'closing',    name: 'Closing / next steps',group: 'Close',  hint: 'Thank you + numbered actions' },
];
const SLIDE_TYPE_NAME = Object.fromEntries(SLIDE_TYPES.map(s => [s.type, s.name]));

// Which themes each type allows in the theme toggle
const THEME_OPTIONS = {
  cover: ['light'],
  agenda: ['light', 'muted', 'navy'],
  divider: ['navy'],
  pillars: ['light', 'muted', 'navy'],
  summary: ['light', 'muted', 'navy'],
  mockup: ['light', 'muted'],
  quote: ['navy', 'light'],
  barchart: ['light', 'muted', 'navy'],
  kpi: ['light', 'muted', 'navy'],
  timeline: ['light', 'muted', 'navy'],
  comparison: ['light', 'muted', 'navy'],
  team: ['light', 'muted', 'navy'],
  closing: ['navy'],
};

let __uid = 0;
const uid = () => `s${Date.now().toString(36)}${(__uid++).toString(36)}`;

// ---- Default content per slide type ----
function defaultData(type) {
  switch (type) {
    case 'cover': return {
      theme: 'light',
      eyebrow: 'Q2 2026 Business Review',
      title: 'Presentation title goes here in two lines.',
      lede: 'A short, plain-language summary of what this deck covers — written for the audience who will see it.',
      author: 'Author name', authorMeta: 'Team or department',
      dateMeta: 'May 12, 2026 · Internal',
      image: { kind: 'none' },
    };
    case 'agenda': return {
      theme: 'light', eyebrow: 'Agenda', title: 'What we\u2019ll cover today',
      items: [
        { num: '01', label: 'Where we are today', desc: 'A short read on the current state of the business.' },
        { num: '02', label: 'Performance and metrics', desc: 'Charts and KPIs against plan.' },
        { num: '03', label: 'What we\u2019re shipping', desc: 'Roadmap milestones for the next two quarters.' },
        { num: '04', label: 'Product walkthrough', desc: 'A look at the new dashboard in flight.' },
        { num: '05', label: 'People and partners', desc: 'Who\u2019s leading the work, and customer voice.' },
        { num: '06', label: 'Next steps', desc: 'Decisions needed and what happens next.' },
      ],
    };
    case 'divider': return {
      theme: 'navy', eyebrow: 'Section 01', title: 'Where we are\ntoday.',
      sectionNum: '01', image: { kind: 'none' },
    };
    case 'pillars': return {
      theme: 'light', eyebrow: 'What we focus on', title: 'Three pillars of the business.',
      items: [
        { icon: 'practice-heart', title: 'Practice software', body: 'Cloud-native tools that run the day-to-day in veterinary practices — scheduling, records, billing.', tag: 'Pulse · Avimark · Impromed' },
        { icon: 'delivery-check', title: 'Supply and pharmacy', body: 'The largest veterinary supply network in the world — products on the shelf, prescriptions at the door.', tag: 'Distribution · Home delivery' },
        { icon: 'productive-workflow', title: 'Services and insights', body: 'Marketing, compliance, and benchmark data that help practices grow and care for more pets.', tag: 'VetSuite · vRxPro · Insights' },
      ],
    };
    case 'summary': return {
      theme: 'muted', eyebrow: 'Executive summary', title: 'The story so far.',
      sideHead: 'The headline',
      sideSub: 'We exited Q1 ahead of plan on three of four key metrics, with the largest gains in pharmacy and Pulse adoption. The work this quarter is to convert that momentum into durable revenue.',
      paragraphs: [
        'The first quarter showed real momentum across the practice-software business. Pulse adoption ran twenty percent ahead of plan, driven by faster onboarding and the new self-serve trial. Avimark renewals held above ninety-eight percent and the migration program continues to convert legacy installs to the cloud.',
        'Pharmacy had its strongest quarter on record. Home-delivery volume grew thirty-one percent year over year, and compounding came back online for two new state markets. Average order value held steady; the lift came from new prescribers rather than larger baskets.',
        'Services were mixed. VetSuite expanded its enterprise footprint, but the small-practice segment saw softer renewals than expected. The team has a focused plan in place and we expect those numbers to recover by the end of the next quarter.',
        'The story for the rest of the year is conversion. We have the products, the pipeline, and the relationships. The work is to turn early enthusiasm into signed, paid, deployed accounts — and to make sure every team knows where they fit.',
      ],
    };
    case 'mockup': return {
      theme: 'muted', eyebrow: 'Product walkthrough', title: 'A first look at Insights.',
      mockHead: 'Benchmark every part of the practice.',
      body: 'Insights brings together appointment, revenue, and inventory data into one view — with peer benchmarks built in.',
      list: [
        { lead: 'Live benchmarks', rest: ' against practices of the same size and region.' },
        { lead: 'Revenue drill-down', rest: ' by service line, provider, and visit type.' },
        { lead: 'One-click exports', rest: ' for board meetings and owner reviews.' },
        { lead: 'Native to Pulse', rest: ' — no extra logins, no data uploads.' },
      ],
    };
    case 'quote': return {
      theme: 'navy',
      quote: 'Pulse changed how we run the practice. We onboarded in a week, and our team hasn\u2019t looked back — records, Rx, and reporting in one place.',
      name: 'Dr. Sara Reyes, DVM', title: 'Maplewood Animal Hospital · Austin, TX',
      avatar: 'SR', avatarImage: { kind: 'none' },
    };
    case 'barchart': return {
      theme: 'light', eyebrow: 'Performance · Q1 2026', title: 'Revenue ran 14% ahead of plan.',
      chartTitle: 'Quarterly revenue · $M', prefix: '$',
      seriesA: 'Plan', seriesB: 'Actual',
      bars: [
        { label: "Q2 '25", a: 182, b: 194 },
        { label: "Q3 '25", a: 198, b: 219 },
        { label: "Q4 '25", a: 224, b: 236 },
        { label: "Q1 '26", a: 248, b: 283 },
      ],
      kpis: [
        { eyebrow: 'Q1 Actual', num: '$283M', delta: '+14%', cap: '$35M ahead of plan, driven by pharmacy and Pulse.' },
        { eyebrow: 'YoY Growth', num: '+18.3%', delta: '▲', cap: 'Fourth consecutive quarter of double-digit growth.' },
        { eyebrow: 'Pipeline', num: '$412M', delta: '+9%', cap: 'Weighted, two-quarter forward pipeline.' },
      ],
    };
    case 'kpi': return {
      theme: 'light', eyebrow: 'Key metrics', title: 'Quarter at a glance.',
      cards: [
        { label: 'Active practices', value: '42.6k', delta: '+3.1%', foot: 'vs. last quarter' },
        { label: 'Pulse seats', value: '128k', delta: '+12.4%', foot: 'vs. last quarter' },
        { label: 'Rx volume', value: '8.9M', delta: '+6.2%', foot: 'shipments / mo' },
        { label: 'Net retention', value: '112%', delta: '+2 pts', foot: 'trailing twelve months' },
      ],
      trendHead: 'Trailing twelve months', trendSub: 'Monthly recurring revenue, all segments combined.',
      trend: [108,98,104,86,82,70,74,58,52,38,32,24,12],
    };
    case 'timeline': return {
      theme: 'light', eyebrow: 'Roadmap', title: 'The next two quarters.',
      steps: [
        { date: 'Apr 2026', label: 'Pulse 4.0 GA', desc: 'Cloud migration tooling shipped.', state: 'done' },
        { date: 'May 2026', label: 'Rx home delivery', desc: 'Expanded to two new state markets.', state: 'done' },
        { date: 'Today · Q2', label: 'Analytics beta', desc: 'Limited release to 250 practices.', state: 'current' },
        { date: 'Aug 2026', label: 'VetSuite refresh', desc: 'Redesigned reminder workflows.', state: 'future' },
        { date: 'Q4 2026', label: 'Insights GA', desc: 'Benchmarks open to all customers.', state: 'future' },
      ],
    };
    case 'comparison': return {
      theme: 'light', eyebrow: 'How we compare', title: 'Plans, side by side.',
      columns: ['Capability', 'Essentials', 'Pulse', 'Enterprise'],
      highlightCol: 2, highlightPill: 'Most popular',
      rows: [
        ['Scheduling and records', '✓', '✓', '✓'],
        ['Rx + home delivery', 'Limited', '✓', '✓'],
        ['Multi-location', '—', 'Up to 5', 'Unlimited'],
        ['Insights and benchmarks', '—', '✓', '✓'],
        ['Dedicated success manager', '—', '—', '✓'],
        ['Starting price', '$249/mo', '$499/mo', 'Custom'],
      ],
    };
    case 'team': return {
      theme: 'light', eyebrow: 'People', title: 'Leading this work.',
      members: [
        { initials: 'SR', role: 'Lead', name: 'Sara Reyes', bio: 'Drives the Insights program end-to-end, partnering with product and data teams.', image: { kind: 'none' } },
        { initials: 'MK', role: 'Product', name: 'Mateo Khan', bio: 'Owns the Pulse platform roadmap and the cross-product analytics layer.', image: { kind: 'none' } },
        { initials: 'JL', role: 'Design', name: 'Jenna Lui', bio: 'Leads the design system and the unified Pulse + Insights experience.', image: { kind: 'none' } },
        { initials: 'DO', role: 'Engineering', name: 'Devon Okafor', bio: 'Heads the Insights engineering team and the data-platform migration.', image: { kind: 'none' } },
      ],
    };
    case 'closing': return {
      theme: 'navy', eyebrow: 'What\u2019s next', title: 'Thank you.',
      lede: 'Three things we need from this room before we leave today.',
      steps: [
        { text: 'Sign off on the Q3 Insights launch plan.', meta: 'Owner: Sara · By: May 20' },
        { text: 'Confirm staffing for the VetSuite refresh.', meta: 'Owner: Mateo · By: May 26' },
        { text: 'Approve the customer-advisory roster.', meta: 'Owner: Devon · By: Jun 02' },
      ],
    };
    default: return {};
  }
}

function makeSlide(type) {
  return { id: uid(), type, data: defaultData(type) };
}

// Starter deck — the original 13-slide template, in order
function starterDeck() {
  const order = ['cover','agenda','divider','pillars','summary','barchart','kpi','timeline','mockup','quote','comparison','team','closing'];
  return { title: 'Untitled deck', slides: order.map(makeSlide) };
}

Object.assign(window, {
  ICON_LIBRARY, ICON_SRC, IMAGE_LIBRARY, imageBg,
  SLIDE_TYPES, SLIDE_TYPE_NAME, THEME_OPTIONS,
  defaultData, makeSlide, starterDeck, uid,
});
