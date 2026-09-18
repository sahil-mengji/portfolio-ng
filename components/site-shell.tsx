"use client"

import { useEffect, useRef, useState } from "react"
import { playTap } from "@/lib/sound"
import AdaptiveDraftingGridBackground from "@/components/AdaptiveDraftingGridBackground"
import { FloatingNavbar } from "@/components/floating-navbar"
import { ColorPicker } from "@/components/ui/color-picker"

const NAV_ITEMS = [
  { href: "/", title: "Home" },
  { href: "/blogs", title: "Blogs" },
  { href: "/projects", title: "Projects" },
  { href: "/showcase", title: "Showcase" },
]

export function SiteShell({ children }: { children: React.ReactNode }) {
  // Gauntlet hide-and-reveal: parked below the viewport edge, slides up
  // when the corner hover zone is entered (180ms grace on leave).
  // Touch devices have no hover → always shown there.
  const [peek, setPeek] = useState(false)
  const [fineHover, setFineHover] = useState(true)
  // Gauntlet stays up while its animation runs, wherever it was triggered.
  const [gauntActive, setGauntActive] = useState(false)
  const hideT = useRef(0)
  useEffect(() => {
    setFineHover(window.matchMedia("(hover: hover)").matches)
    return () => window.clearTimeout(hideT.current)
  }, [])
  // Universal tap tick for every button/link press site-wide (gauntlet
  // opts out — its snap sound already covers it). Bubble phase runs after
  // the target's own handler, so the navbar toggle flips state first.
  useEffect(() => {
    const onTap = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null
      if (!t || t.closest("[data-silent-tap]")) return
      if (t.closest("button, a")) playTap()
    }
    document.addEventListener("click", onTap)
    return () => document.removeEventListener("click", onTap)
  }, [])
  const shown = peek || !fineHover || gauntActive
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <AdaptiveDraftingGridBackground cellSize={22} majorEvery={5} showArcs showAngles />
      <FloatingNavbar items={NAV_ITEMS} />
      <div
        onMouseEnter={() => {
          window.clearTimeout(hideT.current)
          setPeek(true)
        }}
        onMouseLeave={() => {
          window.clearTimeout(hideT.current)
          hideT.current = window.setTimeout(() => setPeek(false), 180)
        }}
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          zIndex: 200,
          width: 160,
          height: 132,
          display: "flex",
          alignItems: "flex-end",
          paddingLeft: 20,
        }}
      >
        <div
          style={{
            transform: shown ? "translateY(0)" : "translateY(120%)",
            opacity: shown ? 1 : 0,
            transition:
              "transform 450ms cubic-bezier(0.22,1,0.36,1), opacity 300ms",
          }}
        >
          <ColorPicker onActiveChange={setGauntActive} />
        </div>
      </div>
      <div style={{ position: "relative", zIndex: 1, padding: "2rem", paddingBottom: "8rem" }}>{children}</div>
    </div>
  )
}
