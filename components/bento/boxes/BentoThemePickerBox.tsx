"use client"
import * as React from "react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"

const PRESETS = ["#E5E55A", "#00332A", "#0A1A2F", "#7FD1E0", "#FF3F0A", "#CA6395", "#30F8AB", "#002F9E", "#3D0000", "#111111", "#FFFFFF"]

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function BentoThemePickerBox() {
  const { color, palette, updatePalette, commitPalette, flushPalette, resetPalette, isOverridden } = useThemeColorContext()
  const boxRef = React.useRef<HTMLDivElement>(null)
  return (
    <div ref={boxRef} className="h-full w-full">
    <HomeBox boxKey="theme" outerClassName="bento-theme h-full w-full" className="flex flex-col justify-between p-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono tracking-widest text-muted-foreground">THEME — PICKER</span>
        <span className="rounded-full border px-2 py-0.5 text-xs font-mono" style={{ borderColor: hexToRgba(palette.brand, 0.2) }}>
          {isOverridden ? "Universal" : "System + Box"}
        </span>
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl border-2" style={{ background: color, borderColor: hexToRgba(palette.text, 0.12) }} />
          <div>
            <p className="text-sm font-medium">Universal theme setter</p>
            <p className="font-mono text-xs text-muted-foreground">{color.toUpperCase()}</p>
          </div>
          <label className="ml-auto grid h-9 w-9 place-items-center rounded-full border cursor-pointer relative overflow-hidden" style={{ background: color, borderColor: hexToRgba(palette.text, 0.12) }}>
            <input type="color" value={color} onChange={(e) => updatePalette(e.target.value, boxRef.current)} onBlur={() => flushPalette(boxRef.current)} className="absolute inset-0 h-full w-full cursor-pointer opacity-0" aria-label="Pick color" />
            <span className="pointer-events-none text-xs text-white mix-blend-difference">◉</span>
          </label>
        </div>
        <div className="grid grid-cols-6 gap-1.5">
          {PRESETS.map((c) => (
            <button
              key={c}
              onClick={(e) => commitPalette(c, e.currentTarget)}
              className="aspect-square rounded-full border-2 transition hover:scale-110 active:scale-95"
              style={{
                background: c,
                borderColor: c.toLowerCase() === color.toLowerCase() ? palette.brand : hexToRgba(palette.text, 0.12),
                boxShadow: c.toLowerCase() === color.toLowerCase() ? `0 0 0 2px ${hexToRgba(palette.brand, 0.3)}` : undefined,
              }}
              aria-label={c}
            />
          ))}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={(e) => resetPalette(e.currentTarget)}
          disabled={!isOverridden}
          className="flex-1 rounded-full border py-1.5 text-xs font-medium transition disabled:opacity-40"
          style={{ borderColor: hexToRgba(palette.brand, 0.2), color: palette.text }}
        >
          Reset to system
        </button>
        <span className="rounded-full bg-foreground px-3 py-1.5 text-xs text-background">One of theme is ColorPicker</span>
      </div>
    </HomeBox>
    </div>
  )
}
export default BentoThemePickerBox
