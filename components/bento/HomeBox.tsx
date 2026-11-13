"use client"
import { useMemo, type CSSProperties } from "react"
import { ensureContrast, type generateColorPalette } from "@/lib/color-utils"
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
  livePalette,
  transparent = false,
}: {
  outerClassName?: string
  children: React.ReactNode
  className?: string
  boxKey?: string
  allowOverflow?: boolean
  surfaceOverride?: string
  liveSurface?: string
  livePalette?: ReturnType<typeof generateColorPalette>
  transparent?: boolean
}) {
  const { palette: universalPalette, isOverridden } = useThemeColorContext()
  const palette = useMemo(() => {
    if (livePalette) return livePalette
    if (!isOverridden && boxKey) {
      const boxPalette = getBoxPalette(boxKey)
      if (boxPalette) return boxPalette
    }
    return universalPalette
  }, [universalPalette, isOverridden, boxKey, livePalette])

  const overflow = allowOverflow ? "overflow-visible" : "overflow-hidden"
  // Per-card surface override (default mode only — themed mode always follows palette).
  // liveSurface wins in EVERY mode: the owning box paints per-frame during
  // drags instead of waiting for the debounced site commit.
  const surface =
    liveSurface ??
    (!isOverridden && surfaceOverride ? surfaceOverride : palette.surface)
  const ink = ensureContrast(palette.cardText, surface)
  const mutedInk = ensureContrast(palette.cardSecondaryText, surface)
  const accent = ensureContrast(palette.brand, surface, 3)
  const tokens = {
    background: transparent ? "transparent" : surface,
    color: ink,
    "--card": surface,
    "--card-foreground": ink,
    "--foreground": ink,
    "--text": ink,
    "--surface": surface,
    "--surface-foreground": ink,
    "--muted": surface,
    "--accent": accent,
    "--accent-foreground": ensureContrast(palette.brandForeground, accent),
    "--card-text": ink,
    "--card-muted": mutedInk,
    "--muted-foreground": mutedInk,
    "--card-heading": ensureContrast(palette.cardHeading, surface),
    "--border": ensureContrast(palette.brand, surface, 3),
    "--ring": ensureContrast(palette.cardText, surface, 3),
    "--effect-surface": palette.effectSurface,
    "--effect-text": palette.effectText,
  } as CSSProperties
  return (
    <div
      className={cn(
        "group relative h-full w-full cursor-pointer rounded-[24px] bg-card",
        overflow,
        outerClassName,
        className
      )}
      style={tokens}
    >
      {children}
    </div>
  )
}
export default HomeBox
