/* ------------------------------------------------------------------ */
/* Portfolio content — single source of truth                          */
/* ------------------------------------------------------------------ */

export type ProjectStory = {
  id: string
  num: string
  name: string
  tagline: string
  domain: string
  year: string
  problem: string
  idea: string
  experience: string
  engineering: string
  result: string
  metrics: { k: string; v: string }[]
  stack: string[]
}

export const PROJECTS: ProjectStory[] = [
  {
    id: 'restaurant-os',
    num: '01',
    name: 'Restaurant OS',
    tagline: 'One system connecting the entire restaurant.',
    domain: 'Web Platform · Realtime POS',
    year: '2025',
    problem:
      'Orders were taken on paper, tickets got lost between the floor and the kitchen, and inventory was counted by hand at midnight. The owner was flying blind until the month ended — and the numbers arrived late.',
    idea:
      'A single operating system for the restaurant: waiters, kitchen, bar, stock and payments living on one realtime core. Every event — an order, a cancellation, a stock movement — instantly visible to everyone who needs it.',
    experience:
      'A waiter taps a table, builds the order in three touches, and the kitchen display flashes it instantly. The manager opens one dashboard and sees live revenue, table turnover, and low-stock alerts before lunch rush.',
    engineering:
      'Next.js front-of-house, Node.js + WebSockets event bus, PostgreSQL schema designed around an append-only order ledger, offline-tolerant POS mode with conflict-free sync, and role-based access for 4 staff types.',
    result:
      'Ticket time dropped, order errors nearly vanished, and the owner finally runs the restaurant from live numbers instead of end-of-month guesses.',
    metrics: [
      { k: 'ORDER ERRORS', v: '−94%' },
      { k: 'TICKET TIME', v: '−38%' },
      { k: 'STATIONS LIVE', v: '12' },
    ],
    stack: ['Next.js', 'Node.js', 'WebSockets', 'PostgreSQL', 'Prisma'],
  },
  {
    id: 'fleetflow',
    num: '02',
    name: 'FleetFlow',
    tagline: 'Every vehicle, every delivery, one map.',
    domain: 'Logistics · Web + Mobile',
    year: '2024',
    problem:
      'A growing delivery fleet was coordinated over WhatsApp. Dispatchers re-typed addresses, drivers called for directions, and customers had no idea where their parcel was.',
    idea:
      'A dispatch platform with a live operations map: assign, route and track every driver in real time — with a driver app simple enough to learn in one shift.',
    experience:
      'A dispatcher drags a job onto a driver. The driver’s phone buzzes with a route. The customer watches the vehicle move toward them on a shareable live link.',
    engineering:
      'React Native driver app, Next.js control tower, geospatial queries (PostGIS), battery-aware location streaming, route optimization heuristics, and push-based status events end to end.',
    result:
      'Dispatch went from a chaotic group chat to a calm map. More drops per driver per day, fewer support calls, and customers who stop asking “where is my order?”',
    metrics: [
      { k: 'DROPS / DRIVER', v: '+27%' },
      { k: 'SUPPORT CALLS', v: '−61%' },
      { k: 'LIVE VEHICLES', v: '80+' },
    ],
    stack: ['React Native', 'Next.js', 'PostGIS', 'Redis', 'Maps API'],
  },
  {
    id: 'chapchap-pay',
    num: '03',
    name: 'ChapChap Pay',
    tagline: 'Mobile money that works at the speed of the market.',
    domain: 'Fintech · Mobile + APIs',
    year: '2024',
    problem:
      'Market traders in Nairobi juggle cash, M-Pesa and IOUs. Reconciliation happens in a notebook, and small merchants have no clear picture of their daily flow.',
    idea:
      'A mobile-first payments and savings companion for informal traders — instant M-Pesa collection, automatic records, and a savings goal gentle enough to actually stick.',
    experience:
      'A trader enters an amount, the customer scans a QR or gets a STK push, and the sale is recorded before the change is given. End of day: a clean summary, not a paper ledger.',
    engineering:
      'Flutter app, Node.js API gateway, M-Pesa Daraja integration (STK push + C2B callbacks), idempotent webhook processing, double-entry ledger for balances, and end-to-end audit trails.',
    result:
      'Hundreds of daily transactions reconciled automatically. Traders see income, expenses and savings trends for the first time — from a phone they already own.',
    metrics: [
      { k: 'RECONCILIATION', v: '100% auto' },
      { k: 'SETTLEMENT', v: '< 5 sec' },
      { k: 'LEDGER ENTRIES', v: '250k+' },
    ],
    stack: ['Flutter', 'Node.js', 'M-Pesa Daraja', 'PostgreSQL', 'Docker'],
  },
]

export const PIPELINE = [
  {
    step: '01',
    key: 'PROBLEM',
    line: 'People have a problem.',
    detail: 'It usually shows up as friction, wasted hours, or lost money. I start by finding the real pain, not the symptom.',
  },
  {
    step: '02',
    key: 'UNDERSTAND',
    line: 'I understand it.',
    detail: 'Talking to the people affected. Mapping the process. Deciding what is actually worth building — and what is not.',
  },
  {
    step: '03',
    key: 'DESIGN',
    line: 'I design the experience.',
    detail: 'Interfaces that make the obvious thing easy. Every screen earns its place, every interaction has a reason.',
  },
  {
    step: '04',
    key: 'ENGINEER',
    line: 'I engineer the system.',
    detail: 'Typed code, honest data models, realtime infrastructure, tests where they matter. Built to be maintained, not just launched.',
  },
  {
    step: '05',
    key: 'SHIP',
    line: 'People use it.',
    detail: 'Deployment, monitoring, feedback loops. The launch is the starting line — then the system evolves with real usage.',
  },
]

export const SYSTEMS = [
  {
    key: 'WEB',
    device: 'Browser window',
    line: 'Fast, accessible web applications — from marketing sites to realtime control towers.',
    tags: ['Next.js', 'React', 'TypeScript', 'WebSockets'],
  },
  {
    key: 'MOBILE',
    device: 'Smartphone',
    line: 'Native-feeling apps that live in people’s pockets and work when the network doesn’t.',
    tags: ['Flutter', 'React Native', 'Offline-first', 'Push'],
  },
  {
    key: 'DESKTOP',
    device: 'Application window',
    line: 'Focused tools for people who work all day in one screen — speed is the feature.',
    tags: ['Electron', 'Tauri', 'Local-first', 'Shortcuts'],
  },
  {
    key: 'SYSTEMS',
    device: 'Servers · APIs · Data',
    line: 'The invisible layer: APIs, databases, integrations and pipelines that never get to fail.',
    tags: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
  },
] as const

export const STACK_GROUPS = [
  {
    group: 'FRONTEND',
    items: ['TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Framer Motion', 'Three.js'],
  },
  {
    group: 'MOBILE',
    items: ['Flutter', 'React Native', 'Expo', 'Offline sync'],
  },
  {
    group: 'BACKEND',
    items: ['Node.js', 'PostgreSQL', 'Redis', 'Prisma', 'WebSockets', 'Docker'],
  },
  {
    group: 'PRACTICE',
    items: ['System design', 'CI/CD', 'Testing', 'Accessibility', 'Perf budgets'],
  },
]

export type StackItem = {
  name: string
  group: 'FRONTEND' | 'MOBILE' | 'BACKEND' | 'PRACTICE'
  /* 0–100 self-assessed production confidence */
  level: number
  since: string
  note: string
  /* project numbers (PROJECTS.num) where this was battle-tested */
  usedIn: string[]
}

export const STACK_ITEMS: StackItem[] = [
  /* ---------------- FRONTEND ---------------- */
  { name: 'TypeScript', group: 'FRONTEND', level: 95, since: '2019', note: 'Default language for everything I build — strict mode on, no exceptions.', usedIn: ['01', '02'] },
  { name: 'React', group: 'FRONTEND', level: 95, since: '2019', note: 'Component thinking is permanent. I care about state models more than prop counts.', usedIn: ['01', '02'] },
  { name: 'Next.js', group: 'FRONTEND', level: 92, since: '2020', note: 'App Router, server components, edge cases included. This portfolio is one.', usedIn: ['01'] },
  { name: 'Tailwind CSS', group: 'FRONTEND', level: 90, since: '2021', note: 'Design systems at cursor speed. Constraints make the visual language consistent.', usedIn: ['01'] },
  { name: 'Framer Motion', group: 'FRONTEND', level: 85, since: '2021', note: 'Motion as meaning — easing curves that explain hierarchy, never decoration for its own sake.', usedIn: [] },
  { name: 'Three.js', group: 'FRONTEND', level: 70, since: '2022', note: 'Shaders and 3D scenes where they earn their bytes. The lab is my playground.', usedIn: [] },
  /* ---------------- MOBILE ---------------- */
  { name: 'Flutter', group: 'MOBILE', level: 90, since: '2021', note: 'Pixel-perfect cross-platform UI. ChapChap Pay ships on it daily.', usedIn: ['03'] },
  { name: 'React Native', group: 'MOBILE', level: 82, since: '2020', note: 'FleetFlow’s driver app — one codebase, one shift onboarding for drivers.', usedIn: ['02'] },
  { name: 'Expo', group: 'MOBILE', level: 80, since: '2021', note: 'OTA updates and CI builds that keep release cycles measured in hours.', usedIn: ['02'] },
  { name: 'Offline sync', group: 'MOBILE', level: 78, since: '2022', note: 'Conflict-free queues for markets where the network is a rumor, not a guarantee.', usedIn: ['01', '03'] },
  /* ---------------- BACKEND ---------------- */
  { name: 'Node.js', group: 'BACKEND', level: 93, since: '2019', note: 'APIs, event buses, integrations. The server side of every system on this page.', usedIn: ['01', '02', '03'] },
  { name: 'PostgreSQL', group: 'BACKEND', level: 90, since: '2020', note: 'Append-only ledgers, geospatial queries, window functions — the honest core of a product.', usedIn: ['01', '02'] },
  { name: 'Prisma', group: 'BACKEND', level: 88, since: '2021', note: 'Typed data models that make migrations reviewable and drift nearly impossible.', usedIn: ['01'] },
  { name: 'WebSockets', group: 'BACKEND', level: 86, since: '2020', note: 'Realtime everything — floor-to-kitchen tickets, live fleet maps, presence systems.', usedIn: ['01', '02'] },
  { name: 'Redis', group: 'BACKEND', level: 80, since: '2021', note: 'Caches, queues and rate limits placed exactly where the latency hurts.', usedIn: ['02'] },
  { name: 'Docker', group: 'BACKEND', level: 76, since: '2021', note: 'If it isn’t containerized, it isn’t deployable. Reproducibility is a feature.', usedIn: ['03'] },
  /* ---------------- PRACTICE ---------------- */
  { name: 'System design', group: 'PRACTICE', level: 85, since: '2020', note: 'Diagrams before code. The cheapest place to fix a mistake is on a whiteboard.', usedIn: ['01', '02', '03'] },
  { name: 'CI/CD', group: 'PRACTICE', level: 78, since: '2020', note: 'Green pipelines, preview deploys, rollback in one command. Ship without fear.', usedIn: ['01', '03'] },
  { name: 'Testing', group: 'PRACTICE', level: 75, since: '2019', note: 'Tests where money and data are involved; sanity checks everywhere else.', usedIn: ['01'] },
  { name: 'Accessibility', group: 'PRACTICE', level: 82, since: '2021', note: 'Keyboard paths, reduced motion, contrast budgets. Software everyone can run.', usedIn: [] },
  { name: 'Perf budgets', group: 'PRACTICE', level: 80, since: '2022', note: 'Every effect justifies its milliseconds. Particles halved on mobile, always.', usedIn: [] },
]

export const STACK_LEARNING = ['RUST', 'WEBGPU', 'LOCAL-FIRST SYNC', 'CRDTS', 'ZIG', 'EMBEDDED']

export const STACK_GROUPS_FILTER = ['ALL', 'FRONTEND', 'MOBILE', 'BACKEND', 'PRACTICE'] as const

export const PRINCIPLES = [
  {
    n: '01',
    title: 'Software is for people',
    body: 'Every abstraction, queue and shader exists so that a human somewhere has a better day. If people can’t use it, it doesn’t work.',
  },
  {
    n: '02',
    title: 'Boring where it counts',
    body: 'Databases, payments, auth — proven technology, careful engineering. I save the experiments for the layers where they can’t hurt anyone.',
  },
  {
    n: '03',
    title: 'Details compound',
    body: 'The 1px alignment, the 80ms easing, the empty state nobody asked for. That’s the difference between used software and loved software.',
  },
  {
    n: '04',
    title: 'Ship, then sharpen',
    body: 'A running system with feedback beats a perfect plan in a drawer. I ship early, watch real usage, and iterate hard.',
  },
]

export const STORY = {
  origin:
    'I wrote my first lines of code to make a computer do something it clearly already knew how to do — and I’ve been chasing that feeling ever since. From a cyber-café in Nairobi to realtime systems serving hundreds of users a day, every step taught me the same lesson: technology is only real when it reaches someone.',
  belief:
    'Today I design and build digital products end to end — the interface, the API, the database, the deployment. I care as much about the ledger math behind a payment as about the easing curve on a button, because to the person using it, they’re the same thing.',
  now: 'Currently building product systems for teams across East Africa — and always looking for the next problem worth solving properly.',
}

export const NAV_LINKS = [
  { href: '#entry', label: 'ENTRY' },
  { href: '#engine', label: 'ENGINE' },
  { href: '#work', label: 'WORK' },
  { href: '#lab', label: 'LAB' },
  { href: '#human', label: 'HUMAN' },
  { href: '#stack', label: 'STACK' },
  { href: '#signal', label: 'SIGNAL' },
]

export const CONTACT = {
  email: 'hello@elvinomondi.dev',
  location: 'Nairobi, Kenya · UTC+3',
  socials: [
    { label: 'GitHub', href: 'https://github.com/elvinomondi' },
    { label: 'LinkedIn', href: 'https://linkedin.com/in/elvinomondi' },
    { label: 'X', href: 'https://x.com/elvinomondi' },
  ],
}

/* ------------------------------------------------------------------ */
/* Imagery — real photography bundled in /public/images                */
/* ------------------------------------------------------------------ */

export type Shot = { src: string; alt: string; caption: string }

export const ENGINE_IMAGES: Record<'WEB' | 'MOBILE' | 'DESKTOP' | 'SYSTEMS', { src: string; alt: string }> = {
  WEB: { src: '/images/engine/web.jpg', alt: 'Code editor glowing on a laptop screen in a dark room' },
  MOBILE: { src: '/images/engine/mobile.jpg', alt: 'Hands holding a smartphone running a mobile app' },
  DESKTOP: { src: '/images/engine/desktop.jpg', alt: 'A developer workstation with a large monitor and keyboard' },
  SYSTEMS: { src: '/images/engine/systems.jpg', alt: 'Server room corridor with glowing lights' },
}

export const PROJECT_GALLERIES: Record<string, Shot[]> = {
  'restaurant-os': [
    { src: '/images/projects/restaurantos-1.jpg', alt: 'Point-of-sale terminal at a restaurant counter', caption: 'FOH · ORDER TERMINAL' },
    { src: '/images/projects/restaurantos-2.jpg', alt: 'Chefs plating food during a busy kitchen service', caption: 'KDS · THE PASS' },
    { src: '/images/projects/restaurantos-3.jpg', alt: 'Manager reviewing a dashboard on a tablet', caption: 'LIVE OPS · REVENUE' },
  ],
  fleetflow: [
    { src: '/images/projects/fleetflow-1.jpg', alt: 'Delivery vans lined up on a city street', caption: 'FLEET · STAGED FOR DISPATCH' },
    { src: '/images/projects/fleetflow-2.jpg', alt: 'Route tracking map on a control room screen', caption: 'CONTROL TOWER · LIVE MAP' },
    { src: '/images/projects/fleetflow-3.jpg', alt: 'Courier riding a motorbike with a parcel box through the city', caption: 'LAST MILE · IN TRANSIT' },
  ],
  'chapchap-pay': [
    { src: '/images/projects/chapchap-1.jpg', alt: 'Market vendor selling fresh vegetables at a colorful stall', caption: 'THE MERCHANT · DAILY FLOW' },
    { src: '/images/projects/chapchap-2.jpg', alt: 'Customer scanning a QR code with a phone to pay', caption: 'SCAN TO PAY · STK PUSH' },
    { src: '/images/projects/chapchap-3.jpg', alt: 'Hands holding a phone showing a mobile money app', caption: 'RECONCILED · END OF DAY' },
  ],
}

export const HUMAN_GALLERY: Shot[] = [
  { src: '/images/human/workspace.jpg', alt: 'Software engineer desk setup with warm lamp light', caption: 'THE DESK, 07:42' },
  { src: '/images/human/nairobi.jpg', alt: 'Nairobi city skyline at dusk', caption: 'NAIROBI · HOME BASE' },
  { src: '/images/human/keyboard.jpg', alt: 'Hands typing on a backlit mechanical keyboard', caption: 'THOUGHTS, BUFFERED' },
  { src: '/images/human/team.jpg', alt: 'Developers sketching a system diagram on a whiteboard', caption: 'WHITEBOARD FIRST' },
]

/* ------------------------------------------------------------------ */
/* 3D assets — real glTF PBR models bundled in /public/models          */
/* Rendered with react-three-fiber + drei; credits in the README.      */
/* ------------------------------------------------------------------ */

export const MODEL_CREDITS =
  '3D models: Khronos glTF Sample Models (DamagedHelmet, Lantern, BoomBox, WaterBottle, ToyCar) — used under their CC-BY 4.0 / CC0 licenses. Photography: web-sourced stock imagery, re-hosted locally.'
