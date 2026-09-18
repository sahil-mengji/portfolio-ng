"use client"
import { memo } from "react"
import { defaultPalette, detailStroke } from "@/lib/color-utils"

const CX = 200
const CY = 200
// Flower of life: 6 circles on a hexagonal ring, each radius = ring radius
// so every neighbor pair overlaps 50% (centers on each other's circumference)
const RING_R = 90
const DOT_R = 90

/**
 * OrbitCircles — six border-only circles in hexagonal symmetry (60° apart),
 * slowly orbiting. Strokes resolve via CSS vars: instant theme response,
 * zero context subscription (no re-render on drags).
 *
 * Coordinates are rounded to 3 decimals: Math.sin/cos can differ by 1 ulp
 * between the server and client JS engines, which React reports as a
 * hydration mismatch. Rounding makes SSR/CSR output byte-identical.
 */
const r3 = (n: number) => Math.round(n * 1000) / 1000

// HaloRing — every ring color stays vivid, but each gets a pure-white
// outline underneath (white is lighter than any bg, always), so all
// circles read on every theme without dulling their colors.
function HaloRing({
  x,
  y,
  r,
  stroke,
  width = 7,
  opacity = 1,
}: {
  x: number
  y: number
  r: number
  stroke: string
  width?: number
  opacity?: number
}) {
  return (
    <g>
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        stroke="#FFFFFF"
        strokeWidth={width + 3.5}
        opacity={0.9}
      />
      <circle
        cx={x}
        cy={y}
        r={r}
        fill="none"
        style={{ stroke }}
        strokeWidth={width}
        opacity={opacity}
      />
    </g>
  )
}

const DOTS = Array.from({ length: 6 }, (_, i) => {
  const a = (i * 60 * Math.PI) / 180
  const even = i % 2 === 0
  const fallback = even ? defaultPalette.brand : defaultPalette.secondary
  // Ring hues, lightened past the bg (strict lighter-than-bg rule):
  const hueVar = even ? "--accent" : "--secondary-soft"
  return {
    x: r3(CX + RING_R * Math.cos(a)),
    y: r3(CY + RING_R * Math.sin(a)),
    stroke: detailStroke(hueVar, fallback, 55),
  }
})

// Instrument tick dial: 72 ticks every 5° on r=178 (longer each 30°).
// Pure arithmetic → deterministic across engines (hydration-safe).
const TICKS = Array.from({ length: 72 }, (_, i) => {
  const a = (i * 5 * Math.PI) / 180
  const major = i % 6 === 0
  const r1 = major ? 166 : 172
  return {
    x1: r3(CX + r1 * Math.cos(a)),
    y1: r3(CY + r1 * Math.sin(a)),
    x2: r3(CX + 178 * Math.cos(a)),
    y2: r3(CY + 178 * Math.sin(a)),
    major,
  }
})

const DETAIL = detailStroke("--secondary-soft", defaultPalette.secondary)

export const OrbitCircles = memo(function OrbitCircles() {
  return (
    <div className="flex w-full justify-center" aria-hidden>
      <svg
        viewBox="0 0 400 400"
        className="h-auto w-full max-w-[420px]"
        role="presentation"
      >
        {/* opaque disc behind the figure — grid shows around it, not through it */}
        <circle cx={CX} cy={CY} r={195} fill="var(--card)" />
        {/* construction ring through the centers (dash drifts opposite the orbit) */}
        <circle
          cx={CX}
          cy={CY}
          r={RING_R}
          fill="none"
          className="orbit-dash-drift"
          style={{ stroke: detailStroke("--accent", defaultPalette.brand, 55) }}
          strokeOpacity={0.35}
          strokeWidth={1.5}
          strokeDasharray="3 7"
        />
        {/* same-size circle fixed at the center of the figure */}
        <HaloRing x={CX} y={CY} r={DOT_R} stroke={detailStroke("--accent", defaultPalette.brand, 55)} />
        {/* smaller concentric inside the center circle — same motif as the orbiters */}
        <HaloRing
          x={CX}
          y={CY}
          r={DOT_R / 2}
          stroke={detailStroke("--accent", defaultPalette.brand, 55)}
          opacity={0.55}
        />
        {/* big enclosing circle: outermost ring edge sits at 90 + 90 + 3.5,
            so r=195 leaves a padding gap around the whole figure */}
        <circle
          cx={CX}
          cy={CY}
          r={195}
          fill="none"
          style={{ stroke: detailStroke("--secondary-soft", defaultPalette.secondary, 60) }}
          strokeWidth={7}
        />
        {/* rotating group — dots stay 60° apart at every instant (CSS orbit) */}
        <g className="orbit-rotate">
          {DOTS.map((d, i) => (
            <g key={i}>
              <HaloRing x={d.x} y={d.y} r={DOT_R} stroke={d.stroke} />
              {/* smaller concentric circle, co-centered — same thickness as parent */}
              <HaloRing
                x={d.x}
                y={d.y}
                r={DOT_R / 2}
                stroke={d.stroke}
                opacity={0.55}
              />
              {/* vertex node: filled dot + hairline ring, staggered pulse */}
              <circle
                cx={d.x}
                cy={d.y}
                r={10}
                fill="none"
                style={{ stroke: DETAIL }}
                strokeWidth={1}
                opacity={0.7}
              />
              <circle
                cx={d.x}
                cy={d.y}
                r={4}
                fill={DETAIL}
                className="orbit-pulse-dot"
                style={{ animationDelay: `${(i * 0.67).toFixed(2)}s` }}
              />
            </g>
          ))}
        </g>
        {/* tick dial — slow forward rotation */}
        <g className="orbit-tick-dial">
          {TICKS.map((t, i) => (
            <line
              key={i}
              x1={t.x1}
              y1={t.y1}
              x2={t.x2}
              y2={t.y2}
              style={{ stroke: DETAIL }}
              strokeWidth={t.major ? 2 : 1}
              opacity={t.major ? 0.9 : 0.55}
            />
          ))}
        </g>
        {/* center medallion: halo base + spinning detail diamond */}
        <HaloRing x={CX} y={CY} r={16} stroke={detailStroke("--accent", defaultPalette.brand, 55)} />
        <g className="orbit-medallion">
          <polygon points="200,192 208,200 200,208 192,200" fill={DETAIL} />
        </g>
      </svg>
    </div>
  )
})
export default OrbitCircles
