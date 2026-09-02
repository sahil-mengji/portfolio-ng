"use client"

import { Text } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { useThemeColorContext } from "@/components/theme-provider"

export default function ShowcasePage() {
  const { palette, color } = useThemeColorContext()
  const gridInk = (palette as any).gridInk
  return (
    <SiteShell>
      <div className="max-w-3xl space-y-8">
        <Text.Heading>Showcase</Text.Heading>
        <Text.Subheading>How the single picker drives everything</Text.Subheading>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-2xl border p-4" style={{ background: palette.primary, borderColor: gridInk }}>
            <Text.Label style={{ color: gridInk }}>bg = primary</Text.Label>
            <div className="mt-2 font-mono text-xs" style={{ color: gridInk }}>
              {color.toUpperCase()}
            </div>
          </div>
          <div className="rounded-2xl border p-4" style={{ background: palette.surface, borderColor: palette.brand }}>
            <Text.Label>surface (tinted)</Text.Label>
            <div className="mt-2 font-mono text-xs" style={{ color: palette.text }}>
              {palette.surface}
            </div>
          </div>
          <div className="rounded-2xl border p-4" style={{ background: gridInk, borderColor: palette.brand }}>
            <Text.Label style={{ color: palette.primary }}>gridInk</Text.Label>
            <div className="mt-2 font-mono text-xs" style={{ color: palette.primary }}>
              {gridInk}
            </div>
          </div>
        </div>
        <Text.Body>All tokens above update live from the left-bottom picker. Navbar bg is primary — see floating navbar.</Text.Body>
      </div>
    </SiteShell>
  )
}
