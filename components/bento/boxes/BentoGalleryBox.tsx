"use client"
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { createPortal } from "react-dom"
import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  usePresence,
  useReducedMotion,
  useTransform,
} from "framer-motion"
import type { Transition, Variants } from "framer-motion"
import { X } from "lucide-react"
import { HomeBox } from "@/components/bento/HomeBox"
import GlassSurface from "@/components/glass-surface"
import { getLenis } from "@/lib/lenis"

/* -------------------------------------------------------------------------- */
/*  Data                                                                      */
/* -------------------------------------------------------------------------- */

const TILES = [
  { src: "/algorhythm.png", alt: "Algorhythm" },
  { src: "/studentims.png", alt: "Studentims" },
  { src: "/devdao.png", alt: "DevDAO" },
]
// Extra (real) items live here. The folder button + expanded entries only
// exist when this list is non-empty — no dummies.
const EXTRA_TILES: { src: string; alt: string }[] = []
const HAS_EXTRAS = EXTRA_TILES.length > 0
// 3×3 collapsed grid = 9 cells: logos + (folder button if extras) + dotted rest.
const PLACEHOLDER_COUNT = 9 - TILES.length - (HAS_EXTRAS ? 1 : 0)
const ALL = [...TILES, ...EXTRA_TILES]

/* -------------------------------------------------------------------------- */
/*  Motion config                                                             */
/* -------------------------------------------------------------------------- */

const EASE_OUT: [number, number, number, number] = [0.32, 0.72, 0, 1]

/**
 * Curved flight paths. Layout animations in framer share ONE progress value,
 * so per-axis x/y timing can't bend a path there. Here every icon owns
 * independent x / y / scale motion values, so we give each axis its own spring:
 *   open  → x snaps ahead, y lags + overshoots slightly  (arc bows outward)
 *   close → y snaps ahead, x lags                       (arc mirrored on return)
 * All transform-only → compositor friendly.
 */
const OPEN_SPRING = {
  x: {
    type: "spring",
    stiffness: 330,
    damping: 30,
    mass: 0.9,
    restDelta: 0.4,
    restSpeed: 8,
  },
  y: {
    type: "spring",
    stiffness: 210,
    damping: 21,
    mass: 1,
    restDelta: 0.4,
    restSpeed: 8,
  },
  s: {
    type: "spring",
    stiffness: 300,
    damping: 23,
    mass: 0.9,
    restDelta: 0.002,
    restSpeed: 0.02,
  },
} as const
const CLOSE_SPRING = {
  x: {
    type: "spring",
    stiffness: 250,
    damping: 34,
    mass: 0.9,
    restDelta: 0.5,
    restSpeed: 10,
  },
  y: {
    type: "spring",
    stiffness: 380,
    damping: 36,
    mass: 0.9,
    restDelta: 0.5,
    restSpeed: 10,
  },
  s: {
    type: "spring",
    stiffness: 380,
    damping: 34,
    mass: 0.9,
    restDelta: 0.003,
    restSpeed: 0.03,
  },
} as const

// Noticeable cascade: whole group spreads over ~200ms open / ~120ms close.
const STAGGER_OPEN = 0.03
const STAGGER_CLOSE = 0.02

const PANEL_SPRING: Transition = {
  type: "spring",
  stiffness: 260,
  damping: 26,
  mass: 0.9,
}

const folderVariants: Variants = {
  rest: { scale: 1 },
  hover: {
    scale: 1.06,
    transition: { type: "spring", stiffness: 420, damping: 20 },
  },
  tap: {
    scale: 0.94,
    transition: { type: "spring", stiffness: 520, damping: 24 },
  },
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

type GetRect = (idx: number) => DOMRect | null

const deltaBetween = (src: DOMRect, dst: DOMRect) => ({
  dx: src.left + src.width / 2 - (dst.left + dst.width / 2),
  dy: src.top + src.height / 2 - (dst.top + dst.height / 2),
  s: src.width / dst.width,
})

/* -------------------------------------------------------------------------- */
/*  One flying icon                                                           */
/* -------------------------------------------------------------------------- */

function FlyIcon({
  idx,
  getSrcRect,
  reduced,
}: {
  idx: number
  getSrcRect: GetRect
  reduced: boolean
}) {
  const item = ALL[idx]
  const cellRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const scale = useMotionValue(1)
  // Starts hidden so the very first painted frame can never flash at the
  // final position before the FLIP offset is applied.
  const opacity = useMotionValue(0)
  const [isPresent, safeToRemove] = usePresence()

  useLayoutEffect(() => {
    const cell = cellRef.current
    if (!cell) return
    // Measure the (never transformed) grid cell, not the flying image.
    const dst = cell.getBoundingClientRect()
    const src = getSrcRect(idx)
    const d = src && !reduced ? deltaBetween(src, dst) : null
    const controls: { stop: () => void }[] = []
    let cancelled = false

    if (isPresent) {
      const delay = (ALL.length - 1 - idx) * STAGGER_OPEN
      if (d) {
        x.set(d.dx)
        y.set(d.dy)
        scale.set(d.s)
        opacity.set(1)
        controls.push(
          animate(x, 0, { ...OPEN_SPRING.x, delay }),
          animate(y, 0, { ...OPEN_SPRING.y, delay }),
          animate(scale, 1, { ...OPEN_SPRING.s, delay })
        )
      } else {
        controls.push(
          animate(opacity, 1, { duration: 0.25, ease: "easeOut", delay })
        )
      }
    } else {
      const delay = idx * STAGGER_CLOSE
      const run = d
        ? [
            animate(x, d.dx, { ...CLOSE_SPRING.x, delay }),
            animate(y, d.dy, { ...CLOSE_SPRING.y, delay }),
            animate(scale, d.s, { ...CLOSE_SPRING.s, delay }),
          ]
        : [animate(opacity, 0, { duration: 0.18, ease: "easeIn" })]
      controls.push(...run)
      Promise.all(run).then(() => {
        if (!cancelled) safeToRemove?.()
      })
    }

    return () => {
      cancelled = true
      controls.forEach((c) => c.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent])

  return (
    <div className="flex flex-col gap-2.5">
      <div ref={cellRef} className="relative aspect-square w-full">
        <motion.img
          src={item.src}
          alt={item.alt}
          decoding="async"
          draggable={false}
          style={{ x, y, scale, opacity, borderRadius: "28%" }}
          className="absolute inset-0 h-full w-full transform-gpu object-cover shadow-lg"
        />
      </div>
      <motion.span
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.1 } }}
        transition={{
          duration: 0.3,
          ease: "easeOut",
          delay: 0.16,
        }}
        className="truncate text-center text-sm font-medium text-white/90"
      >
        {item.alt}
      </motion.span>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Glass layer: cheap while moving, refractive once settled                  */
/* -------------------------------------------------------------------------- */

/**
 * Container morph: the glass plate starts exactly on top of the collapsed cell
 * and grows into the panel (x / y / scaleX / scaleY, each on its own spring, so
 * the corners swing and the height gets a little jelly overshoot). The plate is
 * EMPTY, so non-uniform scale can't distort any content; border-radius is
 * counter-scaled (elliptical radii) so corners stay perfectly round the whole
 * way. Everything is transform + opacity.
 *
 * GlassSurface (SVG displacement + backdrop-filter) is the most expensive
 * thing here, so while the plate moves it is a plain `backdrop-blur` plate. The
 * real GlassSurface mounts only once the springs settle, fades in over the
 * plate, and unmounts the instant closing starts.
 */
const CELL_RADIUS = 24
const PANEL_RADIUS = 36

function GlassLayer({
  getCellRect,
  reduced,
}: {
  getCellRect: () => DOMRect | null
  reduced: boolean
}) {
  const plateRef = useRef<HTMLDivElement>(null)
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useMotionValue(1)
  const sy = useMotionValue(1)
  const rad = useMotionValue(PANEL_RADIUS)
  const opacity = useMotionValue(0)
  // Displayed radius = rad; local radius = rad / scale (per axis).
  const borderRadius = useTransform(
    [rad, sx, sy] as const,
    ([r, a, b]: number[]) => `${r / a}px / ${r / b}px`
  )
  const [isPresent, safeToRemove] = usePresence()
  const [settled, setSettled] = useState(false)

  useLayoutEffect(() => {
    // The plate fills its (never transformed) parent, so the parent's rect is
    // the panel's final rect. Don't use a ref from the parent: React attaches
    // parent refs AFTER child layout effects, so it would still be null here.
    const dst = plateRef.current?.parentElement?.getBoundingClientRect()
    const src = getCellRect()
    const d =
      src && dst && !reduced
        ? {
            dx: src.left + src.width / 2 - (dst.left + dst.width / 2),
            dy: src.top + src.height / 2 - (dst.top + dst.height / 2),
            sx: src.width / dst.width,
            sy: src.height / dst.height,
          }
        : null
    const controls: { stop: () => void }[] = []
    let cancelled = false

    if (isPresent) {
      if (d) {
        x.set(d.dx)
        y.set(d.dy)
        sx.set(d.sx)
        sy.set(d.sy)
        rad.set(CELL_RADIUS)
        const run = [
          animate(opacity, 1, { duration: 0.12, ease: "easeOut" }),
          animate(x, 0, {
            type: "spring",
            stiffness: 250,
            damping: 27,
            mass: 0.9,
            restDelta: 0.4,
          }),
          animate(y, 0, {
            type: "spring",
            stiffness: 215,
            damping: 23,
            mass: 0.95,
            restDelta: 0.4,
          }),
          animate(sx, 1, {
            type: "spring",
            stiffness: 235,
            damping: 24,
            mass: 0.9,
            restDelta: 0.001,
          }),
          animate(sy, 1, {
            type: "spring",
            stiffness: 200,
            damping: 19,
            mass: 0.95,
            restDelta: 0.001,
          }),
          animate(rad, PANEL_RADIUS, { duration: 0.5, ease: EASE_OUT }),
        ]
        controls.push(...run)
        Promise.all(run).then(() => {
          if (!cancelled) setSettled(true)
        })
      } else {
        controls.push(animate(opacity, 1, { duration: 0.2 }))
        const t = setTimeout(() => !cancelled && setSettled(true), 220)
        controls.push({ stop: () => clearTimeout(t) })
      }
    } else {
      setSettled(false)
      const run = d
        ? [
            animate(x, d.dx, {
              type: "spring",
              stiffness: 300,
              damping: 34,
              mass: 0.9,
              restDelta: 0.5,
            }),
            animate(y, d.dy, {
              type: "spring",
              stiffness: 340,
              damping: 34,
              mass: 0.9,
              restDelta: 0.5,
            }),
            animate(sx, d.sx, {
              type: "spring",
              stiffness: 320,
              damping: 33,
              mass: 0.9,
              restDelta: 0.002,
            }),
            animate(sy, d.sy, {
              type: "spring",
              stiffness: 340,
              damping: 33,
              mass: 0.9,
              restDelta: 0.002,
            }),
            animate(rad, CELL_RADIUS, { duration: 0.4, ease: EASE_OUT }),
            // fade only at the very end, once the plate sits on the cell again
            animate(opacity, 0, { duration: 0.1, delay: 0.32 }),
          ]
        : [animate(opacity, 0, { duration: 0.18, ease: "easeIn" })]
      controls.push(...run)
      Promise.all(run).then(() => {
        if (!cancelled) safeToRemove?.()
      })
    }

    return () => {
      cancelled = true
      controls.forEach((c) => c.stop())
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPresent])

  return (
    <motion.div
      ref={plateRef}
      aria-hidden
      className="absolute inset-0 transform-gpu"
      style={{ x, y, scaleX: sx, scaleY: sy, opacity, borderRadius }}
    >
      <motion.div
        className="absolute inset-0 border border-border/40 bg-card/85 shadow-2xl"
        style={{ borderRadius: "inherit" }}
      />
      {settled && isPresent && (
        <motion.div
          className="absolute inset-0 overflow-hidden"
          style={{ borderRadius: PANEL_RADIUS }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
        >
          <GlassSurface
            width="100%"
            height="100%"
            borderRadius={PANEL_RADIUS}
            backgroundOpacity={0.12}
            className="h-full w-full"
          />
        </motion.div>
      )}
    </motion.div>
  )
}

/* -------------------------------------------------------------------------- */
/*  Overlay                                                                   */
/* -------------------------------------------------------------------------- */

function FolderOverlay({
  onClose,
  getSrcRect,
  getCellRect,
  reduced,
}: {
  onClose: () => void
  getSrcRect: GetRect
  getCellRect: () => DOMRect | null
  reduced: boolean
}) {
  const dialogRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus({ preventScroll: true })
    const trap = (event: KeyboardEvent) => {
      if (event.key !== "Tab") return
      const items = [
        ...(dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex="0"]'
        ) ?? []),
      ]
      const first = items[0],
        last = items[items.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener("keydown", trap)
    return () => document.removeEventListener("keydown", trap)
  }, [])

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={onClose}
        // blur-sm: a big blur radius on a fading full-screen layer is costly.
        className="fixed inset-0 z-[100] bg-black/70"
      />
      <div className="pointer-events-none fixed inset-0 z-[101] flex items-start justify-center overflow-y-auto p-4 pt-20 sm:p-8 sm:pt-24">
        <div
          ref={dialogRef}
          role="dialog"
          aria-modal="true"
          aria-label="Products shipped"
          className="pointer-events-auto relative mx-auto w-full max-w-2xl"
        >
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6, transition: { duration: 0.15 } }}
            transition={{ duration: 0.35, ease: EASE_OUT, delay: 0.05 }}
            className="mb-3 flex items-center justify-between px-1"
          >
            <h2 className="text-lg font-semibold tracking-tight text-white">
              Products shipped
            </h2>
            <button
              ref={closeRef}
              type="button"
              aria-label="Close folder"
              onClick={onClose}
              className="inline-flex size-10 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white backdrop-blur-md transition-colors hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
            >
              <X size={18} aria-hidden />
            </button>
          </motion.div>

          {/* The dialog itself never transforms, so FlyIcon can measure real
              layout positions. Only the glass plate behind it scales. */}
          <div className="relative w-full">
            <GlassLayer getCellRect={getCellRect} reduced={reduced} />
            <div className="relative grid grid-cols-4 gap-8 p-10 sm:gap-10 sm:p-12">
              {ALL.map((_, idx) => (
                <FlyIcon
                  key={idx}
                  idx={idx}
                  getSrcRect={getSrcRect}
                  reduced={reduced}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

/* -------------------------------------------------------------------------- */
/*  Collapsed box                                                             */
/* -------------------------------------------------------------------------- */

export function BentoGalleryBox() {
  const reduced = !!useReducedMotion()
  const [open, setOpen] = useState(false)
  // Source icons stay hidden until the overlay's exit flight has landed.
  const [sourcesHidden, setSourcesHidden] = useState(false)
  const [mounted, setMounted] = useState(false)
  const srcRefs = useRef<(HTMLElement | null)[]>([])
  const folderBtnRef = useRef<HTMLButtonElement>(null)
  const cellRef = useRef<HTMLDivElement>(null)
  const getCellRect = useCallback(
    () => cellRef.current?.getBoundingClientRect() ?? null,
    []
  )

  useEffect(() => setMounted(true), [])

  const getSrcRect = useCallback<GetRect>(
    (idx) => srcRefs.current[idx]?.getBoundingClientRect() ?? null,
    []
  )
  const setSrcRef = (idx: number) => (el: HTMLElement | null) => {
    srcRefs.current[idx] = el
  }

  const openFolder = () => {
    setSourcesHidden(true)
    setOpen(true)
  }
  const closeFolder = useCallback(() => setOpen(false), [])

  // Scroll lock (without layout shift) + Esc + focus restore.
  useEffect(() => {
    if (!open) return
    const sbw = window.innerWidth - document.documentElement.clientWidth
    const prevOverflow = document.body.style.overflow
    const prevPad = document.body.style.paddingRight
    document.body.style.overflow = "hidden"
    if (sbw > 0) document.body.style.paddingRight = `${sbw}px`
    getLenis()?.stop()
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    window.addEventListener("keydown", onKey)
    const btn = folderBtnRef.current ?? cellRef.current
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.style.paddingRight = prevPad
      getLenis()?.start()
      window.removeEventListener("keydown", onKey)
      btn?.focus({ preventScroll: true })
    }
  }, [open])

  const intro = (i: number) =>
    reduced
      ? {}
      : {
          initial: { opacity: 0, y: 18, scale: 0.9 },
          animate: { opacity: 1, y: 0, scale: 1 },
          transition: {
            type: "spring" as const,
            stiffness: 280,
            damping: 24,
            delay: Math.min(i * 0.05, 0.3),
          },
        }

  return (
    <HomeBox
      boxKey="gallery"
      transparent
      outerClassName="h-full w-full"
      className="flex flex-col p-0"
    >
      {/* Static glass cell. No transform/layout animation here (that would
          force the backdrop-filter to re-rasterise every frame) — only a
          cheap opacity fade so it disappears behind the expanded view.
          Opacity keeps layout/rects measurable for the FLIP flight. */}
      <motion.div
        ref={cellRef}
        role="button"
        tabIndex={0}
        aria-label="Open products gallery"
        aria-haspopup="dialog"
        aria-expanded={open}
        onKeyDown={(event) => {
          if (
            event.target === event.currentTarget &&
            (event.key === "Enter" || event.key === " ")
          ) {
            event.preventDefault()
            openFolder()
          }
        }}
        className="h-full w-full flex-1 cursor-pointer overflow-hidden"
        style={{ borderRadius: CELL_RADIUS }}
        initial={false}
        animate={{ opacity: open ? 0 : 1 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={() => {
          if (!open) openFolder()
        }}
      >
        <GlassSurface
          className="h-full w-full"
          width="100%"
          height="100%"
          borderRadius={CELL_RADIUS}
          backgroundOpacity={0.24}
          blur={8}
          distortionScale={-70}
          redOffset={0}
          greenOffset={3}
          blueOffset={6}
        >
          <div
            className="grid min-h-0 w-full flex-1 grid-cols-3 gap-6 p-6"
            aria-label="Products gallery"
          >
            {TILES.map((t, i) => (
              <motion.div
                key={i}
                className="relative z-10 aspect-square cursor-pointer"
                {...intro(i)}
              >
                <img
                  ref={setSrcRef(i)}
                  src={t.src}
                  alt={t.alt}
                  decoding="async"
                  draggable={false}
                  className="absolute inset-0 h-full w-full object-cover"
                  style={{
                    borderRadius: "27%",
                    opacity: sourcesHidden ? 0 : 1,
                  }}
                />
              </motion.div>
            ))}

            {/* Empty slots: static dotted squircles instead of pictures. */}
            {Array.from({ length: PLACEHOLDER_COUNT }, (_, p) => (
              <div
                key={`placeholder-${p}`}
                aria-hidden
                className="relative z-10 aspect-square bg-white/10 opacity-5"
                style={{
                  borderRadius: "27%",
                  border: "2px dashed var(--card-foreground)",
                }}
              />
            ))}

            {/* Folder: a "+N" count, only when extra items exist. */}
            {HAS_EXTRAS && (
              <motion.div
                className="relative z-10 aspect-square"
                {...intro(TILES.length + PLACEHOLDER_COUNT)}
              >
                <motion.button
                  ref={folderBtnRef}
                  type="button"
                  aria-label={`Open folder — ${EXTRA_TILES.length} items`}
                  aria-haspopup="dialog"
                  aria-expanded={open}
                  onClick={openFolder}
                  initial="rest"
                  animate="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="absolute inset-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:outline-none"
                  style={{ borderRadius: "24%" }}
                >
                  <motion.span
                    aria-hidden
                    variants={folderVariants}
                    className="absolute inset-0 flex items-center justify-center border border-white/10 bg-white/10"
                    style={{ borderRadius: "24%" }}
                  >
                    <span className="text-2xl font-bold tracking-tight text-white tabular-nums">
                      +{EXTRA_TILES.length}
                    </span>
                  </motion.span>
                </motion.button>
              </motion.div>
            )}
          </div>
        </GlassSurface>
      </motion.div>

      {mounted &&
        createPortal(
          <AnimatePresence onExitComplete={() => setSourcesHidden(false)}>
            {open && (
              <FolderOverlay
                key="folder-overlay"
                onClose={closeFolder}
                getSrcRect={getSrcRect}
                getCellRect={getCellRect}
                reduced={reduced}
              />
            )}
          </AnimatePresence>,
          document.body
        )}
    </HomeBox>
  )
}
export default BentoGalleryBox
