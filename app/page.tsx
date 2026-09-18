"use client"

import Link from "next/link"
import { useMemo } from "react"
import { useRouter } from "next/navigation"
import { Text, CardContext } from "@/components/ui/text"
import { TextureButton } from "@/components/ui/texture-button"
import { SiteShell } from "@/components/site-shell"
import { blogPosts, projects, workExperience } from "@/lib/dummy-data"
import { P2BentoGrid } from "@/components/bento/P2BentoGrid"
import { VerticalBannerTabs } from "@/components/vertical-banner-tabs"
import { WorkCompany } from "@/components/work-timeline"
import { OrbitSpread } from "@/components/orbit-spread"
import { ScrollRuler } from "@/components/scroll-ruler"
import { defaultPalette } from "@/lib/color-utils"

function Card({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  // Static var()-based style: instant theme response, zero subscription.
  const FB = defaultPalette
  const style = useMemo(
    () => ({
      background: `color-mix(in srgb, var(--surface, ${FB.surface}) 88%, transparent)`,
      borderColor: `color-mix(in srgb, var(--accent, ${FB.brand}) 18%, transparent)`,
      boxShadow: `0 1px 2px color-mix(in srgb, var(--accent, ${FB.brand}) 6%, transparent), 0 4px 12px color-mix(in srgb, var(--background, ${FB.primary}) 4%, transparent)`,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
  return (
    <CardContext.Provider value={true}>
      <div
        className={`rounded-2xl border p-5 backdrop-blur ${className}`}
        style={style}
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
      {/* ORBIT — full-bleed (outside max-w-7xl) so the scroll-scatter can
          use the whole viewport and never trims at a container edge */}
      <section
        data-ruler-section
        data-ruler-label="Orbit"
        data-ruler-type="default"
        data-ruler-preview="Six circles at 60 degrees"
        className="flex items-center justify-center overflow-x-clip px-6 py-10"
      >
        <OrbitSpread />
      </section>
      <div className="mx-auto max-w-7xl space-y-20">
        {/* HERO */}
        <section
          data-ruler-section
          data-ruler-label="Intro"
          data-ruler-type="default"
          data-ruler-preview="Designer — engineer systems for color"
          className="space-y-6 pt-8 md:pt-16"
        >
          <Text.Caption className="inline-flex rounded-full border px-3 py-1">
            Available for new work · 2026
          </Text.Caption>
          <Text.Heading className="!text-5xl leading-[0.9] md:!text-7xl">
            Designer — engineer
            <br />
            systems for{" "}
            <span className="underline decoration-2 underline-offset-8">
              color
            </span>
          </Text.Heading>
          <Text.Subheading className="max-w-2xl !text-2xl md:!text-3xl">
            I build editorial, grid-driven portfolios where one color drives
            everything — background is primary, guidelines flip by luminosity.
          </Text.Subheading>
          <div className="flex gap-3 pt-2">
            <TextureButton
              variant="primary"
              size="default"
              onClick={() => router.push("/projects")}
            >
              View projects
            </TextureButton>
            <TextureButton
              variant="secondary"
              size="default"
              onClick={() => router.push("/blogs")}
            >
              Read blogs
            </TextureButton>
            <TextureButton variant="minimal" size="default">
              Get in touch
            </TextureButton>
          </div>
        </section>

        {/* STORY */}
        <section
          data-ruler-section
          data-ruler-label="Story"
          data-ruler-type="default"
          data-ruler-preview="2019 → 2026 · editorial to systems"
          className="grid gap-6 md:grid-cols-12 md:gap-8"
        >
          <div className="md:col-span-4">
            <Text.Subheading as="h3">Story</Text.Subheading>
            <Text.Caption className="mt-2 block">2019 → 2026</Text.Caption>
          </div>
          <div className="space-y-4 md:col-span-8">
            <Text.Body>
              Started in editorial, moved to systems. Obsessed with grids that
              feel like drafting tables — fixed, bottom-left pinned, clipped.
              Type set in Instrument Serif for subheads gives it a human
              editorial voice against the technical grid.
            </Text.Body>
            <Text.Body className="opacity-80">
              Single-picker theming wasn’t a gimmick: hue-tinted surfaces keep
              the UI from collapsing to white/black, and guideline ink stays
              legible by switching white ↔ dark shade per luminosity.
            </Text.Body>
          </div>
        </section>

        {/* BENTO GRID – centered, square base tracks */}
        <div
          data-ruler-section
          data-ruler-label="Bento"
          data-ruler-type="decision"
          data-ruler-preview="Grid-driven portfolio cells"
        >
          <P2BentoGrid />
        </div>

        {/* INDEX – tabbed highlights with banner art */}
        <VerticalBannerTabs />

        {/* WORK EXPERIENCE */}
        <section
          data-ruler-section
          data-ruler-label="Work"
          data-ruler-type="action"
          data-ruler-preview="Work experience timeline"
          className="space-y-4"
        >
          <Text.Subheading>Work experience</Text.Subheading>
          <div className="grid gap-6">
            {workExperience.map((w) => (
              <Card key={w.company}>
                <WorkCompany w={w} />
              </Card>
            ))}
          </div>
        </section>

        {/* PROJECTS */}
        <section
          data-ruler-section
          data-ruler-label="Projects"
          data-ruler-type="decision"
          data-ruler-preview="Selected projects"
          className="space-y-4"
        >
          <div className="flex items-end justify-between">
            <Text.Subheading>Projects</Text.Subheading>
            <Link
              href="/projects"
              className="text-sm underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {projects.map((p) => (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="block">
                <Card className="h-full transition-transform hover:scale-[1.01]">
                  <Text.Label>{p.year}</Text.Label>
                  <Text.Subheading as="h4" size="sm" className="mt-1 !text-lg">
                    {p.title}
                  </Text.Subheading>
                  <Text.Body size="sm" className="mt-2 line-clamp-3 opacity-80">
                    {p.excerpt}
                  </Text.Body>
                  <Text.Caption className="mt-3 block">
                    {p.stack.join(" · ")}
                  </Text.Caption>
                </Card>
              </Link>
            ))}
          </div>
        </section>

        {/* BLOGS */}
        <section
          data-ruler-section
          data-ruler-label="Blogs"
          data-ruler-type="default"
          data-ruler-preview="Latest writing"
          className="space-y-4"
        >
          <div className="flex items-end justify-between">
            <Text.Subheading>Blogs</Text.Subheading>
            <Link
              href="/blogs"
              className="text-sm underline underline-offset-4"
            >
              View all
            </Link>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {blogPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blogs/${post.slug}`}
                className="block"
              >
                <Card className="h-full transition-transform hover:scale-[1.01]">
                  <Text.Caption>
                    {post.date} · {post.readingTime}
                  </Text.Caption>
                  <Text.Subheading as="h4" size="sm" className="mt-2 !text-lg">
                    {post.title}
                  </Text.Subheading>
                  <Text.Body size="sm" className="mt-2 line-clamp-3 opacity-80">
                    {post.excerpt}
                  </Text.Body>
                </Card>
              </Link>
            ))}
          </div>
        </section>
        <ScrollRuler />
      </div>
    </SiteShell>
  )
}
