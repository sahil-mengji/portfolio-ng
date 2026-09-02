"use client"

import React, { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"

interface ScrambleTextProps {
  children: string
  className?: string
  interval?: number
  scrambleOnMount?: boolean
}

const CHARS = '!@#$%^&*()_+{}:"<>?ABCDEFGHIJKLMNOPQRSTUVWXYZ'

export function ScrambleText({ 
  children, 
  className, 
  interval = 50,
  scrambleOnMount = true
}: ScrambleTextProps) {
  const [displayedText, setDisplayedText] = useState(children)
  const [isScrambling, setIsScrambling] = useState(false)

  const scramble = useCallback(() => {
    if (isScrambling) return
    setIsScrambling(true)

    let iteration = 0
    const maxIterations = children.length
    
    const timer = setInterval(() => {
      setDisplayedText((prev) => 
        prev
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return children[index]
            }
            return CHARS[Math.floor(Math.random() * CHARS.length)]
          })
          .join("")
      )

      iteration += 1 / 3
      if (iteration >= maxIterations) {
        clearInterval(timer)
        setDisplayedText(children)
        setIsScrambling(false)
      }
    }, interval)

    return () => clearInterval(timer)
  }, [children, interval, isScrambling])

  useEffect(() => {
    if (scrambleOnMount) {
      scramble()
    }
  }, [])

  return (
    <span
      onMouseEnter={scramble}
      className={cn("cursor-default font-mono", className)}
    >
      {displayedText}
    </span>
  )
}
