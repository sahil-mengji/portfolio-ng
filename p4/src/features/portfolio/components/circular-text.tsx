"use client"

import React from "react"
import { motion } from "motion/react"
import { cn } from "@/lib/utils"

interface CircularTextProps {
  text: string
  radius?: number
  fontSize?: number
  letterSpacing?: number
  fontWeight?: number | string
  className?: string
  style?: React.CSSProperties
  duration?: number
  reverse?: boolean
  repeat?: number
  rotation?: import("motion/react").MotionValue<number> | number
  fillCircle?: boolean
}

export function CircularText({
  text,
  radius = 450,
  fontSize = 60,
  letterSpacing = 2,
  fontWeight,
  className,
  style,
  duration = 10,
  reverse = false,
  repeat = 1,
  rotation,
  fillCircle = false,
}: CircularTextProps) {
  // Use a fixed internal coordinate system for fluid scaling
  const viewBoxSize = 1000
  const center = 500
  const pathLength = 2 * Math.PI * radius
  
  const displayText = Array(repeat).fill(text).join("")

  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <motion.svg
        viewBox={`0 0 ${viewBoxSize} ${viewBoxSize}`}
        style={{ 
          width: "100%", 
          height: "100%", 
          rotate: rotation,
          ...style 
        }}
        className="overflow-visible"
        animate={rotation === undefined ? { rotate: reverse ? -360 : 360 } : undefined}
        transition={rotation === undefined ? { duration, repeat: Infinity, ease: "linear" } : undefined}
      >
        <path
          id="circlePath"
          d={`M ${center - radius}, ${center} a ${radius},${radius} 0 1,1 ${radius * 2},0 a ${radius},${radius} 0 1,1 -${radius * 2},0`}
          fill="none"
        />
        <text
          style={{ 
            fontSize, 
            letterSpacing, 
            fontWeight,
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
          className="fill-white/40 font-medium"
          textLength={fillCircle ? pathLength : undefined}
        >
          <textPath xlinkHref="#circlePath">
            {displayText}
          </textPath>
        </text>
      </motion.svg>
    </div>
  )
}
