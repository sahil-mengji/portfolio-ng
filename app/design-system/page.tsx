"use client"

import { Text } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { useThemeColorContext } from "@/components/theme-provider"
import { LinkTooltip } from "@/components/ui/link-tooltip"
import { ImageViewer } from "@/components/ui/image-viewer"
import { InteractionPane } from "@/components/ui/interaction-pane"

export default function DesignSystemPage() {
  const { palette, color } = useThemeColorContext()
  const gridInk = palette.gridInk ?? palette.text
  return (
    <SiteShell>
      <div className="max-w-3xl space-y-8">
        <Text.Heading>Design System</Text.Heading>
        <Text.Subheading>
          How the single picker drives everything
        </Text.Subheading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div
            className="rounded-2xl border p-4"
            style={{ background: palette.primary, borderColor: gridInk }}
          >
            <Text.Label style={{ color: gridInk }}>bg = primary</Text.Label>
            <div className="mt-2 font-mono text-xs" style={{ color: gridInk }}>
              {color.toUpperCase()}
            </div>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ background: palette.surface, borderColor: palette.brand }}
          >
            <Text.Label>surface (tinted)</Text.Label>
            <div
              className="mt-2 font-mono text-xs"
              style={{ color: palette.text }}
            >
              {palette.surface}
            </div>
          </div>
          <div
            className="rounded-2xl border p-4"
            style={{ background: gridInk, borderColor: palette.brand }}
          >
            <Text.Label style={{ color: palette.primary }}>gridInk</Text.Label>
            <div
              className="mt-2 font-mono text-xs"
              style={{ color: palette.primary }}
            >
              {gridInk}
            </div>
          </div>
        </div>
        <Text.Body>
          All tokens above update live from the left-bottom picker. Navbar bg is
          primary — see floating navbar.
        </Text.Body>

        <Text.Subheading as="h3" size="sm" className="!text-xl">
          Link tooltips
        </Text.Subheading>
        <Text.Body size="sm" className="opacity-80">
          Hover the{" "}
          <LinkTooltip
            href="https://github.com/sahil-mengji"
            title="GitHub — sahil-mengji"
            preview="Repos, stars and contribution graph."
          >
            GitHub profile
          </LinkTooltip>{" "}
          or the{" "}
          <LinkTooltip
            href="/blogs"
            title="Blogs"
            preview="Latest writing, MDX rendered."
          >
            internal blogs link
          </LinkTooltip>{" "}
          to see hover cards.
        </Text.Body>

        <Text.Subheading as="h3" size="sm" className="!text-xl">
          Image viewer
        </Text.Subheading>
        <Text.Body size="sm" className="opacity-80">
          Click a thumbnail — it morphs into the viewer. Wheel / pinch to zoom,
          drag to pan, swipe or arrows to page.
        </Text.Body>
        <ImageViewer
          images={[
            {
              id: "gep1",
              src: "/gep1.jpeg",
              alt: "GEP photo 1",
              width: 1280,
              height: 591,
              caption: "GEP · 1",
            },
            {
              id: "gep2",
              src: "/gep2.jpeg",
              alt: "GEP photo 2",
              width: 1280,
              height: 960,
              caption: "GEP · 2",
            },
            {
              id: "profile",
              src: "/profile.jpg",
              alt: "Profile",
              width: 400,
              height: 400,
              caption: "Profile",
            },
            {
              id: "cloud",
              src: "/clouds/cloud-1.png",
              alt: "Cloud render",
              width: 560,
              height: 299,
              caption: "Cloud study",
            },
          ]}
        />

        <Text.Subheading as="h3" size="sm" className="!text-xl">
          Interaction pane
        </Text.Subheading>
        <Text.Body size="sm" className="opacity-80">
          Scroll to zoom at the cursor, drag to pan, double-click to step
          in/out. Touch: one finger pans, two pinch.
        </Text.Body>
        <InteractionPane
          className="h-72 rounded-2xl border"
          contentClassName="p-6"
          style={{
            borderColor:
              "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
          }}
        >
          <div className="relative h-64 w-[560px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/gep1.jpeg"
              alt=""
              draggable={false}
              className="absolute top-2 left-2 w-64 rounded-lg select-none"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/clouds/cloud-1.png"
              alt=""
              draggable={false}
              className="absolute top-24 left-64 w-56 rounded-lg select-none"
            />
            <div
              className="absolute top-6 left-[26rem] rounded-xl border px-4 py-3 font-mono text-xs"
              style={{
                background:
                  "color-mix(in srgb, var(--surface, #f4f4f2) 85%, transparent)",
                borderColor:
                  "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
              }}
            >
              draggable node
            </div>
            <svg width="560" height="200" className="absolute top-0 left-0">
              <line
                x1="140"
                y1="60"
                x2="330"
                y2="140"
                stroke="var(--accent, #4f46e5)"
                strokeWidth="2"
                strokeDasharray="6 4"
              />
              <circle cx="140" cy="60" r="5" fill="var(--accent, #4f46e5)" />
              <circle cx="330" cy="140" r="5" fill="var(--accent, #4f46e5)" />
            </svg>
          </div>
        </InteractionPane>
      </div>
    </SiteShell>
  )
}
