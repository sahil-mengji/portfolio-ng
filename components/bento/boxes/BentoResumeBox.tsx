"use client"

import { useEffect, useRef, useState, type CSSProperties } from "react"
import { HomeBox } from "@/components/bento/HomeBox"
import { pixelText } from "@/lib/pixel-display"
import { useThemeColorContext } from "@/components/theme-provider"
import { ensureContrast } from "@/lib/color-utils"
import styles from "./circuit-badge.module.css"

type DisplayMode = "identity" | "companion" | "spectrum" | "system"
const MODES: { id: DisplayMode; key: string; name: string }[] = [
  { id: "identity", key: "A", name: "Identity" },
  { id: "companion", key: "B", name: "Pixel companion" },
  { id: "spectrum", key: "C", name: "Color spectrum" },
  { id: "system", key: "D", name: "Device information" },
]

function Lcd({
  mode,
  brightness,
  powered,
  paused,
  surface,
  ink,
}: {
  mode: DisplayMode
  brightness: number
  powered: boolean
  paused: boolean
  surface: string
  ink: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    if (!powered) {
      ctx.fillStyle = "#060b0c"
      ctx.fillRect(0, 0, 240, 180)
      return
    }
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)")
    let animation = 0
    let previousFrame = -100
    let visible = true
    const draw = (time: number) => {
      if (visible && !document.hidden && time - previousFrame >= 65) {
        previousFrame = time
        const t = reducedMotion.matches || paused ? 0 : time / 1000
        const background = ctx.createLinearGradient(0, 0, 240, 180)
        background.addColorStop(0, surface)
        background.addColorStop(1, surface)
        ctx.fillStyle = background
        ctx.fillRect(0, 0, 240, 180)
        if (mode === "spectrum") {
          for (let x = 0; x < 240; x += 4) {
            for (let y = 0; y < 180; y += 4) {
              const hue =
                (x * 1.2 + y * 0.28 + Math.sin(y / 24 + t) * 20 + t * 18) % 360
              ctx.fillStyle = `hsl(${hue} 88% ${43 + Math.sin(x / 30 + t + y / 40) * 12}%)`
              ctx.fillRect(x, y, 4, 4)
            }
          }
          ctx.fillStyle = "#061334b8"
          ctx.fillRect(8, 8, 224, 22)
          pixelText(ctx, "COLOR LAB", 14, 15, "#ffffff")
          pixelText(ctx, "RGB / 24 BIT", 148, 15, "#ffffff")
          ctx.fillRect(8, 151, 224, 21)
          pixelText(ctx, "LIVE SPECTRUM", 14, 158, "#ffffff")
        } else if (mode === "system") {
          pixelText(ctx, "SYSTEM / SM-01", 12, 12, ink)
          pixelText(ctx, "DEVICE ONLINE", 12, 46, ink, 2)
          pixelText(ctx, "DISPLAY 240 X 180", 12, 82, ink)
          pixelText(ctx, "INPUT   8 BUTTONS", 12, 102, ink)
          pixelText(ctx, `LIGHT   ${brightness} PERCENT`, 12, 122, ink)
          pixelText(ctx, "REV 02 / PERSONAL EDITION", 12, 157, ink)
        } else if (mode === "identity") {
          pixelText(ctx, "PERSONAL ACCESS / 001", 12, 12, ink)
          ctx.fillStyle = "#4d93ff"
          ctx.fillRect(12, 30, 216, 1)
          pixelText(ctx, "SAHIL", 13, 53, ink, 3)
          pixelText(ctx, "MENGJI", 13, 83, ink, 3)
          pixelText(ctx, "DESIGN + DEVELOPMENT", 14, 120, ink)
          pixelText(ctx, "ALWAYS BUILDING.", 14, 151, ink)
          ctx.fillStyle = ink
          ctx.fillRect(215, 150, 6, 8)
        } else {
          pixelText(ctx, "BYTE", 12, 12, ink)
          pixelText(ctx, "SAY HELLO", 155, 12, ink)
          for (let i = 0; i < 18; i++) {
            const x = ((i * 53 + 11) % 218) + 10
            const y = ((i * 29 + 35) % 100) + 30
            ctx.fillStyle = `rgba(98,151,255,${0.15 + (Math.sin(t + i) + 1) * 0.15})`
            ctx.fillRect(x, y, 2, 2)
          }
          const bob = Math.round(Math.sin(t * 2.4) * 4)
          const sprite = [
            "0000011111100000",
            "0001111111111000",
            "0011111111111100",
            "0111111111111110",
            "0111111111111110",
            "1111111111111111",
            "1111111111111111",
            "1111111111111111",
            "0111111111111110",
            "0111111111111110",
            "0111111111111110",
            "0011111111111100",
            "0011101111011100",
            "0001000110001000",
          ]
          const gx = 80,
            gy = 44 + bob
          ctx.shadowColor = "#3a99ff"
          ctx.shadowBlur = 13
          sprite.forEach((row, y) =>
            [...row].forEach((bit, x) => {
              if (bit === "1") {
                ctx.fillStyle = y < 7 ? "#63d4f8" : "#40a6e8"
                ctx.fillRect(gx + x * 5, gy + y * 5, 5, 5)
              }
            })
          )
          ctx.shadowBlur = 0
          ctx.fillStyle = "#102c76"
          const eyeHeight = Math.sin(t * 1.2) > 0.98 ? 2 : 7
          ctx.fillRect(gx + 25, gy + 29, 5, eyeHeight)
          ctx.fillRect(gx + 50, gy + 29, 5, eyeHeight)
          ctx.fillRect(gx + 35, gy + 45, 10, 3)
          ctx.fillStyle = "#c09cff"
          ctx.fillRect(gx + 70, gy - 6, 6, 6)
          pixelText(ctx, "A LITTLE CURIOUS.", 12, 143, ink)
          pixelText(ctx, "A/B/C/D CHOOSE A SCREEN", 12, 159, ink)
        }
      }
      if (
        visible &&
        !document.hidden &&
        !reducedMotion.matches &&
        !paused &&
        mode !== "identity" &&
        mode !== "system"
      )
        animation = requestAnimationFrame(draw)
    }
    const restart = () => {
      cancelAnimationFrame(animation)
      previousFrame = -100
      draw(performance.now())
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) restart()
      else cancelAnimationFrame(animation)
    })
    observer.observe(canvas)
    const visibility = () => {
      cancelAnimationFrame(animation)
      if (!document.hidden && visible) restart()
    }
    document.addEventListener("visibilitychange", visibility)
    reducedMotion.addEventListener("change", restart)
    draw(0)
    return () => {
      cancelAnimationFrame(animation)
      observer.disconnect()
      document.removeEventListener("visibilitychange", visibility)
      reducedMotion.removeEventListener("change", restart)
    }
  }, [mode, brightness, powered, paused, surface, ink])

  return (
    <div
      className={styles.lcd}
      style={{ filter: `brightness(${brightness / 100})` }}
    >
      <canvas
        ref={canvasRef}
        width={240}
        height={180}
        className={styles.canvas}
        aria-hidden="true"
      />
      <div className={styles.pixelMatrix} />
      <div className={styles.glassReflection} />
    </div>
  )
}

export function BentoResumeBox() {
  const [mode, setMode] = useState<DisplayMode>("companion")
  const [brightness, setBrightness] = useState(100)
  const [powered, setPowered] = useState(true)
  const [paused, setPaused] = useState(false)
  const { palette, isOverridden } = useThemeColorContext()
  const screenSurface = isOverridden ? palette.effectSurface : "#111e62"
  const screenInk = isOverridden ? palette.effectText : "#b0e4ff"
  const deviceStyle = isOverridden
    ? ({
        "--badge-shell": palette.effectSurface,
        "--badge-ink": palette.effectText,
        "--badge-muted": ensureContrast(
          palette.secondary,
          palette.effectSurface
        ),
        "--badge-metal": palette.secondary,
      } as CSSProperties)
    : undefined

  return (
    <HomeBox
      boxKey="resume"
      outerClassName="bento-resume h-full w-full"
      className={styles.cell}
      transparent
    >
      <div className={styles.stage}>
        <div
          className={styles.badge}
          style={deviceStyle}
          role="group"
          aria-label="Interactive personal circuit badge"
        >
          <div className={styles.nameplate}>
            <div className={`${styles.slot} ${styles.slotLeft}`} />
            <div className={`${styles.slot} ${styles.slotRight}`} />
            <div className={styles.testPads} aria-hidden="true">
              {Array.from({ length: 6 }, (_, i) => (
                <i key={i} />
              ))}
            </div>
            <div className={styles.brandSymbol} aria-hidden="true">
              <svg viewBox="0 0 60 60" fill="none">
                <path
                  d="m30 3 24 14v26L30 57 6 43V17z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path
                  d="m16 37 7-17 7 12 7-12 7 17M16 37h28"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <div className={styles.wordmark}>
              sahil<span>.</span>
            </div>
            <div className={styles.subtitle}>DESIGNER & DEVELOPER</div>
            <svg
              className={styles.illustration}
              viewBox="0 0 300 235"
              fill="none"
              aria-hidden="true"
            >
              <g stroke="#bac5ba" strokeWidth="1.1" opacity=".6">
                <path d="m42 78 13-7 13 7v15l-13 7-13-7zm0 0 13 8 13-8m-13 8v14M232 119l22-12 22 12v26l-22 12-22-12zm0 0 22 13 22-13m-22 13v25" />
                <path d="M54 234v-28c0-38 23-63 54-63s54 25 54 63v28m-89-49c-11-4-21 0-26 9m109-9c11-4 21 0 26 9M84 180q24-15 48 0v27q-24 12-48 0zM108 143v-16m-4 0h8M92 189v7m31-7v7m-22 6q7 5 14 0M66 218l-8 5m94-5 8 5" />
                <ellipse
                  cx="108"
                  cy="193"
                  rx="73"
                  ry="22"
                  transform="rotate(-29 108 193)"
                  strokeDasharray="160 20 28 10"
                />
              </g>
              <path d="m181 172 4 5-4 5-4-5z" fill="#d3b27a" />
              <circle cx="203" cy="199" r="1.5" fill="currentColor" />
              <g stroke="currentColor" opacity=".5" strokeWidth=".8">
                <path d="M210 25h40l12 12v34h-19m-30-40h33l10 10v28m-43-32h28l9 9v20M22 118v-18l12-12h10M21 126v32l12 12v29" />
                <rect x="218" y="61" width="27" height="21" rx="2" />
                <path d="M222 57v4m5-4v4m5-4v4m5-4v4m5-4v4m-20 21v4m5-4v4m5-4v4m5-4v4m5-4v4" />
                <circle cx="211" cy="25" r="2" />
                <circle cx="211" cy="31" r="2" />
                <circle cx="211" cy="37" r="2" />
              </g>
            </svg>
            <div className={styles.serviceControls}>
              <button
                type="button"
                aria-label={powered ? "Power off badge" : "Power on badge"}
                aria-pressed={powered}
                onClick={() => setPowered((value) => !value)}
              >
                <span aria-hidden="true">⏻</span> POWER
              </button>
              <button
                type="button"
                aria-label={
                  paused ? "Resume badge animation" : "Pause badge animation"
                }
                aria-pressed={paused}
                onClick={() => setPaused((value) => !value)}
              >
                <span aria-hidden="true">Ⅱ</span> HOLD
              </button>
            </div>
            <span className={styles.edition}>PERSONAL EDITION / 001</span>
          </div>

          <div className={styles.hardware}>
            <div className={styles.pcb} aria-hidden="true">
              <svg viewBox="0 0 300 240" preserveAspectRatio="none">
                <g stroke="#a28d51" strokeWidth=".8" fill="none" opacity=".65">
                  <path d="M17 28h18l10 10h14M17 35h14l10 10h18M17 42h10l10 10h22M282 31h-15v25l-10 10M282 38h-10v21l-10 10M20 175v18h47l12 12h38M20 183v18h43l12 12h44M281 178v16h-27l-12 12h-25M281 185v17h-23l-12 12h-29M90 220v-18m5 18v-18m5 18v-18m5 18v-18" />
                </g>
                <g fill="#b2a67c">
                  {[24, 36, 48, 60, 72, 84, 96, 108].map((y) => (
                    <rect key={y} x="12" y={y} width="4" height="4" rx=".6" />
                  ))}
                </g>
              </svg>
              <span className={styles.ribbon} />
              <span className={styles.chip} />
              <span className={styles.oscillator}>24.000</span>
              <span className={styles.usbPort} />
              <span className={styles.resistors}>
                {[0, 1, 2, 3].map((i) => (
                  <i key={i} />
                ))}
              </span>
              <span className={styles.powerLed} />
              <span className={styles.boardLegend}>SM-01 / 3V3</span>
            </div>
            <div className={styles.acrylic} aria-hidden="true" />
            <div className={styles.hinge} aria-hidden="true" />
            <div className={styles.displayFrame}>
              <Lcd
                mode={mode}
                brightness={brightness}
                powered={powered}
                paused={paused}
                surface={screenSurface}
                ink={screenInk}
              />
            </div>
            <div className={styles.sideControls}>
              <span aria-hidden="true">⌃</span>
              <button
                aria-label="Increase screen brightness"
                title="Increase brightness"
                disabled={brightness >= 120}
                onClick={() =>
                  setBrightness((value) => Math.min(120, value + 20))
                }
              />
              <button
                aria-label="Decrease screen brightness"
                title="Decrease brightness"
                disabled={brightness <= 60}
                onClick={() =>
                  setBrightness((value) => Math.max(60, value - 20))
                }
              />
              <span aria-hidden="true">⌄</span>
            </div>
            <div className={styles.controls}>
              {MODES.map((item) => (
                <button
                  key={item.id}
                  aria-label={`Show ${item.name.toLowerCase()}`}
                  aria-pressed={mode === item.id}
                  onClick={() => {
                    setPowered(true)
                    setMode(item.id)
                  }}
                  title={item.name}
                >
                  <span className={styles.keycap} />
                  <span className={styles.keyLabel}>{item.key}</span>
                </button>
              ))}
            </div>
            <span
              className={`${styles.screw} ${styles.screwLeft}`}
              aria-hidden="true"
            />
            <span
              className={`${styles.screw} ${styles.screwRight}`}
              aria-hidden="true"
            />
          </div>
        </div>
        <span className="sr-only" role="status">
          {MODES.find((item) => item.id === mode)?.name} display. Brightness{" "}
          {brightness} percent. {powered ? "Powered on." : "Powered off."}{" "}
          {paused ? "Animation paused." : ""}
        </span>
      </div>
    </HomeBox>
  )
}

export default BentoResumeBox
