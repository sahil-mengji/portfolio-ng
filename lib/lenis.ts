import Lenis from "lenis"

// Shared Lenis singleton: one smooth-scroll instance site-wide, with a
// helper so programmatic tweens (orbit click-to-play) run through Lenis
// instead of fighting it.
let lenis: Lenis | null = null

export function initLenis() {
  if (lenis) return () => {}
  lenis = new Lenis({ duration: 1.2, smoothWheel: true })
  let raf = 0
  const loop = (time: number) => {
    lenis?.raf(time)
    raf = requestAnimationFrame(loop)
  }
  raf = requestAnimationFrame(loop)
  return () => {
    cancelAnimationFrame(raf)
    lenis?.destroy()
    lenis = null
  }
}

export function getLenis() {
  return lenis
}

const EASE = (t: number) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2

// Animated scroll to an absolute Y. Cancelling: call cancelSmoothScroll()
// (wheel/touch handlers do this) — implemented as an immediate jump to the
// live position, which kills the tween dead with no state corruption.
export function smoothScrollTo(target: number, duration = 2.2) {
  const l = getLenis()
  if (l) {
    l.scrollTo(target, { duration, easing: EASE })
    return
  }
  window.scrollTo({ top: target, behavior: "smooth" })
}

export function cancelSmoothScroll() {
  const l = getLenis()
  if (l) l.scrollTo(window.scrollY, { immediate: true })
}
