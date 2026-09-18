"use client"

import Link from "next/link"
import { Text, CardContext } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { projects } from "@/lib/dummy-data"
import { defaultPalette } from "@/lib/color-utils"

const FB = defaultPalette
const CARD_STYLE = {
  background: `color-mix(in srgb, var(--surface, ${FB.surface}) 88%, transparent)`,
  borderColor: `color-mix(in srgb, var(--accent, ${FB.brand}) 18%, transparent)`,
  boxShadow: `0 1px 2px color-mix(in srgb, var(--accent, ${FB.brand}) 6%, transparent), 0 4px 12px color-mix(in srgb, var(--background, ${FB.primary}) 4%, transparent)`,
} as const

export default function ProjectsPage() {
  return (
    <SiteShell>
      <div className="max-w-3xl space-y-8">
        <Text.Heading>Projects</Text.Heading>
        <Text.Subheading>Dummy projects — same theming tokens</Text.Subheading>
        <div className="grid gap-4">
          {projects.map((p) => (
            <CardContext.Provider key={p.slug} value={true}>
              <Link
                href={`/projects/${p.slug}`}
                className="block rounded-2xl border p-5 backdrop-blur hover:opacity-95 transition-transform hover:scale-[1.01]"
                style={{ ...CARD_STYLE }}
              >
                <Text.Subheading as="h3" size="sm" className="!text-lg">
                  {p.title}
                </Text.Subheading>
                <Text.Body size="sm" className="mt-2 opacity-90">
                  {p.excerpt}
                </Text.Body>
                <Text.Caption className="mt-3 block">{p.year} · {p.stack.join(" · ")}</Text.Caption>
              </Link>
            </CardContext.Provider>
          ))}
        </div>
      </div>
    </SiteShell>
  )
}
