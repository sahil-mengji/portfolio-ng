"use client"

import * as React from "react"
import { useThemeColorContext } from "@/components/theme-provider"

const PRESETS = [
  "#00332A",
  "#E5E55A",
  "#0A1A2F",
  "#7FD1E0",
  "#FF3F0A",
  "#CA6395",
  "#095848",
  "#30F8AB",
  "#002F9E",
  "#EDEEFD",
  "#3D0000",
  "#FF2E2E",
  "#2B2A28",
  "#D9D4C7",
  "#111111",
  "#FFFFFF",
]

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function ColorPicker() {
  const { color, palette, updatePalette } = useThemeColorContext()
  const [open, setOpen] = React.useState(false)
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const cardBg = hexToRgba(palette.surface, 0.94)
  const border = hexToRgba(palette.brand, 0.18)
  const text = palette.text
  const muted = palette.secondaryText

  return (
    <div ref={ref} className="relative">
      {/* Trigger – same native input approach as before, just better looking */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Pick theme color"
        className="flex items-center gap-2 rounded-full pl-1.5 pr-3 py-1.5 shadow-2xl backdrop-blur-xl border transition hover:scale-[1.02] active:scale-[0.98]"
        style={{ background: cardBg, borderColor: border, boxShadow: `0 8px 24px ${hexToRgba(palette.primary, 0.22)}` }}
      >
        <span
          className="h-8 w-8 rounded-full border-2 shadow-inner shrink-0"
          style={{ background: color, borderColor: hexToRgba(text, 0.12) }}
        />
        <span className="text-xs font-medium tracking-wide hidden sm:inline" style={{ color: text }}>
          {color.toUpperCase()}
        </span>
        <span className="text-[11px] hidden sm:inline" style={{ color: muted }}>
          Theme
        </span>
      </button>

      {open && (
        <div
          className="absolute bottom-[calc(100%+12px)] left-0 w-[260px] rounded-2xl p-3 shadow-2xl backdrop-blur-xl border"
          style={{ background: cardBg, borderColor: border }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-xl border shrink-0" style={{ background: color, borderColor: hexToRgba(text, 0.1) }} />
            <div className="min-w-0 flex-1">
              <div className="text-xs font-medium" style={{ color: text }}>
                Pick theme color
              </div>
              <div className="text-[11px] font-mono" style={{ color: muted }}>
                {color.toUpperCase()}
              </div>
            </div>
            {/* Native picker – same functioning as before */}
            <label
              className="h-9 w-9 rounded-full border grid place-items-center cursor-pointer shrink-0 relative overflow-hidden"
              style={{ background: color, borderColor: hexToRgba(text, 0.12) }}
              title="Open system color picker"
            >
              <input
                type="color"
                value={color}
                onChange={(e) => updatePalette(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer h-full w-full"
                aria-label="Native color picker"
              />
              <span className="pointer-events-none text-white mix-blend-difference text-xs">◉</span>
            </label>
          </div>

          {/* Presets – quick picks, same updatePalette as native */}
          <div className="grid grid-cols-8 gap-1.5">
            {PRESETS.map((c) => (
              <button
                key={c}
                onClick={() => updatePalette(c)}
                className="h-7 w-7 rounded-full border-2 transition hover:scale-110 active:scale-95"
                style={{
                  background: c,
                  borderColor: c.toLowerCase() === color.toLowerCase() ? palette.brand : hexToRgba(text, 0.1),
                  boxShadow: c.toLowerCase() === color.toLowerCase() ? `0 0 0 2px ${hexToRgba(palette.brand, 0.28)}` : undefined,
                }}
                title={c}
                aria-label={c}
              />
            ))}
          </div>

          <div className="text-[10px] mt-2.5 text-center" style={{ color: muted }}>
            Native picker + presets — same as before
          </div>
        </div>
      )}
    </div>
  )
}
