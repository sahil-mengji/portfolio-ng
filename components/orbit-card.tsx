"use client"
import { useId, useMemo } from "react"
import { OrbitCircles } from "@/components/orbit-circles"
import { defaultPalette, detailStroke } from "@/lib/color-utils"
import { JACK_SVG } from "@/components/jack-art"

// Static themed Jack (see components/jack-art.ts — generated, validated).
// Full-bleed: art ratio is exactly 5:7, face clips the corners.
// NOTE: the SVG is inlined once per card, so IDs must be namespaced per
// instance — duplicate document-wide IDs make <use> refs resolve to another
// (possibly backface-culled) copy and the jack silently doesn't paint.
function namespacedJack(uid: string) {
  let out = JACK_SVG.slice(JACK_SVG.indexOf("<svg"))
  const ids = new Set(
    Array.from(out.matchAll(/\sid="([^"]+)"/g)).map((m) => m[1]),
  )
  for (const id of ids) {
    out = out.split(`id="${id}"`).join(`id="${id}-${uid}"`)
    out = out.split(`"#${id}"`).join(`"#${id}-${uid}"`)
  }
  // Belt-and-braces: modern href alongside the deprecated xlink:href.
  out = out.replace(
    / xlink:href="(#[^"]+)"/g,
    ' href="$1" xlink:href="$1"',
  )
  return out
}
function JackBack() {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, "")
  const html = useMemo(() => namespacedJack(uid), [uid])
  return (
    <div
      aria-hidden
      className="jack-svg absolute inset-0"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

// OrbitCard — dense geometric ornament around the orbit figure.
// STRICT RULE: every visible element is lighter than the card bg, always.
//detail tones mix toward white; halos are pure white; the disc IS the bg.
// flip=false disables the hover flip (deck-spread copies stay face-up).
export function OrbitCard({ flip = true }: { flip?: boolean }) {
  // Frame matches the enclosing ring (both lighter-than-bg secondary tints).
  const frame = detailStroke("--secondary-soft", defaultPalette.secondary, 60)
  // Detail tones (lightness above bg, always):
  const ink = (pct: number) => detailStroke("--secondary-soft", defaultPalette.secondary, pct)
  const tickStripH =
    `repeating-linear-gradient(90deg, ${ink(55)} 0 1px, transparent 1px 12px)`
  const tickStripV =
    `repeating-linear-gradient(0deg, ${ink(55)} 0 1px, transparent 1px 12px)`

  return (
    <div className="group w-[min(86vw,440px)] [perspective:1400px] [transform-style:preserve-3d]">
      <div className={`relative aspect-[5/7] transition-transform duration-700 [transform-style:preserve-3d] ${flip ? "motion-safe:group-hover:[transform:rotateY(180deg)]" : ""}`}>
        {/* ═══ FRONT · the orbit instrument ═══ */}
        <div
          className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[24px] border-[16px] bg-card p-8 shadow-xl backface-hidden"
          style={{ borderColor: frame }}
        >
      {/* 1 · tri-axis weave of huge overlapping circles, mirror-symmetric
             about the vertical midline forever: H halves converge/diverge,
             diagonal chains glide mirrored along their axes.
             All coords are plain arithmetic → hydration-safe. */}
      <svg
        aria-hidden
        viewBox="0 0 500 700"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 h-full w-full"
      >
        <g fill="none" style={{ stroke: ink(40) }} strokeWidth={2.5} strokeDasharray="0.1 7" strokeLinecap="round">
          <circle cx={-120} cy={350} r={320} />
          <circle cx={80} cy={350} r={320} />
        </g>
        <g fill="none" style={{ stroke: ink(40) }} strokeWidth={2.5} strokeDasharray="0.1 7" strokeLinecap="round">
          <circle cx={420} cy={350} r={320} />
          <circle cx={620} cy={350} r={320} />
        </g>
        <g fill="none" style={{ stroke: ink(40) }} strokeWidth={2.5} strokeDasharray="0.1 7" strokeLinecap="round">
          {[-300, -100, 100, 300].map((s) => (
            <circle key={s} cx={250 + s * 0.5} cy={350 + s * 0.866} r={320} />
          ))}
        </g>
        <g fill="none" style={{ stroke: ink(40) }} strokeWidth={2.5} strokeDasharray="0.1 7" strokeLinecap="round">
          {[-300, -100, 100, 300].map((s) => (
            <circle key={s} cx={250 - s * 0.5} cy={350 + s * 0.866} r={320} />
          ))}
        </g>
      </svg>
      {/* 3 · radial glow behind figure */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{ background: "radial-gradient(circle at 50% 46%, rgba(255,255,255,0.10), transparent 62%)" }}
      />
      {/* 4 · crosshair guides through card center */}
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-full w-px" style={{ background: ink(35) }} />
      <div aria-hidden className="pointer-events-none absolute left-0 top-1/2 h-px w-full" style={{ background: ink(35) }} />
      {/* 5 · triangle overlay ringing the figure (slow reverse rotation) */}
      <svg aria-hidden viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 m-auto w-[72%]">
        <g className="orbit-spin-rev-slow">
          <polygon points="200,50 329.904,275 70.096,275" fill="none" style={{ stroke: ink(25) }} strokeWidth={1.5} />
          <polygon points="200,50 329.904,275 70.096,275" fill="none" style={{ stroke: ink(25) }} strokeWidth={1.5} transform="rotate(60 200 200)" />
          <polygon points="200,50 329.904,275 70.096,275" fill="none" style={{ stroke: ink(25) }} strokeWidth={1.5} transform="rotate(120 200 200)" />
        </g>
      </svg>
      {/* 6 · inner keyline */}
      <div aria-hidden className="pointer-events-none absolute rounded-[10px]" style={{ inset: 26, border: `1px solid ${ink(40)}` }} />
      {/* 7 · corner diamonds centered on the keyline corners */}
      {[
        { style: { left: 26, top: 26 }, cls: "-translate-x-1/2 -translate-y-1/2" },
        { style: { right: 26, top: 26 }, cls: "translate-x-1/2 -translate-y-1/2" },
        { style: { left: 26, bottom: 26 }, cls: "-translate-x-1/2 translate-y-1/2" },
        { style: { right: 26, bottom: 26 }, cls: "translate-x-1/2 translate-y-1/2" },
      ].map((c, i) => (
        <div
          key={i}
          aria-hidden
          className={`pointer-events-none absolute h-2 w-2 rotate-45 ${c.cls}`}
          style={{ ...c.style, background: ink(70) }}
        />
      ))}
      {/* 8 · edge tick strips */}
      <div aria-hidden className="pointer-events-none absolute left-12 right-12 top-[30px] h-[5px]" style={{ backgroundImage: tickStripH }} />
      <div aria-hidden className="pointer-events-none absolute bottom-12 left-[30px] top-12 w-[5px]" style={{ backgroundImage: tickStripV }} />
      <div aria-hidden className="pointer-events-none absolute bottom-12 right-[30px] top-12 w-[5px]" style={{ backgroundImage: tickStripV }} />
      <div aria-hidden className="pointer-events-none absolute bottom-[30px] left-12 right-12 h-[5px]" style={{ backgroundImage: tickStripH }} />
      {/* 9 · top title / bottom spec — the zones that earn the 5:7 height */}
      <div
        className="absolute left-0 right-0 top-[46px] text-center font-mono text-[10px] tracking-[0.35em]"
        style={{ color: ink(70) }}
      >
        ORBIT · 60°
      </div>
      <div
        className="absolute bottom-[46px] left-0 right-0 text-center font-mono text-[10px] tracking-[0.35em]"
        style={{ color: ink(70) }}
      >
        R90 · ⬡ · 48S
      </div>
      {/* 10 · the figure (gentle breathe) */}
      <div className="orbit-breathe relative w-[80%]">
        <OrbitCircles />
      </div>
        </div>
        {/* ═══ BACK · jack face art, themed live ═══ */}
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden rounded-[24px] bg-card shadow-xl backface-hidden [transform:rotateY(180deg)]">
          <JackBack />
        </div>
      </div>
    </div>
  )
}
