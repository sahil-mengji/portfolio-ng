"use client"

import { Link } from "next-view-transitions"
import { useRouter } from "next/navigation"
import {
  DraftingCompass,
  Ruler,
  PenTool,
  Grid3x3,
  Type,
  Palette,
  Layers,
  Spline,
} from "lucide-react"
import { Text } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { blogPosts } from "@/lib/dummy-data"
import { rememberBlogReturn } from "@/lib/blog-return"
import { P2BentoGrid } from "@/components/bento/P2BentoGrid"
import { VerticalBannerTabs } from "@/components/vertical-banner-tabs"
import { LaptopBack } from "@/components/laptop-back"
// import { OrbitSpread } from "@/components/orbit-spread"
import { ProfileHeader } from "@/components/profile-header"
import { SectionSeparator } from "@/components/section-separator"
import { ScrollRuler } from "@/components/scroll-ruler"

// Thin-line drafting icons for the Proof circles.
const PROOF_ICONS = [
  DraftingCompass,
  Ruler,
  PenTool,
  Grid3x3,
  Type,
  Palette,
  Layers,
  Spline,
]

// Pill labels for the Blogs heading cells (4 + 3) — each pill sizes to
// its own text, height uniform, zero gaps.
const BLOG_PILLS = [
  "Design",
  "Grids",
  "Type",
  "Color",
  "Motion",
  "Draft",
  "Notes",
]

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

      {/* BENTO — grid with breathing room, closed below by a hatch band
          (the hero's own closing band above doubles as its top rule) */}
      <div className="px-8 pt-12 pb-10 md:px-16 md:pb-12">
        {/* BENTO GRID – edge-to-edge tracks, pinned left + right by the
            same 1px fine measure rules as the rest of the sheet */}
        <div
          data-ruler-section
          data-ruler-label="Bento"
          data-ruler-type="decision"
          data-ruler-preview="Grid-driven portfolio cells"
          className="border-x border-[color-mix(in_srgb,var(--grid-ink,#767165)_16%,transparent)]"
        >
          <P2BentoGrid />
        </div>
        {/* Fine thin rule at the bento bottom edge — full screen width. */}
        <div
          aria-hidden
          className="relative left-1/2 h-px w-screen max-w-[100vw] -translate-x-1/2"
          style={{
            background:
              "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
        {/* Fine line flush on the Proof hatch band's top edge — no gap,
            mirroring the Blogs top. */}
        <div
          aria-hidden
          className="relative left-1/2 mt-6 h-px w-screen max-w-[100vw] -translate-x-1/2 md:mt-8"
          style={{
            background:
              "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
        <SectionSeparator />
        {/* Fine horizontal hairlines above the statement — a matching pair
            mirroring the double rule below, same little gap between. */}
        <div
          aria-hidden
          className="relative left-1/2 mt-6 h-px w-screen max-w-[100vw] -translate-x-1/2 md:mt-8"
          style={{
            background:
              "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
        <div
          aria-hidden
          className="relative left-1/2 mt-2 h-px w-screen max-w-[100vw] -translate-x-1/2"
          style={{
            background:
              "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
        {/* Statement: big Instrument Serif lead-in, starting exactly at the
            intersection of the horizontal band and the vertical hatch
            strips (the max-w-7xl measure edge) — with a 2-row grid of
            circular fine-line cells filling the block height on the right,
            outer edge pinned to the right vertical measure rule. */}
        <div className="flex flex-wrap items-center gap-0 pl-[calc((100vw_-_92rem)/2)]">
          {/* md:pl-[max(2rem,)] */}
          <Text.Subheading className="min-w-56 flex-1 !text-5xl md:!text-8xl">
            Proof <br /> of work.
          </Text.Subheading>
          {/* Circles grid: shifted left so its outer right edge aligns
              exactly with the fine running vertical measure rule (never
              crossing past it); shrink-0 keeps the circles clear of the
              heading. Cells are fixed squares — deterministic, no
              stretch/aspect math, so overlap is impossible. */}
          <div
            aria-hidden
            className="mr-[max(0px,calc((100vw_-_92rem)/2))] grid shrink-0 grid-flow-col grid-rows-2 gap-0"
          >
            {PROOF_ICONS.map((Icon, i) => (
              <div
                key={i}
                className="flex size-20 items-center justify-center rounded-full border md:size-24"
                style={{
                  borderColor:
                    "color-mix(in srgb, var(--grid-ink,#767165) 32%, transparent)",
                }}
              >
                <Icon
                  size={28}
                  strokeWidth={1.25}
                  className="opacity-60"
                  aria-hidden
                />
              </div>
            ))}
          </div>
        </div>
        <div
          aria-hidden
          className="relative left-1/2 h-px w-screen max-w-[100vw] -translate-x-1/2"
          style={{
            background:
              "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
        {/* Second hairline below the first, separated by a little gap —
            double-rule close for the statement block. */}
        <div
          aria-hidden
          className="relative left-1/2 mt-2 h-px w-screen max-w-[100vw] -translate-x-1/2"
          style={{
            background:
              "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
          }}
        />
      </div>

      <div className="mx-auto max-w-7xl space-y-20">
        {/* INDEX – tabbed highlights with banner art */}
        <VerticalBannerTabs />
      </div>

      {/* ORBIT — full-bleed scatter, now below the Work/Education tabs */}
      {/* Jack of all trades section — temporarily hidden
      <section
        data-ruler-section
        data-ruler-label="Orbit"
        data-ruler-type="default"
        data-ruler-preview="Six circles at 60 degrees"
        className="flex items-center justify-center overflow-x-clip px-6 py-10"
      >
        <OrbitSpread />
      </section>
      */}

      <div className="mx-auto flex max-w-7xl flex-col gap-20">
        {/* Flush stack (gap-0): hairline touches the hatch band, hatch
            touches the Blogs block — no empty band in between for the
            vertical measure rules to show through. NOTE: space-y + !mt-0
            cannot do this in Tailwind v4 — space-y lives on the previous
            sibling's margin-block-end, so !mt-0 on the next sibling never
            cancels it. */}
        <div className="flex flex-col gap-0">
          {/* Fine line flush on the Blogs hatch band's top edge — no gap,
            mirroring the bento's thin-rule-over-hatch pattern. */}
          <div
            aria-hidden
            className="relative left-1/2 h-px w-screen max-w-[100vw] -translate-x-1/2"
            style={{
              background:
                "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
            }}
          />
          <SectionSeparator />
          {/* Fine 1px line flush on the heading block's top edge — touches
            the hatch above and the heading below, no gaps. */}

          {/* BLOGS */}
          <section
            data-ruler-section
            data-ruler-label="Blogs"
            data-ruler-type="default"
            data-ruler-preview="Latest writing"
          >
            {/* Statement heading mirroring the Proof block: 2-row circular
              cell grid on the left, big serif heading right-aligned. */}

            <div
              aria-hidden
              className="relative left-1/2 mt-6 h-px w-screen max-w-[100vw] -translate-x-1/2 md:mt-8"
              style={{
                background:
                  "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="relative left-1/2 mt-2 h-px w-screen max-w-[100vw] -translate-x-1/2"
              style={{
                background:
                  "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              }}
            />

            {/* Blogs 2-col grid: first card backfills (1,1), heading +
              pills locked to (1,2), other cards fill the rest. Blueprint
              construction lines (middle-column vertical double +
              middle-row horizontal double) sit in the 8px gutters —
              exactly two per axis, flanking the gap, no extra center
              line. Overlay is desktop-only: single column has no
              middle column to mark. Outer 1px fine rules left + right
              pin the grid to the max-w-7xl measure, mirroring the
              bento grid above. */}
            <div className="relative border-x border-[color-mix(in_srgb,var(--grid-ink,#767165)_16%,transparent)]">
              <div className="grid grid-flow-dense gap-2 md:auto-rows-fr md:grid-cols-2">
                {/* Cell (1,2): heading + pills stacked, vertically centered —
                auto-flow backfills the first card into (1,1). Cards
                stretch to take their whole cell. Heading steps down so
                all four cells land the same size. */}
                <div className="flex flex-col justify-center bg-background md:col-start-2">
                  <Text.Subheading className="text-right !text-5xl md:!text-8xl">
                    Blogs.
                  </Text.Subheading>
                  {/* Pills in flex layout: two rows (4 + 3) — each pill widths
                  to its own text, uniform height, zero gaps. */}
                  <div className="mt-4 flex justify-end md:mt-6">
                    <div
                      aria-hidden
                      className="flex w-auto shrink-0 flex-col gap-0"
                    >
                      {[0, 1].map((row) => (
                        <div
                          key={row}
                          className="flex items-center justify-end gap-0"
                        >
                          {BLOG_PILLS.slice(
                            row * 4,
                            row * 4 + (row === 0 ? 4 : 3)
                          ).map((label) => (
                            <div
                              key={label}
                              className="flex h-10 items-center justify-center rounded-full border px-4 font-mono text-xs font-light tracking-wide whitespace-nowrap opacity-70 md:h-12 md:px-5 md:text-sm"
                              style={{
                                borderColor:
                                  "color-mix(in srgb, var(--grid-ink,#767165) 32%, transparent)",
                              }}
                            >
                              {label}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                {blogPosts.map((post) => (
                  <Link
                    key={post.slug}
                    href={`/blogs/${post.slug}`}
                    onClick={rememberBlogReturn}
                    className="group block min-h-[220px] bg-background p-5 md:min-h-[240px] md:p-6"
                  >
                    <Text.Subheading
                      as="h4"
                      size="sm"
                      className="!text-3xl group-hover:underline group-hover:underline-offset-4"
                      style={{ viewTransitionName: `blog-title-${post.slug}` }}
                    >
                      {post.title}
                    </Text.Subheading>
                    <Text.Body
                      size="sm"
                      className="mt-2 line-clamp-3 opacity-80"
                      style={{
                        viewTransitionName: `blog-excerpt-${post.slug}`,
                      }}
                    >
                      {post.excerpt}
                    </Text.Body>
                  </Link>
                ))}
              </div>
              {/* Blueprint lines: one vertical double in the middle-column
              gutter + one horizontal double in the middle-row gutter —
              exactly two lines per axis, each 1px pair flanking the 8px
              gap (left/top at -4px, right/bottom at +3px so the 1px
              stroke stays inside the gutter, never over cell content). */}
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 hidden md:block"
              >
                <div
                  className="absolute inset-y-0 left-[calc(50%_-_4px)] w-px"
                  style={{
                    background:
                      "color-mix(in srgb, var(--grid-ink,#767165) 24%, transparent)",
                  }}
                />
                <div
                  className="absolute inset-y-0 left-[calc(50%_+_3px)] w-px"
                  style={{
                    background:
                      "color-mix(in srgb, var(--grid-ink,#767165) 24%, transparent)",
                  }}
                />
                <div
                  className="absolute inset-x-0 top-[calc(50%_-_4px)] h-px"
                  style={{
                    background:
                      "color-mix(in srgb, var(--grid-ink,#767165) 24%, transparent)",
                  }}
                />
                <div
                  className="absolute inset-x-0 top-[calc(50%_+_3px)] h-px"
                  style={{
                    background:
                      "color-mix(in srgb, var(--grid-ink,#767165) 24%, transparent)",
                  }}
                />
              </div>
            </div>
            <div
              aria-hidden
              className="relative left-1/2 h-px w-screen max-w-[100vw] -translate-x-1/2"
              style={{
                background:
                  "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="relative left-1/2 mt-2 h-px w-screen max-w-[100vw] -translate-x-1/2"
              style={{
                background:
                  "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              }}
            />

            {/* Double-rule frame below the Blogs cards — mirrors the pair. */}
            <div
              aria-hidden
              className="relative left-1/2 mt-6 h-px w-screen max-w-[100vw] -translate-x-1/2 md:mt-8"
              style={{
                background:
                  "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              }}
            />
            <div
              aria-hidden
              className="relative left-1/2 mt-2 h-px w-screen max-w-[100vw] -translate-x-1/2"
              style={{
                background:
                  "color-mix(in srgb, var(--grid-ink,#767165) 16%, transparent)",
              }}
            />
            {/* View all sits next to the closing pair of lines. */}
            <div className="mt-6 flex justify-end">
              <Link
                href="/blogs"
                className="text-sm underline underline-offset-4"
              >
                View all
              </Link>
            </div>
          </section>
        </div>
        <LaptopBack />
      </div>
      <ScrollRuler />
    </SiteShell>
  )
}
