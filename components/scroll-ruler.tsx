"use client"

import { useEffect, useState } from "react"
import { defaultPalette, detailStroke } from "@/lib/color-utils"

type RulerMarker = {
  percent: number // 0..100 scroll position
  label: string
  type: "decision" | "risk" | "action" | "default"
  preview: string
}

const TICK_COUNT = 129
const DURATION = 100 // scroll percent scale (mirrors video duration in source)
const MARKER_VICINITY = 2.5 // percent window for marker snap (mirrors 15s window)

const formatPercent = (p: number) => `${Math.round(Math.min(100, Math.max(0, p)))}%`

export function ScrollRuler() {
  // Scale colors match the orbit-card element tones (secondary hue lightened
  // past the bg — same family as the rings/ticks there): zero subscription,
  // so the 129 ticks never re-render on drags — browser repaints instantly.
  // Non-overridden state falls back to default-palette tones.
  const FB = defaultPalette
  const accent = `var(--accent, #000)`
  const accentFg = `var(--accent-foreground, #fff)`
  const ink = detailStroke("--secondary-soft", FB.secondary, 55)
  const muted = detailStroke("--secondary-soft", FB.secondary, 30)
  const [markers, setMarkers] = useState<RulerMarker[]>([])
  const [rulerHoverPercent, setRulerHoverPercent] = useState<number | null>(
    null
  )

  // ——— section markers (mirrors displayMarkers, positions from DOM) ———
  useEffect(() => {
    const compute = () => {
      const max =
        document.documentElement.scrollHeight - window.innerHeight
      if (max <= 0) {
        setMarkers([])
        return
      }
      const els = Array.from(
        document.querySelectorAll<HTMLElement>("[data-ruler-section]")
      )
      setMarkers(
        els.map((el) => ({
          percent: Math.min(
            100,
            Math.max(
              0,
              ((el.getBoundingClientRect().top + window.scrollY) / max) * 100
            )
          ),
          label: el.dataset.rulerLabel || "Section",
          type: (el.dataset.rulerType as RulerMarker["type"]) || "default",
          preview:
            el.dataset.rulerPreview ||
            el.dataset.rulerLabel ||
            "Page section",
        }))
      )
    }
    compute()
    const t = setTimeout(compute, 1000) // re-measure after layout settles
    window.addEventListener("resize", compute)
    window.addEventListener("load", compute)
    return () => {
      clearTimeout(t)
      window.removeEventListener("resize", compute)
      window.removeEventListener("load", compute)
    }
  }, [])

  const seekTo = (percent: number) => {
    const max = document.documentElement.scrollHeight - window.innerHeight
    if (max <= 0) return
    const target = Math.min(1, Math.max(0, percent / 100)) * max
    window.scrollTo({ top: target, behavior: "smooth" })
  }

  return (
    <div className="group fixed top-16 right-0 bottom-0 z-40 hidden flex-col items-center gap-4 rounded-full py-8 select-none xl:flex">
      <div
        className="relative flex h-full w-32 cursor-pointer flex-col items-end justify-between bg-none"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickY = e.clientY - rect.top
          const percentage = Math.min(
            100,
            Math.max(0, (clickY / rect.height) * 100)
          )
          setRulerHoverPercent(percentage)
        }}
        onMouseLeave={() => setRulerHoverPercent(null)}
        onClick={(e) => {
          const rect = e.currentTarget.getBoundingClientRect()
          const clickY = e.clientY - rect.top
          const percentage = Math.min(
            1,
            Math.max(0, clickY / rect.height)
          )
          seekTo(percentage * 100)
        }}
      >
        {/* Hover Interactive Cursor Tracking Line & Tooltip */}
        {rulerHoverPercent !== null &&
          (() => {
            const hoverValue = (rulerHoverPercent / 100) * DURATION
            // Key moments = page sections: always show the nearest section
            let nearestMarker: RulerMarker | null = null
            let nearestDist = Infinity
            for (const m of markers) {
              const d = Math.abs(m.percent - rulerHoverPercent)
              if (d < nearestDist) {
                nearestDist = d
                nearestMarker = m
              }
            }
            return (
              <div
                style={{
                  top: `${rulerHoverPercent}%`,
                  background: accent,
                }}
                className="absolute right-0 z-50 flex h-[2px] w-32 -translate-y-1/2 justify-start shadow-md pointer-events-none"
              >
                <div className="absolute top-[-12px] right-28 flex flex-col items-end gap-2 pointer-events-none">
                  <div
                    style={{
                      background: accent,
                      color: accentFg,
                    }}
                    className="text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xl whitespace-nowrap"
                  >
                    {formatPercent(hoverValue)}{" "}
                    <span className="opacity-50">/ 100%</span>
                  </div>
                  {nearestMarker && (
                    <div className="flex flex-col items-end gap-0.5 max-w-xs">
                      <div
                        style={{ color: ink }}
                        className="text-[10px] font-semibold px-2.5 py-1 whitespace-nowrap truncate"
                      >
                        {(nearestMarker as RulerMarker).label}
                      </div>
                      <div
                        style={{ color: muted }}
                        className="text-[10px] px-2.5 whitespace-nowrap truncate max-w-[220px]"
                      >
                        {(nearestMarker as RulerMarker).preview}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          })()}
        {/* Ruler Tick Marks */}
        {Array.from({ length: TICK_COUNT }).map((_, i) => {
          const tickValueStart = (i / (TICK_COUNT - 1)) * DURATION
          const isEighth = i % 16 === 0
          const isMajor = i % 8 === 0

          // Check if any marker falls inside or near this tick window
          const matchingMarker = markers.find(
            (m) => Math.abs(m.percent - (tickValueStart + 0.5)) < MARKER_VICINITY
          )

          // All scale lines: single card-element tone (light secondary tint)
          // — markers differ only by length

          // Dynamic Gaussian Bell-Curve (e^-x^2) Hover Math (widened scale)
          const baseWidth = isMajor ? 20 : 10
          const maxWidth = isMajor ? 52 : 30
          let currentWidth = baseWidth

          if (rulerHoverPercent !== null) {
            const itemPercent = (i / (TICK_COUNT - 1)) * 100
            const dist = Math.abs(rulerHoverPercent - itemPercent)
            const sigma = 6 // Standard deviation for smooth tail merging
            // Gaussian curve: e^(-(dist/sigma)^2)
            const factor = 2 * Math.exp(-Math.pow(dist / sigma, 2))
            currentWidth = baseWidth + (maxWidth - baseWidth) * factor
          }
          // Markers stand out by extra length (same themed shade)
          if (matchingMarker) currentWidth += 8

          return (
            <div
              key={i}
              className="relative flex h-[1px] w-full items-center justify-end"
            >
              {isEighth && (
                <span
                  style={{ color: muted }}
                  className="absolute top-1/2 right-16 -translate-y-1/2 text-[10px] font-mono opacity-0 transition-opacity duration-300 select-none leading-none pointer-events-none group-hover:opacity-100"
                >
                  {formatPercent((i / (TICK_COUNT - 1)) * DURATION)}
                </span>
              )}
              <div
                style={{ width: `${currentWidth}px`, background: ink }}
                className="h-[1px] rounded-full transition-[width] duration-150 ease-out"
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default ScrollRuler
