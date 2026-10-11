"use client"

import React, { useEffect, useLayoutEffect, useState } from "react"
import { motion, AnimatePresence, type Variants } from "motion/react"
import { X, ArrowUpRight, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useShowcaseSheet } from "./showcase-sheet-context"

// ─── Lightbox ────────────────────────────────────────────────────────────────

function Lightbox({
  photos,
  startIndex,
  onClose,
}: {
  photos: { url: string; type?: string }[]
  startIndex: number
  onClose: () => void
}) {
  // imgSrc tracks what's actually displayed — changes imperatively after fade-out
  const [current, setCurrent] = useState(startIndex)
  const [imgSrc, setImgSrc] = useState(photos[startIndex].url)
  const imgRef = React.useRef<HTMLImageElement>(null)
  const animating = React.useRef(false)
  // Thumbnail strip auto-centering
  const thumbsRef = React.useRef<HTMLDivElement>(null)
  const thumbRefs = React.useRef<(HTMLButtonElement | null)[]>([])

  const navigate = (delta: number) => {
    setCurrent((c) => {
      const next = Math.max(0, Math.min(c + delta, photos.length - 1))
      if (next === c || animating.current) return c

      animating.current = true
      const el = imgRef.current
      if (el) {
        // Fade out → swap src → fade in (imperative, no layoutId change)
        el.style.transition = "opacity 0.12s ease-in, transform 0.12s ease-in"
        el.style.opacity = "0"
        el.style.transform = `translateX(${delta * -30}px)`
        setTimeout(() => {
          setImgSrc(photos[next].url)
          el.style.transition = "none"
          el.style.transform = `translateX(${delta * 30}px)`
          // Force reflow
          void el.offsetHeight
          el.style.transition = "opacity 0.2s ease-out, transform 0.2s ease-out"
          el.style.opacity = "1"
          el.style.transform = "translateX(0)"
          setTimeout(() => { animating.current = false }, 220)
        }, 130)
      }

      return next
    })
  }

  // Auto-scroll thumbnail strip to keep active thumb centered
  useEffect(() => {
    const container = thumbsRef.current
    const thumb = thumbRefs.current[current]
    if (!container || !thumb) return
    const containerCenter = container.offsetWidth / 2
    const thumbCenter = thumb.offsetLeft + thumb.offsetWidth / 2
    container.scrollTo({ left: thumbCenter - containerCenter, behavior: "smooth" })
  }, [current])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      if (e.key === "ArrowRight") navigate(1)
      if (e.key === "ArrowLeft") navigate(-1)
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [onClose, photos.length])

  return (
    <motion.div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      onClick={onClose}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/92" />

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 size-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="size-4" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 text-white/50 text-xs font-mono">
        {current + 1} / {photos.length}
      </div>

      {/* Image — stable layoutId so exit always animates back to the clicked thumbnail */}
      <div
        className="relative z-10 max-w-[88vw] max-h-[80vh] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        <motion.img
          ref={imgRef}
          layoutId={`photo-${photos[startIndex].url}`}
          src={imgSrc}
          alt=""
          className="max-w-full max-h-[80vh] object-contain rounded-xl shadow-2xl"
          transition={{ type: "spring", stiffness: 380, damping: 40 }}
        />
      </div>

      {/* Prev */}
      {current > 0 && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(-1) }}
          className="absolute left-4 top-1/2 z-10 -translate-y-1/2 size-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      {/* Next */}
      {current < photos.length - 1 && (
        <button
          onClick={(e) => { e.stopPropagation(); navigate(1) }}
          className="absolute right-4 top-1/2 z-10 -translate-y-1/2 size-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      {/* Thumbnail strip — active item scrolled to center */}
      <div
        ref={thumbsRef}
        className="absolute bottom-4 left-0 right-0 z-10 flex gap-1.5 px-8 overflow-x-auto no-scrollbar"
      >
        {photos.map((p, i) => (
          <button
            key={p.url + i}
            ref={(el) => { thumbRefs.current[i] = el }}
            onClick={(e) => { e.stopPropagation(); navigate(i - current) }}
            className={cn(
              "shrink-0 h-12 w-16 rounded overflow-hidden border transition-all duration-200",
              i === current ? "border-white opacity-100 scale-105" : "border-white/20 opacity-40 hover:opacity-70"
            )}
          >
            <img src={p.url} alt="" className="w-full h-full object-cover" />
          </button>
        ))}
      </div>
    </motion.div>
  )
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

const SHEET_CONTENT_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.15 + i * 0.08,
      duration: 0.6,
      ease: [0.21, 0.47, 0.32, 0.98],
    },
  }),
}

export function ShowcaseSheet() {
  const { open, data, closeSheet } = useShowcaseSheet()
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  // useLayoutEffect fires synchronously before paint — eliminates the 1-frame
  // delay between the sheet sliding and the push-wrapper animating
  useLayoutEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (lightboxIndex !== null) setLightboxIndex(null)
        else if (open) closeSheet()
      }
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [open, closeSheet, lightboxIndex])

  // Browser back closes sheet
  useEffect(() => {
    if (open) window.history.pushState({ fromSheet: true }, "")
    const handlePop = () => { if (open) closeSheet() }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [open, closeSheet])

  // Lock scroll on mobile
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (isMobile) document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  const urls = data?.url
    ? Array.isArray(data.url)
      ? data.url.filter((u) => u && u !== "#")
      : data.url !== "#"
      ? [data.url]
      : []
    : []

  const screenPhotos = (data?.photos ?? []).filter((p) => p.url && p.type !== "logo")

  return (
    <>
      {/* Fullscreen lightbox — AnimatePresence enables layout exit animation */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <Lightbox
            photos={screenPhotos}
            startIndex={lightboxIndex}
            onClose={() => setLightboxIndex(null)}
          />
        )}
      </AnimatePresence>

      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={closeSheet}
        className={cn(
          "md:hidden fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-700",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      />

      {/* Desktop dim overlay */}
      <div
        aria-hidden
        onClick={closeSheet}
        className={cn(
          "max-md:hidden fixed inset-0 z-40 cursor-pointer",
          "transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.6) 30%, rgba(0,0,0,0.4) 55%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 100%)",
          right: "min(60vw, 1100px)",
        }}
      />

      {/* Sheet Panel */}
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={data?.title ?? "Project details"}
        className={cn(
          "fixed top-0 right-0 z-50 h-full bg-background border-l border-line flex flex-col shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.3)]",
          "w-full md:w-[min(60vw,1100px)]"
        )}
        initial={{ x: "100%" }}
        animate={{ x: open ? "0%" : "100%" }}
        transition={{ 
          type: "spring", 
          stiffness: 300, 
          damping: 35, 
          mass: 1,
          restDelta: 0.01 
        }}
      >
        {/* Header */}
        <motion.div 
          className="flex items-start justify-between gap-4 border-b border-line p-6 shrink-0"
          variants={SHEET_CONTENT_VARIANTS}
          initial="hidden"
          animate={open ? "visible" : "hidden"}
          custom={0}
        >
          <div className="flex items-center gap-5 min-w-0">
            {data?.logo && (
              <div className="size-20 rounded-xl border border-line bg-muted/20 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                <img src={data.logo} alt={data?.title} className="size-14 object-contain grayscale opacity-80" />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="font-heading text-4xl font-medium text-foreground leading-tight tracking-tight truncate">
                {data?.title}
              </h2>
              {data?.categories && data.categories.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-1.5">
                  {data.categories.map((cat, i) => (
                    <span key={cat} className="text-muted-foreground text-xs uppercase tracking-widest font-medium">
                      {cat}{i < data.categories!.length - 1 && <span className="ml-2 text-line">/</span>}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <button
            id="showcase-sheet-close"
            onClick={closeSheet}
            aria-label="Close panel"
            className="shrink-0 size-10 flex items-center justify-center rounded-full border border-line bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/30 transition-all duration-300"
          >
            <X className="size-4" />
          </button>
        </motion.div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-10">

          {/* Description */}
          {data?.description && (
            <motion.div 
              className="px-6 py-6 border-b border-line"
              variants={SHEET_CONTENT_VARIANTS}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={1}
            >
              <p className="text-base text-muted-foreground leading-relaxed font-light">{data.description}</p>
            </motion.div>
          )}

          {/* Tags / Tools */}
          {((data?.tags && data.tags.length > 0) || (data?.tools && data.tools.length > 0)) && (
            <motion.div 
              className="px-6 py-6 border-b border-line space-y-4"
              variants={SHEET_CONTENT_VARIANTS}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={2}
            >
              {data?.tags && data.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold">Specialization</span>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-widest border border-line text-muted-foreground bg-muted/10 hover:bg-muted/30 transition-colors">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data?.tools && data.tools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold">Technologies</span>
                  <div className="flex flex-wrap gap-2">
                    {data.tools.map((tool) => (
                      <span key={tool} className="inline-flex items-center px-2.5 py-1 rounded text-[10px] font-mono text-muted-foreground bg-muted/20 border border-line/50">
                        {tool}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Horizontal Photo Strip */}
          {screenPhotos.length > 0 && (
            <motion.div 
              className="py-6 space-y-4"
              variants={SHEET_CONTENT_VARIANTS}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={3}
            >
              <div className="px-6 flex justify-between items-end">
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground/60 font-semibold">
                  Visual Showcase
                </p>
                <p className="text-[10px] font-mono text-muted-foreground/40">
                  {screenPhotos.length} Shots
                </p>
              </div>

              {/* Horizontal scroll strip */}
              <div className="flex gap-4 overflow-x-auto no-scrollbar px-6 pb-2">
                {screenPhotos.map((photo, i) => (
                  <button
                    key={photo.url + i}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative shrink-0 overflow-hidden rounded-2xl border border-line bg-muted/5 cursor-zoom-in shadow-sm transition-all duration-500 hover:shadow-xl hover:border-foreground/20"
                    style={{ height: "360px", width: photo.type === "mobile" ? "180px" : "520px" }}
                  >
                    {/* Shared layoutId — matches the lightbox image on open/close */}
                    <motion.img
                      layoutId={`photo-${photo.url}`}
                      src={photo.url}
                      alt={`Screenshot ${i + 1}`}
                      loading="lazy"
                      className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                    {/* Zoom hint on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-all duration-500 backdrop-blur-[0px] group-hover:backdrop-blur-[1px]">
                      <div className="size-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100">
                        <ZoomIn className="size-5 text-white" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer — Links */}
        {urls.length > 0 && (
          <motion.div 
            className="shrink-0 border-t border-line p-6 bg-background/50 backdrop-blur-md flex gap-3"
            variants={SHEET_CONTENT_VARIANTS}
            initial="hidden"
            animate={open ? "visible" : "hidden"}
            custom={4}
          >
            {urls.map((url, i) => (
              <a
                key={url + i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                id={`showcase-sheet-link-${i}`}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-xl text-sm font-medium transition-all duration-500",
                  i === 0
                    ? "bg-foreground text-background hover:bg-foreground/90 shadow-lg shadow-foreground/10 hover:shadow-foreground/20 hover:-translate-y-0.5"
                    : "border border-line bg-muted/10 text-muted-foreground hover:text-foreground hover:bg-muted/30 hover:-translate-y-0.5"
                )}
              >
                <span>{i === 0 ? "Explore Project" : url}</span>
                <ArrowUpRight className="size-4" />
              </a>
            ))}
          </motion.div>
        )}
      </motion.div>
    </>
  )
}
