"use client"

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react"
import { cn } from "@/lib/utils"

export type InteractionPaneHandle = {
  /** Zoom by a factor around the layer center (or given screen point). */
  zoomBy: (factor: number, cx?: number, cy?: number) => void
  /** Back to the initial scale + origin. */
  reset: () => void
}

// Pan/zoom workspace for desktop + mobile (after J. Kloosterman's
// InteractionPane): wheel zooms anchored at the cursor, drag pans, double
// click steps in/out, and on touch one finger pans while two fingers pinch
// (zoom + translate simultaneously). Screen = offset + scale * content, so
// zooming keeps the point under the mouse glued in place.
export const InteractionPane = forwardRef<
  InteractionPaneHandle,
  {
    children: React.ReactNode
    className?: string
    contentClassName?: string
    style?: React.CSSProperties
    minScale?: number
    maxScale?: number
    initialScale?: number
    onChange?: (scale: number, offset: { x: number; y: number }) => void
  }
>(function InteractionPane(
  {
    children,
    className,
    contentClassName,
    style,
    minScale = 0.25,
    maxScale = 4,
    initialScale = 1,
    onChange,
  },
  ref
) {
  const layerRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(initialScale)
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const state = useRef({ scale: initialScale, offset: { x: 0, y: 0 } })
  const pointers = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ dist: number; scale: number; mid: { x: number; y: number } } | null>(null)
  const panFrom = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null)

  const commit = (nextScale: number, nextOffset: { x: number; y: number }) => {
    const s = Math.max(minScale, Math.min(maxScale, nextScale))
    // At minimum zoom there is nothing to pan to — recenter so the
    // content can never get lost off-stage when zooming back out.
    const o = s <= minScale + 1e-3 ? { x: 0, y: 0 } : nextOffset
    state.current = { scale: s, offset: o }
    setScale(s)
    setOffset(o)
    onChange?.(s, o)
  }

  // Zoom anchored at a screen point: offset' = mouse - (mouse - offset) * (s'/s).
  const zoomAt = (screenX: number, screenY: number, factor: number) => {
    const layer = layerRef.current
    if (!layer) return
    const r = layer.getBoundingClientRect()
    const mx = screenX - r.left
    const my = screenY - r.top
    const { scale: s, offset: o } = state.current
    const ns = Math.max(minScale, Math.min(maxScale, s * factor))
    const k = ns / s
    commit(ns, { x: mx - (mx - o.x) * k, y: my - (my - o.y) * k })
  }

  // Non-passive wheel so page scroll doesn't fight the zoom.
  useEffect(() => {
    const layer = layerRef.current
    if (!layer) return
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      zoomAt(e.clientX, e.clientY, Math.exp(-e.deltaY * 0.0018))
    }
    layer.addEventListener("wheel", onWheel, { passive: false })
    return () => layer.removeEventListener("wheel", onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minScale, maxScale])

  const onPointerDown = (e: React.PointerEvent) => {
    layerRef.current?.setPointerCapture?.(e.pointerId)
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pointers.current.size === 1) {
      const o = state.current.offset
      panFrom.current = { x: e.clientX, y: e.clientY, ox: o.x, oy: o.y }
    } else if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        scale: state.current.scale,
        mid: { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
      }
      panFrom.current = null
    }
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    // Pinch: zoom around the moving midpoint + translate by its delta.
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()]
      const p = pinch.current
      if (!p || p.dist <= 0 || !layerRef.current) return
      const dist = Math.hypot(a.x - b.x, a.y - b.y)
      const mid = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 }
      const r = layerRef.current.getBoundingClientRect()
      const toLocal = (pt: { x: number; y: number }) => ({ x: pt.x - r.left, y: pt.y - r.top })
      const m0 = toLocal(p.mid)
      const m1 = toLocal(mid)
      const { offset: o } = state.current
      const ns = Math.max(minScale, Math.min(maxScale, p.scale * (dist / p.dist)))
      const k = ns / state.current.scale
      // Anchor at previous midpoint, then carry by the midpoint delta.
      const anchored = { x: m0.x - (m0.x - o.x) * k, y: m0.y - (m0.y - o.y) * k }
      commit(ns, { x: anchored.x + (m1.x - m0.x), y: anchored.y + (m1.y - m0.y) })
      return
    }
    const f = panFrom.current
    if (!f) return
    commit(state.current.scale, {
      x: f.ox + (e.clientX - f.x),
      y: f.oy + (e.clientY - f.y),
    })
  }

  const endPointer = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId)
    if (pointers.current.size < 2) pinch.current = null
    if (pointers.current.size === 1) {
      const [p] = [...pointers.current.values()]
      const o = state.current.offset
      panFrom.current = { x: p.x, y: p.y, ox: o.x, oy: o.y }
    } else {
      panFrom.current = null
    }
  }

  useImperativeHandle(ref, () => ({
    zoomBy: (factor: number, cx?: number, cy?: number) => {
      const layer = layerRef.current
      if (!layer) return
      const r = layer.getBoundingClientRect()
      zoomAt(
        cx ?? r.left + r.width / 2,
        cy ?? r.top + r.height / 2,
        factor
      )
    },
    reset: () => commit(initialScale, { x: 0, y: 0 }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [minScale, maxScale, initialScale])

  return (
    <div
      ref={layerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endPointer}
      onPointerCancel={endPointer}
      onDoubleClick={(e) => {
        const s = Math.max(state.current.scale, 0.01)
        zoomAt(e.clientX, e.clientY, s < 1.75 ? 2 / s : 1 / s)
      }}
      className={cn("relative overflow-hidden", className)}
      style={{ touchAction: "none", cursor: "grab", ...style }}
    >
      <div
        className={cn("absolute top-0 left-0", contentClassName)}
        style={{
          transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
          transformOrigin: "0 0",
        }}
      >
        {children}
      </div>
    </div>
  )
})
