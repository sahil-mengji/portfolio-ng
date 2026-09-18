"use client"

import { useRef, useState } from "react"
import { Text } from "@/components/ui/text"
import { workExperience, education, achievements } from "@/lib/dummy-data"
import { WorkCompany } from "@/components/work-timeline"

// Signature color per tab + readable ink on it. The active spine wears
// its full color; the panel wears the same hue as a surface tint (full
// strength would kill theme-text legibility — Text pins var(--text)).
const TAB_COLORS = {
  work: "#A0355C",
  education: "#E4FF9A",
  achievements: "#94B7E3",
} as const
const TAB_INK: Record<keyof typeof TAB_COLORS, string> = {
  work: "#FFFFFF",
  education: "#1A1A1A",
  achievements: "#14202E",
}
const WEDGE = "polygon(0 13%, 100% 0, 100% 100%, 0 87%)"
// Exact sheet color = the selected tab's color. Text pins var(--text) /
// related tokens explicitly, so the panel retargets them to the tab's
// readable ink — full-strength bg, still legible in every site theme.
// --accent/--surface are retargeted too so timeline rails, dots and tags
// stay visible on the saturated sheet instead of clashing with it.
const panelVars = (tab: keyof typeof TAB_COLORS) => {
  const ink = TAB_INK[tab]
  const dim = `color-mix(in srgb, ${ink} 72%, transparent)`
  return {
    background: TAB_COLORS[tab],
    color: ink,
    ["--text" as any]: ink,
    ["--card-text" as any]: ink,
    ["--card-muted" as any]: dim,
    ["--muted-foreground" as any]: dim,
    ["--accent" as any]: ink,
    ["--surface" as any]: TAB_COLORS[tab],
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
] as const

const TAB_META = {
  work: { title: "Work", blurb: "Roles, teams, and what shipped." },
  education: { title: "Education", blurb: "Degrees, programs, and training." },
  achievements: { title: "Achievements", blurb: "Awards, recognition, and milestones." },
} as const

type TabId = (typeof TABS)[number]["id"]

function Panel({ children, label }: { children: React.ReactNode; label: string }) {
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
  const [tab, setTab] = useState<TabId>("work")
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])

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
    setTab(next)
    tabRefs.current[ids.indexOf(next)]?.focus()
  }

  return (
    <section
      data-ruler-section
      data-ruler-label="Index"
      data-ruler-type="decision"
      data-ruler-preview="Tabbed highlights"
      // Right-anchored: right edge bleeds to the viewport edge, width
      // taken leftward up to 72rem.
      className="md:mr-[min(0px,calc((80rem_-_100vw)/2))] md:ml-auto md:w-[min(72rem,100%)]"
    >
      <style>{`@keyframes vbt-in { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } } .vbt-panel { animation: vbt-in 0.35s ease-out; }`}</style>
      <div className="flex flex-col gap-4 md:flex-row md:items-stretch">
        {/* Merged unit: spine rail + panel touch with zero gap. */}
        <div className="flex min-w-0 flex-1 flex-col gap-2 md:flex-row md:gap-0">
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
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 flex-row items-center gap-2 rounded-none px-2 py-2.5 text-sm whitespace-nowrap transition-colors md:w-full md:flex-col md:gap-1.5 md:px-0 md:py-8 md:whitespace-normal ${
                  active ? "relative z-10 md:-mr-px" : ""
                }`}
                style={{
                  background: TAB_COLORS[t.id],
                  color: TAB_INK[t.id],
                  clipPath: WEDGE,
                }}
              >
                {/* Uniform serif size; each spine's height stays
                    content-driven (modest fixed padding, text sets length). */}
                <span className="font-heading text-lg font-medium md:[writing-mode:vertical-rl] md:rotate-180 md:text-3xl">
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
          style={panelVars(tab)}
        >
          <div className="mb-8 flex flex-wrap items-end justify-between gap-2">
            <div>
              <div className="font-heading text-3xl leading-none md:text-4xl">
                {TAB_META[tab].title}
              </div>
              <Text.Body size="sm" className="mt-1.5 opacity-75">
                {TAB_META[tab].blurb}
              </Text.Body>
            </div>
          </div>
          {tab === "work" && (
            <Panel key="work" label="Work experience">
              <div className="grid divide-y divide-black/10">
                {workExperience.map((w, wi) => (
                  <div key={w.company} className={`py-6 ${wi === 0 ? "pt-0" : ""} ${wi === workExperience.length - 1 ? "pb-0" : ""}`}>
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
                    className={`py-4 ${ei === 0 ? "pt-0" : ""} ${ei === education.length - 1 ? "pb-0" : ""}`}
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <Text.Body className="font-medium">
                        {e.degree} · {e.school}
                      </Text.Body>
                      <Text.Caption>
                        {e.period} · {e.location}
                      </Text.Caption>
                    </div>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                      {e.details.map((d) => (
                        <li key={d}>
                          <Text.Body as="span" size="sm" className="opacity-80">
                            {d}
                          </Text.Body>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Panel>
          )}

          {tab === "achievements" && (
            <Panel key="achievements" label="Achievements">
              <div className="grid divide-y divide-black/10">
                {achievements.map((a, ai) => (
                  <div
                    key={a.title}
                    className={`py-4 ${ai === 0 ? "pt-0" : ""} ${ai === achievements.length - 1 ? "pb-0" : ""}`}
                  >
                    <div className="flex flex-wrap justify-between gap-2">
                      <Text.Body className="font-medium">{a.title}</Text.Body>
                      <Text.Caption>
                        {a.org} · {a.year}
                      </Text.Caption>
                    </div>
                    <Text.Body size="sm" className="mt-1 opacity-80">
                      {a.description}
                    </Text.Body>
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
