"use client"
import { useEffect, useRef, useState } from "react"
import { OrbitCard } from "@/components/orbit-card"
import { smoothScrollTo, cancelSmoothScroll } from "@/lib/lenis"
import { playTap, playFlip } from "@/lib/sound"

// OrbitSpread — two phases driven by scroll:
// Phase 0 (top of runway): deck-style spread — 7 copies of the card with
// horizontal overlap, progressive fan + arc, cascade z-order. Hover a card:
// it lifts while neighbors part into two pinched decks, whole deck swinging
// to lean the pick toward center. Stacking order never changes.
// Phase 1 (scrolled): each card flips (staggered, showing the jack back)
// and scatters to its own place around the screen. Scroll back to return.
// Fit-scale (measured, transform-based) uniformly shrinks everything —
// proportions preserved — so nothing ever trims.
const COUNT = 7
const MID = (COUNT - 1) / 2
// Hot-card vertical lift (scaled by per-card hover spring 0..1).
const LIFT = -90
// Hover spring: base stiffness (minus falloff per step from the pick, so
// the deck ripples outward) + damping (underdamped: dip, lift, overshoot).
const HOVER_K = 190
const HOVER_KFALLOFF = 20
const HOVER_C = 15
// Gap opened around the pick, per side.
const SPLIT = 140
// Within-deck tightening, per card step.
const PINCH = 32
// Whole-deck swing toward the pick's side: px shifted per step the hovered
// card sits from center, plus degrees of tilt (top tips toward center).
const SWING = 26
const TILT = 1.2
// Progressive fan: base angle per step + extra per step of distance, so
// edge cards lean disproportionately more (true arc, not a straight fan).
// Rest vs hovered base.
const FAN = 3
const FAN_HOT = 3.5
const FAN_GROW = 0.7
// Progressive arc cascade: base drop per step + extra per step of distance,
// so edge cards sit disproportionately lower (true arc curve).
const ARC = 18
const ARC_GROW = 6
// Layout budget (px, pre-scale): row 2060 + hover split + deck swing + fan.
const ROW_W = 2780
// Layout height (px, pre-scale): card 616 + arc/tilt headroom.
const ROW_H = 920
const SCALE_CAP = 0.62
// Scroll runway height (viewport heights) for the flip-scatter sequence.
// The sequence completes at HOLD_AT of the runway, then holds the final
// spread-out pose for the remaining scroll.
const RUNWAY_VH = 340
const HOLD_AT = 0.55
// After HOLD_AT the final pose holds for a brief beat until PARA_AT;
// beyond that cards drift upward continuously for the rest of the runway.
const PARA_AT = 0.62
// Scatter targets as fractions of container width / viewport height.
// Left-top tucks under the hero; left-bottom pushes further out; both
// right-top (biggest on the right, pulled inward) and right-bottom step
// right of the mid-right card they overlap. Nothing touches the tagline.
const SCATTER_FX = [-0.24, -0.35, -0.44, 0, 0.27, 0.22, 0.4]
const SCATTER_FY = [-0.24, 0.28, -0.06, 0, -0.22, 0.32, 0.02]
// Final scattered size ladder: center card full-size, shrinking by this
// much per step toward the screen sides. Final rotation is always 0
// (cards stand straight).

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const smooth = (t: number) => t * t * (3 - 2 * t)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function OrbitSpread() {
  const [hot, setHot] = useState<number | null>(null)
  // Focused (clicked) card takes the middle scatter slot (scatter hero);
  // the deck itself never reshuffles — cards fly direct to their targets.
  // Default focus reproduces the original layout exactly.
  const [focus, setFocus] = useState(MID)
  const slot = (i: number) => (((i - focus + MID) % COUNT) + COUNT) % COUNT
  // Click a card: it becomes the hero AND the runway slow-plays to just
  // past the final flip landing (prog 0.55), so the tween ends in sync
  // with the cards — never coasting after they finish. Wheel/touch cancels
  // it and hands control straight back; clicking replays from anywhere.
  const play = () => {
    const tall = tallRef.current
    if (!tall) return
    const top = tall.getBoundingClientRect().top + window.scrollY
    const total = tall.offsetHeight - window.innerHeight
    const target = top + total * 0.55
    if (Math.abs(target - window.scrollY) < 2) return
    const cancel = () => {
      cancelSmoothScroll()
      window.removeEventListener("wheel", cancel)
      window.removeEventListener("touchmove", cancel)
    }
    window.addEventListener("wheel", cancel, { passive: true })
    window.addEventListener("touchmove", cancel, { passive: true })
    window.setTimeout(() => {
      window.removeEventListener("wheel", cancel)
      window.removeEventListener("touchmove", cancel)
    }, 2500)
    smoothScrollTo(target, 3.2)
  }
  const [scale, setScale] = useState(SCALE_CAP)
  const [prog, setProg] = useState(0)
  // Scroll-velocity trail (px, smoothed): fast scrolls smear the deck a
  // touch, slow scrolls stay crisp. Zero at rest.
  const [trail, setTrail] = useState(0)
  const lastP = useRef(0)
  const trailR = useRef(0)
  // Hover springs live in refs (per-card amount + velocity, cursor tilt
  // target + smoothed); hTick re-renders while anything is in motion.
  const hAmtR = useRef<number[]>(Array(COUNT).fill(0))
  const hVelR = useRef<number[]>(Array(COUNT).fill(0))
  const tiltTR = useRef({ x: 0, y: 0 })
  const tiltCR = useRef({ x: 0, y: 0 })
  // Smoothed split: per-card offsets + magnitude glide toward their
  // targets in the loop, so neighbor parting never jumps on unhover or
  // when the pick changes sides mid-handoff.
  const splitCR = useRef<number[]>(Array(COUNT).fill(0))
  const splitAmtCR = useRef(0)
  // Smoothed deck-swing direction (-3..3): lerps between picks so the
  // whole-deck lean never snaps on unhover or hover handoff.
  const swingCR = useRef(0)
  const [hTick, setHTick] = useState(0)
  void hTick
  const [vh, setVh] = useState(800)
  const tallRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  // Flip-SFX edge tracking: fire as each turn lands (≈0.85), both scroll
  // directions (reverse = darker). Cooldown stops machine-gun replays,
  // low mark re-arms after scrub-back.
  const flipT = useRef<number[]>(Array(COUNT).fill(0))
  const flipCool = useRef<number[]>(Array(COUNT).fill(0))

  useEffect(() => {
    let raf = 0
    const update = () => {
      raf = 0
      const tall = tallRef.current
      if (tall) {
        const rect = tall.getBoundingClientRect()
        const total = rect.height - window.innerHeight
        const p = clamp01(total > 0 ? -rect.top / total : 0)
        setProg(p)
        // Velocity trail: smoothed per-frame prog delta, clamped.
        const dp = p - lastP.current
        lastP.current = p
        trailR.current = trailR.current * 0.82 + dp * 4200
        setTrail(Math.max(-55, Math.min(55, trailR.current)))
        // Card-turn sounds, scrub-safe: each fires as its own turn lands
        // (≈0.85 of the flip), scrolling either direction (down = bright,
        // up = darker reverse). Attacks share one global 260ms grid so
        // simultaneous crossings can never fuse into a single wash.
        const ee = smooth(clamp01(p / HOLD_AT))
        const now = performance.now()
        const crossed: { i: number; dir: 1 | -1 }[] = []
        for (let i = 0; i < COUNT; i++) {
          const f0 = 0.05 + i * 0.105
          const ft = clamp01((ee - f0) / 0.3)
          const was = flipT.current[i]
          if (ft >= 0.85 && was < 0.85 && now - flipCool.current[i] > 1800) {
            flipCool.current[i] = now
            crossed.push({ i, dir: 1 })
          // Reverse: sound when the card lands back FLAT (≈0.05), not
          // when it merely starts un-flipping — matches the forward rule.
          } else if (ft < 0.05 && was >= 0.05 && was > 0 && now - flipCool.current[i] > 1800) {
            flipCool.current[i] = now
            crossed.push({ i, dir: -1 })
          }
          flipT.current[i] = ft
          if (ft < 0.05) flipCool.current[i] = 0
        }
        // One attack max per frame, sounded instantly: simultaneous
        // crossings keep only the first. Deferred sounds would fire after
        // the motion stops (out of sync) — fast flings lose some hits, but
        // every sound you hear matches visible motion. Scrub-speed sets the
        // rhythm: slow scrolls ripple card-to-card, flings fuse honestly.
        if (crossed.length > 0) {
          const c = crossed[0]
          // Pitched per card, tighter tails; reverse direction darker.
          const rate = (1.25 + (c.i % 3) * 0.07) * (c.dir === 1 ? 1 : 0.72)
          playFlip(rate)
        }
      }
      const avail = boxRef.current?.clientWidth ?? window.innerWidth
      // Generous gutter: section padding + rotated-corner headroom, so the
      // deck and the scatter both sit well inside the clip edge.
      setScale(Math.min(SCALE_CAP, (avail - 64) / ROW_W))
      setVh(window.innerHeight)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [])

  // Hover spring loop: per-card hover amount with distance-falloff
  // stiffness (the deck ripples outward from the pick), underdamped for
  // dip-then-lift + overshoot-then-settle; cursor tilt smoothed alongside.
  // Runs only at the top of the runway and self-terminates at rest.
  useEffect(() => {
    if (prog > 0.02) return
    let raf = 0
    let last = performance.now()
    const tick = () => {
      const now = performance.now()
      const dt = Math.min(0.05, (now - last) / 1000)
      last = now
      let live = hot !== null
      const nA = [...hAmtR.current]
      const nV = [...hVelR.current]
      for (let i = 0; i < COUNT; i++) {
        const tgt = hot === i ? 1 : 0
        const k = Math.max(
          90,
          HOVER_K - HOVER_KFALLOFF * (hot === null ? 3 : Math.abs(i - hot))
        )
        const F = (tgt - nA[i]) * k - nV[i] * HOVER_C
        nV[i] += F * dt
        nA[i] += nV[i] * dt
        if (Math.abs(nV[i]) > 0.002 || Math.abs(nA[i] - tgt) > 0.002) {
          live = true
        } else {
          nA[i] = tgt
          nV[i] = 0
        }
      }
      hAmtR.current = nA
      hVelR.current = nV
      const tt = hot === null ? { x: 0, y: 0 } : tiltTR.current
      const tc = tiltCR.current
      const s = Math.min(1, dt * 10)
      tc.x += (tt.x - tc.x) * s
      tc.y += (tt.y - tc.y) * s
      if (Math.abs(tc.x) > 0.002 || Math.abs(tc.y) > 0.002) live = true
      const sTgt = hot === null ? 0 : -(hot - MID)
      const nsw =
        swingCR.current + (sTgt - swingCR.current) * Math.min(1, dt * 8)
      swingCR.current = nsw
      if (Math.abs(nsw - sTgt) > 0.002) live = true
      const rate = Math.min(1, dt * 10)
      const sT =
        hot === null ? 0 : SPLIT * (1 - (Math.abs(hot - MID) / MID) * 0.85)
      const nSA = splitAmtCR.current + (sT - splitAmtCR.current) * rate
      splitAmtCR.current = nSA
      if (Math.abs(nSA - sT) > 0.05) live = true
      const nBX = [...splitCR.current]
      for (let j = 0; j < COUNT; j++) {
        let bt = 0
        if (hot !== null) {
          if (j < hot) bt = -nSA + (hot - 1 - j) * PINCH
          else if (j > hot) bt = nSA - (j - hot - 1) * PINCH
        }
        nBX[j] += (bt - nBX[j]) * rate
        if (Math.abs(bt - nBX[j]) > 0.05) live = true
      }
      splitCR.current = nBX
      if (!live) return
      setHTick((t) => t + 1)
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      if (raf) cancelAnimationFrame(raf)
    }
  }, [hot, prog])

  const e = smooth(clamp01(prog / HOLD_AT))
  // Parallax progress: 0 through the hold, eased 0→1 over the tail.
  const ppE = smooth(clamp01((prog - PARA_AT) / (1 - PARA_AT)))
  // Final sizes per card: hero ~18% larger; left-top grown to tuck under
  // the hero, left-bottom slightly smaller; right-top is the biggest on
  // the right, mid-right next, rest smaller.
  const SCATTER_SIZE = [0.9, 0.62, 0.75, 1.18, 0.95, 0.62, 0.78]
  const sizeF = (i: number) => SCATTER_SIZE[i]
  // Size spread for exit-dissolve weighting (small cards fade/blur most).
  const SMAX = Math.max(...SCATTER_SIZE)
  const SDEN = SMAX - Math.min(...SCATTER_SIZE) || 1
  // Vertical cap: every scattered card must stay inside the viewport
  // height, so scale is capped by the tightest card (the big center one).
  const effVCap = Math.max(
    0.15,
    Math.min(
      ...SCATTER_FY.map(
        (fy, i) => (vh / 2 - 40 - Math.abs(fy) * vh) / (308 * sizeF(i))
      )
    )
  )
  // Cards grow a little as they leave the deck for the scatter.
  const effScale = Math.min(0.75, scale * (1 + 0.9 * e), effVCap)
  // Parallax travel sized so even the slowest (smallest) card fully exits
  // the viewport by the end of the zone; faster cards leave earlier.
  const paraK = (vh / 2 / effScale + 360) / 0.62
  // Box height lerps from deck height to the exact scatter span, so the
  // centered row can never leave the screen vertically.
  const maxNeed = Math.max(
    ...SCATTER_FY.map((fy, i) => Math.abs(fy) * vh + 308 * effScale * sizeF(i))
  )
  const boxH =
    lerp(ROW_H * effScale, 2 * maxNeed + 32, e) + ppE * 160 * effScale
  const hA = hAmtR.current
  // Global hover envelope: strongest spring anywhere. Decays smoothly on
  // unhover and holds through hover handoffs (one card falls as the next
  // rises) — split, swing, and fan ride this, never hot's identity.
  const deckHa = Math.max(0, ...hA)
  const swingC = swingCR.current
  const deckDx = swingC * SWING * effScale * (1 - e) * deckHa
  const deckRot = swingC * TILT * (1 - e) * deckHa
  const availW = boxRef.current?.clientWidth ?? 1200

  return (
    <div ref={tallRef} className="w-full" style={{ height: `${RUNWAY_VH}vh` }}>
      <div className="sticky top-0 flex h-[100dvh] items-center justify-center overflow-visible">
        <div
          ref={boxRef}
          className="relative flex w-full justify-center"
          style={{ height: boxH }}
        >
          <div
            className={`absolute top-1/2 left-1/2 flex items-start [--shift:170px] [perspective:1400px] [&>.ocard+.ocard]:ml-[calc(var(--shift)*-1)]`}
            style={{
              transform: `translateX(-50%) translateY(-50%) translateX(${deckDx}px) scale(${effScale}) rotate(${deckRot}deg)`,
              transformOrigin: "center",
            }}
          >
            {Array.from({ length: COUNT }).map((_, i) => {
              const d = i - MID
              const ad = Math.abs(d)
              // Base deck pose (phase 0): original slots, never remapped —
              // no reshuffle on click. Split rides the smoothed per-card
              // offsets × the global envelope: no jumps, ever.
              const bdx = (splitCR.current[i] ?? 0) * deckHa
              // sl = scatter slot only: the clicked card becomes scatter
              // hero while its deck slot never moves.
              const bdy = ad * (ARC + ARC_GROW * ad) + LIFT * (hA[i] ?? 0)
              const brot =
                d * (FAN + (FAN_HOT - FAN) * clamp01(deckHa) + FAN_GROW * ad)
              // Scatter pose (phase 1), in layout px so it scales uniformly.
              // NOTE: translate() moves cards relative to their row slots.
              // The row is centered in its box, so horizontally each slot
              // sits at (i-MID)*270 (440px card, 170 overlap) from center,
              // while vertically every slot center IS row-center height —
              // only the horizontal offset needs compensating. The hero
              // targets 275px left of center so hero + tagline read as one
              // centered group.
              // Scatter targets follow the slot too: whichever card holds the
              // middle slot becomes the scatter hero (big, centered, tagged).
              // sl = scatter slot for this card (clicked card → middle slot).
              const sl = slot(i)
              const slotX = (i - MID) * 270
              // Scatter targets (+ post-hold size-driven parallax: zero until
              // the hold ends, so the reached pose itself never changes).
              const tX =
                sl === MID ? -275 : (SCATTER_FX[sl] * availW) / effScale
              // Size-driven parallax (slot hero drifts a touch at 0.3, rest
              // stream past at their own size speed). Zero until the hold ends.
              const tY =
                (SCATTER_FY[sl] * vh) / effScale -
                paraK * (sl === MID ? 0.3 : sizeF(sl)) * ppE
              // Follow-through: rotation settles just after position, scale
              // just after that — nothing arrives in lockstep.
              const eRot = clamp01((e - 0.06) / 0.94)
              const eSca = clamp01((e - 0.03) / 0.97)
              // Settle sized: slot hero biggest, rest per-slot sizes, with a
              // gentle arrival pop (scale breathes past target, then lands).
              const cs =
                lerp(1, sizeF(sl), eSca) *
                (1 + 0.045 * Math.sin(Math.PI * clamp01((e - 0.8) / 0.2)))
              // Hard guarantee: absolute targets are clamped inside the
              // viewport (per-card size accounted, 8px margin), so no card
              // can ever leave the screen whatever the measurements say.
              // Viewport clamps hold through scatter/hold, then relax away so
              // parallax can carry every card fully off-screen.
              const relax = ppE * 4000
              const maxAX = Math.max(
                0,
                availW / 2 / effScale - 220 * cs - 8 + relax
              )
              const maxAY = Math.max(
                0,
                vh / 2 / effScale - 308 * cs - 8 + relax
              )
              const sdx = Math.min(maxAX, Math.max(-maxAX, tX)) - slotX
              const sdy = Math.min(maxAY, Math.max(-maxAY, tY))
              // Organic travel: each card leads/lags a touch mid-flight
              // (alternating, endpoints pinned), and the path bows outward
              // along a quadratic-style bulge — swoop, never straight lines.
              const eP = clamp01(e + 0.04 * Math.sin(Math.PI * e) * (i % 2 ? 1 : -1))
              const sw = Math.sin(Math.PI * eP)
              const vx = sdx - bdx
              const vy = sdy - bdy
              const dist = Math.hypot(vx, vy)
              let bezX = 0
              let bezY = 0
              if (dist > 1) {
                let nx = -vy / dist
                let ny = vx / dist
                if (ny > 0) {
                  nx = -nx
                  ny = -ny
                }
                const bulge = Math.min(150, dist * 0.22)
                bezX = nx * sw * bulge
                bezY = ny * sw * bulge
              }
              const dx = lerp(bdx, sdx, eP) + bezX
              // Scroll-velocity trail: edge cards lag fast scrolls most.
              const dy =
                lerp(bdy, sdy, eP) +
                bezY +
                trail * (0.35 + (0.65 * ad) / MID) * (1 - e * 0.5)
              // Follow-through: rotation uses the lagged progress above, so it
              // settles just after position.
              const rot = lerp(brot, 0, eRot)
              // Staggered flip: narrow per-card window + wide start spacing so
              // each turn plays distinctly one after another (eased
              // end-to-end, soft landing), plus a slight pull-back dip
              // mid-flip like a real flicked card.
              const f0 = 0.05 + i * 0.105
              const flipT = clamp01((e - f0) / 0.3)
              // Fast ends, slow middle: rush off the face, dwell edge-on,
              // snap shut. (A true cubic-bezier can't hold this shape
              // monotonically, so sinusoidal with the same velocity profile.)
              const fez =
                flipT + (0.45 * Math.sin(2 * Math.PI * flipT)) / (2 * Math.PI)
              const flip = 180 * fez
              const dip = 1 - 0.12 * Math.sin(Math.PI * flipT)
              // Exit dissolve: smaller cards blur + fade harder (hero stays
              // crisp). Applied on the flat outer so the 3D flip inside is
              // never flattened (filter/opacity would kill the jack backs).
              const wOut = (SMAX - sizeF(sl)) / SDEN
              // Cursor life: tilt + magnetic pull scaled by this card's own
              // spring — fading smoothly on unhover/handoff, never snapping
              // with hot's identity. Smoothed in the spring loop.
              const spring = clamp01(hA[i] ?? 0)
              const tx = tiltCR.current.x * spring
              const ty = tiltCR.current.y * spring
              return (
                <div
                  key={i}
                  className={`ocard shrink-0 cursor-pointer`}
                  onMouseEnter={() => setHot(i)}
                  onMouseLeave={() => setHot(null)}
                  onMouseMove={(ev) => {
                    const r = ev.currentTarget.getBoundingClientRect()
                    tiltTR.current = {
                      x: ((ev.clientX - r.left) / r.width - 0.5) * 2,
                      y: ((ev.clientY - r.top) / r.height - 0.5) * 2,
                    }
                  }}
                  onClick={() => {
                    playTap()
                    setFocus(i)
                    play()
                  }}
                  style={{
                    transform: `translate(${dx + tx * 12}px, ${dy + ty * 10}px)`,
                    zIndex: i,
                    opacity: 1 - ppE * 0.8 * wOut,
                    filter: `blur(${ppE * 8 * wOut}px)`,
                  }}
                >
                  <div
                    className="[transform-style:preserve-3d]"
                    style={{
                      transform: `rotate(${rot}deg) rotateX(${(-ty * 7).toFixed(2)}deg) rotateY(${(tx * 9).toFixed(2)}deg) rotateY(${flip}deg) scale(${cs * dip})`,
                    }}
                  >
                    <OrbitCard flip={false} />
                  </div>
                </div>
              )
            })}
            {/* Tagline beside the hero card — fades in on scatter.
                Hero (-535..-15) + 70px gap + tagline (55..535):
                group centered at 0. */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-1/2 left-[calc(50%+55px)] w-[480px] -translate-y-1/2 font-heading text-[104px] leading-[1.08]  italic"
              style={{ opacity: e * (1 - ppE), zIndex: 10 }}
            >
              The <br />
              Jack of
              <br /> all trades <br />
              <span className="mt-4 inline-block rounded-full border border-current px-8 text-[76px] leading-[1.4] whitespace-nowrap">
                that your team needs!
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
