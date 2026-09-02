"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { cn } from "@/lib/utils"

export function InitialLoader() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setTimeout(() => setLoading(false), 500)
          return 100
        }
        return prev + Math.floor(Math.random() * 15) + 5
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <AnimatePresence>
      {loading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ 
            y: "-100%",
            transition: { duration: 1, ease: [0.76, 0, 0.24, 1] }
          }}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-background select-none overflow-hidden"
        >
          {/* Coherent Animated Stripe Background */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.4] dark:opacity-[0.2]">
            <motion.div 
              className="absolute inset-0 w-[200%] h-[100%] bg-[repeating-linear-gradient(45deg,rgba(255,255,255,1)_25%,rgba(255,255,255,1)_50%,transparent_50%,transparent_75%)] bg-size-[100px_100px]"
              animate={{ x: ["-100px", "0px"] }}
              transition={{ 
                duration: 4, 
                repeat: Infinity, 
                ease: "linear" 
              }}
            />
          </div>
          
          {/* Radial Overlay for depth */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-background)_90%)]" />

          {/* Central Counter with Coherent Stripe Mask */}
          <div className="relative flex flex-col items-center">
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              style={{ WebkitTextStroke: "1px rgba(255, 255, 255, 0.2)" }}
              className="font-thunder text-[25vw] md:text-[15vw] leading-none font-bold tracking-tighter italic"
            >
              <motion.span
                animate={{ backgroundPosition: ["0px 0px", "100px 100px"] }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                style={{ 
                    backgroundImage: "repeating-linear-gradient(45deg, rgba(255, 255, 255, 0.9) 25%, rgba(255, 255, 255, 0.9) 50%, transparent 50%, transparent 75%)",
                    backgroundSize: "100px 100px",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                    display: "inline-block"
                }}
              >
                {Math.min(progress, 100)}%
              </motion.span>
            </motion.div>
            
            <div className="w-64 h-[1px] bg-line/20 mt-4 relative overflow-hidden">
                <motion.div 
                    className="absolute inset-0 bg-line"
                    initial={{ scaleX: 0, originX: 0 }}
                    animate={{ scaleX: progress / 100 }}
                    transition={{ duration: 0.2 }}
                />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
