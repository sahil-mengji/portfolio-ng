"use client"
import {
  useState,
  useRef,
  useEffect,
  useMemo,
  type PointerEvent,
  type KeyboardEvent,
} from "react"
import { Wheel, hsvaToHex, hexToHsva, type HsvaColor } from "@uiw/react-color"
import {
  Dices,
  Plus,
  Minus,
  Copy,
  Check,
  RotateCcw,
  Sun,
  Moon,
  SlidersHorizontal,
} from "lucide-react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"
import { requestHandAction } from "@/lib/theme-hand"
import { playSfx, playDust, preloadSfx, SFX } from "@/lib/sound"
import { harmonize, type ColorHarmony } from "@/lib/color-harmony"
import { readableInkOn, generateColorPalette } from "@/lib/color-utils"

const PRESETS = [
  { name: "Pearl", colors: ["#e8e3db", "#a3b4a0", "#b397ae"] },
  { name: "Rose", colors: ["#eeb9c5", "#c88870", "#906ca9"] },
  { name: "Dusk", colors: ["#b7a2db", "#e97fb7", "#efac85"] },
  { name: "Citrus", colors: ["#e9df84", "#8fc58e", "#c88e69"] },
  { name: "Lagoon", colors: ["#90d4ba", "#63acdc", "#9e86d4"] },
  { name: "Orbit", colors: ["#98b4e8", "#b495d6", "#df92a8"] },
  { name: "Graphite", colors: ["#25272d", "#8589ae", "#ac91bf"] },
]
const names = ["Page", "Cards", "Accent"]
export function BentoColorPickerBox() {
  const {
    color,
    secondaryColor,
    tertiaryColor,
    commitPalette,
    resetPalette,
    isOverridden,
  } = useThemeColorContext()
  const savedHarmony: ColorHarmony = "analogous"
  const [harmony, setHarmony] = useState<ColorHarmony>(savedHarmony)
  const [tones, setTones] = useState(() =>
    harmonize(
      hexToHsva(color),
      savedHarmony,
      tertiaryColor ? 3 : secondaryColor ? 2 : 1
    )
  )
  const [count, setCount] = useState(tertiaryColor ? 3 : secondaryColor ? 2 : 1)
  const selected = 0
  const [size, setSize] = useState(230)
  const [copied, setCopied] = useState(false)
  const [previewing, setPreviewing] = useState(false)
  const livePalette = useMemo(
    () =>
      generateColorPalette(
        hsvaToHex(tones[0]),
        count > 1 ? hsvaToHex(tones[1]) : null,
        count > 2 ? hsvaToHex(tones[2]) : null
      ),
    [tones, count]
  )
  const wrap = useRef<HTMLDivElement>(null),
    wheel = useRef<HTMLDivElement>(null)
  const animation = useRef(0)
  const generation = useRef(0)
  const [animating, setAnimating] = useState(false)
  const cancelAnimation = () => {
    generation.current++
    cancelAnimationFrame(animation.current)
    animation.current = 0
    setAnimating(false)
  }
  const drag = useRef<"arc" | "wheel" | "slider" | number | null>(null)
  useEffect(() => {
    preloadSfx([SFX.snap, SFX.reverse, ...SFX.dust])
    return () => cancelAnimationFrame(animation.current)
  }, [])
  const current = useRef({ tones, count, selected, harmony })
  current.current = { tones, count, selected, harmony }
  const committed = useRef({ color, secondaryColor, tertiaryColor })
  committed.current = { color, secondaryColor, tertiaryColor }
  useEffect(() => {
    cancelAnimation()
    const n = tertiaryColor ? 3 : secondaryColor ? 2 : 1
    let rule = current.current.harmony
    try {
      const saved = localStorage.getItem("portfolio-color-harmony")
      if (
        saved &&
        [
          "analogous",
          "complementary",
          "split-complementary",
          "triadic",
        ].includes(saved)
      )
        rule = saved as ColorHarmony
    } catch {}
    setHarmony(rule)
    setTones(harmonize(hexToHsva(color), rule, n))
    setPreviewing(false)
    setCount(tertiaryColor ? 3 : secondaryColor ? 2 : 1)
  }, [color, secondaryColor, tertiaryColor])
  useEffect(() => {
    if (!wrap.current) return
    const observer = new ResizeObserver(([e]) =>
      setSize(
        Math.max(120, Math.min(e.contentRect.width, e.contentRect.height))
      )
    )
    observer.observe(wrap.current)
    return () => observer.disconnect()
  }, [])
  const apply = (
    next = current.current.tones,
    n = current.current.count,
    origin: Element | null = wheel.current
  ) => {
    cancelAnimation()
    const colors = next.map(hsvaToHex),
      second = n > 1 ? colors[1] : null,
      third = n > 2 ? colors[2] : null,
      old = committed.current
    if (
      colors[0] !== old.color ||
      second !== old.secondaryColor ||
      third !== old.tertiaryColor
    )
      commitPalette(colors[0], origin, second, third)
  }
  const preview = (tone: HsvaColor, index = current.current.selected) => {
    cancelAnimation()
    setPreviewing(true)
    const next = harmonize(tone, current.current.harmony, current.current.count)
    current.current.tones = next
    setTones(next)
  }
  const applyRef = useRef(apply)
  applyRef.current = apply
  useEffect(() => {
    const finish = () => {
      if (drag.current === null) return
      drag.current = null
      applyRef.current()
    }
    window.addEventListener("pointerup", finish)
    window.addEventListener("pointercancel", finish)
    return () => {
      window.removeEventListener("pointerup", finish)
      window.removeEventListener("pointercancel", finish)
    }
  }, [])
  const randomize = (origin: Element) => {
    cancelAnimation()
    setPreviewing(true)
    const from = current.current.tones.map((t) => ({ ...t }))
    const n = current.current.count
    const rule = current.current.harmony
    const target = harmonize(
      {
        ...from[0],
        h: Math.random() * 360,
        s: 55 + Math.random() * 40,
        v: 65 + Math.random() * 35,
      },
      rule,
      n
    )
    const token = generation.current
    let handReady = false,
      dialReady = false
    const commit = () => {
      if (token === generation.current && handReady && dialReady)
        applyRef.current(target, n, origin)
    }
    const remote = requestHandAction({
      kind: "snap",
      duration: 650,
      onCommit: () => {
        handReady = true
        commit()
      },
    })
    if (!remote) {
      handReady = true
      playSfx(SFX.snap)
    }
    const finish = () => {
      animation.current = 0
      setAnimating(false)
      current.current.tones = target
      setTones(target)
      dialReady = true
      if (!remote) playDust()
      commit()
    }
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      finish()
      return
    }
    const started = performance.now()
    setAnimating(true)
    const step = (now: number) => {
      const t = Math.min(1, (now - started) / 650)
      const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
      const tone = from[0],
        destination = target[0]
      const dh = ((destination.h - tone.h + 540) % 360) - 180
      const next = harmonize(
        {
          ...tone,
          h: (tone.h + dh * eased + 360) % 360,
          s: tone.s + (destination.s - tone.s) * eased,
          v: tone.v + (destination.v - tone.v) * eased,
        },
        rule,
        n
      )
      current.current.tones = next
      setTones(next)
      if (t < 1) animation.current = requestAnimationFrame(step)
      else finish()
    }
    animation.current = requestAnimationFrame(step)
  }
  const picked = tones[selected],
    currentHex = hsvaToHex(picked),
    radius = size * 0.49,
    disc = size * 0.72,
    center = size / 2
  const polar = (angle: number, r = radius) => ({
    x: center + r * Math.cos((angle * Math.PI) / 180),
    y: center + r * Math.sin((angle * Math.PI) / 180),
  })
  const start = polar(18),
    end = polar(162),
    thumb = polar(162 - picked.v * 1.44)
  const moveArc = (event: PointerEvent) => {
    if (!wrap.current) return
    const box = wrap.current.getBoundingClientRect()
    let a =
      (Math.atan2(
        event.clientY - box.top - box.height / 2,
        event.clientX - box.left - box.width / 2
      ) *
        180) /
      Math.PI
    a = (a + 360) % 360
    const v = a > 270 || a < 18 ? 100 : a > 162 ? 0 : (162 - a) / 1.44
    preview({ ...current.current.tones[current.current.selected], v })
  }
  const movePoint = (event: PointerEvent, index: number) => {
    if (!wheel.current) return
    const box = wheel.current.getBoundingClientRect(),
      dx = event.clientX - box.left - box.width / 2,
      dy = event.clientY - box.top - box.height / 2
    preview(
      {
        ...current.current.tones[index],
        h: (180 - (Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360,
        s: Math.min(100, (Math.hypot(dx, dy) / (box.width / 2)) * 100),
      },
      index
    )
  }
  const keyPoint = (event: KeyboardEvent, index: number) => {
    if (
      !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
    )
      return
    event.preventDefault()
    const tone = { ...tones[index] },
      step = event.shiftKey ? 10 : 2
    if (event.key === "ArrowLeft") tone.h = (tone.h - step + 360) % 360
    if (event.key === "ArrowRight") tone.h = (tone.h + step) % 360
    if (event.key === "ArrowUp") tone.s = Math.min(100, tone.s + step)
    if (event.key === "ArrowDown") tone.s = Math.max(0, tone.s - step)
    preview(tone, index)
    apply()
  }
  const changeHarmony = (rule: ColorHarmony, n = current.current.count) => {
    cancelAnimation()
    setPreviewing(true)
    try {
      localStorage.setItem("portfolio-color-harmony", rule)
    } catch {}
    const next = harmonize(current.current.tones[0], rule, n)
    setHarmony(rule)
    setCount(n)
    setTones(next)
    current.current = {
      ...current.current,
      harmony: rule,
      count: n,
      tones: next,
    }
    apply(next, n)
  }
  const changeCount = (n: number) =>
    changeHarmony(current.current.harmony, Math.min(3, Math.max(1, n)))
  const brightness = (v: number) => {
    preview({ ...picked, v })
    apply()
  }
  return (
    <HomeBox
      boxKey="colorpicker"
      outerClassName="bento-colorpicker h-full w-full"
      className="relative flex flex-col gap-2 p-3"
      livePalette={previewing || isOverridden ? livePalette : undefined}
    >
      <div className="flex items-center justify-between gap-2">
        <button
          aria-label="Copy color code"
          title={`${names[selected]} color`}
          className="flex items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[11px]"
          style={{
            background: currentHex,
            color: readableInkOn(currentHex),
            borderColor: readableInkOn(currentHex),
          }}
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(currentHex)
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            } catch {
              setCopied(false)
            }
          }}
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}{" "}
          {currentHex.toUpperCase()}
        </button>
        <div className="flex gap-2">
          <button
            aria-label="Reset theme"
            title="Reset theme"
            disabled={!isOverridden}
            data-silent-tap
            onClick={(e) => {
              cancelAnimation()
              const token = generation.current
              if (
                !requestHandAction({
                  kind: "reverse",
                  onCommit: () => {
                    if (token === generation.current) resetPalette()
                  },
                })
              ) {
                playSfx(SFX.reverse)
                resetPalette(e.currentTarget)
              }
            }}
            className="grid size-11 place-items-center rounded-full border text-card-foreground disabled:opacity-30"
          >
            <RotateCcw size={21} />
          </button>
          <button
            aria-label="Random color"
            title="Random colors"
            className="grid size-11 place-items-center rounded-full"
            style={{ background: currentHex, color: readableInkOn(currentHex) }}
            data-silent-tap
            data-random-animating={animating}
            onClick={(e) => randomize(e.currentTarget)}
          >
            <Dices size={23} />
          </button>
        </div>
      </div>
      <div
        ref={wrap}
        className="relative flex min-h-0 flex-1 items-center justify-center"
      >
        <div
          className="relative shrink-0"
          style={{ width: size, height: size }}
        >
          <svg
            viewBox={`0 0 ${size} ${size}`}
            className="absolute inset-0 h-full w-full"
            aria-hidden="true"
          >
            <path
              d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
              fill="none"
              stroke="var(--card-foreground)"
              strokeOpacity=".25"
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d={`M ${end.x} ${end.y} A ${radius} ${radius} 0 0 0 ${thumb.x} ${thumb.y}`}
              fill="none"
              stroke={currentHex}
              strokeWidth="18"
              strokeLinecap="round"
            />
            <path
              d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y}`}
              fill="none"
              stroke="transparent"
              strokeWidth="40"
              className="cursor-pointer touch-none"
              onPointerDown={(e) => {
                drag.current = "arc"
                e.currentTarget.setPointerCapture(e.pointerId)
                moveArc(e)
              }}
              onPointerMove={(e) => {
                if (drag.current === "arc") moveArc(e)
              }}
            />
          </svg>
          <div
            ref={wheel}
            className="absolute"
            style={{
              width: disc,
              height: disc,
              left: (size - disc) / 2,
              top: (size - disc) / 2,
            }}
          >
            <Wheel
              width={disc}
              height={disc}
              color={{ ...picked, v: 100 }}
              pointer={() => null}
              onChange={(value) => {
                drag.current = "wheel"
                preview({
                  ...value.hsva,
                  v: current.current.tones[current.current.selected].v,
                })
              }}
            />
            {tones.slice(0, count).map((tone, index) => {
              const a = ((180 - tone.h) * Math.PI) / 180
              return (
                <button
                  key={index}
                  aria-label={`${names[index]} color point`}
                  data-hue={tone.h}
                  data-saturation={tone.s}
                  tabIndex={index === 0 ? 0 : -1}
                  aria-disabled={index !== 0}
                  aria-pressed={selected === index}
                  title={
                    index === 0
                      ? "Main color · drag or use arrow keys"
                      : `Linked ${names[index].toLowerCase()} · ${harmony}`
                  }
                  className="absolute size-6 -translate-x-1/2 -translate-y-1/2 touch-none rounded-full border-[3px] border-white"
                  style={{
                    width: index === 0 ? 34 : 24,
                    height: index === 0 ? 34 : 24,
                    left:
                      disc / 2 + (((tone.s / 100) * disc) / 2) * Math.cos(a),
                    top: disc / 2 + (((tone.s / 100) * disc) / 2) * Math.sin(a),
                    background: hsvaToHex(tone),
                    boxShadow:
                      selected === index
                        ? "0 0 0 2px #2229,0 2px 8px #0005"
                        : "0 0 0 1px #2229",
                    zIndex: selected === index ? 3 : 2,
                    pointerEvents: index === 0 ? "auto" : "none",
                  }}
                  onKeyDown={(e) => keyPoint(e, index)}
                  onPointerDown={(e) => {
                    e.stopPropagation()
                    current.current.selected = index
                    drag.current = index
                    e.currentTarget.setPointerCapture(e.pointerId)
                  }}
                  onPointerMove={(e) => {
                    if (drag.current === index) movePoint(e, index)
                  }}
                />
              )
            })}
          </div>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute size-6 -translate-x-1/2 -translate-y-1/2 rounded-full"
            style={{
              left: thumb.x,
              top: thumb.y,
              background: currentHex,
              boxShadow: "0 0 0 2px #fff,0 0 0 4px #0007",
            }}
          />
          <button
            aria-label="Dark brightness"
            title="Dark"
            className="absolute top-1/2 -left-8 grid size-8 -translate-y-1/2 place-items-center rounded-full text-card-foreground"
            onClick={() => brightness(25)}
          >
            <Moon size={18} />
          </button>
          <button
            aria-label="Light brightness"
            title="Light"
            className="absolute top-1/2 -right-8 grid size-8 -translate-y-1/2 place-items-center rounded-full text-card-foreground"
            onClick={() => brightness(100)}
          >
            <Sun size={18} />
          </button>
        </div>
      </div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <button
            aria-label="Remove color"
            title="Remove color"
            disabled={count === 1}
            onClick={() => changeCount(count - 1)}
            className="grid size-8 place-items-center rounded-full border disabled:opacity-30"
          >
            <Minus size={14} />
          </button>
          <span
            aria-live="polite"
            className="font-mono text-[10px] tabular-nums"
          >
            {count}
          </span>
          <button
            aria-label="Add color"
            title="Add color"
            disabled={count === 3}
            onClick={() => changeCount(count + 1)}
            className="grid size-8 place-items-center rounded-full border disabled:opacity-30"
          >
            <Plus size={14} />
          </button>
        </div>
        <details className="group/tune relative">
          <summary
            aria-label="Color presets and adjustments"
            title="Presets and adjustments"
            className="grid size-8 cursor-pointer list-none place-items-center rounded-full border [&::-webkit-details-marker]:hidden"
          >
            <SlidersHorizontal size={15} />
          </summary>
          <div className="absolute right-0 bottom-11 z-30 grid w-60 gap-3 rounded-2xl border bg-card p-4 text-card-foreground shadow-xl">
            <label className="grid gap-1 font-mono text-[10px]">
              Color harmony
              <select
                aria-label="Color harmony"
                value={harmony}
                onChange={(e) => changeHarmony(e.target.value as ColorHarmony)}
                className="w-full cursor-pointer rounded-lg border bg-card px-2 py-2 text-card-foreground"
              >
                <option value="analogous">Analogous</option>
                <option value="complementary">Complementary</option>
                <option value="split-complementary">Split complementary</option>
                <option value="triadic">Triadic</option>
              </select>
            </label>
            <span className="font-mono text-[10px]">
              {names[selected]} color
            </span>
            <div className="flex justify-between">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  aria-label={`${p.name} preset`}
                  title={p.name}
                  className="size-6 rounded-full border"
                  style={{
                    background: `conic-gradient(${p.colors.join(",")},${p.colors[0]})`,
                  }}
                  onClick={() => {
                    const next = harmonize(
                      hexToHsva(p.colors[0]),
                      current.current.harmony,
                      current.current.count
                    )
                    setTones(next)
                    current.current.tones = next
                    apply(next)
                  }}
                />
              ))}
            </div>
            {(
              [
                ["Hue", "h", 360],
                ["Saturation", "s", 100],
                ["Brightness", "v", 100],
              ] as const
            ).map(([label, key, max]) => (
              <label key={key} className="grid gap-1 font-mono text-[10px]">
                <span className="flex justify-between">
                  {label}
                  <span>
                    {Math.round(picked[key])}
                    {key === "h" ? "°" : "%"}
                  </span>
                </span>
                <input
                  type="range"
                  aria-label={`Theme ${label.toLowerCase()}`}
                  min="0"
                  max={max}
                  value={picked[key]}
                  className="w-full accent-current"
                  onChange={(e) => {
                    drag.current = "slider"
                    preview({ ...picked, [key]: +e.target.value })
                  }}
                  onKeyUp={() => apply()}
                  onBlur={() => apply()}
                />
              </label>
            ))}
          </div>
        </details>
      </div>
    </HomeBox>
  )
}
export default BentoColorPickerBox
