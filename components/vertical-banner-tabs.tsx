"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { motion, AnimatePresence } from "framer-motion"
import { ExternalLink, X } from "lucide-react"
import { useThemeColorContext } from "@/components/theme-provider"
import { readableInkOn } from "@/lib/color-utils"
import { getLenis } from "@/lib/lenis"
import { Text } from "@/components/ui/text"
import {
  workExperience,
  education,
  achievements,
  certifications,
  skillGroups,
} from "@/lib/dummy-data"
import type {
  WorkExp,
  Education as EducationEntry,
  Achievement as AchievementEntry,
} from "@/lib/dummy-data"
import { WorkCompany } from "@/components/work-timeline"

// Signature color per tab + readable ink on it. The active spine wears
// its full color; the panel wears the same hue as a surface tint (full
// strength would kill theme-text legibility — Text pins var(--text)).
const TAB_COLORS = {
  work: "#A0355C",
  education: "#E4FF9A",
  achievements: "#94B7E3",
  skills: "#DE7A2E",
} as const
const TAB_INK: Record<keyof typeof TAB_COLORS, string> = {
  work: "#FFFFFF",
  education: "#1A1A1A",
  achievements: "#14202E",
  skills: "#1A1A1A",
}
const WEDGE = "polygon(0 13%, 100% 0, 100% 100%, 0 87%)"
// Exact sheet color = the selected tab's color. Text pins var(--text) /
// related tokens explicitly, so the panel retargets them to the tab's
// readable ink — full-strength bg, still legible in every site theme.
// --accent/--surface are retargeted too so timeline rails, dots and tags
// stay visible on the saturated sheet instead of clashing with it.
const panelVars = (
  tab: keyof typeof TAB_COLORS,
  surface = TAB_COLORS[tab] as string
) => {
  const ink = readableInkOn(surface)
  const dim = ink
  return {
    background: surface,
    color: ink,
    ["--text" as any]: ink,
    ["--card-text" as any]: ink,
    ["--card-muted" as any]: dim,
    ["--muted-foreground" as any]: dim,
    ["--accent" as any]: ink,
    ["--surface" as any]: surface,
    ["--foreground" as any]: ink,
    ["--ring" as any]: ink,
  } as React.CSSProperties
}

// VerticalBannerTabs — right-anchored tabbed index after the bento grid.
// The section starts at the viewport's right edge and takes width
// leftward up to 72rem. Spine rail (trapezoid tabs) fuses into a
// borderless panel holding one live tab at a time.
const TABS = [
  { id: "work", label: "Work" },
  { id: "education", label: "Education" },
  { id: "achievements", label: "Achievements" },
  { id: "skills", label: "Skills" },
] as const

const TAB_META = {
  work: { title: "Work", blurb: "Roles, teams, and what shipped." },
  education: { title: "Education", blurb: "Degrees, programs, and training." },
  achievements: {
    title: "Achievements",
    blurb: "Awards, recognition, and milestones.",
  },
  skills: {
    title: "Skills",
    blurb: "Tools and strengths, grouped.",
  },
} as const

// Brand icons for skills that have an exact Simple Icons match —
// everything else gets a two-letter monogram tile. Icon Dahlia: colored
// brand glyphs straight from the CDN, no bundle cost.
const SKILL_ICONS: Record<string, string> = {
  JavaScript: "javascript",
  TypeScript: "typescript",
  "C++": "cplusplus",
  C: "c",
  Python: "python",
  HTML: "html5",
  CSS: "css",
  "Tailwind CSS": "tailwindcss",
  "shadcn/ui": "shadcnui",
  React: "react",
  "React Query": "reactquery",
  "React Router": "reactrouter",
  Redux: "redux",
  "React Native": "react",
  "Next.js": "nextdotjs",
  "Node.js": "nodedotjs",
  "Express.js": "express",
  MongoDB: "mongodb",
  JWT: "jsonwebtokens",
  AWS: "amazonwebservices",
  Docker: "docker",
  Nginx: "nginx",
  Kafka: "apachekafka",
  "Socket.io": "socketdotio",
  WebRTC: "webrtc",
  GraphQL: "graphql",
  Prisma: "prisma",
  Firebase: "firebase",
  GitHub: "github",
  NPM: "npm",
  "VS Code": "vscode",
  Linux: "linux",
  Figma: "figma",
  "Adobe Illustrator": "adobeillustrator",
  SVG: "svg",
}

function SkillMonogram({ skill }: { skill: string }) {
  const initials = skill
    .replace(/[^A-Za-z ]/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
  return (
    <span
      aria-hidden
      className="grid size-4 shrink-0 place-items-center rounded-[4px] border border-black/20 font-mono text-[8px] font-semibold"
    >
      {initials}
    </span>
  )
}
// Entry counts per tab, shown small beside the panel title.
const TAB_COUNT: Record<TabId, number> = {
  work: workExperience.length,
  education: education.length,
  achievements: achievements.length,
  skills: skillGroups.reduce((n, g) => n + g.skills.length, 0),
}

type TabId = (typeof TABS)[number]["id"]

// Hovered entry in the right pane (null = default resume view).
type Preview = { tab: TabId; index: number } | null

// Resume sheet shown by default in the left preview space.
const RESUME_IMG = "/resume.png"
// Local pool for the scattered photo boards.
const BOARD_POOL = [
  "/thanos/thanos_idle.png",
  "/thanos/thanos_snap.png",
  "/thanos/thanos_time.png",
  "/clouds/cloud-1.png",
  "/clouds/cloud-2.png",
  "/clouds/cloud-3.png",
  "/profile.jpg",
]

// Mouse-tracking parallax for the preview pane with smooth lerp physics.
function useSmoothMousePosition() {
  const posRef = useRef({ x: 0.5, y: 0.5 })
  const targetRef = useRef({ x: 0.5, y: 0.5 })
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      }
    }
    window.addEventListener("mousemove", onMove)

    let animationFrameId: number
    const lerp = (start: number, end: number, factor: number) =>
      start + (end - start) * factor

    const update = () => {
      const nx = lerp(posRef.current.x, targetRef.current.x, 0.1)
      const ny = lerp(posRef.current.y, targetRef.current.y, 0.1)
      // Only re-render on meaningful movement — setState every frame
      // otherwise keeps React rendering forever.
      if (
        Math.abs(nx - posRef.current.x) > 0.0004 ||
        Math.abs(ny - posRef.current.y) > 0.0004
      ) {
        posRef.current.x = nx
        posRef.current.y = ny
        setPos({ x: nx, y: ny })
      }
      animationFrameId = requestAnimationFrame(update)
    }
    animationFrameId = requestAnimationFrame(update)

    return () => {
      window.removeEventListener("mousemove", onMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return pos
}

// Abstract brick board: photos never overlap — uniform gaps, varied
// x/y placement via column offsets, natural ratios, slight tilts.
// The layout variant is seeded per entry so boards don't look identical.
const BRICK_LAYOUTS = [
  [
    "col-span-4 col-start-1",
    "col-span-3 col-start-4",
    "col-span-4 col-start-2",
  ],
  [
    "col-span-3 col-start-3",
    "col-span-4 col-start-1",
    "col-span-3 col-start-2",
  ],
  [
    "col-span-4 col-start-3",
    "col-span-3 col-start-1",
    "col-span-4 col-start-2",
  ],
]

function PhotoBoard({
  images,
  alt,
  seed = 0,
}: {
  images: [string, string, string]
  alt: string
  seed?: number
}) {
  const [a, b, c] = images
  const srcs = [a, b, c]
  const layout = BRICK_LAYOUTS[seed % BRICK_LAYOUTS.length]
  return (
    <div className="grid w-full max-w-[560px] grid-cols-6 gap-3 lg:gap-4">
      {srcs.map((src, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={`${seed}-${i}`}
          src={src}
          alt={i === 0 ? alt : ""}
          loading="lazy"
          className={`${layout[i]} h-auto w-full rounded-md object-cover shadow-xl`}
        />
      ))}
    </div>
  )
}

// Resume: one single photo, slightly tilted (not straight).
// Click zooms into a fullscreen viewer via a shared layout transition.
function ResumePreview() {
  const [zoom, setZoom] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!zoom) return
    document.body.style.overflow = "hidden"
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setZoom(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      getLenis()?.start()
      window.removeEventListener("keydown", onKey)
    }
  }, [zoom])

  return (
    <div className="flex w-full flex-1 items-center justify-center">
      {/* Unmounted while zoomed: a single image instance flies between
          states, no double-appearing. */}
      {!zoom && (
        // Stacked paper pile: two offset sheets peek out from behind the
        // resume. Front image stays relative + last in DOM so it paints
        // on top; sheets are pure decoration.
        <div className="relative">
          <div
            aria-hidden
            className="absolute inset-0 translate-x-4 translate-y-3 rotate-[-9deg] rounded-md border border-border bg-stone-300 shadow-lg"
          />
          <div
            aria-hidden
            className="absolute inset-0 -translate-x-3 translate-y-1.5 rotate-[3deg] rounded-md border border-border bg-stone-300 shadow-lg"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <motion.img
            src={RESUME_IMG}
            alt="Resume"
            loading="lazy"
            layoutId="resume-zoom-photo"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={() => setZoom(true)}
            className="relative aspect-[2550/3300] h-[58vh] rotate-[-4deg] cursor-zoom-in rounded-md object-cover shadow-xl lg:h-[74vh]"
          />
        </div>
      )}
      {/* Portaled to body: escapes the mouse-follow transformed pane so
          `fixed` truly covers the viewport, centered on the page. */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {zoom && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                onClick={() => setZoom(false)}
                className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center p-4 lg:p-10"
                style={{
                  background: "color-mix(in srgb, #000000 78%, transparent)",
                  backdropFilter: "blur(10px)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <motion.img
                  src={RESUME_IMG}
                  alt="Resume enlarged"
                  layoutId="resume-zoom-photo"
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  onClick={(e) => e.stopPropagation()}
                  className="max-h-[92vh] w-auto max-w-[94vw] rounded-lg object-contain shadow-2xl"
                />
                <button
                  type="button"
                  aria-label="Close resume viewer"
                  onClick={() => setZoom(false)}
                  className="absolute top-5 right-5 rounded-full border border-white/25 bg-black/50 p-2 text-white transition-colors hover:bg-black/80"
                >
                  <X size={18} aria-hidden />
                </button>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}

function WorkPreview({ w, index }: { w: WorkExp; index: number }) {
  // Entry photos first (e.g. gep1/gep2 for GEP), pool fallback otherwise.
  const fallback = [
    BOARD_POOL[index % BOARD_POOL.length],
    BOARD_POOL[(index + 3) % BOARD_POOL.length],
  ]
  const extras = [...(w.photos ?? []), ...fallback].slice(0, 2)
  const images: [string, string, string] = [w.logo, extras[0], extras[1]]
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <PhotoBoard images={images} alt={`${w.company} photos`} seed={index} />
    </div>
  )
}

function EducationPreview({ e, index }: { e: EducationEntry; index: number }) {
  const s = e.school.length
  const images: [string, string, string] = [
    BOARD_POOL[s % BOARD_POOL.length],
    BOARD_POOL[(s + 2) % BOARD_POOL.length],
    BOARD_POOL[(s + 4) % BOARD_POOL.length],
  ]
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <PhotoBoard images={images} alt={e.school} seed={s} />
    </div>
  )
}

function AchievementPreview({
  a,
  index,
}: {
  a: AchievementEntry
  index: number
}) {
  // Entry photos first, pool fallback otherwise (mirrors WorkPreview).
  const fallback = [
    BOARD_POOL[index % BOARD_POOL.length],
    BOARD_POOL[(index + 3) % BOARD_POOL.length],
  ]
  const extras = [...(a.photos ?? []), ...fallback].slice(0, 2)
  const images: [string, string, string] = [
    extras[0],
    extras[1],
    fallback[1 % fallback.length],
  ]
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <PhotoBoard images={images} alt={a.title} seed={index} />
    </div>
  )
}

function SkillsPreview({ index }: { index: number }) {
  const fallback = [
    BOARD_POOL[index % BOARD_POOL.length],
    BOARD_POOL[(index + 3) % BOARD_POOL.length],
  ]
  const images: [string, string, string] = [
    fallback[0],
    fallback[1],
    BOARD_POOL[(index + 5) % BOARD_POOL.length],
  ]
  return (
    <div className="flex w-full flex-1 items-center justify-center">
      <PhotoBoard images={images} alt="Skill snapshots" seed={index} />
    </div>
  )
}
// Dynamic space left of the tabs: resume photo by default, stacked
// photos centered horizontally + vertically for the hovered entry.
// Entire pane tracks the smooth mouse Y, clamped so it stops at the
// section's top/bottom edges instead of overflowing them.
function PreviewPane({ preview }: { preview: Preview }) {
  const { y } = useSmoothMousePosition()
  const asideRef = useRef<HTMLElement | null>(null)
  const boxRef = useRef<HTMLDivElement | null>(null)
  const shiftRef = useRef(0)
  const [shift, setShift] = useState(0)

  // Clamp the desired shift so the photos stay inside BOTH the image
  // component boundary (the aside track) and the screen's top/bottom
  // edges. The component boundary is absolute and never overflows: the
  // screen range only narrows it further when the two ranges overlap.
  // No hover (default resume view) = no cursor follow, rest centered.
  useEffect(() => {
    const aside = asideRef.current
    const box = boxRef.current
    if (!aside || !box) return
    const TRACK_PAD = 8
    const TOP_PAD = 24
    const BOT_PAD = 24
    const viewH = window.innerHeight
    const track = aside.getBoundingClientRect()
    const bRect = box.getBoundingClientRect()
    const prev = shiftRef.current
    const unTop = bRect.top - prev
    const unBottom = bRect.bottom - prev
    // Component boundary: box must stay inside the aside track.
    // This is the hard limit — it is never widened, only narrowed.
    let minT = track.top + TRACK_PAD - unTop
    let maxT = track.bottom - TRACK_PAD - unBottom
    // Screen boundary: narrows the range only when it overlaps;
    // otherwise the component range stands as-is (photos stay inside
    // the component even if that puts them off-screen while scrolling).
    const viewMin = TOP_PAD - unTop
    const viewMax = viewH - BOT_PAD - unBottom
    if (Math.max(minT, viewMin) <= Math.min(maxT, viewMax)) {
      minT = Math.max(minT, viewMin)
      maxT = Math.min(maxT, viewMax)
    }
    // Exact alignment: image section center lands on the cursor Y —
    // but only while an entry is hovered. Default view rests centered.
    const raw =
      preview === null ? 0 : y * window.innerHeight - (unTop + unBottom) / 2
    // Box taller than the allowed range: pin to the midpoint.
    const next =
      minT > maxT ? (minT + maxT) / 2 : Math.min(Math.max(raw, minT), maxT)
    shiftRef.current = next
    setShift(next)
  }, [y, preview])

  return (
    <aside
      ref={asideRef}
      aria-label="Entry preview"
      aria-live="polite"
      // Sticky on lg: the preview parks near viewport center while the
      // long tab panel scrolls past — self-start so it has room to
      // stick. Plain top offset (no -translate): a translate would
      // visually lift the stuck pane above the section top and cover
      // the Proof-of-work heading while the section is still entering.
      // mt-16 / lg:mt-24 mirrors the section's removed top padding, so
      // the resume's rest position is unchanged — only the work panel
      // moves up. (Once stuck, top-[12vh] governs either way.)
      className="mt-16 flex w-full shrink-0 flex-col justify-center lg:sticky lg:top-[12vh] lg:mt-24 lg:w-1/2 lg:flex-1 lg:self-start"
    >
      <div
        ref={boxRef}
        className="flex min-h-[420px] flex-col items-center justify-center p-0 lg:min-h-[520px]"
        style={{ transform: `translateY(${shift}px)` }}
      >
        <div className="mt-0 flex w-full flex-1 items-center justify-center">
          {preview === null ? (
            <ResumePreview />
          ) : preview.tab === "work" ? (
            <WorkPreview
              w={workExperience[preview.index]}
              index={preview.index}
            />
          ) : preview.tab === "education" ? (
            <EducationPreview
              e={education[preview.index]}
              index={preview.index}
            />
          ) : preview.tab === "achievements" ? (
            <AchievementPreview
              a={achievements[preview.index]}
              index={preview.index}
            />
          ) : (
            <SkillsPreview index={preview.index} />
          )}
        </div>
      </div>
    </aside>
  )
}

// Institute logo in the same bordered squircle frame WorkCompany uses.
// Falls back to a monogram tile when no logo URL is set or it fails.
function EducationLogo({ logo, school }: { logo?: string; school: string }) {
  const [failed, setFailed] = useState(false)
  const initials = school
    .replace(/\(.*?\)/g, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase()
  return (
    <span
      className="flex-shrink-0 p-1.5"
      style={
        {
          border:
            "1px solid color-mix(in srgb, var(--text, #111111) 22%, transparent)",
          borderRadius: 16,
          cornerShape: "squircle",
        } as React.CSSProperties
      }
    >
      {logo && !failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logo}
          alt={`${school} logo`}
          onError={() => setFailed(true)}
          className="block h-8 w-8 bg-white object-contain"
          style={
            { borderRadius: 10, cornerShape: "squircle" } as React.CSSProperties
          }
          loading="lazy"
        />
      ) : (
        <span
          aria-hidden
          className="flex h-8 w-8 items-center justify-center text-xs font-semibold"
          style={{
            borderRadius: 10,
            background:
              "color-mix(in srgb, var(--text, #111111) 10%, transparent)",
          }}
        >
          {initials}
        </span>
      )}
    </span>
  )
}

function Panel({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <div
      role="tabpanel"
      aria-label={label}
      // key remounts per tab (parent passes key) → enter animation replays.
      className="vbt-panel space-y-4"
    >
      {children}
    </div>
  )
}

export function VerticalBannerTabs() {
  const { palette, isOverridden } = useThemeColorContext()
  const tabColor = (id: TabId) =>
    isOverridden ? palette.surface : TAB_COLORS[id]
  const [tab, setTab] = useState<TabId>("work")
  const [stuck, setStuck] = useState(false)
  const [preview, setPreview] = useState<Preview>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const sentinelRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)

  // Tab switch always restarts at the section top: jumping from a
  // long tab deep-scrolled into a short one would otherwise land
  // mid-page past the new content. Instant jump (no tween) so the
  // new tab is simply there.
  const go = (id: TabId) => {
    setTab(id)
    setPreview(null)
    const el = sectionRef.current
    if (!el) return
    const top = el.getBoundingClientRect().top + window.scrollY
    if (window.scrollY <= top + 4) return
    const target = Math.max(0, top)
    const l = getLenis()
    if (l) l.scrollTo(target, { immediate: true })
    else window.scrollTo({ top: target })
  }

  // Stuck-only divider: a 1px sentinel sits just above the sticky
  // header; once it scrolls out of view the header is pinned.
  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    setStuck(false)
    const io = new IntersectionObserver(
      ([entry]) => setStuck(!entry.isIntersecting),
      {
        threshold: 0,
      }
    )
    io.observe(sentinel)
    return () => io.disconnect()
  }, [tab])

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (
      e.key !== "ArrowRight" &&
      e.key !== "ArrowLeft" &&
      e.key !== "ArrowDown" &&
      e.key !== "ArrowUp"
    )
      return
    e.preventDefault()
    const ids = TABS.map((t) => t.id)
    const at = ids.indexOf(tab)
    const fwd = e.key === "ArrowRight" || e.key === "ArrowDown"
    const next = ids[(at + (fwd ? 1 : ids.length - 1)) % ids.length]
    go(next)
    tabRefs.current[ids.indexOf(next)]?.focus()
  }

  return (
    <section
      ref={sectionRef}
      data-ruler-section
      data-ruler-label="Index"
      data-ruler-type="decision"
      data-ruler-preview="Tabbed highlights"
      // Full-bleed to the viewport: maximum width, both edges flush
      // on the screen edges. 50/50 split inside. Bottom breathing room
      // kept; top padding dropped so the work panel starts right under
      // the Proof block's closing lines (the resume aside compensates
      // with an equal top margin, so its rest position never moves).
      className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 pt-0 pb-16 lg:pb-24"
    >
      <style>{`@keyframes vbt-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } .vbt-panel { animation: vbt-in 0.35s ease-out; }`}</style>
      <div className="flex flex-col gap-10 px-0 lg:flex-row lg:items-start lg:gap-12">
        {/* Dynamic preview space: mirrors the hovered entry, resume by default. */}
        <PreviewPane preview={preview} />
        {/* Merged unit: spine rail + panel touch with zero gap. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:gap-0 lg:w-1/2">
          {/* Spine rail: vertical (-90°) labels, stuck top-left, sticky. */}
          <div
            role="tablist"
            aria-label="Index categories"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="flex shrink-0 flex-row -space-x-2 overflow-x-auto md:sticky md:top-24 md:w-16 md:flex-col md:-space-y-3 md:space-x-0 md:self-start md:overflow-visible"
          >
            {TABS.map((t, i) => {
              const active = tab === t.id
              return (
                <button
                  key={t.id}
                  ref={(el) => {
                    tabRefs.current[i] = el
                  }}
                  role="tab"
                  aria-selected={active}
                  aria-controls={`vbt-panel-${t.id}`}
                  id={`vbt-tab-${t.id}`}
                  onClick={() => go(t.id)}
                  className={`flex shrink-0 flex-row items-center gap-2 rounded-none px-2 py-2.5 text-sm whitespace-nowrap transition-colors md:w-full md:flex-col md:gap-1.5 md:px-0 md:py-8 md:whitespace-normal ${
                    active ? "relative z-10 md:-mr-px" : ""
                  }`}
                  style={{
                    background: tabColor(t.id),
                    color: readableInkOn(tabColor(t.id)),
                    boxShadow: active
                      ? "inset -3px 0 0 currentColor"
                      : undefined,
                    clipPath: WEDGE,
                  }}
                >
                  {/* Uniform serif size; each spine's height stays
                    content-driven (modest fixed padding, text sets length). */}
                  <span className="font-heading text-lg font-medium md:rotate-180 md:text-3xl md:[writing-mode:vertical-rl]">
                    {t.label}
                  </span>
                </button>
              )
            })}
          </div>
          {/* Content: borderless, sharp-cornered sheet in the exact active
            tab color — bg matches the selected card 1:1. */}
          <div
            className="min-w-0 flex-1 rounded-none p-8 backdrop-blur transition-colors duration-300 md:p-14"
            style={panelVars(tab, tabColor(tab))}
            onMouseLeave={() => setPreview(null)}
          >
            <div ref={sentinelRef} aria-hidden className="h-px w-px" />
            <div
              className="sticky top-0 z-10 -mx-8 mb-8 flex flex-wrap items-end justify-between gap-2 px-8 pt-4 pb-7 md:-mx-14 md:px-14"
              style={{ background: tabColor(tab) }}
            >
              <div>
                <div className="flex items-baseline gap-2">
                  <div className="font-heading text-3xl leading-none md:text-4xl">
                    {TAB_META[tab].title}
                  </div>
                  <span className="font-heading text-lg tabular-nums md:text-xl">
                    ({TAB_COUNT[tab]})
                  </span>
                </div>
                <Text.Body size="sm" className="mt-1.5">
                  {TAB_META[tab].blurb}
                </Text.Body>
              </div>
              {/* Centered stuck divider: hairline + soft glow confined to
                the middle, never touching the panel edges. */}
              <div
                aria-hidden
                className={`pointer-events-none absolute inset-x-0 top-full [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)] transition-opacity duration-200 ${
                  stuck ? "opacity-100" : "opacity-0"
                }`}
              >
                <div className="h-px w-full bg-black/15" />
                <div className="h-1.5 w-full bg-gradient-to-b from-black/15 to-transparent blur-[3px]" />
                <div className="h-2 w-full bg-gradient-to-b from-black/10 to-transparent blur-[7px]" />
                <div className="h-3 w-full bg-gradient-to-b from-black/[0.06] to-transparent blur-[12px]" />
              </div>
            </div>
            {tab === "work" && (
              <Panel key="work" label="Work experience">
                <div className="grid divide-y divide-black/10">
                  {workExperience.map((w, wi) => (
                    <div
                      key={w.company}
                      onMouseEnter={() =>
                        setPreview({ tab: "work", index: wi })
                      }
                      className={`rounded-md py-6 transition-colors hover:bg-black/[0.04] ${wi === 0 ? "pt-0" : ""} ${wi === workExperience.length - 1 ? "pb-0" : ""}`}
                    >
                      <WorkCompany w={w} />
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === "education" && (
              <Panel key="education" label="Education">
                <div className="grid divide-y divide-black/10">
                  {education.map((e, ei) => (
                    <div
                      key={e.school}
                      onMouseEnter={() =>
                        setPreview({ tab: "education", index: ei })
                      }
                      className={`rounded-md py-4 transition-colors hover:bg-black/[0.04] ${ei === 0 ? "pt-0" : ""} ${ei === education.length - 1 ? "pb-0" : ""}`}
                    >
                      {/* Line 1: logo + institute name. Line 2: degree + period. */}
                      <div className="flex items-center gap-3">
                        <EducationLogo logo={e.logo} school={e.school} />
                        <div>
                          <Text.Body className="leading-snug font-medium">
                            {e.school}
                          </Text.Body>
                          <Text.Body size="sm" className="mt-0.5">
                            {e.degree} · {e.period} · {e.location}
                          </Text.Body>
                        </div>
                      </div>
                      <ul className="mt-2 list-inside list-disc space-y-1">
                        {e.details.map((d) => (
                          <li key={d}>
                            <Text.Body
                              as="span"
                              size="sm"
                              className="opacity-80"
                            >
                              {d}
                            </Text.Body>
                          </li>
                        ))}
                      </ul>
                      {/* Relevant coursework pills — NITK only. */}
                      {e.coursework && e.coursework.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {e.coursework.map((c) => (
                            <span
                              key={c}
                              className="rounded-full border border-black/15 px-3 py-1"
                            >
                              <Text.Caption>{c}</Text.Caption>
                            </span>
                          ))}
                        </div>
                      )}
                      {/* Course projects — NITK only. */}
                      {e.courseProjects && e.courseProjects.length > 0 && (
                        <div className="mt-4">
                          <Text.Body size="sm" className="font-medium">
                            Course projects
                          </Text.Body>
                          <div className="mt-1.5 grid gap-1.5">
                            {e.courseProjects.map((p) => (
                              <div
                                key={p.title}
                                className="flex flex-wrap items-baseline justify-between gap-2"
                              >
                                <Text.Body size="sm">{p.title}</Text.Body>
                                <Text.Caption>
                                  {p.desc}
                                </Text.Caption>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {/* Certifications subsection */}
                <div className="mt-10">
                  <Text.Subheading as="h4" size="sm" className="!text-3xl">
                    Certifications
                  </Text.Subheading>
                  <div className="mt-2 grid divide-y divide-black/10">
                    {certifications.map((c) => (
                      <div
                        key={c.title}
                        className="flex flex-wrap items-baseline justify-between gap-2 py-2"
                      >
                        <a
                          href={c.href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 underline underline-offset-4"
                        >
                          <Text.Body as="span" size="sm">
                            {c.title}
                          </Text.Body>
                          <ExternalLink size={12} aria-hidden />
                        </a>
                        <Text.Caption>
                          {c.org}
                          {c.year ? ` · ${c.year}` : ""}
                        </Text.Caption>
                      </div>
                    ))}
                  </div>
                </div>
              </Panel>
            )}

            {tab === "achievements" && (
              <Panel key="achievements" label="Achievements">
                <div className="grid divide-y divide-black/10">
                  {achievements.map((a, ai) => (
                    <div
                      key={a.title}
                      onMouseEnter={() =>
                        setPreview({ tab: "achievements", index: ai })
                      }
                      className={`rounded-md py-4 transition-colors hover:bg-black/[0.04] ${ai === 0 ? "pt-0" : ""} ${ai === achievements.length - 1 ? "pb-0" : ""}`}
                    >
                      <div className="flex flex-wrap justify-between gap-2">
                        <Text.Body className="font-medium">{a.title}</Text.Body>
                        <Text.Caption>
                          {a.org} · {a.year}
                        </Text.Caption>
                      </div>
                      <Text.Body size="sm" className="mt-1">
                        {a.description}
                      </Text.Body>
                      {/* Project links */}
                      {a.links && a.links.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                          {a.links.map((l) => (
                            <a
                              key={l.label}
                              href={l.href}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 underline underline-offset-4"
                            >
                              <Text.Body as="span" size="sm">
                                {l.label}
                              </Text.Body>
                              <ExternalLink size={12} aria-hidden />
                            </a>
                          ))}
                        </div>
                      )}
                      {/* Project images */}
                      {a.photos && a.photos.length > 0 && (
                        <div className="mt-3 grid grid-cols-3 gap-2">
                          {a.photos.map((src) => (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              key={src}
                              src={src}
                              alt={`${a.title} photo`}
                              loading="lazy"
                              className="aspect-[4/3] w-full rounded-md object-cover shadow-xl"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>
            )}

            {tab === "skills" && (
              <Panel key="skills" label="Skills">
                <div className="grid divide-y divide-black/10">
                  {skillGroups.map((g, gi) => (
                    <div
                      key={g.title}
                      onMouseEnter={() =>
                        setPreview({ tab: "skills", index: gi })
                      }
                      className={`rounded-md py-4 transition-colors hover:bg-black/[0.04] ${gi === 0 ? "pt-0" : ""} ${gi === skillGroups.length - 1 ? "pb-0" : ""}`}
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <Text.Body className="font-medium">{g.title}</Text.Body>
                        <Text.Caption>{g.blurb}</Text.Caption>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {g.skills.map((s) => (
                          <span
                            key={s}
                            className="group/skill inline-flex items-center gap-1.5 rounded-full border border-black/15 px-3 py-1"
                          >
                            {SKILL_ICONS[s] ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={`https://cdn.simpleicons.org/${SKILL_ICONS[s]}`}
                                alt=""
                                aria-hidden
                                loading="lazy"
                                draggable={false}
                                className="size-4 shrink-0 transition-transform duration-500 ease-out select-none group-hover/skill:scale-125 group-hover/skill:-rotate-6"
                              />
                            ) : (
                              <SkillMonogram skill={s} />
                            )}
                            <Text.Caption>{s}</Text.Caption>
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
