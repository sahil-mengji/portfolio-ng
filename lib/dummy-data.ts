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
    excerpt:
      "How one picker can drive a whole system — bg is primary, guidelines flip white/dark by luminosity.",
    date: "2026-02-14",
    readingTime: "5 min",
    tags: ["Design", "Theming"],
    body: `We start with a single hex. Luminance decides guidelines: dark hues get white, light hues get a darker shade of the same color.

## One value, whole system

Primary is the site background. Navbar, text and grid all derive from that one value — read more in the [theming notes](/design-system) or the [OKLCH docs](https://oklch.com).

### Token mapping

| Token | Derivation | Notes |
| --- | --- | --- |
| \`--primary\` | picked hex | page background |
| \`--grid-ink\` | luminance flip | white on dark, dark shade on light |
| \`--surface\` | hue-tinted mix | never flat white/black |

> The trick is hue-tinted surfaces: mix the primary hue into every surface so the UI never collapses to flat white or black.

### Derivation snippet

\`\`\`css
:root {
  --primary: oklch(0.55 0.2 270);
  --grid-ink: oklch(from var(--primary) clamp(0.2, 0.95 - l, 0.95) 0.02 h);
}
\`\`\`

- Pick one hex in the [picker](/design-system)
- Surfaces follow automatically
- Text stays legible via \`color-mix\` tints`,
  },
  {
    slug: "instrument-serif-in-practice",
    title: "Instrument Serif in Practice",
    excerpt: "Why subheadings feel editorial when set in Instrument Serif.",
    date: "2026-01-28",
    readingTime: "4 min",
    tags: ["Typography"],
    body: `Subheadings use <Highlight>Instrument Serif</Highlight> — a sharp, high-contrast serif that pairs with the neutral sans.

## The pairing

Headings stay bold sans, body stays relaxed. All via presets: \`Text.Heading\`, \`Text.Subheading\` (Instrument Serif), \`Text.Body\`, \`Text.Link\`.

<Callout title="When to reach for it">
Pull quotes, section titles and empty states. Never body copy — contrast this high gets tiring at paragraph length.
</Callout>

### Rules of thumb

1. One serif voice per page
2. Tight leading and tracking
3. Pair with a quiet grotesque — see [fontsource](https://fontsource.org) for self-hosting

*Italic* for emphasis, **bold** for structure, ~~strikethrough~~ for retired drafts.`,
  },
  {
    slug: "floating-navbar-tokens",
    title: "Floating Navbar Tokens",
    excerpt: "Themifying a floating navbar so its bg is the primary color.",
    date: "2026-01-10",
    readingTime: "3 min",
    tags: ["UI", "Tokens"],
    body: `Navbar background is now primary. Foreground is gridInk, muted is gridInk at 68% opacity, accent pill is gridInk at 14%.

## Token recipe

| Token | Value | Used for |
| --- | --- | --- |
| \`--nav-bg\` | \`var(--primary)\` | floating bar |
| \`--nav-fg\` | \`var(--grid-ink)\` | links |
| \`--nav-muted\` | \`grid-ink 68%\` | secondary text |

### Scroll behavior

\`\`\`ts
useMotionValueEvent(scrollY, "change", (y) => {
  hidden.set(y > last && y > 120) // hide on scroll down
})
\`\`\`

---

## Rollout checklist

- [x] Bg follows the picker
- [x] Hides on scroll down, returns on scroll up
- [ ] Reduced-motion path

It hides on scroll down and reappears on scroll up — fully driven by the picker.`,
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
    excerpt:
      "Native input only, better looking — pill trigger, presets, eyedropper.",
    year: "2026",
    stack: ["React", "Color"],
    body: "Kept functioning identical to the native input (updatePalette on change) but wrapped in a themed pill + popover with presets. Positioned left-bottom, not top-right. No HSL sliders creep — just swatch + hex + presets.",
  },
  {
    slug: "text-system",
    title: "Text System",
    excerpt:
      "Reusable Text.heading / .subheading / .body / .link with theme-aware defaults.",
    year: "2026",
    stack: ["CVA", "Typography"],
    body: "Text presets need only children; className is for Tailwind positioning. Colors default via palette: heading/link → gridInk, body → text, subheading/caption → secondaryText. Override with color or className anytime.",
  },
]

export const showcaseItems = [
  { title: "Primary is BG", desc: "Bg = picked hue", swatch: "primary" },
  {
    title: "White on Dark",
    desc: "Dark picker → white guidelines",
    swatch: "gridInk-dark",
  },
  {
    title: "Darker on Light",
    desc: "Light picker → dark shade guidelines",
    swatch: "gridInk-light",
  },
]

export type Role = {
  title: string
  type: string
  period: string
  duration: string
  bullets: string[]
  skills: string[]
}

export type WorkExp = {
  company: string
  location: string
  logo: string // emoji or URL
  photos?: string[] // board photos for the preview pane
  roles: Role[]
}

const DUMMY_LOGO =
  "https://media.licdn.com/dms/image/v2/D4E0BAQEvdP4_OD_4vA/company-logo_200_200/B4EaBt39NvHoAE-/0/1788549780778/gep_worldwide_logo?e=2147483647&v=beta&t=_Y87nPG6sWkhFmwU18-fYwuQzlzI3JxZFosp5UOMXyI"

export const workExperience: WorkExp[] = [
  {
    company: "GEP Worldwide",
    location: "Hyderabad, Telangana, India",
    logo: DUMMY_LOGO,
    photos: ["/gep1.jpeg", "/gep2.jpeg"],
    roles: [
      {
        title: "Software Engineer Intern",
        period: "May 2026 — Present",
        type: "Internship",
        duration: "5 mos",
        skills: [],
        bullets: [],
      },
    ],
  },
  {
    company: "E-Cell NITK",
    location: "Mangaluru, Karnataka, India · On-site",
    logo: "https://media.licdn.com/dms/image/v2/D560BAQHNOlUgfHzavA/company-logo_200_200/company-logo_200_200/0/1718563404533/ecellnitksurathkal_logo?e=2147483647&v=beta&t=Xd9XBkvnPtcdmfTFBgpcMsiSu_lj3U7w2XAFVrjKpzs",
    roles: [
      {
        title: "Technical Head",
        period: "04.2026 — Present",
        type: "Full-time",
        duration: "5m",
        skills: [],
        bullets: [
          "Leading **technical initiatives** for E-Cell NITK's digital infrastructure",
          "Managing the **core engineering team** and delivery ownership",
          "Setting the **technical roadmap** across platforms",
        ],
      },
      {
        title: "Webmaster",
        period: "04.2025 — Present",
        type: "Part-time",
        duration: "1y 5m",
        skills: [],
        bullets: [
          "Overseeing all **web-related operations** across organizational platforms",
          "Maintaining **high availability** and uptime of web properties",
          "Ensuring **performance** and reliability of production sites",
        ],
      },
      {
        title: "Web Developer",
        period: "01.2024 — 04.2025",
        type: "Full-time",
        duration: "1y 4m",
        skills: ["HTML", "CSS", "JavaScript", "React", "UI/UX Design"],
        bullets: [
          "Crafted organization websites with **modern web technologies** into **responsive, user-friendly** platforms",
          "Designed **intuitive navigation** and enhanced user experience",
          "Optimized **site performance** across pages",
        ],
      },
    ],
  },
  {
    company: "Incident NITK",
    location: "Mangaluru, Karnataka, India · Freelance",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXuBoY0DkW3-hupNLTwCIA44q6pqDCuYfWnQ7eKTyZww&s=10",
    roles: [
      {
        title: "Technical Lead",
        period: "Jul 2026",
        type: "Freelance",
        duration: "1m",
        skills: [],
        bullets: [],
      },
    ],
  },
  {
    company: "ACE-NITK",
    location: "Mangaluru, Karnataka, India · Part-time",
    logo: DUMMY_LOGO,
    roles: [
      {
        title: "Web Developer",
        period: "08.2024 — Present",
        type: "Part-time",
        duration: "2y 1m",
        skills: [],
        bullets: [
          "Developing the **official website** for the Association of Computer Engineers",
          "Maintaining and **updating** web content and pages",
          "Keeping the site **responsive and accessible**",
        ],
      },
    ],
  },
  {
    company: "IEEE NITK",
    location: "Mangaluru, Karnataka, India · Part-time",
    logo: DUMMY_LOGO,
    roles: [
      {
        title: "Executive Member · CompSoc",
        period: "09.2024 — Present",
        type: "Part-time",
        duration: "2y",
        skills: [],
        bullets: [
          "Active member of the **Computer Society** chapter",
          "Organizing **technical workshops** for students",
          "Driving **community engagement** initiatives",
        ],
      },
    ],
  },
  {
    company: "COSH NITK",
    location: "Mangaluru, Karnataka, India",
    logo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrVGg_6xrZ5KUsDvosT928dIQOWJXh76ifpN7lEHbDPw&s",
    roles: [
      {
        title: "Graphic Designer",
        period: "11.2024 — Present",
        type: "",
        duration: "1y 10m",
        skills: [],
        bullets: [
          "Designing **visual identity** for the COSH community",
          "Creating **promotional assets** for events and outreach",
          "Keeping **brand language** consistent across channels",
        ],
      },
    ],
  },
  {
    company: "Urban Parents Club",
    location: "Bengaluru, Karnataka, India · Internship",
    logo: "https://media.licdn.com/dms/image/v2/D560BAQFrs6ZrZcuEtw/company-logo_200_200/B56ZdFyyrYH8AM-/0/1749222632834/urban_parents_club_logo?e=2147483647&v=beta&t=veImUkw5oEbE1P0Ku4-pFfHZYFkVAvgXnhlvSlGoekc",
    roles: [
      {
        title: "Founders Office Intern — Tech",
        period: "05.2025 — 07.2025",
        type: "Internship",
        duration: "3m",
        skills: ["React Native", "React.js", "Mobile Development"],
        bullets: [
          "Worked closely with **founders** on core technical products",
          "Scaled the **mobile application** ecosystem",
          "Shipped features across the **React Native** stack",
        ],
      },
    ],
  },
  {
    company: "Evoque Luxury",
    location: "Remote · Freelance",
    logo: DUMMY_LOGO,
    roles: [
      {
        title: "Web Developer",
        period: "Oct 2025 — Nov 2025",
        type: "Freelance",
        duration: "2m",
        skills: [],
        bullets: [],
      },
    ],
  },
  {
    company: "E-Summit and Innovation Committee, NITK",
    location: "Mangaluru · Hybrid · Part-time",
    logo: DUMMY_LOGO,
    roles: [
      {
        title: "Web Developer and Designer",
        period: "05.2024 — Present",
        type: "Part-time",
        duration: "2y 4m",
        skills: ["CSS", "Figma", "UI/UX Design", "Animation"],
        bullets: [
          "Designed and developed **interactive platforms** for the annual E-Summit",
          "Built for a **hybrid event** experience, on-site and online",
          "Crafted **animations** and engaging interfaces",
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
  logo?: string
  details: string[]
  coursework?: string[]
  courseProjects?: { title: string; desc: string }[]
}

export const education: Education[] = [
  {
    school: "National Institute of Technology Karnataka (NITK), Surathkal",
    degree: "B.Tech in Computer Science and Engineering",
    period: "2023 — 2027",
    location: "Surathkal",
    logo: "https://www.google.com/s2/favicons?domain=nitk.ac.in&sz=128",
    details: ["Focused on systems, full-stack development & system design"],
    coursework: [
      "Computer Science",
      "Data Structures & Algorithms",
      "Software Engineering",
      "DBMS",
      "Operating Systems",
      "Computer Networks",
    ],
    courseProjects: [
      { title: "DBMS Mini Project", desc: "Database design & SQL coursework" },
      { title: "Full-Stack Web App", desc: "Software Engineering coursework" },
      { title: "ML Course Project", desc: "Machine learning coursework" },
      { title: "Networks / OS Project", desc: "Systems coursework" },
    ],
  },
  {
    school: "Gurukul Independent PU College of Science, Kalaburagi",
    degree: "11th and 12th Grade (Pre-University)",
    period: "2021 — 2023",
    location: "Kalaburagi",
    logo: "https://www.google.com/s2/favicons?domain=gurukul.edu.in&sz=128",
    details: ["Science stream", "Physics, Chemistry, Mathematics"],
  },
  {
    school: "Sardar Vallabhbhai Patel Memorial High School, Kalaburagi",
    degree: "Secondary Education",
    period: "2008 — 2021",
    location: "Kalaburagi",
    details: ["Basic education with mathematics & science focus"],
  },
]

export type Certification = {
  title: string
  org: string
  href: string
  year?: string
}

export const certifications: Certification[] = [
  {
    title: "AWS Certified Cloud Practitioner",
    org: "Amazon Web Services",
    href: "https://aws.amazon.com/certification/certified-cloud-practitioner/",
  },
  {
    title: "Meta Front-End Developer Professional Certificate",
    org: "Meta · Coursera",
    href: "https://www.coursera.org/professional-certificates/meta-front-end-developer",
  },
  {
    title: "Google Professional Certificates",
    org: "Google · Coursera",
    href: "https://grow.google/certificates/",
  },
  {
    title: "NPTEL / SWAYAM Courses",
    org: "IIT / IISc",
    href: "https://nptel.ac.in",
  },
]

export type Achievement = {
  title: string
  org: string
  year: string
  description: string
  photos?: string[]
  links?: { label: string; href: string }[]
}

export const achievements: Achievement[] = [
  {
    title: "Polkadot Assethub Hackathon — 2nd Runner-Up",
    description: "2nd runner-up building on Polkadot AssetHub",
    org: "Polkadot",
    year: "Jun 2025",
    photos: [
      "https://picsum.photos/seed/polkadot-1/640/480",
      "https://picsum.photos/seed/polkadot-2/640/480",
      "https://picsum.photos/seed/polkadot-3/640/480",
    ],
    links: [
      { label: "Project", href: "https://github.com/" },
      { label: "Demo", href: "https://example.com/" },
    ],
  },
  {
    title: "Hackverse 2025 — Best Product Design",
    description: "Best Product Design award at NITK's national hackathon",
    org: "Hackverse NITK",
    year: "Feb 2025",
    photos: [
      "https://picsum.photos/seed/hackverse-1/640/480",
      "https://picsum.photos/seed/hackverse-2/640/480",
      "https://picsum.photos/seed/hackverse-3/640/480",
    ],
    links: [
      { label: "Project", href: "https://github.com/" },
      { label: "Demo", href: "https://example.com/" },
    ],
  },
  {
    title: "Wells Fargo x Engineer Hackathon — Top 5 Finalist",
    description: "Top 5 finalist at the Wells Fargo × Engineer hackathon",
    org: "Engineer NITK",
    year: "Nov 2024",
    photos: [
      "https://picsum.photos/seed/engineer-1/640/480",
      "https://picsum.photos/seed/engineer-2/640/480",
      "https://picsum.photos/seed/engineer-3/640/480",
    ],
    links: [
      { label: "Project", href: "https://github.com/" },
      { label: "Demo", href: "https://example.com/" },
    ],
  },
  {
    title: "Silicon Maze CTF — Winner",
    description: "Winner of the Silicon Maze CTF",
    org: "Web Enthusiasts Club NITK",
    year: "Sep 2024",
    photos: [
      "https://picsum.photos/seed/ctf-1/640/480",
      "https://picsum.photos/seed/ctf-2/640/480",
      "https://picsum.photos/seed/ctf-3/640/480",
    ],
    links: [
      { label: "Project", href: "https://github.com/" },
      { label: "Write-up", href: "https://example.com/" },
    ],
  },
]

export const bentoItems = [
  {
    title: "12 tokens",
    desc: "One hex → primary, gridInk, surface, text…",
    span: "col-span-2 row-span-1",
  },
  {
    title: "Grid",
    desc: "22px cells, 5 major, arcs & angles",
    span: "col-span-1 row-span-2",
  },
  { title: "Type", desc: "Instrument Serif subheads", span: "col-span-1" },
  { title: "Nav", desc: "Primary bg, hides on scroll", span: "col-span-1" },
  {
    title: "Picker",
    desc: "Left-bottom, native + presets",
    span: "col-span-2",
  },
  { title: "Motion", desc: "Drafting anim, blur, spring", span: "col-span-1" },
]
