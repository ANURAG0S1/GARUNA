export const site = {
  name: "Anurag Kushwaha",
  title: "Full Stack Engineer",
  location: "Bengaluru, India",
  email: "anuragkush051@gmail.com",
  phone: "+91 8587822762",
  phoneHref: "tel:+918587822762",
  url: "https://anurag-kushwaha.in",
  resumePath: "/anurag-kushwaha-resume.pdf",
  years: "3.5+",
  current: {
    role: "SDE I",
    company: "Cleartrip",
    location: "Bengaluru",
  },
  social: {
    linkedin: "https://www.linkedin.com/in/anurag0s1",
    github: "https://github.com/ANURAG0S1",
  },
  hero: {
    eyebrow: "SDE I · Cleartrip · Bengaluru",
    name: "Anurag Kushwaha",
    headline: "The full stack in production",
    statement: ["The full stack", "in production."],
    lede: "Frontend, backend, and the systems in between.",
    stack: ["Next.js", "Angular", "TypeScript", "Express", "Node.js"],
  },
  about: {
    heading: "I build frontend systems that hold their speed.",
    paragraphs: [
      "I started in travel tech and stayed there on purpose. Train booking, payments, ads, and SEO are unforgiving: if the page is slow, the booking dies. If the integration flakes, the SLA goes with it.",
      "That path runs Trainman → Adani Digital Labs → Cleartrip: white-label train surfaces, an Angular-to-Express migration that cut load times by about 70%, then Next.js SEO systems and CI/CD that halved release cycles.",
    ],
    aside: {
      label: "Currently",
      items: [
        { k: "Role", v: "SDE I, Cleartrip" },
        { k: "Focus", v: "Next.js, TypeScript, SEO" },
        { k: "Before", v: "Adani Digital Labs · Trainman" },
        { k: "Education", v: "B.Tech, Starex University · GPA 8.1" },
      ],
    },
  },
} as const;

export const nav = [
  { id: "work", label: "Work" },
  { id: "practice", label: "Practice" },
  { id: "contact", label: "Contact" },
] as const;

export const metrics = [
  { value: "70%", label: "Load-time reduction", detail: "Angular → Express.js migration" },
  { value: "6s → 2.5s", label: "SSR page load", detail: "Server-side rendering for SEO" },
  { value: "50%", label: "Faster release cycles", detail: "CI/CD with Plexus & Bitbucket" },
  { value: "3.5+", label: "Years in production", detail: "Trainman · Adani · Cleartrip" },
] as const;

export type Role = {
  id: string;
  company: string;
  role: string;
  dates: string;
  location: string;
  stack: string[];
  summary: string;
  points: string[];
};

export const experience: Role[] = [
  {
    id: "cleartrip",
    company: "Cleartrip",
    role: "SDE I",
    dates: "May 2026 — Present",
    location: "Bengaluru, India",
    stack: ["Next.js", "TypeScript", "CI/CD", "Bitbucket", "Plexus"],
    summary:
      "Building internal product surfaces so SEO and marketing can move without waiting on engineering.",
    points: [
      "Spearheaded an internal SEO dashboard in Next.js and TypeScript to improve how teams read and act on search data.",
      "Architected a configuration-driven UI framework so the marketing team can launch campaigns without a frontend bottleneck.",
      "Designed and shipped a CI/CD pipeline with Plexus and Bitbucket Pipelines, cutting release cycles by 50%.",
    ],
  },
  {
    id: "adani",
    company: "Adani Digital Labs",
    role: "Software Engineer",
    dates: "Aug 2023 — May 2026",
    location: "Gurugram, India",
    stack: ["Angular", "Express.js", "REST APIs", "IRCTC", "Razorpay"],
    summary:
      "Owned the Trainman white-label platform: security, third-party APIs, and a multi-month performance migration.",
    points: [
      "Maintained and extended the Trainman white-label so train features could run across multiple client brands.",
      "Implemented input validation, authentication, and protections against XSS and CSRF.",
      "Integrated IRCTC, Razorpay, AdPushup, Google Ads, and Google Analytics into production flows.",
      "Ran a 6-month cross-functional migration with QA and product — sprint delivery up 40%, post-release defects down 25%.",
      "Moved between Angular and Express.js over 18 months, cutting application load times by ~70% while keeping five third-party APIs inside SLA.",
    ],
  },
  {
    id: "trainman",
    company: "Trainman",
    role: "Software Engineer",
    dates: "Jan 2023 — Aug 2023",
    location: "Gurugram, India",
    stack: ["Angular 9–13", "SSR", "Lighthouse", "New Relic", "Google Ads"],
    summary:
      "Shipped the white-label plugin, modernized Angular, and put the product on SSR for SEO and speed.",
    points: [
      "Built and deployed a white-label integration plugin that onboarded three companies onto the platform.",
      "Migrated the Angular codebase from version 9 to 13, improving application performance by 30%.",
      "Implemented server-side rendering for SEO, reducing page load from 6s to 2.5s.",
      "Used Lighthouse and New Relic to find bottlenecks instead of guessing at them.",
      "Integrated Google Ads and AdPushup to run and measure monetization campaigns.",
    ],
  },
];

export type Project = {
  id: string;
  index: string;
  name: string;
  context: string;
  problem: string;
  solution: string;
  engineering: string;
  impact: string[];
  stack: string[];
  visual: "migration" | "whitelabel" | "ssr" | "config" | "dashboard";
  featured?: boolean;
  metric?: string;
  metricLabel?: string;
};

export const projects: Project[] = [
  {
    id: "express-migration",
    index: "01",
    name: "Angular → Express.js performance migration",
    context: "Adani Digital Labs · Trainman",
    problem:
      "A production Angular surface was carrying train booking, payments, and ads — and the load time was costing the product.",
    solution:
      "Over 18 months I moved the stack toward Express.js without taking the five live integrations offline.",
    engineering:
      "The constraint was not a greenfield rewrite. IRCTC, Razorpay, and the ad stack had to keep hitting SLA while the rendering path changed. The work was architecture plus sequencing: what could move server-side, what had to stay, and how to prove it with monitoring rather than a demo.",
    impact: [
      "~70% reduction in application load times",
      "Five third-party APIs kept inside SLA",
      "18-month production transition, not a rewrite in isolation",
    ],
    stack: ["Angular", "Express.js", "REST APIs", "Performance"],
    visual: "migration",
    featured: true,
    metric: "−70%",
    metricLabel: "load time",
  },
  {
    id: "whitelabel",
    index: "02",
    name: "Trainman white-label platform",
    context: "Trainman → Adani Digital Labs",
    problem:
      "Train features needed to ship under multiple client brands without forking the product for every tenant.",
    solution:
      "A white-label integration plugin, then a maintained multi-client platform for train-related features.",
    engineering:
      "White-label is an architecture problem: shared booking and payment flows, client-specific surfaces, and integrations that cannot drift. I built the plugin that onboarded the first three companies, then kept the system coherent as Adani Digital Labs scaled it — including IRCTC and Razorpay in the live path.",
    impact: [
      "Three companies onboarded onto the platform",
      "Train features reused across multiple client brands",
      "Production integrations: IRCTC, Razorpay, ads, analytics",
    ],
    stack: ["Angular", "White-label", "IRCTC", "Razorpay"],
    visual: "whitelabel",
    featured: true,
    metric: "3",
    metricLabel: "brands onboarded",
  },
  {
    id: "ssr",
    index: "03",
    name: "SSR, SEO, and Angular 9 → 13",
    context: "Trainman",
    problem:
      "A client-rendered Angular app was taking 6 seconds to load and giving search engines a weak first paint.",
    solution:
      "Server-side rendering for SEO, plus a version migration from Angular 9 to 13.",
    engineering:
      "SSR was the SEO lever; the 9→13 upgrade was the platform lever. I used Lighthouse and New Relic to locate the actual bottlenecks, then shipped the rendering and framework changes against those numbers — not against a redesign.",
    impact: [
      "Page load 6s → 2.5s",
      "30% performance improvement from Angular 9 → 13",
      "SSR in place for search-indexable HTML",
    ],
    stack: ["Angular 9–13", "SSR", "Lighthouse", "New Relic", "SEO"],
    visual: "ssr",
    featured: true,
    metric: "6s → 2.5s",
    metricLabel: "SSR page load",
  },
  {
    id: "config-ui",
    index: "04",
    name: "Configuration-driven campaign UI",
    context: "Cleartrip",
    problem:
      "Marketing campaigns were gated on frontend development. Every new launch waited on an engineering cycle.",
    solution:
      "A configuration-driven UI framework so campaigns can be launched from config instead of a custom build.",
    engineering:
      "The useful abstraction was not another landing-page template. It was a UI that reads configuration and renders campaign surfaces without a developer in the loop — removing the bottleneck between marketing intent and production.",
    impact: [
      "Marketing can launch campaigns without a frontend queue",
      "Development bottleneck removed from campaign launches",
    ],
    stack: ["Next.js", "TypeScript", "Config-driven UI"],
    visual: "config",
  },
  {
    id: "seo-dashboard",
    index: "05",
    name: "Internal SEO dashboard",
    context: "Cleartrip",
    problem:
      "SEO work needed a dedicated internal surface — not a spreadsheet, and not a generic analytics dump.",
    solution:
      "A new internal dashboard in Next.js and TypeScript, designed for how the team actually reads search data.",
    engineering:
      "This is product work inside engineering: data visualization, TypeScript contracts, and a Next.js app that has to be clear enough that people use it. It sits next to the config-driven campaign system as part of a broader SEO toolchain.",
    impact: [
      "Internal SEO dashboard shipped in Next.js + TypeScript",
      "Improved how search data is visualized and acted on",
    ],
    stack: ["Next.js", "TypeScript", "SEO", "Data visualization"],
    visual: "dashboard",
  },
];

export const engineering = [
  {
    stat: "70%",
    label: "Faster load times",
    title: "Angular → Express.js",
    body: "Eighteen months moving a live travel surface toward Express.js, with five APIs still inside SLA.",
  },
  {
    stat: "6s → 2.5s",
    label: "SSR page load",
    title: "Server-side rendering",
    body: "SSR for SEO on Angular — first paint and crawlable HTML, measured with Lighthouse and New Relic.",
  },
  {
    stat: "50%",
    label: "Shorter release cycles",
    title: "CI/CD at Cleartrip",
    body: "Plexus and Bitbucket Pipelines automating deploys so releases are a pipeline, not a ritual.",
  },
  {
    stat: "40% / 25%",
    label: "Delivery up · defects down",
    title: "6-month migration program",
    body: "Cross-functional work with QA and product during a migration: sprint delivery +40%, post-release defects −25%.",
  },
  {
    stat: "5",
    label: "Production APIs",
    title: "Integrations that ship",
    body: "IRCTC, Razorpay, AdPushup, Google Ads, and Google Analytics — wired into booking, payments, and monetization.",
  },
  {
    stat: "3",
    label: "White-label clients",
    title: "One platform, many brands",
    body: "A Trainman plugin that onboarded three companies without forking the product for each tenant.",
  },
];

export const principles = [
  {
    id: "01",
    name: "Migrate",
    title: "Move the stack without taking the product down.",
    body: "Angular 9 → 13, then Angular → Express over 18 months. Five live APIs. The work is sequencing and contracts, not a demo rewrite.",
  },
  {
    id: "02",
    name: "Measure",
    title: "Lighthouse and New Relic before opinions.",
    body: "6s to 2.5s with SSR. ~70% load-time drop on a migration. Performance is a number you keep, not a slide you present.",
  },
  {
    id: "03",
    name: "Integrate",
    title: "Third-party systems are part of the product.",
    body: "IRCTC, Razorpay, ads, analytics. If it does not survive SLA, it is not integrated — it is attached.",
  },
  {
    id: "04",
    name: "Unblock",
    title: "Ship the system that lets other people ship.",
    body: "Config-driven UI for campaigns. CI/CD that cut release cycles by 50%. Engineering leverage is when marketing does not wait on a PR.",
  },
];

export const skillGroups = [
  {
    name: "Frontend",
    items: [
      "React.js",
      "Next.js",
      "Angular (v9–v13)",
      "AngularJS",
      "TypeScript",
      "JavaScript (ES6+)",
      "HTML5",
      "CSS3",
      "Angular Material",
      "MUI",
      "Responsive design",
    ],
  },
  {
    name: "Backend",
    items: ["Node.js", "Express.js", "REST APIs", "MongoDB", "Python"],
  },
  {
    name: "APIs & product",
    items: ["IRCTC", "Razorpay", "Google Analytics", "Google Ads", "AdPushup"],
  },
  {
    name: "Engineering",
    items: [
      "Performance (Lighthouse, New Relic)",
      "SEO & SSR",
      "XSS / CSRF",
      "Authentication",
      "CI/CD (Plexus, Bitbucket)",
      "Git / Bitbucket",
      "Linux",
      "Jira / Slack",
    ],
  },
];

export const depth = [
  {
    id: "architecture",
    title: "Frontend architecture",
    summary: "White-label platforms and configuration-driven UIs.",
    body: "Most of my production work is not a single branded SPA. Trainman had to render as multiple client products from one codebase. At Cleartrip, campaign surfaces are driven by configuration so marketing is not blocked on a frontend release. The pattern is the same: separate what is shared (booking, payments, SEO plumbing) from what is tenant- or campaign-specific.",
  },
  {
    id: "angular",
    title: "Angular",
    summary: "v9 through v13, Material, and a live version migration.",
    body: "I have shipped on Angular 9–13, AngularJS, Angular CLI, and Angular Material. The 9 → 13 migration was not cosmetic — it came with a 30% performance improvement on a production app. I also spent 18 months peeling a live Angular surface toward Express.js, which is a different skill from writing new Angular features.",
  },
  {
    id: "next",
    title: "Next.js & React",
    summary: "Current production stack at Cleartrip.",
    body: "The SEO dashboard and configuration-driven campaign UI are Next.js and TypeScript. That is a continuation of the SSR work I did on Angular: render what search and humans need on the first response, keep the client bundle honest, and treat TypeScript as the contract between data and UI.",
  },
  {
    id: "express",
    title: "Express.js",
    summary: "Server-side JavaScript used as a performance lever.",
    body: "Express entered the picture as the destination of a performance migration, not as a tutorial stack. Moving rendering and request handling server-side is how we took ~70% off load times while IRCTC, Razorpay, and the ad integrations stayed live.",
  },
  {
    id: "performance",
    title: "Performance",
    summary: "Lighthouse, New Relic, SSR, and migration math.",
    body: "I do not tune by feel. Lighthouse and New Relic were how bottlenecks were found on Trainman. The numbers I will stand behind: 6s → 2.5s after SSR, 30% from the Angular 9→13 upgrade, ~70% from the Angular → Express path. If it is not measured, it is not an optimization.",
  },
  {
    id: "seo",
    title: "SEO",
    summary: "SSR for crawlable HTML, then an internal SEO product.",
    body: "SEO started as an engineering constraint (SSR so the document is indexable and fast) and is now a product I am building: an internal dashboard at Cleartrip so teams can see and act on search data. Same problem, two altitudes.",
  },
  {
    id: "security",
    title: "Authentication & browser security",
    summary: "XSS, CSRF, validation, and auth on a booking platform.",
    body: "Trainman handles bookings and payments. I implemented input validation, authentication, and defenses against XSS and CSRF. Security here is not a separate audit slide — it is what keeps a white-label payment surface from becoming an incident.",
  },
  {
    id: "apis",
    title: "API integrations",
    summary: "IRCTC, Razorpay, ads, analytics — production, not sandboxes.",
    body: "IRCTC for train inventory, Razorpay for payments, AdPushup and Google Ads for monetization, Google Analytics for measurement. These were integrated against SLA, including through an 18-month stack transition. The hard part is failure modes and ownership, not the first successful 200.",
  },
  {
    id: "cicd",
    title: "CI/CD & delivery",
    summary: "Plexus, Bitbucket Pipelines, 50% shorter release cycles.",
    body: "At Cleartrip I designed and implemented CI/CD with Plexus and Bitbucket Pipelines. Release cycle time dropped by 50%. Delivery is part of the engineering job: if it cannot ship, it is not done.",
  },
  {
    id: "monitoring",
    title: "Monitoring",
    summary: "New Relic and Lighthouse as the feedback loop.",
    body: "New Relic in production, Lighthouse in the loop. That pairing is how the SSR and Angular work was judged. I would rather attach a trace to a regression than argue about it in standup.",
  },
];

export const credentials = [
  {
    name: "Blockchain Technology",
    org: "Adani Digital Labs",
    year: "2024",
    id: "99933954",
  },
  {
    name: "JavaScript Specialist",
    org: "HackerRank",
    year: "2021",
    id: "Object-oriented design, REST APIs",
  },
];

export const education = {
  degree: "Bachelor of Technology (Minor in Computer Science)",
  school: "Starex University",
  year: "2023",
  place: "Gurgaon, Haryana",
  gpa: "8.1",
};
