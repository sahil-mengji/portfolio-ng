"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { useThemeColorContext } from "@/components/theme-provider"

// Fallback NavItem type if @/types/nav missing
export type NavItem = { href: string; title: string; external?: boolean }

function hexToRgba(hex: string, alpha: number) {
  const h = hex.replace("#", "")
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const num = parseInt(full, 16)
  const r = (num >> 16) & 255
  const g = (num >> 8) & 255
  const b = num & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

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

// Minimal brand mark fallback
function BrandMark({ ink }: { ink: string }) {
  return (
    <span
      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold leading-none"
      style={{ background: ink, color: "#fff", mixBlendMode: "difference" } as React.CSSProperties}
      aria-hidden
    >
      ◆
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
  const { palette } = useThemeColorContext()
  const [visible, setVisible] = useState(true)
  const lastY = useRef(0)

  // navbar bg = card bg (surface) – text tokens must match surface, not primary
  const gridInk = (palette as any).gridInk ?? palette.text
  const gridBg = (palette as any).gridBg ?? palette.primary
  const navBg = hexToRgba(palette.surface, 0.92)
  const navBorder = hexToRgba(palette.brand, 0.18)
  const navRing = hexToRgba(palette.brand, 0.12)
  const p: any = palette
  const foreground = p.cardText ?? palette.text
  const muted = p.cardSecondaryText ?? palette.secondaryText
  const accentBg = hexToRgba(palette.brand, 0.16)
  const accentText = p.cardText ?? palette.text

  function isLight(hex: string) {
    // quick luma check for accent opacity
    const { l } = (() => {
      const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      if (!m) return { l: 50 }
      const r = parseInt(m[1], 16) / 255,
        g = parseInt(m[2], 16) / 255,
        b = parseInt(m[3], 16) / 255
      const max = Math.max(r, g, b),
        min = Math.min(r, g, b)
      return { l: ((max + min) / 2) * 100 }
    })()
    return l > 58
  }

  useEffect(() => {
    lastY.current = window.scrollY
    const onScroll = () => {
      const cur = window.scrollY
      const dir = cur > lastY.current ? "down" : "up"
      if (cur < 50) setVisible(true)
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
          boxShadow: `0 12px 40px ${hexToRgba(gridBg, 0.22)}, 0 0 0 1px ${navRing}`,
        }}
      >
        {/* Logo */}
        <div className="flex items-center pl-2">
          <Link
            href="/"
            aria-label="Home"
            className="transition-[scale] ease-out active:scale-[0.98] flex items-center"
          >
            <BrandMark ink={gridInk} />
          </Link>
        </div>

        <Separator orientation="vertical" className="h-6 mx-1" style={{ background: hexToRgba(foreground, 0.12) }} />

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
          <span
            className="hidden sm:inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: hexToRgba(gridInk, 0.1), color: muted, border: `1px solid ${hexToRgba(gridInk, 0.12)}` }}
          >
            {gridInk.toUpperCase()}
          </span>
          <Separator orientation="vertical" className="h-4 hidden sm:block" style={{ background: hexToRgba(foreground, 0.12) }} />
          {/* Mobile nav fallback */}
          <div className="flex md:hidden items-center gap-1">
            <Separator orientation="vertical" className="h-6 mx-1" style={{ background: hexToRgba(foreground, 0.12) }} />
            <span className="text-xs px-2" style={{ color: muted }}>
              Menu
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
