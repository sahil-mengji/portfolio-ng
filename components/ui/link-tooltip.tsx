"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { EASE_OUT } from "@/lib/ease"

// Hover tooltip for links: floating card above (or below) the anchor with
// a title + URL preview. Theme-var styled, no portal needed.
export function LinkTooltip({
  href,
  title,
  preview,
  children,
  delay = 120,
}: {
  href: string
  title?: string
  preview?: string
  children: React.ReactNode
  /** ms before the tooltip appears */
  delay?: number
}) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const timer = useRef(0)
  const [open, setOpen] = useState(false)
  const [rect, setRect] = useState({ top: 0, left: 0, width: 0, bottom: 0 })

  const show = () => {
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      const r = anchorRef.current?.getBoundingClientRect()
      if (!r) return
      setRect({ top: r.top, left: r.left, width: r.width, bottom: r.bottom })
      setOpen(true)
    }, delay)
  }
  const hide = () => {
    window.clearTimeout(timer.current)
    setOpen(false)
  }

  // Tooltips are hover-only affordances: dismiss on scroll / resize / Escape.
  useEffect(() => {
    if (!open) return
    const close = () => setOpen(false)
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("scroll", close, true)
    window.addEventListener("resize", close)
    window.addEventListener("keydown", onKey)
    return () => {
      window.removeEventListener("scroll", close, true)
      window.removeEventListener("resize", close)
      window.removeEventListener("keydown", onKey)
    }
  }, [open ])

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const external = /^https?:\/\//.test(href)
  const below = rect.top < 120
  const label = title ?? href.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]

  return (
    <span
      ref={anchorRef}
      className="inline-block"
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <a
        href={href}
        {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
        className="underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
      >
        {children}
      </a>
      <AnimatePresence>
        {open && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, y: below ? -4 : 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.15, ease: EASE_OUT }}
            className="pointer-events-none fixed z-[120] max-w-[260px] rounded-xl border px-3 py-2 shadow-xl backdrop-blur"
            style={{
              top: below ? rect.bottom + 10 : undefined,
              bottom: below ? undefined : window.innerHeight - rect.top + 10,
              left: Math.max(8, Math.min(rect.left + rect.width / 2 - 130, window.innerWidth - 268)),
              background:
                "color-mix(in srgb, var(--surface, #f4f4f2) 92%, transparent)",
              borderColor:
                "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
            }}
          >
            <span className="block truncate text-xs font-semibold">{label}</span>
            {preview && (
              <span className="mt-0.5 block text-[11px] leading-snug opacity-70">
                {preview}
              </span>
            )}
            <span className="mt-0.5 block truncate font-mono text-[10px] opacity-50">
              {href}
            </span>
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  )
}
