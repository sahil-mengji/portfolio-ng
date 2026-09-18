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

// **bold** inline renderer for bullets.
function Rich({ text }: { text: string }) {
  return (
    <Text.Body as="span" size="sm">
      {text.split(/(\*\*[^*]+\*\*)/).map((part, pi) =>
        part.startsWith("**") && part.endsWith("**") ? (
          <strong key={pi} className="font-semibold">
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
  return (
    <>
      <Text.Caption className="opacity-60">{r.period}</Text.Caption>
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
  const tenure = `${w.roles[0].period.split(" — ")[0]} — ${w.roles[w.roles.length - 1].period.split(" — ")[1] || "Present"}`
  return (
    <CardContext.Provider value={true}>
      {/* Company header: bordered container with padding, logo + text
          vertically centered inside */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3 rounded-xl border border-black/10 p-3">
          <img
            src={w.logo}
            alt={`${w.company} logo`}
            className="block h-11 w-11 flex-shrink-0 rounded-md object-contain"
            loading="lazy"
          />
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
      {/* Connector: logo center (x=35) down into the rail (x=35) */}
      <div aria-hidden className="ml-[34px] h-6 w-[2px]" style={dotStyle} />
      <div className="relative ml-[19px]">
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
