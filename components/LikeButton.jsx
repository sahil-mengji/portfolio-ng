"use client"
import React, { useEffect, useRef, useState } from "react"
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

  // Picker theming: defaults below stay pixel-identical when idle; every
  // element repaints from theme tokens only while overridden.
  const { palette, isOverridden } = useThemeColorContext()
  const theme = !isOverridden
    ? null
    : (() => {
        const p = palette || {}
        const accent = p.brand || "#cf3333"
        const text = p.text || "#171717"
        const surface = p.surface || "#ffffff"
        const tmix = (pct) => `color-mix(in srgb, ${text} ${pct}%, transparent)`
        return {
          heartLiked: accent,
          heartIdle: `color-mix(in srgb, ${surface} 85%, transparent)`,
          bgLiked: `color-mix(in srgb, ${accent} 30%, ${surface})`,
          bgIdle: tmix(80),
          border: tmix(45),
          rippleLiked: `color-mix(in srgb, ${accent} 75%, transparent)`,
          rippleIdle: tmix(55),
        }
      })()

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
      {/* Ripples expand from behind the circle on every press */}
      {ripples.map((id) => (
        <span
          key={id}
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute inset-0 animate-ping rounded-full border-2",
            isLiked ? "border-[#cf3333]/70" : "border-gray-500/60"
          )}
          style={
            theme
              ? {
                  borderColor: isLiked ? theme.rippleLiked : theme.rippleIdle,
                }
              : undefined
          }
        />
      ))}
      <button
        type="button"
        onClick={handleClick}
        aria-pressed={isLiked}
        aria-label={isLiked ? "Unlike" : "Like"}
        className={cn(
          "relative aspect-square transform rounded-full border-2 border-black p-8 shadow-lg",
          "transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          "hover:scale-110 hover:brightness-110",
          "active:scale-95 active:brightness-90",
          "focus:outline-none",
          isLiked ? "bg-[#500606]" : "bg-[#313131]"
        )}
        style={
          theme
            ? {
                backgroundColor: isLiked ? theme.bgLiked : theme.bgIdle,
                borderColor: theme.border,
              }
            : undefined
        }
      >
        <span className="grid grid-cols-10 gap-1">
          {heartGrid.map((row, rowIndex) => (
            <React.Fragment key={rowIndex}>
              {row.map((cell, cellIndex) => (
                <span
                  key={`${rowIndex}-${cellIndex}`}
                  className={cn(
                    "h-[5px] w-[5px]",
                    cell === 1
                      ? isLiked
                        ? "bg-[#cf3333]"
                        : "bg-gray-500"
                      : "bg-transparent",
                    isLiked && cell === 1 && "animate-pulse"
                  )}
                  style={
                    theme && cell === 1
                      ? {
                          backgroundColor: isLiked
                            ? theme.heartLiked
                            : theme.heartIdle,
                        }
                      : undefined
                  }
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
