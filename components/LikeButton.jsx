"use client"
import React, { useEffect, useRef, useState } from "react"
import { ensureContrast } from "@/lib/color-utils"
import { getBoxPalette } from "@/components/bento/box-palettes"
import { cn } from "@/lib/utils"
import { useThemeColorContext } from "@/components/theme-provider"

const heartGrid = [
  [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
  [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
  [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
]

function readLiked() {
  try {
    return (
      typeof window !== "undefined" &&
      window.localStorage.getItem("liked") === "true"
    )
  } catch {
    return false
  }
}

const LikeButton = ({ className }) => {
  // Always render the unliked state first (server + hydration agree),
  // then sync the persisted value post-hydration — reading storage
  // during render would mismatch the server HTML.
  const [isLiked, setIsLiked] = useState(false)
  // Ripple rings spawned on each press, removed when their animation ends.
  const [ripples, setRipples] = useState([])
  const rippleId = useRef(0)
  // Skip the persist write until the stored value has been read back,
  // otherwise the mount effect would clobber storage with `false`.
  const synced = useRef(false)

  const { palette, isOverridden } = useThemeColorContext()
  const p = isOverridden ? palette : getBoxPalette("projects")
  const idleFill = ensureContrast(p.brand, p.surface, 3)
  const fill = isLiked ? p.cardText : idleFill
  const heart = isLiked ? p.surface : ensureContrast(p.cardText, idleFill)

  useEffect(() => {
    setIsLiked(readLiked())
    synced.current = true
  }, [])

  useEffect(() => {
    if (!synced.current) return
    try {
      window.localStorage.setItem("liked", isLiked ? "true" : "false")
    } catch {
      /* storage unavailable — like just won't persist */
    }
  }, [isLiked])

  const handleClick = () => {
    setIsLiked((prev) => !prev)
    const id = ++rippleId.current
    setRipples((prev) => [...prev, id])
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r !== id))
    }, 1000)
  }

  return (
    <span className={cn("relative flex w-full justify-center", className)}>
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isLiked}
        aria-label={isLiked ? "Unlike" : "Like"}
        className={cn(
          "relative aspect-square rounded-full border-2 p-8 shadow-lg",
          "transition-[background-color,border-color,transform] duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "hover:scale-105 active:scale-95 motion-reduce:transform-none motion-reduce:transition-none",
          "focus-visible:outline-2 focus-visible:outline-offset-4"
        )}
        style={{
          backgroundColor: fill,
          borderColor: fill,
          outlineColor: p.cardHeading,
        }}
      >
        {/* Ripples expand from behind the circle on every press */}
        {ripples.map((id) => (
          <span
            key={id}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 animate-ping rounded-full border-2 motion-reduce:animate-none"
            style={{ borderColor: p.cardHeading }}
          />
        ))}
        <span
          className="relative z-10 grid grid-cols-10 gap-1"
          style={{ width: 86 }}
        >
          {heartGrid.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <span
                  key={`${rowIndex}-${cellIndex}`}
                  className="h-[5px] w-[5px] transition-colors duration-300 motion-reduce:transition-none"
                  style={{
                    backgroundColor: cell === 1 ? heart : "transparent",
                  }}
                />
              ))}
            </React.Fragment>
          ))}
        </span>
      </button>
    </span>
  )
}

export default LikeButton
