"use client"

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
  return (
    <div style={{ position: "relative", minHeight: "100vh" }}>
      <AdaptiveDraftingGridBackground cellSize={22} majorEvery={5} showArcs showAngles />
      <FloatingNavbar items={NAV_ITEMS} />
      <div style={{ position: "fixed", bottom: "1.25rem", left: "1.25rem", zIndex: 50 }}>
        <ColorPicker />
      </div>
      <div style={{ position: "relative", zIndex: 1, padding: "2rem", paddingBottom: "8rem" }}>{children}</div>
    </div>
  )
}
