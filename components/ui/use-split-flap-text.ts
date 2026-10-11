"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { useReducedMotion } from "motion/react"

const DEFAULT_CHARSET = " ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789:.-'&"

/**
 * Split-flap text behavior (ported from the SplitFlap reference) for
 * dot-matrix boards: the returned line clatters forward character by
 * character — each position cycles through `charset` with a per-cell
 * stagger delay until it lands on its target. Only positions that differ
 * re-flip. Cycles through `messages`, holding each one for `holdMs`.
 */
export function useSplitFlapText(
  messages: string[],
  opts?: {
    charset?: string
    /** ms per charset step (one flap) */
    stepMs?: number
    /** stagger delay per character position */
    charDelayMs?: number
    /** ms each landed message stays up */
    holdMs?: number
    /** fixed line length; padded/truncated so the board never resizes */
    length?: number
  }
): string {
  const charset = opts?.charset ?? DEFAULT_CHARSET
  const stepMs = opts?.stepMs ?? 48
  const charDelayMs = opts?.charDelayMs ?? 34
  const holdMs = opts?.holdMs ?? 2600
  const reduced = useReducedMotion()

  const lines = useMemo(() => {
    const upper = messages.map((m) => m.toUpperCase())
    const len =
      opts?.length ?? Math.max(1, ...upper.map((m) => m.length))
    return upper.map((m) =>
      m
        .padEnd(len, " ")
        .slice(0, len)
        .split("")
        .map((c) => (charset.includes(c) ? c : " "))
        .join("")
    )
  }, [messages.join("\u0000"), charset, opts?.length])

  const len = lines[0]?.length ?? 1
  const [display, setDisplay] = useState(() => " ".repeat(len))
  const [msgIndex, setMsgIndex] = useState(0)
  const displayRef = useRef(display)
  const holdTimer = useRef<number | null>(null)

  // keep the ref mirror in sync (interval reads it, avoiding stale state)
  displayRef.current = display

  useEffect(() => {
    const target = lines[msgIndex % lines.length] ?? " ".repeat(len)
    if (reduced) {
      setDisplay(target)
      holdTimer.current = window.setTimeout(
        () => setMsgIndex((m) => (m + 1) % lines.length),
        holdMs
      )
      return () => {
        if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
      }
    }
    const start = Date.now()
    const iv = window.setInterval(() => {
      const now = Date.now() - start
      const cur = displayRef.current.split("")
      let allDone = true
      for (let i = 0; i < target.length; i++) {
        if (cur[i] === target[i]) continue
        // per-cell stagger (reference: delay = i * 34)
        if (now < i * charDelayMs) {
          allDone = false
          continue
        }
        const idx = charset.indexOf(cur[i])
        cur[i] = charset[(idx + 1) % charset.length]
        if (cur[i] !== target[i]) allDone = false
      }
      const next = cur.join("")
      displayRef.current = next
      setDisplay(next)
      if (allDone) {
        window.clearInterval(iv)
        holdTimer.current = window.setTimeout(
          () => setMsgIndex((m) => (m + 1) % lines.length),
          holdMs
        )
      }
    }, Math.max(stepMs, 30))
    return () => {
      window.clearInterval(iv)
      if (holdTimer.current !== null) window.clearTimeout(holdTimer.current)
    }
  }, [msgIndex, lines, charset, stepMs, charDelayMs, holdMs, reduced, len])

  return display
}

export default useSplitFlapText
