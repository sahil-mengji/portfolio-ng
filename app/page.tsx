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
import { ProfileHeader } from "@/components/profile-header"
import { SectionSeparator } from "@/components/section-separator"
import { ScrollRuler } from "@/components/scroll-ruler"
import { GitHubActivityWrapper } from "@/components/github-activity-wrapper"
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
      <div className="mx-auto max-w-7xl space-y-20">
        {/* HERO */}
        <section
          data-ruler-section
          data-ruler-label="Intro"
          data-ruler-type="default"
          data-ruler-preview="Designer — engineer systems for color"
        >
          {/* HERO — one continuous drafting sheet: band, identity, and
              intro share edge rules with zero gaps between */}
          {/* Full-bleed identity sheet. Top padding = exactly the
              spiral's upward overhang minus the band height, so the
              figure's top edge lands on the viewport top with no
              over-margin — fully dynamic. */}
          <div
            className="relative left-1/2 w-screen max-w-[100vw] -translate-x-1/2 overflow-x-clip"
            style={{
              paddingTop:
                "max(0px, calc(max(56px, calc(max(0px, (100vw - 80rem)/2) * 1.41)) * 0.382 - 32px))",
            }}
          >
            <SectionSeparator className="border-x-0" />
            <ProfileHeader />
            <SectionSeparator className="border-x-0" />
          </div>
        </section>
      </div>

      {/* BENTO — full-bleed flush frame: viewport-wide bands + grid whose
          tracks justify to the edges (zero side gutters, squares kept) */}
      <div>
        <SectionSeparator />
        {/* BENTO GRID – edge-to-edge tracks */}
        <div
          data-ruler-section
          data-ruler-label="Bento"
          data-ruler-type="decision"
          data-ruler-preview="Grid-driven portfolio cells"
        >
          <P2BentoGrid />
        </div>
        <SectionSeparator />
      </div>

      <div className="mx-auto max-w-7xl space-y-20">
        {/* INDEX – tabbed highlights with banner art */}
        <VerticalBannerTabs />
      </div>

      {/* ORBIT — full-bleed scatter, now below the Work/Education tabs */}
      <section
        data-ruler-section
        data-ruler-label="Orbit"
        data-ruler-type="default"
        data-ruler-preview="Six circles at 60 degrees"
        className="flex items-center justify-center overflow-x-clip px-6 py-10"
      >
        <OrbitSpread />
      </section>

      {/* GITHUB ACTIVITY */}
      <div className="mx-auto max-w-7xl">
        <SectionSeparator />
        <section
          data-ruler-section
          data-ruler-label="GitHub"
          data-ruler-type="default"
          data-ruler-preview="Contribution calendar"
          className="space-y-4"
        >
          <GitHubActivityWrapper username="sahil-mengji" />
        </section>
        <SectionSeparator />
      </div>

      <div className="mx-auto max-w-7xl space-y-20">

        <SectionSeparator />
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

        <SectionSeparator />
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

        <SectionSeparator />
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
