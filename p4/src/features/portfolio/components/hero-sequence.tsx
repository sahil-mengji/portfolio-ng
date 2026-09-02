"use client"

import React, { useRef } from "react"
import { motion, useScroll, useTransform, useSpring, useVelocity, useTime } from "motion/react"
import { Mouse } from "lucide-react"
import { ImageSequence } from "./image-sequence"
import { CircularText } from "./circular-text"
import { cn } from "@/lib/utils"

const IMAGE_COUNT = 40
const imagePaths = Array.from({ length: IMAGE_COUNT }, (_, i) => 
  `/sequence/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`
)

export function HeroSequence() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })



  const scrollHintOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0])

  // Base stagger reveal transforms
  const stagger1 = [0.65, 0.75] as [number, number]
  const stagger2 = [0.70, 0.80] as [number, number]
  const stagger3 = [0.75, 0.85] as [number, number]

  const opacity1 = useTransform(scrollYProgress, stagger1, [0, 1])
  const opacity3 = useTransform(scrollYProgress, stagger3, [0, 1])

  const blur1 = useTransform(scrollYProgress, stagger1, ["10px", "0px"])
  const blur2 = useTransform(scrollYProgress, stagger2, ["10px", "0px"])
  const blur3 = useTransform(scrollYProgress, stagger3, ["10px", "0px"])

  const y1 = useTransform(scrollYProgress, stagger1, [30, 0])
  const y2 = useTransform(scrollYProgress, stagger2, [30, 0])
  const y3 = useTransform(scrollYProgress, stagger3, [30, 0])

  // Staggered reveal transforms for individual words (within stagger2 range)
  const staggerWord1 = [0.70, 0.76] as [number, number]
  const staggerWord2 = [0.72, 0.78] as [number, number]
  const staggerWord3 = [0.74, 0.80] as [number, number]
  const staggerWord4 = [0.76, 0.82] as [number, number]

  const opacityWord1 = useTransform(scrollYProgress, staggerWord1, [0, 1])
  const opacityWord2 = useTransform(scrollYProgress, staggerWord2, [0, 1])
  const opacityWord3 = useTransform(scrollYProgress, staggerWord3, [0, 1])
  const opacityWord4 = useTransform(scrollYProgress, staggerWord4, [0, 1])

  const decorationsOpacity = useTransform(scrollYProgress, [0.80, 0.90], [0, 1])
  
  /* 
  const bigCircularTextOpacity = useTransform(scrollYProgress, [0, 0.8], [0.5, 0])
  const bigCircularTextScale = useSpring(useTransform(scrollYProgress, [0, 0.8], [1, 10]), { stiffness: 40, damping: 15 })
  const bigCircularTextBlur = useTransform(scrollYProgress, [0, 0.8], ["blur(0px)", "blur(40px)"])
  
  const baseRotation = useTransform(time, (t) => (t / 150) % 360)

  // 2. Fast scroll rotation
  const scrollRotation = useTransform(scrollYProgress, [0, 1], [0, 1440])

  // 3. Combined rotation with spring for smoothness
  const combinedRotation = useSpring(
    useTransform([baseRotation, scrollRotation], ([b, s]: number[]) => b + s),
    { stiffness: 50, damping: 20 }
  )
  */

  return (
    <div
      ref={containerRef}
      className="relative h-[250vh] select-none"
    >
      <div className="sticky top-0 h-[100dvh] overflow-hidden flex items-center justify-center border-b border-line">
        {/* 0. Big Circular Text & Counter-Ring (Background) - Commented out as per request */}
        {/* <motion.div 
          style={{ 
            opacity: bigCircularTextOpacity, 
            scale: bigCircularTextScale,
            filter: bigCircularTextBlur,
          }}
          className="absolute inset-0 z-5 flex items-center justify-center pointer-events-none"
        >
           <CircularText 
              text="CODER BY CRAFT         &         DESIGNER BY INSTINCT         ✦         "
              radius={420}
              fontSize={140}
              letterSpacing={2}
              fontWeight={850}
              duration={60}
              repeat={1}
              fillCircle={true}
              rotation={combinedRotation}
              className="w-[60vw] h-[60vw] md:w-[90vw] md:h-[90vw] max-w-[1200px] max-h-[1200px] font-thunder"
           />
        </motion.div> */}

        {/* 1. The Sequence (Full Width) */}
        <div className="absolute grayscale inset-0 z-0 [mask-image:linear-gradient(to_bottom,black_80%,transparent_100%)]">
           <ImageSequence 
             progress={scrollYProgress} 
             imageUrls={imagePaths} 
             className="opacity-100 transition-all duration-500"
           />
           {/* Vignette effect (Full Width) */}
           <div 
             className={cn(
               "absolute inset-0 pointer-events-none",
               "bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_75%)]",
               "dark:bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_60%)]"
             )} 
           />
        </div>

        {/* 2. Architectural Guidelines (Constrained to site width) */}
        <div className="absolute inset-0 z-10 pointer-events-none flex justify-center">
            <div className="w-full md:max-w-6xl h-full border-x border-line relative">
                {/* Architectural Decorators (Reveal with text) */}
                <motion.div 
                    style={{ opacity: decorationsOpacity }}
                    className="absolute top-0 left-0 w-full h-full"
                >
                    {/* Top-end pattern (Site's Separator style) */}
                    <div className="absolute top-0 -left-[100vw] h-12 w-[200vw] bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] bg-size-[10px_10px] [--pattern-foreground:var(--color-line)]/40" />
                    
                    {/* Corner Plus Markers */}
                    <div className="absolute top-0 -left-1.5 size-3 flex items-center justify-center text-line font-light">+</div>
                    <div className="absolute top-0 -right-1.5 size-3 flex items-center justify-center text-line font-light">+</div>
                    <div className="absolute bottom-0 -left-1.5 size-3 flex items-center justify-center text-line font-light">+</div>
                    <div className="absolute bottom-0 -right-1.5 size-3 flex items-center justify-center text-line font-light">+</div>
                </motion.div>
            </div>
        </div>

        {/* 3. Revealed Content (Full Width Grid - Placement as per earlier) */}
        <div className="relative z-20 w-full h-full flex flex-col justify-center">
            {/* 2.5 Stylistic Bouncing Scroll Hint */}
        <motion.div 
          style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-30 flex flex-col items-center gap-4 pointer-events-none"
        >
            <motion.div 
              animate={{ y: [0, 6, 0] }}
              transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
              className="flex flex-col items-center gap-2"
            >
                <div className="p-2 rounded-full border border-line bg-background/50 backdrop-blur-sm shadow-sm">
                    <Mouse size={14} className="text-muted-foreground/80" />
                </div>
                <div className="w-[1px] h-8 bg-gradient-to-b from-line via-line/50 to-transparent" />
            </motion.div>
            <span className="text-[9px] font-mono uppercase tracking-[0.4em] text-muted-foreground/40 ml-[0.4em]">
                Scroll to explore
            </span>
        </motion.div>

            {/* Content Reveal Layer */}
            <div className="grid grid-cols-12 w-full px-12 md:px-24">
                <div className="col-span-12 md:col-start-8 md:col-end-13 text-left">
                    <h2 className="flex flex-col items-start font-heading tracking-tighter leading-none gap-6 pointer-events-auto">
                        <motion.span 
                            style={{ opacity: opacity1, y: y1, filter: useTransform(blur1, (v) => `blur(${v})`) }}
                            className="inline-flex items-center justify-center text-4xl md:text-5xl text-foreground font-medium px-8 py-3 rounded-full border border-line bg-background/90 backdrop-blur-md shadow-sm"
                        >
                            The
                        </motion.span>
                        
                        <div className="flex flex-col">
                            <div className="flex items-baseline ">
                                <motion.span 
                                    style={{ opacity: opacityWord1, y: y2, filter: useTransform(blur2, (v) => `blur(${v})`) }}
                                    className="text-6xl sm:text-7xl md:text-9xl font-bold italic py-4 px-8 -ml-8 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[0.8] drop-shadow-[1px_1px_10px_rgba(255,255,255,0.9)] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] drop-shadow-[4px_4px_4px_rgba(0,0,0,0.8)] drop-shadow-[20px_20px_80px_rgba(0,0,0,0.9)]"
                                >
                                    Jack
                                </motion.span>
                                <motion.span 
                                    style={{ opacity: opacityWord2, y: y2, filter: useTransform(blur2, (v) => `blur(${v})`) }}
                                    className="text-6xl sm:text-7xl md:text-9xl font-bold italic py-4 px-8 -ml-8 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[0.8] drop-shadow-[1px_1px_10px_rgba(255,255,255,0.9)] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] drop-shadow-[4px_4px_4px_rgba(0,0,0,0.8)] drop-shadow-[20px_20px_80px_rgba(0,0,0,0.9)]"
                                >
                                    of
                                </motion.span>
                            </div>
                            <div className="flex items-baseline -mt-8">
                                <motion.span 
                                    style={{ opacity: opacityWord3, y: y2, filter: useTransform(blur2, (v) => `blur(${v})`) }}
                                    className="text-6xl sm:text-7xl md:text-9xl font-bold italic py-4 px-8 -ml-8 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[0.8] drop-shadow-[1px_1px_10px_rgba(255,255,255,0.9)] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] drop-shadow-[4px_4px_4px_rgba(0,0,0,0.8)] drop-shadow-[20px_20px_80px_rgba(0,0,0,0.9)]"
                                >
                                    all
                                </motion.span>
                                <motion.span 
                                    style={{ opacity: opacityWord4, y: y2, filter: useTransform(blur2, (v) => `blur(${v})`) }}
                                    className="text-6xl sm:text-7xl md:text-9xl font-bold italic py-4 px-8 -ml-8 bg-gradient-to-b from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent leading-[0.8] drop-shadow-[1px_1px_10px_rgba(255,255,255,0.9)] drop-shadow-[0_0_30px_rgba(255,255,255,0.2)] drop-shadow-[4px_4px_4px_rgba(0,0,0,0.8)] drop-shadow-[20px_20px_80px_rgba(0,0,0,0.9)]"
                                >
                                    Trades
                                </motion.span>
                            </div>
                        </div>

                        <motion.span 
                            style={{ opacity: opacity3, y: y3, filter: useTransform(blur3, (v) => `blur(${v})`) }}
                            className="inline-flex items-center justify-center text-4xl md:text-5xl text-foreground font-medium lowercase px-8 py-3 rounded-full border border-line bg-background/90 backdrop-blur-md shadow-sm"
                        >
                            - that \"you need\"
                        </motion.span>
                    </h2>
                </div>
            </div>
        </div>

        {/* 4. Subtle grid pattern overlay (Full Width) */}
        <div className="absolute inset-0 z-5 pointer-events-none opacity-[0.03] dark:opacity-[0.05] bg-[radial-gradient(var(--color-foreground)_1px,transparent_0)] bg-size-[20px_20px]" />
      </div>
    </div>
  )
}
