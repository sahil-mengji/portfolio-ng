"use client"

import React, { useRef } from "react"
import Image from "next/image"
import { motion, useScroll, useTransform } from "motion/react"
import { USER } from "@/features/portfolio/data/user"

// ─── Word ───────────────────────────────────────────────────────────────────

function Word({
  children,
  progress,
  range,
}: {
  children: string
  progress: import("motion/react").MotionValue<number>
  range: [number, number]
}) {
  const opacity = useTransform(progress, range, [0, 1])
  const y = useTransform(progress, range, [12, 0])
  return (
    <span className="relative mx-[0.2em]">
      {/* Ghost — always visible, very faint */}
      <span className="absolute inset-0 text-foreground/10 select-none" aria-hidden>
        {children}
      </span>
      {/* Animated reveal */}
      <motion.span style={{ opacity, y }} className="inline-block text-foreground">
        {children}
      </motion.span>
    </span>
  )
}

// ─── HeroCover ───────────────────────────────────────────────────────────────

const STORY = `A programmer's life is like crafting spells — 99% experimentation, 1% pure magic, and an endless quest for that perfect "aha!" moment. They say code is poetry, but mine reads more like witty conversations with a machine. Welcome to my digital space, where algorithms meet aesthetics and every pixel is intentional.`

export function HeroCover() {
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    // The sticky panel occupies the top half (50vh), scroll over the full h-[200vh]
    offset: ["start start", "end end"],
  })

  // Parse STORY into words
  const words = STORY.split(/\s+/).filter(Boolean)
  const totalWords = words.length

  return (
    // Outer: 200vh so the sticky panel has room to animate
    <div
      ref={containerRef}
      className="relative h-[200vh] border-x border-line"
    >
      {/* Sticky viewport-height panel */}
      <div className="sticky top-0 h-screen flex flex-col">

        {/* Top meta bar */}
        <div className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-line/60">
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
            {USER.username} · {USER.address}
          </span>
          {/* Scroll hint */}
          <span className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground/40 flex items-center gap-1.5">
            <ScrollIndicator progress={scrollYProgress} />
            Scroll to reveal
          </span>
        </div>

        {/* Main content: vertically centered */}
        <div className="flex-1 flex flex-col items-start justify-center px-6 md:px-12 max-w-5xl mx-auto w-full">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-8">
            <span className="h-px w-8 bg-foreground/20" />
            <span className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground/60">
              {USER.jobTitle}
            </span>
          </div>

          {/* Scroll-reveal paragraph */}
          <p className="text-2xl sm:text-3xl md:text-4xl font-heading font-medium leading-[1.35] flex flex-wrap">
            {words.map((word, i) => {
              const start = i / totalWords
              const end = start + 1.5 / totalWords
              return (
                <Word
                  key={`${word}-${i}`}
                  progress={scrollYProgress}
                  range={[start, Math.min(end, 1)]}
                >
                  {word}
                </Word>
              )
            })}
          </p>

          {/* Bottom name tag */}
          <div className="mt-12 flex items-center gap-4">
            <div className="h-px flex-1 max-w-12 bg-foreground/15" />
            <span className="text-sm font-medium text-foreground/40">
              — {USER.displayName}
            </span>
          </div>
        </div>

        {/* Bottom border accent */}
        <div className="shrink-0 border-t border-line/60 flex items-center px-6 py-3 gap-3">
          <ProgressBar progress={scrollYProgress} />
        </div>
      </div>
    </div>
  )
}

// ─── ProgressBar ─────────────────────────────────────────────────────────────

function ProgressBar({
  progress,
}: {
  progress: import("motion/react").MotionValue<number>
}) {
  return (
    <div className="relative h-px flex-1 bg-foreground/8 overflow-hidden rounded-full">
      <motion.div
        className="absolute inset-y-0 left-0 bg-foreground/30 rounded-full"
        style={{ scaleX: progress, transformOrigin: "left" }}
      />
    </div>
  )
}

// ─── ScrollIndicator ─────────────────────────────────────────────────────────

function ScrollIndicator({
  progress,
}: {
  progress: import("motion/react").MotionValue<number>
}) {
  const opacity = useTransform(progress, [0, 0.1], [1, 0])
  return (
    <motion.span style={{ opacity }} className="inline-flex flex-col items-center gap-0.5">
      <span className="block h-3.5 w-px bg-muted-foreground/40 rounded-full relative overflow-hidden">
        <motion.span
          className="absolute top-0 left-0 w-full h-full bg-muted-foreground/80"
          animate={{ y: ["0%", "100%"] }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </span>
    </motion.span>
  )
}
