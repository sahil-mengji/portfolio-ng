"use client"

import { useEffect, useId, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import { ChevronLeft, ChevronRight, Minus, Plus, X } from "lucide-react"
import { EASE_OUT, SPRING_LAYOUT, SPRING_PRESS } from "@/lib/ease"
import { getLenis } from "@/lib/lenis"
import { InteractionPane, type InteractionPaneHandle } from "@/components/ui/interaction-pane"
import { cn } from "@/lib/utils"

export type ViewerImage = {
  id: string
  src: string
  alt: string
  /** Intrinsic dimensions keep the thumbnail morph aspect-true. */
  width: number
  height: number
  caption?: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 4

// Morphing gallery + lightbox: thumbnails share a layout identity with the
// viewer frame, so opening an image flies it out of the grid. Inside the
// viewer: wheel / pinch to zoom (desktop + mobile), drag to pan when zoomed,
// swipe or arrows to page, Escape to close.
export function ImageViewer({
  images,
  label = "Image gallery",
  className,
}: {
  images: ViewerImage[]
  label?: string
  className?: string
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const groupId = useId()
  const image = images.find((i) => i.id === selected)

  return (
    <LayoutGroup id={groupId}>
      <section
        aria-label={label}
        className={cn("grid w-full grid-cols-2 gap-3 sm:grid-cols-3", className)}
      >
        {images.map((item) => (
          <motion.button
            key={item.id}
            type="button"
            aria-label={`Open ${item.alt}`}
            aria-haspopup="dialog"
            aria-expanded={item.id === selected}
            whileTap={{ scale: 0.98 }}
            transition={SPRING_PRESS}
            onClick={() => setSelected(item.id)}
            className="relative overflow-hidden rounded-2xl border focus-visible:outline-none focus-visible:ring-2"
            style={{
              borderColor:
                "color-mix(in srgb, var(--accent, #4f46e5) 20%, transparent)",
              background:
                "color-mix(in srgb, var(--surface, #f4f4f2) 60%, transparent)",
            }}
          >
            <motion.div layoutId={`${groupId}-${item.id}`} transition={SPRING_LAYOUT}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.src}
                alt={item.alt}
                width={item.width}
                height={item.height}
                loading="lazy"
                draggable={false}
                className="block h-auto w-full select-none"
              />
            </motion.div>
          </motion.button>
        ))}
      </section>
      <ViewerLightbox
        images={images}
        image={image}
        label={label}
        groupId={groupId}
        onClose={() => setSelected(null)}
        onNav={(dir) => {
          if (!image) return
          const at = images.indexOf(image)
          const next = images[at + dir]
          if (next) setSelected(next.id)
        }}
      />
    </LayoutGroup>
  )
}

function ViewerLightbox({
  images,
  image,
  label,
  groupId,
  onClose,
  onNav,
}: {
  images: ViewerImage[]
  image: ViewerImage | undefined
  label: string
  groupId: string
  onClose: () => void
  onNav: (dir: -1 | 1) => void
}) {
  const [mounted, setMounted] = useState(false)
  const [vScale, setVScale] = useState(1)
  const paneRef = useRef<InteractionPaneHandle>(null)
  const imgRef = useRef<HTMLImageElement>(null)
  // Drag guard: a click ending far from its pointerdown was a pan/pinch,
  // not a dismiss tap — ignore it so exploring never collapses the viewer.
  const downAt = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => setMounted(true), [])

  // Reset zoom whenever the image changes; lock body scroll while open.
  useEffect(() => {
    setVScale(1)
  }, [image?.id])

  useEffect(() => {
    if (!image) return
    document.body.style.overflow = "hidden"
    // Body lock alone doesn't stop Lenis smooth-scroll behind the viewer.
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowLeft") onNav(-1)
      if (e.key === "ArrowRight") onNav(1)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      getLenis()?.start()
      window.removeEventListener("keydown", onKey)
    }
  }, [image, onClose, onNav])

  const at = image ? images.indexOf(image) : -1

  if (!mounted) return null
  return createPortal(
    <AnimatePresence>
      {image && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE_OUT }}
            onClick={onClose}
            className="fixed inset-0 z-[100] bg-black/90"
          />
          <div className="pointer-events-none fixed inset-3 z-[101] sm:inset-6">
            <div
              role="dialog"
              aria-modal="true"
              aria-label={label}
              className="pointer-events-auto flex h-full flex-col outline-none"
              onPointerDownCapture={(e) => {
                downAt.current = { x: e.clientX, y: e.clientY }
              }}
              onClick={(e) => {
                const t = e.target as Element | null
                // Controls never dismiss.
                if (t && t.closest("button, a")) return
                // Pixel-accurate: taps inside the rendered image (not the
                // letterbox frame around it) never dismiss — they interact.
                const r = imgRef.current?.getBoundingClientRect()
                if (
                  r &&
                  r.width > 0 &&
                  e.clientX >= r.left &&
                  e.clientX <= r.right &&
                  e.clientY >= r.top &&
                  e.clientY <= r.bottom
                )
                  return
                // A click that traveled was a drag/pinch — ignore it.
                const d = downAt.current
                if (
                  d &&
                  Math.hypot(e.clientX - d.x, e.clientY - d.y) > 8
                )
                  return
                onClose()
              }}
            >
              <div className="flex items-center justify-between gap-3 pb-3 text-white">
                <span aria-live="polite" className="text-xs tabular-nums">
                  {at + 1} / {images.length}
                </span>
                <button
                  type="button"
                  aria-label="Close viewer"
                  onClick={onClose}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                >
                  <X size={18} aria-hidden />
                </button>
              </div>

              {/* Zoom stage: InteractionPane owns wheel-zoom at cursor,
                  drag-pan and pinch once zoomed; remounts per image.
                  Container-query sized so the frame fills the real stage. */}
              <InteractionPane
                ref={paneRef}
                key={image.id}
                minScale={MIN_ZOOM}
                maxScale={MAX_ZOOM}
                initialScale={1}
                onChange={(s) => setVScale(s)}
                className="relative min-h-0 flex-1 overflow-hidden rounded-lg [container-type:size]"
                contentClassName="flex h-full w-full items-center justify-center"
              >
                <motion.div
                  layoutId={`${groupId}-${image.id}`}
                  transition={SPRING_LAYOUT}
                  className="relative flex max-h-full max-w-full items-center justify-center"
                  style={{
                    aspectRatio: `${image.width} / ${image.height}`,
                    height: "100cqh",
                    maxWidth: "100cqw",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <motion.img
                    key={image.id}
                    ref={imgRef}
                    src={image.src}
                    alt={image.alt}
                    width={image.width}
                    height={image.height}
                    draggable={false}
                    initial={{ opacity: 0.4 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                    className="block h-full w-full select-none object-contain"
                  />
                </motion.div>
              </InteractionPane>

              <div className="flex items-center justify-between gap-3 pt-3 text-white">
                <button
                  type="button"
                  aria-label="Previous image"
                  disabled={at <= 0}
                  onClick={() => onNav(-1)}
                  className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                >
                  <ChevronLeft size={18} aria-hidden />
                </button>
                <div aria-live="polite" className="min-w-0 text-center text-sm">
                  {image.caption ?? image.alt}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    aria-label="Zoom out"
                    disabled={vScale <= MIN_ZOOM + 0.001}
                    onClick={() => paneRef.current?.zoomBy(1 / 1.5)}
                    className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    <Minus size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Zoom in"
                    disabled={vScale >= MAX_ZOOM - 0.001}
                    onClick={() => paneRef.current?.zoomBy(1.5)}
                    className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    <Plus size={18} aria-hidden />
                  </button>
                  <button
                    type="button"
                    aria-label="Next image"
                    disabled={at < 0 || at >= images.length - 1}
                    onClick={() => onNav(1)}
                    className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20 disabled:opacity-30"
                  >
                    <ChevronRight size={18} aria-hidden />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  )
}
