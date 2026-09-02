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

export type WorkExp = {
  role: string
  company: string
  period: string
  location: string
  bullets: string[]
}

export const workExperience: WorkExp[] = [
  {
    role: "Senior Frontend Engineer",
    company: "Draft Systems",
    period: "2024 — Present",
    location: "Remote · Berlin",
    bullets: ["Led theming system — single picker drives 12 tokens", "Shipped drafting-grid bg with Instrument Serif system", "Floating navbar with hue-tinted tokens"],
  },
  {
    role: "Product Designer",
    company: "Field Studio",
    period: "2021 — 2024",
    location: "Lisbon",
    bullets: ["Built bento & editorial layouts", "Design tokens → code pipeline"],
  },
  {
    role: "Frontend Engineer",
    company: "Proto Labs",
    period: "2019 — 2021",
    location: "London",
    bullets: ["Next.js portfolios, motion & a11y"],
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
