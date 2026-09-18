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
  roles: Role[]
}

const DUMMY_LOGO =
  "https://media.licdn.com/dms/image/v2/D4E0BAQEvdP4_OD_4vA/company-logo_200_200/B4EaBt39NvHoAE-/0/1788549780778/gep_worldwide_logo?e=2147483647&v=beta&t=_Y87nPG6sWkhFmwU18-fYwuQzlzI3JxZFosp5UOMXyI"

export const workExperience: WorkExp[] = [
  {
    company: "GEP Worldwide",
    location: "Hyderabad, Telangana, India",
    logo: DUMMY_LOGO,
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
