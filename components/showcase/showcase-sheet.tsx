"use client"

import React, { useEffect, useLayoutEffect, useState } from "react"
import { motion, AnimatePresence, type Variants } from "motion/react"
import {
  X,
  ArrowUpRight,
  ZoomIn,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LaptopMockupCard } from "@/components/laptop-mockup-card"
import { PhoneMockupCard } from "@/components/phone-mockup-card"
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
          setTimeout(() => {
            animating.current = false
          }, 220)
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
    container.scrollTo({
      left: thumbCenter - containerCenter,
      behavior: "smooth",
    })
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
        className="absolute top-4 right-4 z-10 flex size-9 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
      >
        <X className="size-4" />
      </button>

      {/* Counter */}
      <div className="absolute top-4 left-1/2 z-10 -translate-x-1/2 font-mono text-xs text-white/50">
        {current + 1} / {photos.length}
      </div>

      {/* Image — device mockup per shot type (laptop / phone), raw
          frame otherwise. layoutId stays on the inner img so open/close
          always morphs back to the clicked thumbnail. */}
      <div
        className="relative z-10 flex max-h-[80vh] max-w-[88vw] items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {photos[current]?.type === "mobile" ? (
          <PhoneMockupCard className="shrink-0">
            <motion.img
              ref={imgRef}
              layoutId={`photo-${photos[startIndex].url}`}
              src={imgSrc}
              alt=""
              className="h-full w-full object-cover object-top"
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
            />
          </PhoneMockupCard>
        ) : photos[current]?.type === "desktop" ||
          photos[current]?.type === "web" ? (
          <LaptopMockupCard className="shrink-0">
            <motion.img
              ref={imgRef}
              layoutId={`photo-${photos[startIndex].url}`}
              src={imgSrc}
              alt=""
              className="h-full w-full object-cover object-top"
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
            />
          </LaptopMockupCard>
        ) : (
          <motion.img
            ref={imgRef}
            layoutId={`photo-${photos[startIndex].url}`}
            src={imgSrc}
            alt=""
            className="max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl"
            transition={{ type: "spring", stiffness: 380, damping: 40 }}
          />
        )}
      </div>

      {/* Prev */}
      {current > 0 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(-1)
          }}
          className="absolute top-1/2 left-4 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronLeft className="size-5" />
        </button>
      )}

      {/* Next */}
      {current < photos.length - 1 && (
        <button
          onClick={(e) => {
            e.stopPropagation()
            navigate(1)
          }}
          className="absolute top-1/2 right-4 z-10 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <ChevronRight className="size-5" />
        </button>
      )}

      {/* Thumbnail strip — active item scrolled to center */}
      <div
        ref={thumbsRef}
        className="absolute right-0 bottom-4 left-0 z-10 no-scrollbar flex gap-1.5 overflow-x-auto px-8"
      >
        {photos.map((p, i) => (
          <button
            key={p.url + i}
            ref={(el) => {
              thumbRefs.current[i] = el
            }}
            onClick={(e) => {
              e.stopPropagation()
              navigate(i - current)
            }}
            className={cn(
              "h-12 w-16 shrink-0 overflow-hidden rounded border transition-all duration-200",
              i === current
                ? "scale-105 border-white opacity-100"
                : "border-white/20 opacity-40 hover:opacity-70"
            )}
          >
            <img src={p.url} alt="" className="h-full w-full object-cover" />
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
    const handlePop = () => {
      if (open) closeSheet()
    }
    window.addEventListener("popstate", handlePop)
    return () => window.removeEventListener("popstate", handlePop)
  }, [open, closeSheet])

  // Lock scroll on mobile
  useEffect(() => {
    const isMobile = window.matchMedia("(max-width: 767px)").matches
    if (isMobile) document.body.style.overflow = open ? "hidden" : ""
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  const urls = data?.url
    ? Array.isArray(data.url)
      ? data.url.filter((u) => u && u !== "#")
      : data.url !== "#"
        ? [data.url]
        : []
    : []

  const screenPhotos = (data?.photos ?? []).filter(
    (p) => p.url && p.type !== "logo"
  )

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
          "fixed inset-0 z-40 bg-background/70 backdrop-blur-sm transition-opacity duration-700 md:hidden",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        )}
      />

      {/* Desktop dim overlay */}
      <div
        aria-hidden
        onClick={closeSheet}
        className={cn(
          "fixed inset-0 z-40 cursor-pointer max-md:hidden",
          "transition-opacity duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
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
          "fixed top-0 right-0 z-50 flex h-full flex-col border-l border-line bg-background shadow-[-20px_0_50px_-10px_rgba(0,0,0,0.3)]",
          "w-full md:w-[min(60vw,1100px)]"
        )}
        initial={{ x: "100%" }}
        animate={{ x: open ? "0%" : "100%" }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 35,
          mass: 1,
          restDelta: 0.01,
        }}
      >
        {/* Header */}
        <motion.div
          className="flex shrink-0 items-start justify-between gap-4 border-b border-line p-6"
          variants={SHEET_CONTENT_VARIANTS}
          initial="hidden"
          animate={open ? "visible" : "hidden"}
          custom={0}
        >
          <div className="flex min-w-0 items-center gap-5">
            {data?.logo && (
              <div className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-line bg-muted/20 shadow-sm">
                <img
                  src={data.logo}
                  alt={data?.title}
                  className="size-14 object-contain opacity-80 grayscale"
                />
              </div>
            )}
            <div className="min-w-0">
              <h2 className="truncate font-heading text-4xl leading-tight font-medium tracking-tight text-foreground">
                {data?.title}
              </h2>
              {data?.categories && data.categories.length > 0 && (
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {data.categories.map((cat, i) => (
                    <span
                      key={cat}
                      className="text-xs font-medium tracking-widest text-muted-foreground uppercase"
                    >
                      {cat}
                      {i < data.categories!.length - 1 && (
                        <span className="ml-2 text-line">/</span>
                      )}
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
            className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line bg-muted/10 text-muted-foreground transition-all duration-300 hover:bg-muted/30 hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        </motion.div>

        {/* Scrollable Content */}
        <div className="no-scrollbar flex-1 overflow-y-auto pb-10">
          {/* Description */}
          {data?.description && (
            <motion.div
              className="border-b border-line px-6 py-6"
              variants={SHEET_CONTENT_VARIANTS}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={1}
            >
              <p className="text-base leading-relaxed font-light text-muted-foreground">
                {data.description}
              </p>
            </motion.div>
          )}

          {/* Tags / Tools */}
          {((data?.tags && data.tags.length > 0) ||
            (data?.tools && data.tools.length > 0)) && (
            <motion.div
              className="space-y-4 border-b border-line px-6 py-6"
              variants={SHEET_CONTENT_VARIANTS}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={2}
            >
              {data?.tags && data.tags.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                    Specialization
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-line bg-muted/10 px-3 py-1 text-[10px] font-medium tracking-widest text-muted-foreground uppercase transition-colors hover:bg-muted/30"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              {data?.tools && data.tools.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                    Technologies
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {data.tools.map((tool) => (
                      <span
                        key={tool}
                        className="inline-flex items-center rounded border border-line/50 bg-muted/20 px-2.5 py-1 font-mono text-[10px] text-muted-foreground"
                      >
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
              className="space-y-4 py-6"
              variants={SHEET_CONTENT_VARIANTS}
              initial="hidden"
              animate={open ? "visible" : "hidden"}
              custom={3}
            >
              <div className="flex items-end justify-between px-6">
                <p className="text-[10px] font-semibold tracking-[0.2em] text-muted-foreground/60 uppercase">
                  Visual Showcase
                </p>
                <p className="font-mono text-[10px] text-muted-foreground/40">
                  {screenPhotos.length} Shots
                </p>
              </div>

              {/* Horizontal scroll strip */}
              <div className="no-scrollbar flex gap-4 overflow-x-auto px-6 pb-2">
                {screenPhotos.map((photo, i) => (
                  <button
                    key={photo.url + i}
                    onClick={() => setLightboxIndex(i)}
                    className="group relative flex shrink-0 cursor-zoom-in items-center justify-center overflow-hidden rounded-2xl border border-line bg-muted/5 shadow-sm transition-all duration-500 hover:border-foreground/20 hover:shadow-xl"
                    style={{
                      height: "360px",
                      width: photo.type === "mobile" ? "180px" : "520px",
                    }}
                  >
                    {/* Device mockup per shot type; layoutId stays on the
                        inner img so it morphs into the lightbox */}
                    {photo.type === "mobile" ? (
                      <div className="shrink-0 scale-[.7]">
                        <PhoneMockupCard>
                          <motion.img
                            layoutId={`photo-${photo.url}`}
                            src={photo.url}
                            alt={`Screenshot ${i + 1}`}
                            loading="lazy"
                            className="h-full w-full object-cover object-top"
                            transition={{
                              type: "spring",
                              stiffness: 300,
                              damping: 30,
                            }}
                          />
                        </PhoneMockupCard>
                      </div>
                    ) : photo.type === "desktop" || photo.type === "web" ? (
                      <LaptopMockupCard className="shrink-0">
                        <motion.img
                          layoutId={`photo-${photo.url}`}
                          src={photo.url}
                          alt={`Screenshot ${i + 1}`}
                          loading="lazy"
                          className="h-full w-full object-cover object-top"
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      </LaptopMockupCard>
                    ) : (
                      /* Shared layoutId — matches the lightbox image on open/close */
                      <motion.img
                        layoutId={`photo-${photo.url}`}
                        src={photo.url}
                        alt={`Screenshot ${i + 1}`}
                        loading="lazy"
                        className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-[1.02]"
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 30,
                        }}
                      />
                    )}
                    {/* Zoom hint on hover */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/0 backdrop-blur-[0px] transition-all duration-500 group-hover:bg-black/30 group-hover:backdrop-blur-[1px]">
                      <div className="flex size-12 scale-50 items-center justify-center rounded-full border border-white/20 bg-white/10 opacity-0 backdrop-blur-md transition-all duration-500 group-hover:scale-100 group-hover:opacity-100">
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
            className="flex shrink-0 gap-3 border-t border-line bg-background/50 p-6 backdrop-blur-md"
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
                  "flex flex-1 items-center justify-center gap-2.5 rounded-xl px-6 py-4 text-sm font-medium transition-all duration-500",
                  i === 0
                    ? "bg-foreground text-background shadow-lg shadow-foreground/10 hover:-translate-y-0.5 hover:bg-foreground/90 hover:shadow-foreground/20"
                    : "border border-line bg-muted/10 text-muted-foreground hover:-translate-y-0.5 hover:bg-muted/30 hover:text-foreground"
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
