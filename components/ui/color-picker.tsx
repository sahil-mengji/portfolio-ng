"use client"

import * as React from "react"
import { useThemeColorContext } from "@/components/theme-provider"
import { hslToHex } from "@/lib/color-utils"
import { playSfx, playDust, preloadSfx, SFX } from "@/lib/sound"

// Floating corner control — Thanos gauntlet instead of dice.
// Single click: snap-finger strip animation, then a vivid random theme
// commits with the circular reveal growing from the button itself.
// Press-and-hold (550ms): time-reverse strip, then reset to default theme.
// Strip assets are 48-frame horizontal sprite sheets (80px frames).
const FRAME = 80
const FRAMES = 48
const FRAME_MS = 45
const HOLD_MS = 550

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

export function ColorPicker({
  onActiveChange,
}: {
  onActiveChange?: (active: boolean) => void
}) {
  const { commitPalette, resetPalette, defaultColor } = useThemeColorContext()
  const activeCb = React.useRef(onActiveChange)
  activeCb.current = onActiveChange
  const canvasRef = React.useRef<HTMLCanvasElement>(null)
  const btnRef = React.useRef<HTMLButtonElement>(null)
  const imgs = React.useRef<{ idle: HTMLImageElement | null; snap: HTMLImageElement | null; time: HTMLImageElement | null }>({
    idle: null,
    snap: null,
    time: null,
  })
  const busy = React.useRef(false)
  const holdTimer = React.useRef(0)
  const held = React.useRef(false)
  const raf = React.useRef(0)

  // All SFX route through the universal manager (toggle-aware). Announce
  // every commit so the bento dials can mirror it.
  const announce = (hex: string) => {
    window.dispatchEvent(
      new CustomEvent("theme:committed", { detail: { hex } })
    )
  }

  const draw = React.useCallback((img: HTMLImageElement | null, frame = 0) => {
    const canvas = canvasRef.current
    if (!canvas || !img) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    const s = canvas.width
    ctx.clearRect(0, 0, s, s)
    ctx.drawImage(img, frame * FRAME, 0, FRAME, FRAME, 0, 0, s, s)
  }, [])

  // Preload strips + SFX, paint idle.
  React.useEffect(() => {
    let live = true
    preloadSfx([SFX.snap, SFX.reverse, ...SFX.dust])
    Promise.all([
      load("/thanos/thanos_idle.png"),
      load("/thanos/thanos_snap.png"),
      load("/thanos/thanos_time.png"),
    ])
      .then(([idle, snap, time]) => {
        if (!live) return
        imgs.current = { idle, snap, time }
        console.info(
          `[Gauntlet] strips loaded (snap frames: ${snap.width / FRAME}, time frames: ${time.width / FRAME})`
        )
        draw(idle, 0)
      })
      .catch((err) => {
        console.warn("[Gauntlet] strip preload failed — taps still roll/reset", err)
      })
    return () => {
      live = false
      cancelAnimationFrame(raf.current)
      window.clearTimeout(holdTimer.current)
    }
  }, [draw])

  // Play a 48-frame strip once. onCommit fires mid-strip at commitFrame
  // (so the theme reveal blooms inside the animation, no dead gap);
  // onDone runs after the last frame.
  const playStrip = React.useCallback(
    (
      img: HTMLImageElement | null,
      onDone: () => void,
      commitFrame = FRAMES,
      onCommit?: () => void
    ) => {
      if (!img || busy.current) return
      busy.current = true
      activeCb.current?.(true)
      let frame = 0
      let last = performance.now()
      const step = (now: number) => {
        if (now - last >= FRAME_MS) {
          last = now
          draw(img, frame)
          frame += 1
          if (frame === commitFrame) onCommit?.()
        }
        if (frame < FRAMES) {
          raf.current = requestAnimationFrame(step)
        } else {
          busy.current = false
          activeCb.current?.(false)
          onDone()
        }
      }
      raf.current = requestAnimationFrame(step)
    },
    [draw]
  )

  const roll = React.useCallback(() => {
    const hex = hslToHex(
      Math.floor(Math.random() * 360),
      70 + Math.floor(Math.random() * 30),
      45 + Math.floor(Math.random() * 20)
    )
    commitPalette(hex, btnRef.current)
    announce(hex)
  }, [commitPalette])

  // Idle face, falling back to the snap strip's first frame.
  const idleImg = () => imgs.current.idle ?? imgs.current.snap

  // opts.hex = bento handed over its dial target: commit exactly that from
  // the corner (mask + sounds always originate here). opts.quiet skips the
  // local random roll (bento already chose). Local taps pass nothing.
  const snap = React.useCallback(
    (opts: { quiet?: boolean; hex?: string } = {}) => {
      const img = imgs.current.snap
      playSfx(SFX.snap)
      const commit = () => {
        if (opts.hex) {
          commitPalette(opts.hex, btnRef.current)
          announce(opts.hex)
        } else if (!opts.quiet) {
          roll()
        }
      }
      if (!img) {
        commit()
        return
      }
      // Commit the theme at frame 34 (the snap climax) layered with a random
      // dust sound, so snap + dust + color land as one grouped gesture.
      playStrip(
        img,
        () => {
          draw(idleImg(), 0)
        },
        34,
        () => {
          playDust()
          commit()
        }
      )
    },
    [playStrip, roll, commitPalette, draw]
  )

  const reverse = React.useCallback(() => {
    const img = imgs.current.time
    playSfx(SFX.reverse)
    const done = () => {
      resetPalette(btnRef.current)
      announce(defaultColor)
      draw(idleImg(), 0)
    }
    if (!img) {
      done()
      return
    }
    playStrip(img, done)
  }, [playStrip, resetPalette, defaultColor, draw])

  // Remote triggers: bento random/reset hands over — gauntlet appears,
  // performs (sounds + mask originate here), then disappears.
  React.useEffect(() => {
    const onPlay = (e: Event) => {
      const raw = (e as CustomEvent).detail as unknown
      if (typeof raw === "string") {
        if (raw === "snap") snap({ quiet: true })
        else if (raw === "reverse") reverse()
        return
      }
      if (raw && typeof raw === "object") {
        const { kind, hex } = raw as { kind: string; hex?: string }
        if (kind === "snap") snap(hex ? { hex } : { quiet: true })
        else if (kind === "reverse") reverse()
      }
    }
    window.addEventListener("gauntlet:play", onPlay)
    return () => window.removeEventListener("gauntlet:play", onPlay)
  }, [snap, reverse])

  // touch-none on the button: the browser must never steal this press for
  // a scroll gesture (that path yields pointercancel and dead taps).
  return (
    <button
      ref={btnRef}
      onClick={() => {
        if (held.current || busy.current) return
        snap()
      }}
      onPointerDown={() => {
        held.current = false
        window.clearTimeout(holdTimer.current)
        holdTimer.current = window.setTimeout(() => {
          held.current = true
          if (!busy.current) reverse()
        }, HOLD_MS)
      }}
      onPointerUp={() => {
        window.clearTimeout(holdTimer.current)
        // Primary tap path (touch + mouse release); click below is only
        // the keyboard/mouse fallback — busy guard dedupes the pair.
        if (!held.current && !busy.current) snap()
      }}
      // Touch browsers fire pointercancel (not pointerup) when a gesture is
      // taken over — treat a quick cancel as the tap it almost certainly was.
      onPointerCancel={() => {
        window.clearTimeout(holdTimer.current)
        if (!held.current && !busy.current) snap()
      }}
      onPointerLeave={() => window.clearTimeout(holdTimer.current)}
      onContextMenu={(e) => e.preventDefault()}
      aria-label="Gauntlet: snap for random theme, hold to reset"
      title="Snap: random theme · Hold: reset theme"
      data-silent-tap
      className="grid h-28 w-28 cursor-pointer touch-none place-items-center transition-[transform,opacity] select-none hover:scale-105 active:scale-95"
      style={{ filter: "drop-shadow(0 6px 16px rgba(0,0,0,0.35))" }}
    >
      <canvas ref={canvasRef} width={112} height={112} className="h-28 w-28" />
    </button>
  )
}
