"use client"

import { useEffect, useRef, useState } from "react"
import { usePathname } from "next/navigation"
import { playTap } from "@/lib/sound"
import AdaptiveDraftingGridBackground from "@/components/AdaptiveDraftingGridBackground"
import { FloatingNavbar } from "@/components/floating-navbar"
import { SiteFooter } from "@/components/site-footer"
import { ColorPicker } from "@/components/ui/color-picker"

const NAV_ITEMS = [
  { href: "/", title: "Home" },
  { href: "/blogs", title: "Blogs" },
  { href: "/projects", title: "Projects" },
  { href: "/showcase", title: "Showcase" },
  { href: "/design-system", title: "Design System" },
]

export function SiteShell({
  children,
  showHatch = true,
  showHatchStrips,
  showFooter,
}: {
  children: React.ReactNode
  // Hatch strips at the measure edges — blog pages opt out for a clean read.
  showHatch?: boolean
  // Vertical 2rem hatch bands only (boundary rules stay). Defaults to showHatch.
  showHatchStrips?: boolean
  // Footer renders on the main page only by default; pass explicitly to override.
  showFooter?: boolean
}) {
  const pathname = usePathname()
  const showFooterResolved = showFooter ?? pathname === "/"
  const showHatchStripsResolved = showHatchStrips ?? showHatch
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
  // Master switch for the drafting-grid backdrop — flip to true to bring
  // the background pattern back (temporarily off).
  const SHOW_GRID = false
  return (
    <div
      style={
        {
          position: "relative",
          minHeight: "100vh",
          // Shared measure with ProfileHeader's spiral figure:
          // --measure-left = container left edge (L0),
          // --figH = spiral figure height (max(56px, L0 * 1.41)).
          // NOTE: 100% (not 100vw) so the math tracks the mx-auto
          // container, which lays out against the content width
          // excluding the scrollbar. 100vw includes the scrollbar and
          // pushed the RIGHT rule a few px off the grid's true edge —
          // a stray 1px "border" on the right side.
          "--measure-left": "max(0px, calc((100% - 80rem) / 2))",
          "--figH":
            "max(56px, calc(max(0px, calc((100% - 80rem) / 2)) * 1.41))",
        } as React.CSSProperties
      }
    >
      {SHOW_GRID && (
        <AdaptiveDraftingGridBackground
          cellSize={22}
          majorEvery={5}
          showArcs
          showAngles
        />
      )}
      {/* Vertical boundary rules at the max-w-7xl container edges — fixed
          so they run continuously behind everything (separators, orbit,
          sections), defining the measure wall to wall. Skipped with the
          hatch strips on clean pages (blogs). */}
      {showHatch &&
        ["left", "right"].map((side) => (
          <div
            key={side}
            aria-hidden
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              width: 1,
              zIndex: 0,
              pointerEvents: "none",
              background:
                "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              ...(side === "left"
                ? { left: "max(0px, calc((100% - 80rem) / 2))" }
                : { right: "max(0px, calc((100% - 80rem) / 2))" }),
            }}
          />
        ))}
      {/* Vertical hatch strips (2rem, ≥86rem viewports only). Mirrored pair:
          LEFT strip's outer RIGHT edge pinned to the golden spiral's
          topmost anchor ([377,144] → X = measure-left − 0.0906996·figH,
          so left = X − 2rem); RIGHT strip mirrors it — its outer LEFT
          edge lands on the mirrored X, so right = X − 2rem. Border-box
          sizing keeps the 1px borders (which travel with the bands)
          exactly on the anchors. */}
      {showHatchStripsResolved &&
        ["left", "right"].map((side) => (
          <div
            key={`hatch-${side}`}
            aria-hidden
            className="hidden min-[86rem]:block"
            style={{
              position: "fixed",
              top: 0,
              bottom: 0,
              width: "2rem",
              boxSizing: "border-box",
              zIndex: 0,
              pointerEvents: "none",
              background:
                "repeating-linear-gradient(45deg, color-mix(in srgb, var(--grid-ink,#767165) 32%, transparent) 0, color-mix(in srgb, var(--grid-ink,#767165) 32%, transparent) 1px, transparent 0, transparent 50%)",
              backgroundSize: "10px 10px",
              borderLeft:
                "1px solid color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              borderRight:
                "1px solid color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              ...(side === "left"
                ? {
                    left: "calc(var(--measure-left) - calc(var(--figH) * 0.0906996) - 2rem)",
                  }
                : {
                    right:
                      "calc(var(--measure-left) - calc(var(--figH) * 0.0906996) - 2rem)",
                  }),
            }}
          />
        ))}
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
      {/* Content column: flex + viewport-filling min-height pins the
          footer flush to the bottom edge of the screen on short pages
          (and to the document end on long ones). Zero bottom padding —
          the footer's own safe-area spacer owns the bottom rhythm. */}
      <div
        style={{
          position: "relative",
          zIndex: 1,
          padding: "2rem",
          paddingBottom: "0",
          display: "flex",
          flexDirection: "column",
          minHeight: "calc(100vh - 2rem)",
        }}
      >
        <div style={{ flex: "1 0 auto", minWidth: 0 }}>{children}</div>
        {showFooterResolved && <SiteFooter />}
      </div>
    </div>
  )
}
