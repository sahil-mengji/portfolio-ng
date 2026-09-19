"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { BadgeCheck, Volume2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { TextureButton } from "@/components/ui/texture-button"
import { Rich } from "@/components/work-timeline"

// Theme-aware drafting-guideline rule (grid ink at low alpha — flips with
// luminosity like the rest of the guidelines). Hard fallback keeps rules
// visible when theme vars are unmounted in the default state.
const LINE =
  "border-[color-mix(in_srgb,var(--grid-ink,#767165)_16%,transparent)] "

// Single-direction hatch (45° only) — shared by every hatched section
// in the header. Low opacity for subtlety.
const HATCH_BG =
  "repeating-linear-gradient(45deg, color-mix(in srgb, var(--grid-ink,#767165) 14%, transparent) 0, color-mix(in srgb, var(--grid-ink,#767165) 22%, transparent) 1px, transparent 0, transparent 50%)"

const FLIP_SENTENCES = [
  "Designer — engineer",
  "Systems for color",
  "Editorial, grid-driven",
  "One picker theming",
]

function TextFlip({
  children,
  className,
  interval = 1.5,
}: {
  children: string[]
  className?: string
  interval?: number
}) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = window.setInterval(
      () => setI((v) => (v + 1) % children.length),
      interval * 1000
    )
    return () => window.clearInterval(id)
  }, [children.length, interval])
  return (
    <span className={cn("relative block overflow-hidden", className)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={i}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: -1, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="block"
        >
          {children[i]}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function PronounceMyName() {
  const speak = () => {
    try {
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(new SpeechSynthesisUtterance("Sahil Mengji"))
    } catch {}
  }
  return (
    <button
      onClick={speak}
      aria-label="Pronounce my name"
      title="Pronounce my name"
      className="grid size-6 place-items-center rounded-full opacity-60 transition-opacity hover:opacity-100"
    >
      <Volume2 size={14} />
    </button>
  )
}

// Golden-ratio drafting overlay: the φ spiral itself (squares removed),
// plus whole diagonals. Each quarter-arc verified tangent-continuous
// (all sweeps = 1), corner-centered, endpoints on shared square edges.
const GOLDEN_SPIRAL =
  "M0,233 A233 233 0 0 1 233,0 " +
  "M233,0 A144 144 0 0 1 377,144 " +
  "M377,144 A89 89 0 0 1 288,233 " +
  "M288,233 A55 55 0 0 1 233,178 " +
  "M233,178 A34 34 0 0 1 267,144 " +
  "M267,144 A21 21 0 0 1 288,165"
// Anchor-point markers on every arc joint (vector-editor handles).
const GOLDEN_JOINTS = [
  [0, 233],
  [233, 0],
  [377, 144],
  [288, 233],
  [233, 178],
  [267, 144],
  [288, 165],
]
function GoldenGuides({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 377 233"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden
      className={className}
    >
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth={1}
        vectorEffect="non-scaling-stroke"
      >
        <path d={GOLDEN_SPIRAL} strokeWidth={1.5} />
        {GOLDEN_JOINTS.map(([cx, cy], i) => (
          <rect
            key={i}
            x={cx - 3.5}
            y={cy - 3.5}
            width={7}
            height={7}
            fill="currentColor"
            stroke="none"
          />
        ))}
      </g>
    </svg>
  )
}

// ProfileHeader — full-bleed drafting sheet: outer rules + hatch run wall
// to wall, inner content follows max-w-6xl with its own rules. Avatar
// cell, type-specimen line, verified name + pronunciation, flip line.
export function ProfileHeader() {
  const router = useRouter()
  return (
    <div
      className={cn("relative border-x border-b", LINE)}
      // --figH: spiral figure height, derived from the pin-to-viewport
      // distance. Min height = the spiral's visual bottom (123.6%),
      // so the sheet scales until its bottom rule lands exactly on the
      // figure's bottom edge.
      style={
        {
          "--figH": "max(56px, calc(max(0px, (100vw - 80rem)/2) * 1.41))",
          minHeight: "calc(var(--figH) * 1.236)",
        } as React.CSSProperties
      }
    >
      {/* Golden spiral, rotated -90°: spans from the screen edge to the
          pinned tail-tip anchor (288,165). Inner svg spins about its
          own center; wrapper translates pin the rotated tip exactly. */}
      <div className="pointer-events-none absolute top-0 left-[max(0px,calc((100vw_-_80rem)/2))] z-0 h-[var(--figH)] -translate-x-[62.9%] -translate-y-[7.3%]">
        <GoldenGuides className="h-full w-auto -rotate-90 opacity-10" />
      </div>
      {/* Full-width border lines through every anchor height. The seven
          joints collapse to five distinct rotated heights (fractions of
          figure height, sheet-relative): visual top, sheet top, two
          inner joints, visual bottom. */}
      {[1.236, 0.236, 0, 0.09, -0.382].map((f) => (
        <div
          key={f}
          aria-hidden
          className="pointer-events-none absolute inset-x-0 z-0"
          style={{
            top: `calc(var(--figH) * ${f})`,
            borderTop:
              "1px solid color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
      ))}
      {/* Content measure matches the bento grid (max-w-7xl). Flex
          column + inherited min-height so the row below fills the
          sheet — avatar bottom lands on the sheet bottom (= the
          bottom-most anchor height). */}
      <div
        className={cn("mx-auto flex max-w-7xl flex-col border-x", LINE)}
        style={{ minHeight: "inherit" }}
      >
        {/* Availability strip: very top, ruled top and bottom */}
        {/* <div className={cn("border-b", LINE)}>
          <div className="flex items-center gap-2 px-4 py-2">
            <span className="relative flex size-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-500" />
            </span>
            <span className="inline-flex rounded-full border px-3 py-1 font-mono text-[11px]">
              Available for new work · 2026
            </span>
          </div>
        </div> */}
        <div className="[container-type:inline-size] flex flex-1 items-stretch gap-0">
          <div
            className="flex min-w-0 flex-1 flex-col"
            style={{
              paddingTop: "calc(var(--figH) * 0.236)",
              paddingBottom: "0",
              // flex: 1,
            }}
          >
            {/* <div className="flex grow items-end pb-1 pl-4">
              <div
                className="line-clamp-1 font-mono text-xs text-foreground opacity-40 select-none max-sm:hidden"
                aria-hidden
              >
                {"text-5xl "}
                <span>font-heading</span>
                {" font-semibold"}
              </div>
            </div> */}

            <div className={cn("flex flex-1 flex-col border-t", LINE)}>
              <div className="relative flex items-stretch gap-2 pl-4">
                <h1 className="relative z-10 -translate-y-px font-heading text-5xl font-semibold tracking-tight md:text-7xl">
                  Sahil Mengji
                </h1>
                {/* <BadgeCheck
                  size={22}
                  className="select-none"
                  style={{ color: "var(--accent)" }}
                  aria-label="Verified"
                /> */}
                <PronounceMyName />
                <div
                  aria-hidden
                  className="ml-2 flex-1 self-stretch border-l"
                  style={{
                    backgroundImage: HATCH_BG,
                    backgroundSize: "10px 10px",
                  }}
                />
              </div>

              <div
                className={cn("flex items-stretch gap-3 border-t pl-4", LINE)}
              >
                <TextFlip
                  className="shrink-0 font-mono text-lg text-balance text-foreground opacity-55"
                  interval={1.5}
                >
                  {FLIP_SENTENCES}
                </TextFlip>
                {/* Hatched section filling rightwards beside the flip line */}
                <div
                  aria-hidden
                  className={cn("flex-1 border-x border-b border-l", LINE)}
                  style={{
                    backgroundImage: HATCH_BG,
                    backgroundSize: "10px 10px",
                  }}
                />
              </div>

              {/* Bio + buttons beside an in-flow hatched gutter that
                  spans both grid rows — always visible, zero JS. */}
              <div
                className="grid"
                style={{
                  gridTemplateColumns:
                    "calc(var(--figH) * 0.291) minmax(0, 1fr)",
                  flex: 1,

                  // gridTemplateRows: "h-full",
                }}
              >
                <div
                  aria-hidden
                  className="row-span-2 flex-1 border-t border-r"
                  style={{
                    backgroundImage: HATCH_BG,
                    backgroundSize: "10px 10px",
                  }}
                />
                <div>
                  {" "}
                  <div
                    className={cn(
                      "space-y-2 border-t border-r border-b border-l py-2.5 pl-4",
                      LINE
                    )}
                  >
                    <p className="max-w-xl font-mono text-base text-balance text-foreground opacity-80">
                      <Rich
                        size="default"
                        text="Designer–engineer building **editorial, grid-driven portfolios** where **one color** drives everything."
                      />
                    </p>
                    <p className="max-w-xl font-mono text-base text-balance text-foreground opacity-80">
                      <Rich
                        size="default"
                        text="I care about **grids with intent**, **type with a voice**, and interfaces that feel **drafted, not decorated**."
                      />
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex flex-wrap gap-3 self-end border-r border-l pl-4",
                      LINE
                    )}
                  >
                    <TextureButton
                      variant="primary"
                      size="default"
                      className="w-auto"
                      onClick={() => router.push("/projects")}
                    >
                      View projects
                    </TextureButton>
                    <TextureButton
                      variant="secondary"
                      size="default"
                      className="w-auto"
                      onClick={() => router.push("/blogs")}
                    >
                      Read blogs
                    </TextureButton>

                    <div
                      aria-hidden
                      className={cn("flex-1 border-x border-b border-l", LINE)}
                      style={{
                        backgroundImage: HATCH_BG,
                        height: "100%",
                        backgroundSize: "10px 10px",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Avatar: right side — guaranteed square, scaling with
              viewport height past any max. Fills its cell exactly. */}
          <div
            className={cn(
              "flex shrink-0 items-end justify-center self-stretch border-l",
              LINE
            )}
          >
            <div className="box-border aspect-square w-[calc(var(--figH)*0.9)] p-2">
              <Image
                className="h-full w-full rounded-full object-cover ring-1 ring-border ring-offset-2 ring-offset-background select-none"
                alt="Sahil Mengji"
                src="/profile.jpg"
                width={600}
                height={600}
                priority
                unoptimized
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
