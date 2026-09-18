import { generateColorPalette } from "@/lib/color-utils"

export const BOX_BASE_COLORS: Record<string, string> = {
  github: "#FFFFFF",
  social: "#1DA1F2",
  resume: "#9f385c",
  like: "#ec4899",
  skills: "#10b981",
  showcase: "#901616",
  library: "#0ea5e9",
  quotes: "#f97316",
  experiments: "#eab308",
  nft: "#f0bcfb",
  id: "#06b6d4",
  lightboard: "#22c55e",
  projects: "#F6693E",
  theme: "#FFFFFF",
  colorpicker: "#333333",
  stats: "#6366f1",
  extra: "#ffd66c",
  notch: "#72b6f7",
  map: "#84cc16",
  gallery: "#e3ff99",
  list: "#facc15",
  banner: "#c084fc",
}

const cache = new Map<string, ReturnType<typeof generateColorPalette>>()

export function getBoxPalette(boxKey: string) {
  if (!BOX_BASE_COLORS[boxKey]) return null
  if (!cache.has(boxKey)) cache.set(boxKey, generateColorPalette(BOX_BASE_COLORS[boxKey]))
  return cache.get(boxKey)!
}
