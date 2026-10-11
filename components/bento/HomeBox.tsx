"use client"
import { useMemo } from "react"
import { cn } from "@/lib/utils"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"

export function HomeBox({
  outerClassName = "",
  children,
  className = "",
  boxKey,
  allowOverflow = false,
  surfaceOverride,
  liveSurface,
  transparent = false,
}: {
  outerClassName?: string
  children: React.ReactNode
  className?: string
  boxKey?: string
  allowOverflow?: boolean
  surfaceOverride?: string
  liveSurface?: string
  transparent?: boolean
}) {
  const { palette: universalPalette, isOverridden } = useThemeColorContext()
  const palette = useMemo(() => {
    if (!isOverridden && boxKey) {
      const boxPalette = getBoxPalette(boxKey)
      if (boxPalette) return boxPalette
    }
    return universalPalette
  }, [universalPalette, isOverridden, boxKey])

  const overflow = allowOverflow ? "overflow-visible" : "overflow-hidden"
  // Per-card surface override (default mode only — themed mode always follows palette).
  // liveSurface wins in EVERY mode: the owning box paints per-frame during
  // drags instead of waiting for the debounced site commit.
  const useLive = liveSurface != null
  const surface = liveSurface ?? (!isOverridden && surfaceOverride ? surfaceOverride : palette.surface)
  // Single-layer card: no nested inner content divs — `className` (padding /
  // layout) applies directly on the card surface so children sit straight
  // on the card. The subtle bottom shade is an absolute overlay, not a wrapper.
  return (
    <div
      className={cn(
        "group relative h-full w-full cursor-pointer rounded-[24px] bg-card",
        overflow,
        outerClassName,
        className
      )}
      style={
        transparent
          ? !useLive && (isOverridden || !boxKey)
            ? ({ background: "transparent" } as any)
            : ({
                background: "transparent",
                color: palette.cardText,
                ["--card" as any]: surface,
                ["--card-foreground" as any]: palette.cardText,
                ["--card-text" as any]: palette.cardText,
                ["--card-muted" as any]: palette.cardSecondaryText,
              } as any)
          : !useLive && (isOverridden || !boxKey)
            ? ({ background: `color-mix(in oklab, var(--card) 92%, transparent)` } as any)
            : ({
                background: `color-mix(in oklab, ${surface} 92%, transparent)`,
                color: palette.cardText,
                ["--card" as any]: surface,
                ["--card-foreground" as any]: palette.cardText,
                ["--card-text" as any]: palette.cardText,
                ["--card-muted" as any]: palette.cardSecondaryText,
              } as any)
      }
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit] bg-gradient-to-b from-transparent to-black/5 dark:to-white/5"
      />
      {children}
    </div>
  )
}
export default HomeBox
