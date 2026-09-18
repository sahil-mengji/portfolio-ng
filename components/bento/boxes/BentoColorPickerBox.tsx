"use client"
import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { Wheel, hsvaToHex, hexToHsva, type HsvaColor } from "@uiw/react-color"
import { Dices, Copy, Check, RotateCcw } from "lucide-react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"
import { generateColorPalette, readableInkOn } from "@/lib/color-utils"

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}


export function BentoColorPickerBox() {
  const { updatePalette, commitPalette, flushPalette, isOverridden, palette: universalPalette, defaultColor } = useThemeColorContext()
  const palette = !isOverridden
    ? (getBoxPalette("colorpicker") ?? universalPalette)
    : universalPalette
  // HSVA state drives the package Wheel; theme applies only on user interaction
  const [hsva, setHsva] = useState<HsvaColor>({ h: 0, s: 0, v: 100, a: 1 })

  const arcWrapRef = useRef<HTMLDivElement>(null)
  const wheelWrapRef = useRef<HTMLDivElement>(null)
  const [arcSize, setArcSize] = useState(200)
  const [isDraggingArc, setIsDraggingArc] = useState(false)

  // --- Interaction model: this block stays live via local hsva state on
  // every move; the whole site follows through a debounced commit with a
  // circular reveal growing from the color wheel (see ThemeProvider). ---
  const hsvaRef = useRef(hsva)
  useEffect(() => {
    hsvaRef.current = hsva
  }, [hsva])

  const currentHex = hsvaToHex(hsva)
  // Live card chrome: once touched, the card surfaces follow the selected
  // color instantly instead of waiting for the debounced site commit.
  const [touched, setTouched] = useState(false)
  const livePalette = useMemo(() => generateColorPalette(currentHex), [currentHex])
  // Card bg carries a clearly visible wash of the pick (not the subtle
  // surface tint), applied the same frame — never waiting for the reveal.
  const liveWash = `color-mix(in oklab, ${currentHex} 32%, ${livePalette.surface})`
  // The wheel always previews at full brightness: lightness lives only on
  // the arc + state, never dimming the wheel disc itself.
  const wheelDisplay: HsvaColor = { ...hsva, v: 100 }

  // --- Random-color dial animation (rAF, cancelled by any manual input) ---
  const animRef = useRef(0)
  const cancelAnim = useCallback(() => {
    if (animRef.current) {
      cancelAnimationFrame(animRef.current)
      animRef.current = 0
    }
  }, [])
  useEffect(() => {
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current)
    }
  }, [])

  // Commit any pending debounced theme on drag release (reveal from wheel).
  useEffect(() => {
    const onUp = () => flushPalette(wheelWrapRef.current)
    window.addEventListener("pointerup", onUp)
    return () => window.removeEventListener("pointerup", onUp)
  }, [flushPalette])

  // Measure the square arc area so wheel + arc stay in sync at any cell width
  useEffect(() => {
    if (!arcWrapRef.current) return
    const ro = new ResizeObserver(([e]) =>
      setArcSize(Math.max(140, e.contentRect.width))
    )
    ro.observe(arcWrapRef.current)
    return () => ro.disconnect()
  }, [])

  // NOTE: no mount effect here — both the arc drag (handleArcMove) and the
  // Wheel onChange already apply the theme directly, so applying on mount
  // would override the default white theme before any user interaction.

  // --- Arc geometry: 144° (2/5 of circumference) centered at the bottom ---
  // moon (v=0) at 162° (lower-left) → sun (v=100) at 18° (lower-right)
  const ARC_END_SUN = 18
  const ARC_END_MOON = 162
  const cx = arcSize / 2
  const cy = arcSize / 2
  // Fully relative geometry — wheel, arc, icons never overlap at any width
  const STROKE = 16
  const iconOrbit = arcSize / 2 - 10
  const arcR = iconOrbit - 8 - 4 - STROKE / 2
  const wheelPx = Math.max(40, 2 * (arcR - STROKE / 2 - 11))
  // Rounded to 3 decimals: sin/cos can differ 1 ulp between server and
  // client engines → hydration mismatch in path/position attributes.
  const polar = useCallback(
    (deg: number, radius: number = arcR) => {
      const rad = (deg * Math.PI) / 180
      const r3 = (n: number) => Math.round(n * 1000) / 1000
      return { x: r3(cx + radius * Math.cos(rad)), y: r3(cy + radius * Math.sin(rad)) }
    },
    [cx, cy, arcR]
  )
  // Value 0 at moon (162°), value 100 at sun (18°)
  const thumbAngle = ARC_END_MOON - (hsva.v / 100) * (ARC_END_MOON - ARC_END_SUN)
  const thumbPos = polar(thumbAngle)
  const sunPos = polar(ARC_END_SUN)
  const moonPos = polar(ARC_END_MOON)
  // Track from sun (18°) to moon (162°) through the bottom (sweep-flag=1)
  const arcTrack = `M ${sunPos.x} ${sunPos.y} A ${arcR} ${arcR} 0 0 1 ${moonPos.x} ${moonPos.y}`
  // Fill from moon (162°) to thumb (sweep-flag=0)
  const arcFill = `M ${moonPos.x} ${moonPos.y} A ${arcR} ${arcR} 0 0 0 ${polar(thumbAngle).x} ${polar(thumbAngle).y}`
  // Sun/moon icons sit on the horizontal diameter, tucked very slightly
  // inside the icon orbit
  const iconR = iconOrbit - 4
  const sunIconPos = polar(0, iconR)
  const moonIconPos = polar(180, iconR)
  // Card-relative track — auto-contrasts the live card surface
  const trackStroke = hexToRgba(touched ? livePalette.cardText : palette.cardText, 0.45)
  // Ring the icon matching the current extreme (dark → moon, bright → sun)
  const atSun = hsva.v >= 99
  const atMoon = hsva.v <= 1

  // --- Pointer → arc angle → value (clamped to the 144° arc) ---
  // Stable: reads hue/sat from ref so listener never resubscribes per tick.
  // Any manual grab cancels the dice sweep.
  const handleArcMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!arcWrapRef.current) return
      cancelAnim()
      const rect = arcWrapRef.current.getBoundingClientRect()
      const dx = clientX - (rect.left + rect.width / 2)
      const dy = clientY - (rect.top + rect.height / 2)
      let a = (Math.atan2(dy, dx) * 180) / Math.PI
      a = ((a % 360) + 360) % 360
      // Clamp to 18°–162° (below that → sun end, above → moon end)
      let v: number
      if (a >= ARC_END_MOON && a <= 270) v = 0
      else if (a > 270 || a < ARC_END_SUN) v = 100
      else v = ((ARC_END_MOON - a) / (ARC_END_MOON - ARC_END_SUN)) * 100
      const next = { ...hsvaRef.current, v }
      hsvaRef.current = next
      setHsva(next)
      setTouched(true)
      updatePalette(hsvaToHex(next), wheelWrapRef.current)
    },
    [cancelAnim, updatePalette, ARC_END_MOON, ARC_END_SUN]
  )

  // --- Random color (dice): dials, readouts, card bg all travel together on
  // the same hsva state, so everything stays in sync frame-to-frame; the
  // site theme commits once on landing. ---
  const randomize = useCallback(
    (origin: Element | null = null, quiet = false) => {
      cancelAnim()
      const from = hsvaRef.current
      const target: HsvaColor = {
        h: Math.floor(Math.random() * 360),
        s: 55 + Math.random() * 40,
        v: 65 + Math.random() * 35,
        a: 1,
      }
      // Gauntlet owns sounds + the reveal mask: it commits this exact
      // target from the corner while the dials sweep here.
      if (quiet) {
        window.dispatchEvent(
          new CustomEvent("gauntlet:play", {
            detail: { kind: "snap", hex: hsvaToHex(target) },
          })
        )
      }
      // Shortest path around the hue ring
      const dh = ((target.h - from.h + 540) % 360) - 180
      const ds = target.s - from.s
      const dv = target.v - from.v
      const el = origin ?? wheelWrapRef.current
      const dur = 650
      const t0 = performance.now()
      setTouched(true)
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur)
        // easeInOutCubic
        const e = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const next: HsvaColor = {
          h: (from.h + dh * e + 360) % 360,
          s: from.s + ds * e,
          v: from.v + dv * e,
          a: 1,
        }
        hsvaRef.current = next
        setHsva(next)
        if (t < 1) {
          animRef.current = requestAnimationFrame(step)
        } else {
          animRef.current = 0
          // Site commit exactly on landing — unless the gauntlet owns it
          // (quiet bento taps commit from the corner instead).
          if (!quiet) commitPalette(hsvaToHex(next), el)
        }
      }
      animRef.current = requestAnimationFrame(step)
    },
    [cancelAnim, commitPalette]
  )

  // --- Copy hex to clipboard ---
  const [copied, setCopied] = useState(false)
  const copyHex = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(currentHex)
    } catch {
      const ta = document.createElement("textarea")
      ta.value = currentHex
      document.body.appendChild(ta)
      ta.select()
      document.execCommand("copy")
      ta.remove()
    }
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }, [currentHex])

  // --- Pointer Event Listeners (arc only – Wheel handles its own drag) ---
  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (isDraggingArc) handleArcMove(e.clientX, e.clientY)
    }

    const onPointerUp = () => {
      setIsDraggingArc(false)
      flushPalette(wheelWrapRef.current)
    }

    if (isDraggingArc) {
      window.addEventListener("pointermove", onPointerMove)
      window.addEventListener("pointerup", onPointerUp)
    }
    return () => {
      window.removeEventListener("pointermove", onPointerMove)
      window.removeEventListener("pointerup", onPointerUp)
    }
  }, [isDraggingArc, handleArcMove, flushPalette])

  // (ResizeObserver above is the single source for arcSize — duplicate removed.)

  // Follow gauntlet commits (corner taps or bento-remote): swing the dials
  // to the committed color so the selector card mirrors the site theme.
  // No commit loop — setting dial state alone never commits.
  useEffect(() => {
    const onTheme = (e: Event) => {
      const hex = (e as CustomEvent).detail?.hex as string | undefined
      if (!hex) return
      cancelAnim()
      const next = hexToHsva(hex)
      hsvaRef.current = next
      setHsva(next)
      setTouched(hex.toLowerCase() !== defaultColor.toLowerCase())
    }
    window.addEventListener("theme:committed", onTheme)
    return () => window.removeEventListener("theme:committed", onTheme)
  }, [cancelAnim, defaultColor])

  return (
    <HomeBox
      boxKey="colorpicker"
      outerClassName="bento-colorpicker h-full w-full"
      className="flex flex-col justify-center p-3"
      liveSurface={touched ? liveWash : undefined}
    >
      {/* Clean picker device - card bg only, no dark panel */}
      <div
        className="flex h-full w-full flex-col gap-2 rounded-[18px] p-3 select-none"
        style={
          touched
            ? ({
                color: livePalette.cardText,
                ["--card-text" as any]: livePalette.cardText,
                ["--card-muted" as any]: livePalette.cardSecondaryText,
                ["--card-foreground" as any]: livePalette.cardText,
              } as any)
            : undefined
        }
      >
        <div className="flex items-center justify-between px-1">
          {/* <span className="font-mono text-[10px] tracking-widest uppercase text-muted-foreground">
            Theme picker
          </span> */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={copyHex}
              aria-label="Copy color code"
              title="Copy color code"
              className="flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-xs transition-[transform,opacity] hover:opacity-85 active:scale-95"
              style={{
                background: currentHex,
                color: readableInkOn(currentHex),
                borderColor: hexToRgba(readableInkOn(currentHex), 0.25),
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
              {currentHex.toUpperCase()}
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                cancelAnim()
                setTouched(false)
                // Snap the dials home; the gauntlet owns the reset reveal +
                // sound from the corner.
                const home = hexToHsva(defaultColor)
                hsvaRef.current = home
                setHsva(home)
                window.dispatchEvent(
                  new CustomEvent("gauntlet:play", { detail: "reverse" })
                )
              }}
              disabled={!isOverridden}
              title="Reset theme"
              aria-label="Reset theme"
              className="grid h-14 w-14 place-items-center rounded-full border-2 text-card-foreground transition-[transform,opacity] hover:scale-105 active:scale-95 disabled:opacity-30"
              style={{
                borderColor: hexToRgba(currentHex, 0.5),
                color: touched ? livePalette.cardText : undefined,
              }}
            >
              <RotateCcw size={24} />
            </button>
            <button
              onClick={(e) => randomize(e.currentTarget, true)}
              aria-label="Random color"
              title="Random color"
              className="grid h-14 w-14 place-items-center rounded-full transition-[transform,opacity] hover:scale-105 hover:opacity-85 active:scale-95"
              style={{ background: currentHex, color: readableInkOn(currentHex) }}
            >
              <Dices size={24} />
            </button>
          </div>
        </div>

        {/* Wheel + semicircular lightness arc */}
        <div className="flex min-h-[200px] flex-1 items-center justify-center">
          <div
            ref={arcWrapRef}
            onPointerDown={(e) => {
              // Wheel handles its own drags — a hue click must not reset lightness
              if (wheelWrapRef.current?.contains(e.target as Node)) return
              setIsDraggingArc(true)
              handleArcMove(e.clientX, e.clientY)
            }}
            className="relative aspect-square w-full max-w-[300px] cursor-pointer touch-none"
          >
            {/* Package Wheel, centered */}
            <div
              ref={wheelWrapRef}
              data-wheel
              className="absolute"
              style={{
                width: wheelPx,
                height: wheelPx,
                left: cx - wheelPx / 2,
                top: cy - wheelPx / 2,
              }}
            >
              <Wheel
                width={wheelPx}
                height={wheelPx}
                color={wheelDisplay}
                pointer={({ style, color }: { style?: React.CSSProperties; color?: string }) => (
                  <div
                    style={{
                      ...style,
                      width: 26,
                      height: 26,
                      // style.transform already carries translate(x, y);
                      // recenter the bigger box on that point.
                      transform: `${style?.transform ?? ""} translate(-13px, -13px)`,
                      borderRadius: "50%",
                      background: "#fff",
                      boxShadow:
                        "0 2px 8px rgba(0,0,0,0.45), inset 0 0 0 1px rgba(0,0,0,0.2)",
                      pointerEvents: "none",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 4,
                        borderRadius: "50%",
                        background: color,
                      }}
                    />
                  </div>
                )}
                onChange={(color) => {
                  // Manual grab cancels the dice sweep; wheel edits hue/sat
                  // only — the arc keeps its lightness.
                  cancelAnim()
                  const next = { ...color.hsva, v: hsvaRef.current.v }
                  setHsva(next)
                  hsvaRef.current = next
                  setTouched(true)
                  updatePalette(hsvaToHex(next), wheelWrapRef.current)
                }}
              />
            </div>

            {/* Arc track (semicircle under the wheel) */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full"
              viewBox={`0 0 ${arcSize} ${arcSize}`}
            >
              <path
                d={arcTrack}
                fill="none"
                stroke={trackStroke}
                strokeWidth="16"
                strokeLinecap="round"
              />
              <path
                d={arcFill}
                fill="none"
                stroke={currentHex}
                strokeWidth="16"
                strokeLinecap="round"
              />
            </svg>

            {/* Arc thumb — live local color with contrast rings for any background */}
            <div
              data-thumb
              className="pointer-events-none absolute h-5 w-5 rounded-full"
              style={{
                left: thumbPos.x,
                top: thumbPos.y,
                transform: "translate(-50%, -50%)",
                background: currentHex,
                boxShadow: "0 0 0 2px #fff, 0 0 0 4px rgba(0,0,0,0.45)",
              }}
            />

            {/* Sun at bright end of the wheel diameter */}
            <svg
              className={`pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full p-1 text-card-foreground ${atSun ? "ring-2 ring-current" : ""}`}
              style={{
                left: sunIconPos.x,
                top: sunIconPos.y,
                background: hexToRgba(touched ? livePalette.cardText : palette.cardText, 0.14),
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707-.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
            {/* Moon at dark end of the wheel diameter */}
            <svg
              className={`pointer-events-none absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full p-1 text-card-foreground ${atMoon ? "ring-2 ring-current" : ""}`}
              style={{
                left: moonIconPos.x,
                top: moonIconPos.y,
                background: hexToRgba(touched ? livePalette.cardText : palette.cardText, 0.14),
              }}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          </div>
        </div>
      </div>
    </HomeBox>
  )
}
export default BentoColorPickerBox