"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { defaultPalette } from "@/lib/color-utils"
import { useSoundOn, setSoundOn, playTap } from "@/lib/sound"
import { Volume2, VolumeX } from "lucide-react"
import { useThemeColorContext } from "@/components/theme-provider"

// Fallback NavItem type if @/types/nav missing
export type NavItem = { href: string; title: string; external?: boolean }

// Minimal inline Separator to avoid missing @/components/ui/separator
function Separator({ orientation = "vertical", className, style }: { orientation?: "vertical" | "horizontal"; className?: string; style?: React.CSSProperties }) {
  return (
    <div
      role="separator"
      className={cn(orientation === "vertical" ? "w-px self-stretch" : "h-px w-full", className)}
      style={style}
    />
  )
}

// Brand logo lockup (wide monogram artwork), scaled to navbar height.
// Themified like the rest of the bar: panels follow --surface, letterforms
// follow --grid-ink — repaints instantly on theme drags via CSS vars.
function LogoMark() {
  const FB = defaultPalette
  const panel = `var(--surface, ${FB.surface})`
  const ink = `var(--grid-ink, ${FB.gridInk})`
  return (
    <svg
      viewBox="0 0 6813 4020"
      aria-hidden
      className="block h-9 w-auto rounded-[6px]"
    >
      <rect width="3291" height="4020" fill={panel} />
      <rect x="3522" width="3291" height="4020" fill={panel} />
      <path d="M2976.15 952.121H1044.12V1188.57H2976.15V2884.15H315V2155.03H2247.03L2247.03 1917.69H1044.12V1923.08H315V223H2976.15V952.121Z" fill={ink} />
      <rect x="3836" y="227.496" width="2661.15" height="729.12" fill={ink} />
      <rect x="5530.69" y="223" width="2661.15" height="729.12" transform="rotate(90 5530.69 223)" fill={ink} />
      <rect x="4565.12" y="223" width="2661.15" height="729.12" transform="rotate(90 4565.12 223)" fill={ink} />
      <rect x="6497.15" y="223" width="2661.15" height="729.12" transform="rotate(90 6497.15 223)" fill={ink} />
    </svg>
  )
}

// Live ink-hex readout — isolated subscriber so only this chip re-renders
// on commits; the rest of the navbar follows CSS vars with zero re-renders.
function NavInkLabel({ className, style }: { className?: string; style?: React.CSSProperties }) {
  const { palette } = useThemeColorContext()
  const gridInk = (palette as any).gridInk ?? palette.text
  return (
    <span className={className} style={style}>
      {gridInk.toUpperCase()}
    </span>
  )
}

interface FloatingNavbarProps {
  items?: NavItem[]
  mobileItems?: NavItem[]
  stargazersCount?: number
  docPreviews?: any[]
  blocks?: any[]
}

const defaultItems: NavItem[] = [
  { href: "/", title: "Home" },
  { href: "/work", title: "Work" },
  { href: "/writing", title: "Writing" },
  { href: "/about", title: "About" },
]

export function FloatingNavbar({
  items = defaultItems,
  mobileItems = defaultItems,
}: FloatingNavbarProps) {
  const pathname = usePathname()
  const soundOn = useSoundOn()
  // Hidden at the initial (top) position — reveals on scroll-up only.
  const [visible, setVisible] = useState(false)
  const lastY = useRef(0)

  // All colors via CSS vars (fallbacks = default palette): the navbar never
  // re-renders on theme drags — it repaints instantly from preview DOM writes.
  // Token map: surface→--surface, brand→--accent, gridInk→--grid-ink,
  // gridBg→--grid-bg, cardText→--card-text, cardSecondaryText→--card-muted.
  const FB = defaultPalette
  const gridInk = `var(--grid-ink, ${FB.gridInk})`
  const gridBg = `var(--grid-bg, ${FB.gridBg})`
  const surface = `var(--surface, ${FB.surface})`
  const accent = `var(--accent, ${FB.brand})`
  const foreground = `var(--card-text, ${FB.cardText})`
  const muted = `var(--card-muted, ${FB.cardSecondaryText})`
  const mix = (token: string, pct: number) =>
    `color-mix(in srgb, ${token} ${pct}%, transparent)`
  const navBg = mix(surface, 92)
  const navBorder = mix(accent, 18)
  const navRing = mix(accent, 12)
  const accentBg = mix(accent, 16)
  const faintFg = mix(foreground, 12)
  const faintInk = mix(gridInk, 10)
  const faintInkBorder = mix(gridInk, 12)

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const cur = window.scrollY
      const dir = cur > lastY.current ? "down" : "up"
      if (cur < 50) setVisible(false)
      else if (dir === "down" && cur > 100) setVisible(false)
      else if (dir === "up") setVisible(true)
      lastY.current = cur
    }
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-7 left-1/2 z-[100] flex w-full max-w-[880px] -translate-x-1/2 justify-center px-4 pointer-events-none transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-[120%] opacity-0"
      )}
    >
      <div
        className="flex w-full items-center gap-3 rounded-full p-3 pl-3 shadow-2xl backdrop-blur-xl pointer-events-auto cursor-pointer transition-transform hover:scale-[1.015] hover:-translate-y-0.5"
        style={{
          background: navBg,
          border: `1px solid ${navBorder}`,
          boxShadow: `0 12px 40px ${mix(gridBg, 22)}, 0 0 0 1px ${navRing}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center pl-2">
          <Link
            href="/"
            aria-label="Home"
            className="transition-[scale] ease-out active:scale-[0.98] flex items-center"
          >
            <LogoMark />
          </Link>
        </div>

            <Separator orientation="vertical" className="h-6 mx-1" style={{ background: faintFg }} />

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5 flex-1">
          {items.map((item) => {
            const active =
              (pathname?.startsWith(item.href) && item.href !== "/") || pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "relative px-5 py-2 text-[15px] font-medium transition-colors rounded-full",
                  active ? "" : "hover:opacity-80"
                )}
                style={{
                  color: active ? foreground : muted,
                }}
              >
                {active && (
                  <span
                    className="absolute inset-0 -z-0 rounded-full"
                    style={{ background: accentBg }}
                    aria-hidden
                  />
                )}
                <span className="relative z-10" style={active ? { color: foreground } : undefined}>
                  {item.title}
                </span>
              </Link>
            )
          })}
        </nav>

        <div className="flex-1 md:hidden" />

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2 pr-1">
          {/* placeholder for command menu / github / theme – keep themified minimal */}
          <NavInkLabel
            className="hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: faintInk, color: muted, border: `1px solid ${faintInkBorder}` }}
          />
          <Separator orientation="vertical" className="h-4 hidden sm:block" style={{ background: faintFg }} />
          {/* Universal sound toggle */}
          <button
            onClick={() => {
              const v = !soundOn
              setSoundOn(v)
              if (v) playTap()
            }}
            aria-label={soundOn ? "Mute sound effects" : "Unmute sound effects"}
            title={soundOn ? "Mute sounds" : "Unmute sounds"}
            className="grid h-8 w-8 place-items-center rounded-full transition-transform hover:scale-105 active:scale-95"
            style={{ color: muted }}
          >
            {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
          </button>
          {/* Mobile nav fallback */}
          <div className="flex md:hidden items-center gap-1">
        <Separator orientation="vertical" className="h-6 mx-1" style={{ background: faintFg }} />
            <span className="text-xs px-2" style={{ color: muted }}>
              Menu
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
