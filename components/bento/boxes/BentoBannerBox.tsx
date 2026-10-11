"use client"
import { useEffect, useMemo, useState } from "react"
import { HomeBox } from "@/components/bento/HomeBox"
import { LightBoard } from "@/components/ui/lightboard"
import { useSplitFlapText } from "@/components/ui/use-split-flap-text"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"

type Mode =
  | { kind: "stats"; lines: string[] }
  | { kind: "glide"; text: string; updateInterval: number }
  | { kind: "flip"; text: string }

const STATS = [
  "10+  CLIENTS",
  "20+  PROJECTS",
  "05+  YEARS",
  "03+  TEAMS",
]

const GLIDE_A = "H.e.l . l . o  ..."
const GLIDE_B = "W . o . r . l . d ..."
const GLIDE_C = "D . r . a . f . t . e . d  ..."
const GLIDE_D = "S . h . i . p . p . e . d  ..."

const FLIP_A = ["HELLO", "GRIDS", "COLOR", "TYPE"]
const FLIP_B = ["DRAFTED", "SHIPPED", "PIXELS", "WIRED"]

const MODES: Mode[] = [
  { kind: "stats", lines: STATS },
  { kind: "glide", text: GLIDE_A, updateInterval: 400 },
  { kind: "flip", text: "" },
  { kind: "glide", text: GLIDE_B, updateInterval: 700 },
  { kind: "flip", text: "" },
  { kind: "glide", text: GLIDE_C, updateInterval: 500 },
  { kind: "flip", text: "" },
  { kind: "glide", text: GLIDE_D, updateInterval: 600 },
]

const MODE_DURATION = 4200

const BOARD_PROPS = {
  lightSize: 5,
  gap: 2,
  font: "default",
  rows: 7,
} as const

export function BentoBannerBox() {
  const flipA = useSplitFlapText(FLIP_A, { holdMs: 2400 })
  const flipB = useSplitFlapText(FLIP_B, { holdMs: 3400, charDelayMs: 52 })
  const { palette: universalPalette, isOverridden } = useThemeColorContext()
  const palette = useMemo(() => {
    if (!isOverridden) {
      const boxPalette = getBoxPalette("banner")
      if (boxPalette) return boxPalette
    }
    return universalPalette
  }, [universalPalette, isOverridden])
  const boardColors = useMemo(
    () => ({
      background: palette.surface,
      textDim: palette.cardText,
      textBright: palette.surface,
      drawLine: palette.surface,
    }),
    [palette]
  )

  const [modeIndex, setModeIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const id = window.setInterval(
      () => setModeIndex((m) => (m + 1) % MODES.length),
      MODE_DURATION
    )
    return () => window.clearInterval(id)
  }, [])

  const mode = MODES[modeIndex]
  const flipText = modeIndex === 2 ? flipA : modeIndex === 4 ? flipB : ""

  if (!mounted) {
    return (
      <HomeBox
        boxKey="banner"
        outerClassName="bento-banner h-full w-full"
        className="h-full w-full"
      >
        <div className="h-full w-full" />
      </HomeBox>
    )
  }

  const commonProps = {
    ...BOARD_PROPS,
    colors: boardColors,
    marquee: mode.kind === "glide",
    updateInterval: mode.kind === "glide" ? mode.updateInterval : 400,
  }

  return (
    <HomeBox
      boxKey="banner"
      outerClassName="bento-banner h-full w-full"
      className="h-full w-full"
    >
      <div className="flex h-full w-full flex-col justify-stretch gap-0 overflow-hidden rounded-3xl p-4">
        <div className="min-w-0 flex-1">
          <LightBoard {...commonProps} text={mode.kind === "stats" ? mode.lines.join("    ") : mode.kind === "glide" ? mode.text : flipText} />
        </div>
        <div className="min-w-0 flex-1">
          <LightBoard {...commonProps} text={mode.kind === "stats" ? mode.lines.join("    ") : mode.kind === "glide" ? mode.text : flipText} />
        </div>
        <div className="min-w-0 flex-1">
          <LightBoard {...commonProps} text={mode.kind === "stats" ? mode.lines.join("    ") : mode.kind === "glide" ? mode.text : flipText} />
        </div>
        <div className="min-w-0 flex-1">
          <LightBoard {...commonProps} text={mode.kind === "stats" ? mode.lines.join("    ") : mode.kind === "glide" ? mode.text : flipText} />
        </div>
      </div>
    </HomeBox>
  )
}
export default BentoBannerBox