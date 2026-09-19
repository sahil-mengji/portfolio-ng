"use client"

import { useLayoutEffect, useRef, useState } from "react"
import { cn } from "@/lib/utils"

// Grid-ink rule classes with a hard fallback: theme vars are unmounted in
// the default state, and Tailwind needs fully literal class strings
// (no runtime interpolation) to generate the utilities.
const RULE_BORDER =
  "border-[color-mix(in_srgb,var(--grid-ink,#767165)_16%,transparent)]"
const HATCH_BG =
  "bg-[repeating-linear-gradient(315deg,color-mix(in_srgb,var(--grid-ink,#767165)_32%,transparent)_0,color-mix(in_srgb,var(--grid-ink,#767165)_32%,transparent)_1px,transparent_0,transparent_50%)]"

// SectionSeparator — p4-style drafting divider: h-8 diagonal-pattern band
// ruled on both sides, everything derived from grid ink so it flips
// with the luminosity theming. Contained (not full-bleed) so the bento
// notch's overflow-visible cell is never clipped.
export function SectionSeparator({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        // Full-bleed: breaks out of the max-w container to span the
        // viewport, matching the hero sheet. Overflow-clipped so the
        // 100vw span never creates a scrollbar.
        "relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip",
        "flex h-8 w-screen border-x",
        RULE_BORDER,
        HATCH_BG,
        "bg-[size:10px_10px]",
        className
      )}
    />
  )
}

// Thin ruled spacer for tight section joints.
export function RuleSpacer({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cn(
        "flex h-2 w-full border-x",
        RULE_BORDER,
        className
      )}
    />
  )
}

// BentoFrame — flush stack whose hatch bands measure the actual grid
// width at runtime (auto-fit tracks center with leftover gutters, so
// static widths can never align). Bands stay exactly grid-wide: zero
// gap on all four sides, at any viewport.
export function BentoFrame({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState<number | null>(null)
  useLayoutEffect(() => {
    const el = ref.current?.querySelector(".bento-grid") as HTMLElement | null
    if (!el) return
    const measure = () => setW(Math.round(el.getBoundingClientRect().width))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  const band = (pos: string) => (
    <div key={pos} style={{ width: w ?? "100%", marginInline: "auto" }}>
      <SectionSeparator className="left-auto w-full max-w-full translate-x-0" />
    </div>
  )
  return (
    <div>
      {band("top")}
      <div ref={ref}>{children}</div>
      {band("bottom")}
    </div>
  )
}
