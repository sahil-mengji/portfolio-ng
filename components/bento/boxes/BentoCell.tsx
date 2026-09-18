"use client"
import { useMemo } from "react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"
import { hexToOklch, oklchToHex } from "@/lib/color-utils"

function channelToLinear(v: number) {
  const n = v / 255
  return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
}

function luminance(hex: string) {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex) ?? [
    "",
    "00",
    "00",
    "00",
  ]
  const [r, g, b] = [m[1], m[2], m[3]].map((x) => parseInt(x, 16))
  return (
    0.2126 * channelToLinear(r) +
    0.7152 * channelToLinear(g) +
    0.0722 * channelToLinear(b)
  )
}

function contrastRatio(a: string, b: string) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/**
 * BentoCell — empty cell template: top-left heading in Instrument Serif,
 * nothing inside (for now). Keeps boxKey (palette) + area (grid span).
 * Heading is a lighter/darker version of the card color — never black/white —
 * with OKLCH lightness walked until it reaches 3:1 contrast (large-text AA).
 */
export function BentoCell({
  boxKey,
  area,
  title,
}: {
  boxKey: string
  area: string
  title: string
}) {
  const { palette: universal, isOverridden } = useThemeColorContext()
  const headingColor = useMemo(() => {
    const box = getBoxPalette(boxKey)
    const p = isOverridden ? universal : (box ?? universal)
    const surface = isOverridden
      ? universal.surface
      : (box?.surface ?? universal.surface)
    const { l, c } = hexToOklch(surface)
    const lightCard = l > 0.6 || (c > 0.15 && l > 0.52)
    // Start from the hue-rich token, then walk OKLCH lightness until the
    // heading clears 3:1 contrast against the surface actually shown.
    let fg = hexToOklch(lightCard ? p.brand : p.secondary)
    for (let i = 0; i < 16; i++) {
      const hex = oklchToHex(fg.l, fg.c, fg.h)
      if (contrastRatio(hex, surface) >= 3) return hex
      fg = { ...fg, l: lightCard ? fg.l - 0.04 : fg.l + 0.04 }
      if (fg.l <= 0.05 || fg.l >= 0.97) break
    }
    return oklchToHex(fg.l, fg.c, fg.h)
  }, [boxKey, universal, isOverridden])

  return (
    <HomeBox
      boxKey={boxKey}
      outerClassName={`${area} h-full w-full`}
      className="flex flex-col p-5"
    >
      <h3
        className="text-2xl font-normal"
        style={{ fontFamily: "var(--font-heading)", color: headingColor }}
      >
        {title}
      </h3>
    </HomeBox>
  )
}
export default BentoCell
