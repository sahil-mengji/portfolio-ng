"use client"

import { motion } from "motion/react"
import { useShowcaseSheet } from "./showcase-sheet-context"

export function ShowcasePushWrapper({ children }: { children: React.ReactNode }) {
  const { open } = useShowcaseSheet()

  return (
    <motion.div
      animate={{ 
        x: open ? "calc(-1 * min(60vw, 1100px))" : "0%"
      }}
      transition={{ 
        type: "spring", 
        stiffness: 300, 
        damping: 35, 
        mass: 1 
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  )
}
