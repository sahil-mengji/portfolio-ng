"use client"

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion"

// Realistic laptop lid (back view): brushed aluminum, edge thickness,
// glowing emblem, desk shadow + reflection, gentle mouse-stage tilt.
export function LaptopBack() {
  const mx = useMotionValue(0.5)
  const my = useMotionValue(0.5)
  const sx = useSpring(mx, { stiffness: 120, damping: 18 })
  const sy = useSpring(my, { stiffness: 120, damping: 18 })
  const rotateX = useTransform(sy, [0, 1], [10, 2])
  const rotateY = useTransform(sx, [0, 1], [-7, 7])
  const sheenX = useTransform(sx, [0, 1], ["20%", "80%"])
  const sheen = useTransform(
    sheenX,
    (x) =>
      `linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.28) 45%, rgba(255,255,255,0.05) 55%, transparent 70%), linear-gradient(105deg, transparent ${x}, rgba(255,255,255,0.12) 50%, transparent 60%)`
  )

  return (
    <section aria-label="Laptop" className="mx-auto w-full max-w-4xl px-4">
      <div
        className="relative mx-auto"
        style={{ perspective: 1400 }}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          mx.set((e.clientX - r.left) / r.width)
          my.set((e.clientY - r.top) / r.height)
        }}
        onMouseLeave={() => {
          mx.set(0.5)
          my.set(0.5)
        }}
      >
        {/* Desk shadow */}
        <div
          aria-hidden
          className="absolute -bottom-10 left-1/2 h-10 w-[86%] -translate-x-1/2 rounded-[100%] bg-black/45 blur-2xl"
        />
        <motion.div
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
          className="relative aspect-[16/10] w-full"
        >
          {/* Lid thickness (bottom edge) */}
          <div
            aria-hidden
            className="absolute inset-x-3 bottom-0 h-[10px] rounded-b-2xl"
            style={{
              background:
                "linear-gradient(to bottom, #3a3d42 0%, #17181b 60%, #000 100%)",
              transform: "translateZ(-14px)",
            }}
          />
          {/* Aluminum lid */}
          <div
            aria-hidden
            className="absolute inset-0 overflow-hidden rounded-2xl"
            style={{
              background:
                "linear-gradient(160deg, #f2f3f5 0%, #d7d9dd 18%, #b9bcc2 42%, #9ea2a9 62%, #c6c9ce 82%, #e8eaed 100%)",
              boxShadow:
                "inset 0 2px 2px rgba(255,255,255,0.9), inset 0 -3px 8px rgba(0,0,0,0.28), inset 2px 0 4px rgba(255,255,255,0.35), inset -2px 0 4px rgba(0,0,0,0.18), 0 30px 60px -20px rgba(0,0,0,0.5)",
              border: "1px solid rgba(0,0,0,0.35)",
            }}
          >
            {/* Brushed metal streaks */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.16]"
              style={{
                background:
                  "repeating-linear-gradient(90deg, rgba(255,255,255,0.5) 0 1px, transparent 1px 3px)",
              }}
            />
            {/* Stage light sheen (follows mouse) */}
            <motion.div aria-hidden className="absolute inset-0" style={{ background: sheen }} />
            {/* Top edge highlight */}
            <div
              aria-hidden
              className="absolute inset-x-8 top-0 h-[3px] rounded-full bg-white/80 blur-[1px]"
            />
            {/* Center glowing emblem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div
                aria-hidden
                className="h-20 w-20 rounded-full lg:h-24 lg:w-24"
                style={{
                  background:
                    "radial-gradient(circle at 35% 30%, #ffffff 0%, #dfe4ea 35%, #8f959e 70%, #5b6068 100%)",
                  boxShadow:
                    "0 0 24px 6px rgba(255,255,255,0.55), 0 0 70px 20px rgba(255,255,255,0.22), inset 0 2px 4px rgba(255,255,255,0.9), inset 0 -3px 6px rgba(0,0,0,0.35)",
                }}
              />
            </div>
            {/* Faint etched model text */}
            <div
              aria-hidden
              className="absolute bottom-[7%] left-1/2 -translate-x-1/2 font-mono text-[10px] tracking-[0.35em] text-black/30"
            >
              SAHIL&nbsp;&nbsp;·&nbsp;&nbsp;PRO
            </div>
          </div>
        </motion.div>
        {/* Desk reflection */}
        <div
          aria-hidden
          className="mx-auto mt-2 h-16 w-[88%] rounded-[100%] opacity-40 blur-xl"
          style={{
            background:
              "linear-gradient(to bottom, rgba(160,165,175,0.5), transparent 80%)",
          }}
        />
      </div>
    </section>
  )
}
