export type BlogPost = {
  slug: string
  title: string
  excerpt: string
  date: string
  readingTime: string
  tags: string[]
  body: string
}

export type Project = {
  slug: string
  title: string
  excerpt: string
  year: string
  stack: string[]
  body: string
}

export const blogPosts: BlogPost[] = [
  {
    slug: "designing-with-a-single-color",
    title: "Designing with a Single Color",
    excerpt: "How one picker can drive a whole system — bg is primary, guidelines flip white/dark by luminosity.",
    date: "2026-02-14",
    readingTime: "5 min",
    tags: ["Design", "Theming"],
    body: "We start with a single hex. Luminance decides guidelines: dark hues get white, light hues get a darker shade of the same color. Primary is the site background. Navbar, text and grid all derive from that one value. The trick is hue-tinted surfaces so the UI never collapses to flat white/black.",
  },
  {
    slug: "instrument-serif-in-practice",
    title: "Instrument Serif in Practice",
    excerpt: "Why subheadings feel editorial when set in Instrument Serif.",
    date: "2026-01-28",
    readingTime: "4 min",
    tags: ["Typography"],
    body: "Subheadings use Instrument Serif — a sharp, high-contrast serif that pairs with the neutral sans. Headings stay bold sans, body stays relaxed. All via <Text> presets: Text.Heading, Text.Subheading (Instrument Serif), Text.Body, Text.Link.",
  },
  {
    slug: "floating-navbar-tokens",
    title: "Floating Navbar Tokens",
    excerpt: "Themifying a floating navbar so its bg is the primary color.",
    date: "2026-01-10",
    readingTime: "3 min",
    tags: ["UI", "Tokens"],
    body: "Navbar background is now primary. Foreground is gridInk, muted is gridInk at 68% opacity, accent pill is gridInk at 14%. It hides on scroll down and reappears on scroll up — fully driven by the picker.",
  },
]

export const projects: Project[] = [
  {
    slug: "drafting-grid",
    title: "Drafting Grid",
    excerpt: "SVG grid pinned bottom-left, clipped to viewport, hue-aware ink.",
    year: "2026",
    stack: ["Next.js", "SVG", "OKLCH"],
    body: "The grid is a full-screen fixed layer (z 0) behind content. Viewport math adds extra units to overflow top/right. Geometry recomputes on resize, but server renders a solid placeholder to avoid hydration mismatch from floating-point SVG paths.",
  },
  {
    slug: "color-picker",
    title: "Color Picker — Left Bottom",
    excerpt: "Native input only, better looking — pill trigger, presets, eyedropper.",
    year: "2026",
    stack: ["React", "Color"],
    body: "Kept functioning identical to the native input (updatePalette on change) but wrapped in a themed pill + popover with presets. Positioned left-bottom, not top-right. No HSL sliders creep — just swatch + hex + presets.",
  },
  {
    slug: "text-system",
    title: "Text System",
    excerpt: "Reusable Text.heading / .subheading / .body / .link with theme-aware defaults.",
    year: "2026",
    stack: ["CVA", "Typography"],
    body: "Text presets need only children; className is for Tailwind positioning. Colors default via palette: heading/link → gridInk, body → text, subheading/caption → secondaryText. Override with color or className anytime.",
  },
]

export const showcaseItems = [
  { title: "Primary is BG", desc: "Bg = picked hue", swatch: "primary" },
  { title: "White on Dark", desc: "Dark picker → white guidelines", swatch: "gridInk-dark" },
  { title: "Darker on Light", desc: "Light picker → dark shade guidelines", swatch: "gridInk-light" },
]

export type Role = {
  title: string
  period: string
  bullets: string[]
  skills: string[]
}

export type WorkExp = {
  company: string
  location: string
  logo: string // emoji or URL
  roles: Role[]
}

export const workExperience: WorkExp[] = [
  {
    company: "Draft Systems",
    location: "Remote · Berlin",
    logo: "https://media.licdn.com/dms/image/v2/D4E0BAQEvdP4_OD_4vA/company-logo_200_200/B4EaBt39NvHoAE-/0/1788549780778/gep_worldwide_logo?e=2147483647&v=beta&t=_Y87nPG6sWkhFmwU18-fYwuQzlzI3JxZFosp5UOMXyI",
    roles: [
      {
        title: "Staff Frontend Engineer",
        period: "2025 — Present",
        skills: ["React", "OKLCH", "Design Systems", "TypeScript", "Framer Motion"],
        bullets: [
          "Architected unified **theming platform** — single picker drives **12 tokens** across web & native",
          "Led migration to **OKLCH color space**, cut theme-related bugs by **78%**",
          "Mentored **4 engineers** on design-system internals",
        ],
      },
      {
        title: "Senior Frontend Engineer",
        period: "2023 — 2025",
        skills: ["React", "Next.js", "Instrument Serif", "CSS Variables"],
        bullets: [
          "Built **drafting-grid background** with **Instrument Serif** type system",
          "Designed **floating navbar** with hue-tinted semantic tokens",
          "Shipped **color picker** (native input, presets, eyedropper)",
        ],
      },
      {
        title: "Frontend Engineer",
        period: "2021 — 2023",
        skills: ["Next.js", "Framer Motion", "Accessibility", "Bento Grid"],
        bullets: [
          "Delivered **Next.js portfolio starters** with motion & a11y",
          "Implemented **bento-grid layout engine** with dense packing",
        ],
      },
    ],
  },
  {
    company: "Field Studio",
    location: "Lisbon",
    logo: "https://media.licdn.com/dms/image/v2/D4E0BAQEvdP4_OD_4vA/company-logo_200_200/B4EaBt39NvHoAE-/0/1788549780778/gep_worldwide_logo?e=2147483647&v=beta&t=_Y87nPG6sWkhFmwU18-fYwuQzlzI3JxZFosp5UOMXyI",
    roles: [
      {
        title: "Lead Product Designer",
        period: "2022 — 2024",
        skills: ["Figma", "Design Tokens", "Style Dictionary", "Data Viz"],
        bullets: [
          "Defined **design-token pipeline** from **Figma → code** (Style Dictionary)",
          "Established **bento & editorial layout system** for marketing",
        ],
      },
      {
        title: "Product Designer",
        period: "2020 — 2022",
        skills: ["User Research", "Dashboard Design", "SaaS", "Prototyping"],
        bullets: [
          "Designed **dashboard & data-viz interfaces** for SaaS platform",
          "Ran **usability studies**, cut task-completion time **35%**",
        ],
      },
    ],
  },
  {
    company: "Proto Labs",
    location: "London",
    logo: "https://media.licdn.com/dms/image/v2/D4E0BAQEvdP4_OD_4vA/company-logo_200_200/B4EaBt39NvHoAE-/0/1788549780778/gep_worldwide_logo?e=2147483647&v=beta&t=_Y87nPG6sWkhFmwU18-fYwuQzlzI3JxZFosp5UOMXyI",
    roles: [
      {
        title: "Frontend Engineer",
        period: "2019 — 2020",
        skills: ["Next.js", "Framer Motion", "WCAG AA", "Performance"],
        bullets: [
          "Built performant portfolio sites with **Next.js & Framer Motion**",
          "Championed **accessibility** — **WCAG AA** across all projects",
        ],
      },
    ],
  },
]

export type Education = {
  school: string
  degree: string
  period: string
  location: string
  details: string[]
}

export const education: Education[] = [
  {
    school: "Berlin University of the Arts",
    degree: "M.A. Interface Design",
    period: "2017 — 2019",
    location: "Berlin",
    details: ["Thesis on generative design systems", "Motion & typography focus"],
  },
  {
    school: "Loughborough University",
    degree: "B.Sc. Computer Science",
    period: "2014 — 2017",
    location: "Loughborough",
    details: ["First-class honours", "HCI & graphics electives"],
  },
]

export type Achievement = {
  title: string
  org: string
  year: string
  description: string
}

export const achievements: Achievement[] = [
  {
    title: "Awwwards Honorable Mention",
    description: "Portfolio experience cited for interaction craft",
    org: "Awwwards",
    year: "2025",
  },
  {
    title: "Design Systems Speaker",
    description: "Talk on single-picker theming at a Berlin meetup",
    org: "Design Systems Berlin",
    year: "2024",
  },
  {
    title: "Open Source — 2k stars",
    description: "Theming toolkit adopted across portfolio starters",
    org: "GitHub",
    year: "2024",
  },
]

export const bentoItems = [
  { title: "12 tokens", desc: "One hex → primary, gridInk, surface, text…", span: "col-span-2 row-span-1" },
  { title: "Grid", desc: "22px cells, 5 major, arcs & angles", span: "col-span-1 row-span-2" },
  { title: "Type", desc: "Instrument Serif subheads", span: "col-span-1" },
  { title: "Nav", desc: "Primary bg, hides on scroll", span: "col-span-1" },
  { title: "Picker", desc: "Left-bottom, native + presets", span: "col-span-2" },
  { title: "Motion", desc: "Drafting anim, blur, spring", span: "col-span-1" },
]
