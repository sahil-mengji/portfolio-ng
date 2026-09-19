"use client"

import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { Text, CardContext } from "@/components/ui/text"
import type { WorkExp, Role } from "@/lib/dummy-data"

// Sparse dot-leader used for rails + the logo connector.
const DOTS = "radial-gradient(circle, var(--accent) 1.2px, transparent 1.6px)"
const dotStyle = {
  backgroundImage: DOTS,
  backgroundSize: "2px 10px",
  backgroundRepeat: "repeat-y",
}

// **keyword** inline renderer: marker-highlight pill. Size passthrough
// so other sections (e.g. profile bio) can reuse the same treatment.
export function Rich({
  text,
  size = "sm",
}: {
  text: string
  size?: "sm" | "default" | "lg"
}) {
  return (
    <Text.Body as="span" size={size}>
      {text.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong
            key={pi}
            className="rounded px-1 font-semibold"
            style={{
              background:
                "color-mix(in srgb, var(--accent) 24%, transparent)",
            }}
          >
            {part.slice(2, -2)}
          </strong>
        ) : (
          <span key={pi}>{part}</span>
        )
      )}
    </Text.Body>
  )
}

function RoleBody({ r }: { r: Role }) {
  const meta = [r.type, r.period, r.duration].filter(Boolean).join(" · ")
  return (
    <>
      {meta && <Text.Caption className="opacity-60">{meta}</Text.Caption>}
      <ul className="mt-2 list-inside list-disc space-y-1.5">
        {r.bullets.map((b) => (
          <li key={b} className="opacity-80">
            <Rich text={b} />
          </li>
        ))}
      </ul>
    </>
  )
}

// One company: logo + name on the left, overall tenure + expand toggle on
// the right, a dotted connector from the logo down into the timeline.
// Collapsed = plain latest role, zero timeline chrome. Expanded = full
// dot-to-dot timeline, height-animated. Colors resolve through
// --accent/--surface, so it works on plain cards and saturated sheets.
export function WorkCompany({ w }: { w: WorkExp }) {
  const [expanded, setExpanded] = useState(false)
  const [first, ...rest] = w.roles
  const firstStart = w.roles[w.roles.length - 1].period.split(" — ")[0]
  const lastBits = w.roles[0].period.split(" — ")
  const tenure =
    lastBits.length > 1 ? `${firstStart} — ${lastBits[1] || "Present"}` : firstStart
  return (
    <CardContext.Provider value={true}>
      {/* Company header: bordered frame around the logo only (border
          offset from the artwork by padding), text vertically centered */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span
            className="flex-shrink-0 p-1.5"
            style={{
              border: "1px solid color-mix(in srgb, var(--text, #111111) 22%, transparent)",
              // Squircle where supported (Chromium), smooth large radius elsewhere.
              borderRadius: 16,
              cornerShape: "squircle",
            } as React.CSSProperties}
          >
            <img
              src={w.logo}
              alt={`${w.company} logo`}
              className="block h-8 w-8 bg-white object-contain"
              style={{ borderRadius: 10, cornerShape: "squircle" } as React.CSSProperties}
              loading="lazy"
            />
          </span>
          <div>
            <Text.Body className="font-medium leading-snug">{w.company}</Text.Body>
            <Text.Body size="sm" className="mt-0.5 opacity-70">
              {w.location}
            </Text.Body>
          </div>
        </div>
        <div className="flex flex-col gap-1.5 self-start md:self-center md:items-end">
          <Text.Caption className="whitespace-nowrap opacity-60">{tenure}</Text.Caption>
          {rest.length > 0 && (
            <button
              onClick={() => setExpanded((v) => !v)}
              aria-expanded={expanded}
              className="inline-flex items-center gap-1 text-xs font-medium underline underline-offset-4"
            >
              <ChevronDown
                size={14}
                className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
              />
              {expanded
                ? "Show less"
                : `Show ${rest.length} more role${rest.length === 1 ? "" : "s"}`}
            </button>
          )}
        </div>
      </div>

      {/* Collapsed: plain latest role, no dots / rails */}
      {!expanded && (
        <div className="mt-4">
          <Text.Body className="font-medium leading-snug">{first.title}</Text.Body>
          <div className="mt-0.5">
            <RoleBody r={first} />
          </div>
        </div>
      )}

      {/* Expanded: full timeline, height-animated */}
      <div
        className={`grid transition-all duration-500 ease-in-out ${
          expanded ? "mt-4 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
      {/* Connector: logo center (x=20) down into the rail (x=20) */}
      <div aria-hidden className="ml-[19px] h-6 w-[2px]" style={dotStyle} />
      <div className="relative ml-[4px]">
            {w.roles.map((r, ri) => (
              <div
                key={r.title}
                className={`relative pl-16 ${ri === w.roles.length - 1 ? "" : "pb-8"}`}
              >
                {ri < w.roles.length - 1 && (
                  <div
                    aria-hidden
                    className="absolute left-4 top-[17px] bottom-0 w-[2px]"
                    style={dotStyle}
                  />
                )}
                {ri > 0 && (
                  <div
                    aria-hidden
                    className="absolute left-4 top-0 h-[5px] w-[2px]"
                    style={dotStyle}
                  />
                )}
                <div className="mb-0.5 flex items-center">
                  <span
                    aria-hidden
                    className="relative z-10 -ml-[54px] mr-[42px] h-3 w-3 shrink-0 rounded-full border-2"
                    style={{
                      background: ri === 0 ? "var(--accent)" : "var(--surface)",
                      borderColor: "var(--accent)",
                    }}
                  />
                  <Text.Body className="min-w-0 flex-1 truncate font-medium leading-snug">
                    {r.title}
                  </Text.Body>
                </div>
                <RoleBody r={r} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardContext.Provider>
  )
}
