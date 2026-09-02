"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Text, CardContext } from "@/components/ui/text"
import { TextureButton } from "@/components/ui/texture-button"
import { SiteShell } from "@/components/site-shell"
import { blogPosts, projects, workExperience } from "@/lib/dummy-data"
import { P2BentoGrid } from "@/components/bento/P2BentoGrid"
import { useThemeColorContext } from "@/components/theme-provider"

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const { palette } = useThemeColorContext()
  return (
    <CardContext.Provider value={true}>
      <div
        className={`rounded-2xl border p-5 backdrop-blur ${className}`}
        style={{
          background: `color-mix(in srgb, ${palette.surface} 88%, transparent)`,
          borderColor: `color-mix(in srgb, ${palette.brand} 18%, transparent)`,
          boxShadow: `0 1px 2px ${hexToRgba(palette.brand, 0.06)}, 0 4px 12px ${hexToRgba(palette.primary, 0.04)}`,
        }}
      >
        {children}
      </div>
    </CardContext.Provider>
  )
}

export default function Page() {
  const router = useRouter()
  return (
    <SiteShell>
      <div className="max-w-5xl mx-auto space-y-20">
        {/* HERO */}
        <section className="pt-8 md:pt-16 space-y-6">
          <Text.Caption className="inline-flex rounded-full border px-3 py-1">Available for new work · 2026</Text.Caption>
          <Text.Heading className="!text-5xl md:!text-7xl leading-[0.9]">
            Designer — engineer
            <br />
            systems for <span className="underline decoration-2 underline-offset-8">color</span>
          </Text.Heading>
          <Text.Subheading className="max-w-2xl !text-2xl md:!text-3xl">
            I build editorial, grid-driven portfolios where one color drives everything — background is primary, guidelines flip by luminosity.
          </Text.Subheading>
          <div className="flex flex-wrap gap-3 pt-2">
            <TextureButton variant="primary" size="default" onClick={() => router.push("/projects")}>
              View projects
            </TextureButton>
            <TextureButton variant="secondary" size="default" onClick={() => router.push("/blogs")}>
              Read blogs
            </TextureButton>
            <TextureButton variant="minimal" size="default">
              Get in touch
            </TextureButton>
          </div>
        </section>

        {/* STORY */}
        <section className="grid md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-4">
            <Text.Subheading as="h3">Story</Text.Subheading>
            <Text.Caption className="mt-2 block">2019 → 2026</Text.Caption>
          </div>
          <div className="md:col-span-8 space-y-4">
            <Text.Body>Started in editorial, moved to systems. Obsessed with grids that feel like drafting tables — fixed, bottom-left pinned, clipped. Type set in Instrument Serif for subheads gives it a human editorial voice against the technical grid.</Text.Body>
            <Text.Body className="opacity-80">Single-picker theming wasn’t a gimmick: hue-tinted surfaces keep the UI from collapsing to white/black, and guideline ink stays legible by switching white ↔ dark shade per luminosity.</Text.Body>
          </div>
        </section>

        {/* BENTO GRID – migrated from p2/src/pages/Home/Home.jsx */}
        <P2BentoGrid />

        {/* WORK EXPERIENCE */}
        <section className="space-y-4">
          <Text.Subheading>Work experience</Text.Subheading>
          <div className="grid gap-4">
            {workExperience.map((w) => (
              <Card key={w.company}>
                <div className="flex flex-wrap justify-between gap-2">
                  <Text.Body className="font-medium">
                    {w.role} · {w.company}
                  </Text.Body>
                  <Text.Caption>{w.period} · {w.location}</Text.Caption>
                </div>
                <ul className="mt-3 space-y-1 list-disc list-inside">
                  {w.bullets.map((b) => (
                    <li key={b}>
                      <Text.Body as="span" size="sm" className="opacity-80">
                        {b}
                      </Text.Body>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <Text.Subheading>Projects</Text.Subheading>
            <Link href="/projects" className="text-sm underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="block">
                <Card className="h-full hover:scale-[1.01] transition">
                  <Text.Label>{p.year}</Text.Label>
                  <Text.Subheading as="h4" size="sm" className="mt-1 !text-lg">
                    {p.title}
                  </Text.Subheading>
                  <Text.Body size="sm" className="mt-2 opacity-80 line-clamp-3">
                    {p.excerpt}
                  </Text.Body>
                  <Text.Caption className="mt-3 block">{p.stack.join(" · ")}</Text.Caption>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* BLOGS */}
        <section className="space-y-4">
          <div className="flex items-end justify-between">
            <Text.Subheading>Blogs</Text.Subheading>
            <Link href="/blogs" className="text-sm underline underline-offset-4">
              View all
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {blogPosts.map((post) => (
              <Link key={post.slug} href={`/blogs/${post.slug}`} className="block">
                <Card className="h-full hover:scale-[1.01] transition">
                  <Text.Caption>
                    {post.date} · {post.readingTime}
                  </Text.Caption>
                  <Text.Subheading as="h4" size="sm" className="mt-2 !text-lg">
                    {post.title}
                  </Text.Subheading>
                  <Text.Body size="sm" className="mt-2 opacity-80 line-clamp-3">
                    {post.excerpt}
                  </Text.Body>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  )
}
