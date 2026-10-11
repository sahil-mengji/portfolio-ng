"use client"

import { useEffect, useState } from "react"
import { Text } from "@/components/ui/text"

type Head = { id: string; text: string; level: number }

// Left-side minimap for a blog article: slim horizontal lines (one per
// heading, sized + shifted by level). Hovering reveals a nested file-tree
// of the actual headings. Clicking any line or row smooth-scrolls to it.
export function BlogMinimap({ targetId }: { targetId: string }) {
  const [heads, setHeads] = useState<Head[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [open, setOpen] = useState(false)

  // Scan the article for headings once mounted; scroll-spy the active one.
  useEffect(() => {
    const root = document.getElementById(targetId)
    if (!root) return
    const els = Array.from(
      root.querySelectorAll("h1, h2, h3, h4")
    ) as HTMLElement[]
    const items = els
      .map((el, i) => {
        if (!el.id) el.id = `md-h-${i}`
        return {
          id: el.id,
          text: (el.innerText ?? "").trim().replace(/\s+/g, " "),
          level: Number(el.tagName[1]) || 2,
        }
      })
      .filter((h) => h.text.length > 0)
    setHeads(items)
    if (items.length === 0) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const en of entries) {
          if (en.isIntersecting) setActiveId(en.target.id)
        }
      },
      { rootMargin: "-15% 0px -70% 0px" }
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [targetId])

  if (heads.length === 0) return null

  const go = (id: string) => {
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  // Rail bar width shrinks + shifts right as heading level deepens.
  const barClass = (level: number) =>
    level <= 1 ? "w-10" : level === 2 ? "w-7" : level === 3 ? "w-5" : "w-3.5"

  return (
    <div
      className="fixed top-1/2 left-4 z-40 hidden -translate-y-1/2 lg:block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Minimap lines only — no pill, no background. */}
      <div
        aria-hidden={open}
        className={`flex flex-col gap-[7px] transition-opacity duration-150 ${open ? "pointer-events-none opacity-0" : "opacity-100"}`}
      >
        {heads.map((h) => {
          const active = h.id === activeId
          return (
            <button
              key={h.id}
              type="button"
              title={h.text}
              aria-label={h.text}
              onClick={() => go(h.id)}
              className={`h-1 rounded-full transition-all duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 ${barClass(h.level)}`}
              style={{
                marginLeft: (h.level - 1) * 4,
                background: active
                  ? "var(--accent, #4f46e5)"
                  : "color-mix(in srgb, var(--accent, #4f46e5) 70%, transparent)",
                transform: active ? "scaleY(1.5)" : undefined,
                boxShadow: "0 0 0 1px color-mix(in srgb, var(--background, #ffffff) 55%, transparent)",
              }}
            />
          )
        })}
      </div>

      {/* Hover tree: nested by heading size, revealed in the same place,
          sliding in from the left. No background anywhere. */}
      <div
        className={`absolute top-1/2 left-0 w-64 -translate-y-1/2 transition-all duration-200 ease-out ${
          open
            ? "pointer-events-auto translate-x-0 opacity-100"
            : "pointer-events-none -translate-x-6 opacity-0"
        }`}
      >
        <div className="max-h-[60vh] overflow-y-auto py-1">
          {heads.map((h) => {
            const active = h.id === activeId
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => go(h.id)}
                className="block w-full truncate rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-black/[0.05]"
                style={{ paddingLeft: 8 + (h.level - 1) * 14 }}
              >
                <Text.Body
                  as="span"
                  size="sm"
                  className={active ? "font-semibold" : "opacity-70"}
                >
                  {h.text}
                </Text.Body>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
