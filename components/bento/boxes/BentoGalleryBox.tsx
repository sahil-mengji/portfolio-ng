"use client"
import { useEffect, useId, useState } from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, LayoutGroup, motion } from "framer-motion"
import type { Transition } from "framer-motion"
import { X } from "lucide-react"
import { HomeBox } from "@/components/bento/HomeBox"
import { getLenis } from "@/lib/lenis"

// Collapsed: 3×3 grid (8 photos + folder); the bottom-corner cell
// is a folder with a 2×2 photo sub-grid. Overlay mirrors all 12.
// Dummy icon pool for the grid (cycles to fill all cells).
const DUMMY_ICONS = [
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS7u5CplwyyQzGRt5QWNYEI0Le9dXXQy4CJYbjVqiZgDQ&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS9VS9t-gIWX0kfa5NTl2w8-4EdyczrPAs-IheRUTqajQ&s=10",
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSthtsZ89obdrV1FBBVWU1Y1e16XZO-Hn6Zcp0A1vPhsA&s=10",
  "https://svgstack.com/media/img/ios-x-app-icon-b4cq638348.webp",
]
const TILES = Array.from({ length: 8 }, (_, i) => ({
  src: DUMMY_ICONS[i % DUMMY_ICONS.length],
  alt: `App icon ${i + 1}`,
}))
const FOLDER_MINI = Array.from({ length: 4 }, (_, i) => ({
  src: DUMMY_ICONS[i % DUMMY_ICONS.length],
  alt: `Folder icon ${i + 1}`,
}))

// Arch morph: tiles swoop along a ∩-style arc instead of sliding on a
// diagonal. Two tricks combine: (1) x snaps over on a very stiff spring
// while y lags behind on a soft one, and y starts ~70ms late, so each
// tile travels horizontally first, then drops — the path bows outward;
// (2) the expand y-spring is underdamped, so it overshoots slightly past
// the target and settles back, tracing a visible hump on landing.
// Expand runs ease-out flavored (expo-out crossfades, fast attack with a
// gentle settle); collapse keeps the ease-in-out treatment. Per-index
// delay cascades tiles instead of moving them as one block.
// Ease-in-out throughout, running a touch faster than the original
// pacing so the whole cascade lands sooner.
const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1]
const arcTransition = (i = 0, isExpand = false): Transition => {
  const delay = Math.min(i * 0.02, 0.1)
  const ease = EASE_IN_OUT
  if (isExpand) {
    return {
      default: { duration: 0.35, ease },
      x: { type: "spring", stiffness: 900, damping: 45, delay },
      y: { type: "spring", stiffness: 80, damping: 14, delay: delay + 0.12 },
      scale: { type: "spring", stiffness: 280, damping: 20, delay },
      opacity: { duration: 0.2, ease },
    }
  }
  return {
    default: { duration: 0.35, ease },
    x: { type: "spring", stiffness: 800, damping: 38, delay },
    y: { type: "spring", stiffness: 90, damping: 22, delay },
    scale: { type: "spring", stiffness: 260, damping: 22, delay },
    opacity: { duration: 0.2, ease },
  }
}

// Geometric arch: a wrapper-level y bump (0 → −lift → 0) superimposed on
// the layoutId morph, so the visible track bows into a ∩ instead of a
// diagonal slide. Lift varies per index for a non-uniform cascade; the
// bump starts/ends at 0 so layout measurements stay exact.
const archLift = (idx: number) => 55 + (idx % 3) * 20
const archVariants = (idx: number) => ({
  idle: { y: 0 },
  arch: { y: [0, -archLift(idx), 0] },
})
const ARCH_BUMP_TRANSITION: Transition = {
  duration: 0.4,
  ease: EASE_IN_OUT,
}
const archBumpDelay = (idx: number) => Math.min(idx * 0.02, 0.1)

export function BentoGalleryBox() {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const groupId = useId()

  useEffect(() => setMounted(true), [])

  // Fullscreen folder overlay: lock behind-page scroll like the viewer.
  useEffect(() => {
    if (!open) return
    document.body.style.overflow = "hidden"
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    return () => {
      document.body.style.overflow = ""
      getLenis()?.start()
      window.removeEventListener("keydown", onKey)
    }
  }, [open ])

  const all = [...TILES, ...FOLDER_MINI]
  // Overlay order mirrors the collapsed grid: tiles first, folder minis last.
  const overlayId = (idx: number) =>
    idx < TILES.length ? `tile-${idx}` : `mini-${idx - TILES.length}`

  return (
    <LayoutGroup id={groupId}>
    <HomeBox boxKey="gallery" outerClassName="h-full w-full" className="flex flex-col p-6">
      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4" role="img" aria-label="Photo gallery with app folder">
        {TILES.map((t, i) => (
          <motion.div
            key={t.src + t.alt}
            initial={false}
            animate={open ? "idle" : "arch"}
            variants={archVariants(i)}
            transition={{ ...ARCH_BUMP_TRANSITION, delay: archBumpDelay(i) }}
          >
            <motion.img
              src={t.src}
              alt={t.alt}
              loading="lazy"
              layoutId={`${groupId}-tile-${i}`}
              transition={arcTransition(i)}
              className="aspect-square h-auto w-full rounded-2xl object-cover"
            />
          </motion.div>
        ))}
        <motion.button
          type="button"
          layoutId={`${groupId}-folder`}
          transition={arcTransition(TILES.length)}
          aria-label="Open folder — 4 items"
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen(true)}
          title="Folder — 4 items"
          className="grid aspect-square cursor-pointer grid-cols-2 gap-2 rounded-2xl transition-transform hover:scale-[1.03] focus-visible:outline-none focus-visible:ring-2"
        >
          {FOLDER_MINI.map((t, m) => (
            <motion.div
              key={t.src + t.alt}
              initial={false}
              animate={open ? "idle" : "arch"}
              variants={archVariants(TILES.length + m)}
              transition={{
                ...ARCH_BUMP_TRANSITION,
                delay: archBumpDelay(TILES.length + m),
              }}
            >
              <motion.img
                src={t.src}
                alt={t.alt}
                loading="lazy"
                draggable={false}
                layoutId={`${groupId}-mini-${m}`}
                transition={arcTransition(TILES.length + m)}
                className="aspect-square h-auto w-full rounded-2xl object-cover pointer-events-none"
              />
            </motion.div>
          ))}
        </motion.button>
      </div>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.65, 0, 0.35, 1] }}
                  onClick={() => setOpen(false)}
                  className="fixed inset-0 z-[100] bg-black/50"
                  style={{
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                />
                <div className="pointer-events-none fixed inset-0 z-[101] flex items-start justify-center overflow-y-auto p-4 pt-20 sm:p-8 sm:pt-24">
                  {/* No scale entrance (like the image viewer): icons morph
                      via layoutId, chrome fades. */}
                  <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Folder contents"
                    className="pointer-events-auto mx-auto w-full max-w-md"
                  >
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] }}
                      className="mb-4 flex items-center justify-between text-white"
                    >
                      <span className="font-mono text-xs opacity-70" aria-live="polite">
                        {all.length} items
                      </span>
                      <button
                        type="button"
                        aria-label="Close folder"
                        onClick={() => setOpen(false)}
                        className="inline-flex size-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                      >
                        <X size={18} aria-hidden />
                      </button>
                    </motion.div>
                    <div className="grid grid-cols-3 gap-4 sm:gap-6">
                      {all.map((t, idx) => (
                        <motion.div
                          key={overlayId(idx)}
                          className="flex flex-col gap-1.5"
                          initial={{ y: 0 }}
                          animate={{ y: [0, -archLift(idx), 0] }}
                          transition={{
                            ...ARCH_BUMP_TRANSITION,
                            delay: archBumpDelay(idx),
                          }}
                        >
                          <motion.img
                            src={t.src}
                            alt={t.alt}
                            loading="lazy"
                            draggable={false}
                            layoutId={`${groupId}-${overlayId(idx)}`}
                            transition={arcTransition(idx, true)}
                            className="aspect-square h-auto w-full rounded-3xl object-cover shadow-2xl"
                          />
                          <span className="truncate text-center text-[11px] text-white/70">
                            {t.alt}
                          </span>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </HomeBox>
    </LayoutGroup>
  )
}
export default BentoGalleryBox
