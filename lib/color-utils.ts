import { useCallback, useState } from "react"

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!m) return { r: 0, g: 0, b: 0 }
  return { r: parseInt(m[1], 16), g: parseInt(m[2], 16), b: parseInt(m[3], 16) }
}
function rgbToHex(r: number, g: number, b: number): string {
  return "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
}
export function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const { r, g, b } = hexToRgb(hex)
  const rf = r / 255, gf = g / 255, bf = b / 255
  const max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf)
  let h = 0, s = 0
  const l = (max + min) / 2
  if (max !== min) {
    const d = max - min
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
    switch (max) {
      case rf: h = (gf - bf) / d + (gf < bf ? 6 : 0); break
      case gf: h = (bf - rf) / d + 2; break
      case bf: h = (rf - gf) / d + 4; break
    }
    h *= 60
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) }
}
export function hslToHex(h: number, s: number, l: number): string {
  h /= 360; s /= 100; l /= 100
  let r, g, b
  if (s === 0) r = g = b = l
  else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1
      if (t < 1 / 6) return p + (q - p) * 6 * t
      if (t < 1 / 2) return q
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6
      return p
    }
    r = hue2rgb(p, q, h + 1 / 3); g = hue2rgb(p, q, h); b = hue2rgb(p, q, h - 1 / 3)
  }
  return rgbToHex(Math.round(r * 255), Math.round(g * 255), Math.round(b * 255))
}
function srgbToLinear(c: number) { return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
function linearToSrgb(c: number) { return c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055 }
export function hexToOklch(hex: string): { l: number; c: number; h: number } {
  const { r, g, b } = hexToRgb(hex)
  const rl = srgbToLinear(r / 255), gl = srgbToLinear(g / 255), bl = srgbToLinear(b / 255)
  const ll = 0.4122214708 * rl + 0.5363325363 * gl + 0.0514459929 * bl
  const mm = 0.2119034982 * rl + 0.6806995451 * gl + 0.1073969566 * bl
  const ss = 0.0883024619 * rl + 0.2817188376 * gl + 0.6299787005 * bl
  const l_ = Math.cbrt(ll), m_ = Math.cbrt(mm), s_ = Math.cbrt(ss)
  const L = 0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_
  const a = 1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_
  const bb = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_
  const C = Math.sqrt(a * a + bb * bb)
  let h = (Math.atan2(bb, a) * 180) / Math.PI
  if (h < 0) h += 360
  if (C < 0.0001) h = 0
  return { l: L, c: C, h }
}
export function oklchToHex(l: number, c: number, h: number): string {
  const hr = (h * Math.PI) / 180, a = c * Math.cos(hr), b = c * Math.sin(hr)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m = l - 0.1055613458 * a - 0.0638541728 * b
  const s = l - 0.0894841775 * a - 1.291485548 * b
  const l3 = l_ * l_ * l_, m3 = m * m * m, s3 = s * s * s
  let rl = 4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  let gl = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  let bl = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3
  rl = Math.max(0, Math.min(1, rl)); gl = Math.max(0, Math.min(1, gl)); bl = Math.max(0, Math.min(1, bl))
  return rgbToHex(Math.round(linearToSrgb(rl) * 255), Math.round(linearToSrgb(gl) * 255), Math.round(linearToSrgb(bl) * 255))
}
function getLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex)
  const [rs, gs, bs] = [r, g, b].map((v) => {
    const n = v / 255
    return n <= 0.03928 ? n / 12.92 : Math.pow((n + 0.055) / 1.055, 2.4)
  })
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs
}
export function getGridColors(baseColor: string): { bg: string; ink: string } {
  const oklch = hexToOklch(baseColor)
  const isLight = oklch.l > 0.68 || (oklch.c > 0.16 && oklch.l > 0.55) || getLuminance(baseColor) > 0.52
  if (!isLight) return { bg: baseColor, ink: "#FFFFFF" }
  const tL = Math.max(0.24, oklch.l - 0.42), tC = Math.max(0.02, oklch.c * 0.55)
  let ink = oklchToHex(tL, tC, oklch.h)
  if (Math.abs(hexToHsl(ink).l - hexToHsl(baseColor).l) < 38) ink = oklchToHex(Math.max(0.18, tL - 0.08), tC, oklch.h)
  return { bg: baseColor, ink }
}

// Single automated token generator — OKLCH only
export function generateColorPalette(baseColor: string) {
  const oklch = hexToOklch(baseColor)
  const isLight = oklch.l > 0.68 || (oklch.c > 0.15 && oklch.l > 0.52)
  const isAchromatic = oklch.c < 0.04

  const primary = baseColor
  const { ink: gridInk, bg: gridBg } = getGridColors(baseColor)
  const gridOklch = hexToOklch(gridInk)

  // surface: high luminous → just slightly less luminous than primary, same hue/saturation; low → slightly lighter same hue/saturation
  let surface: string, base: string
  if (isLight) {
    const sL = Math.max(0.45, oklch.l - 0.09)
    const sC = isAchromatic ? 0 : oklch.c
    surface = oklchToHex(sL, sC, oklch.h)
    base = oklchToHex(Math.min(0.96, sL + 0.05), sC, oklch.h)
  } else {
    const sC = isAchromatic ? 0 : oklch.c
    surface = oklchToHex(Math.min(0.45, oklch.l + 0.14), sC, oklch.h)
    base = oklchToHex(Math.min(0.38, oklch.l + 0.07), sC, oklch.h)
  }

  const brand = oklchToHex(Math.max(0.12, oklch.l - 0.08), Math.min(0.28, oklch.c * 1.05), oklch.h)
  const secondary = oklchToHex(Math.min(0.96, oklch.l + 0.08), Math.max(0, oklch.c * 0.85), oklch.h)

  // text – OKLCH only, hue-rich
  const tC = isAchromatic ? 0 : Math.min(0.05, oklch.c * 0.55)
  const sC = isAchromatic ? 0 : Math.min(0.04, oklch.c * 0.38)
  const text = oklchToHex(isLight ? 0.22 : 0.96, tC, oklch.h)
  const secondaryText = oklchToHex(isLight ? 0.52 : 0.78, sC, oklch.h)

  // card text auto-contrasts surface
  const sOklch = hexToOklch(surface)
  const isCardLight = sOklch.l > 0.6
  const cardText = oklchToHex(isCardLight ? 0.22 : 0.96, tC, oklch.h)
  const cardSecondaryText = oklchToHex(isCardLight ? 0.52 : 0.78, sC, oklch.h)

  return {
    primary, primaryForeground: isLight ? "#000000" : "#FFFFFF",
    secondary, secondaryForeground: isLight ? "#000000" : "#FFFFFF",
    brand, brandForeground: isLight ? "#000000" : "#FFFFFF",
    base, baseForeground: text, surface, surfaceForeground: text,
    text, secondaryText,
    cardText, cardSecondaryText, cardHeading: cardText,
    gridBg, gridInk,
  }
}

export function useThemeColor() {
  const [color, setColor] = useState<string>("#E5E55A")
  const [palette, setPalette] = useState(() => generateColorPalette("#E5E55A"))
  const updatePalette = useCallback((c: string) => { setColor(c); setPalette(generateColorPalette(c)) }, [])
  return { color, palette, updatePalette }
}
