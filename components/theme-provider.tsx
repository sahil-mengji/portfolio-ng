"use client"

import * as React from "react"
import { flushSync } from "react-dom"
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes"
import {
  useThemeColor,
  applyPaletteToDOM,
  generateColorPalette,
  normalizeThemeColor,
} from "@/lib/color-utils"
import { cn } from "@/lib/utils"

export type ThemeOrigin = Element | null

type ThemeColorContextProps = {
  color: string
  tertiaryColor: string | null
  secondaryColor: string | null
  palette: ReturnType<typeof import("@/lib/color-utils").generateColorPalette>
  /** Drag path: debounced site-wide apply w/ circular reveal (picker stays live locally). */
  updatePalette: (
    color: string,
    origin?: ThemeOrigin,
    secondary?: string | null,
    tertiary?: string | null
  ) => void
  /** Discrete path: immediate site-wide apply w/ circular reveal. */
  commitPalette: (
    color: string,
    origin?: ThemeOrigin,
    secondary?: string | null,
    tertiary?: string | null
  ) => void
  /** Flush a pending debounced commit immediately (e.g. drag release). */
  flushPalette: (origin?: ThemeOrigin) => void
  resetPalette: (origin?: ThemeOrigin) => void
  isOverridden: boolean
  defaultColor: string
}

const ThemeColorContext = React.createContext<ThemeColorContextProps | null>(
  null
)

// Move ThemeHotkey outside to avoid "created during render" error
function ThemeHotkey() {
  const { resolvedTheme, setTheme } = useTheme()

  React.useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (
        event.target instanceof Element &&
        event.target.closest(
          'input, textarea, select, [contenteditable]:not([contenteditable=\"false\"]), [role=\"textbox\"]'
        )
      )
        return

      if (event.key.toLowerCase() !== "d") {
        return
      }

      setTheme(resolvedTheme === "dark" ? "light" : "dark")
    }

    window.addEventListener("keydown", onKeyDown)

    return () => {
      window.removeEventListener("keydown", onKeyDown)
    }
  }, [resolvedTheme, setTheme])

  return null
}

export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  const theme = useThemeColor()
  const {
    color,
    secondaryColor,
    tertiaryColor,
    palette,
    isOverridden,
    defaultColor,
  } = theme
  const commitRef = React.useRef(theme.updatePalette)
  commitRef.current = theme.updatePalette

  const revealRef = React.useRef<(() => void) | null>(null)
  // Reveal the new page through one circular mask from the active control.
  const revealCommit = React.useCallback(
    (
      input: string,
      origin?: ThemeOrigin,
      second: string | null = null,
      third: string | null = null
    ) => {
      let hex: string
      try {
        hex = normalizeThemeColor(input)
        second = second ? normalizeThemeColor(second) : null
        third = second && third ? normalizeThemeColor(third) : null
      } catch {
        return
      }
      revealRef.current?.()
      const commit = () => {
        applyPaletteToDOM(
          generateColorPalette(hex, second, third),
          hex !== defaultColor.toLowerCase() || !!second
        )
        commitRef.current(hex, second, third)
      }
      if (
        matchMedia("(prefers-reduced-motion: reduce)").matches ||
        !document.startViewTransition
      ) {
        commit()
        return
      }
      const anchor = document
        .querySelector("[data-theme-hand-origin]")
        ?.getBoundingClientRect()
      const x = anchor?.left ?? Math.min(76, innerWidth / 2)
      const y = anchor?.top ?? innerHeight - 56
      const radius =
        Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y)) +
        80
      const root = document.documentElement
      root.dataset.themeTransition = "circle"
      let cancelled = false
      const animations: Animation[] = []
      const transition = document.startViewTransition(() => {
        if (!cancelled) flushSync(commit)
      })
      const clean = () => {
        if (revealRef.current === cancel) {
          delete root.dataset.themeTransition
          revealRef.current = null
        }
      }
      const cancel = () => {
        cancelled = true
        animations.forEach((a) => a.cancel())
        transition.skipTransition()
        clean()
      }
      revealRef.current = cancel
      root.style.setProperty("--reveal-x", `${x}px`)
      root.style.setProperty("--reveal-y", `${y}px`)
      transition.ready
        .then(() => {
          if (cancelled) return
          const options = {
            duration: 780,
            easing: "cubic-bezier(.22,.65,.3,1)",
            fill: "forwards" as const,
          }
          animations.push(
            root.animate(
              [
                {
                  offset: 0,
                  clipPath: `circle(0px at ${x}px ${y}px)`,
                  transform: "scale(.96)",
                },
                {
                  offset: 0.72,
                  clipPath: `circle(${radius * 0.94}px at ${x}px ${y}px)`,
                  transform: "scale(1.012)",
                },
                {
                  offset: 1,
                  clipPath: `circle(${radius}px at ${x}px ${y}px)`,
                  transform: "scale(1)",
                },
              ],
              { ...options, pseudoElement: "::view-transition-new(root)" }
            )
          )
          // Snapshot capture pauses rendering. Use the resumed frame's clock
          // for every layer so time spent capturing cannot consume the reveal.
          animations.forEach((animation) => {
            animation.pause()
            animation.currentTime = 0
          })
          requestAnimationFrame((time) => {
            if (cancelled) return
            animations.forEach((animation) => {
              animation.play()
              animation.startTime = time
            })
          })
        })
        .catch(() => {
          if (!cancelled) commit()
        })
      transition.finished.catch(() => {}).finally(clean)
    },
    [defaultColor]
  )

  // Debounced drag path: the picker block stays live via local state while
  // dragging; the whole site applies ~300ms after the last change.
  const pendingRef = React.useRef<{
    hex: string
    origin: ThemeOrigin
    second: string | null
    third: string | null
  } | null>(null)
  const timerRef = React.useRef(0)
  const updatePalette = React.useCallback(
    (
      hex: string,
      origin: ThemeOrigin = null,
      second: string | null = null,
      third: string | null = null
    ) => {
      pendingRef.current = { hex, origin, second, third }
      window.clearTimeout(timerRef.current)
      timerRef.current = window.setTimeout(() => {
        const p = pendingRef.current
        pendingRef.current = null
        if (p) revealCommit(p.hex, p.origin, p.second, p.third)
      }, 300)
    },
    [revealCommit]
  )
  const flushPalette = React.useCallback(
    (origin?: ThemeOrigin) => {
      window.clearTimeout(timerRef.current)
      const p = pendingRef.current
      pendingRef.current = null
      if (p) revealCommit(p.hex, origin ?? p.origin, p.second, p.third)
    },
    [revealCommit]
  )
  const commitPalette = React.useCallback(
    (
      hex: string,
      origin: ThemeOrigin = null,
      second: string | null = null,
      third: string | null = null
    ) => {
      window.clearTimeout(timerRef.current)
      pendingRef.current = null
      revealCommit(hex, origin, second, third)
    },
    [revealCommit]
  )
  const resetPalette = React.useCallback(
    (origin: ThemeOrigin = null) => {
      window.clearTimeout(timerRef.current)
      pendingRef.current = null
      // updatePalette derives isOverridden from hex vs default — committing
      // the default color IS the reset.
      revealCommit(defaultColor, origin)
    },
    [revealCommit, defaultColor]
  )

  React.useEffect(() => {
    return () => {
      window.clearTimeout(timerRef.current)
      revealRef.current?.()
    }
  }, [])

  // Universal theming only when overridden; otherwise respect system light/dark (next-themes class)
  // Committed palette syncs to DOM (covers mount + debounced drag commits + discrete picks).
  React.useEffect(() => {
    applyPaletteToDOM(palette, isOverridden)
    window.dispatchEvent(
      new CustomEvent("theme:committed", { detail: { hex: color } })
    )
  }, [palette, isOverridden, color])

  const colorValue = React.useMemo(
    () => ({
      color,
      secondaryColor,
      tertiaryColor,
      palette,
      updatePalette,
      commitPalette,
      flushPalette,
      resetPalette,
      isOverridden,
      defaultColor,
    }),
    [
      color,
      secondaryColor,
      tertiaryColor,
      palette,
      updatePalette,
      commitPalette,
      flushPalette,
      resetPalette,
      isOverridden,
      defaultColor,
    ]
  )

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
      disableTransitionOnChange
      {...props}
    >
      <ThemeColorContext.Provider value={colorValue}>
        <ThemeHotkey />
        {children}
      </ThemeColorContext.Provider>
    </NextThemesProvider>
  )
}

export function useThemeColorContext() {
  const context = React.useContext(ThemeColorContext)
  if (context === null) {
    throw new Error("useThemeColorContext must be used within a ThemeProvider")
  }
  return context
}
