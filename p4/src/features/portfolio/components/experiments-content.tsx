"use client"

import { motion } from "motion/react"
import { FlaskConical, Atom } from "lucide-react"
import { ScrambleText } from "@/features/portfolio/components/scramble-text"

export function ExperimentsContent() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
      <div className="max-w-md space-y-10">
        <div className="flex justify-center items-center gap-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: "spring", stiffness: 100, delay: 0.2 }}
          >
            <FlaskConical className="size-16 text-yellow-500/80 stroke-[1.5]" />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1, rotate: 360 }}
            transition={{ 
              opacity: { duration: 0.5, delay: 0.4 },
              scale: { type: "spring", stiffness: 100, delay: 0.4 },
              rotate: { duration: 10, repeat: Infinity, ease: "linear" }
            }}
          >
            <Atom className="size-16 text-blue-500/80 stroke-[1.5]" />
          </motion.div>
        </div>

        <div className="space-y-4">
          <h2 className="text-3xl font-heading font-medium tracking-tight text-foreground">
            <ScrambleText interval={30}>Coming Soon</ScrambleText>
          </h2>
          <p className="text-sm text-muted-foreground leading-relaxed italic opacity-60">
            Some cool projects, stuff and experiments on the way
          </p>
        </div>
        
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-line bg-muted/20 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground animate-pulse">
          <span className="size-1.5 rounded-full bg-yellow-500" />
          Research in progress
        </div>
      </div>
    </div>
  )
}
