import type { Metadata } from "next"
import { Suspense } from "react"

import { SiteShell } from "@/components/site-shell"
import {
  PageHeading,
  PageHeadingTagline,
  PageHeadingTitle,
  PageHeadingDescription,
} from "@/components/page-heading"
import {
  ShowcaseNav,
  ShowcaseNavSkeleton,
} from "@/components/showcase/showcase-nav"
import { cn } from "@/lib/utils"
import { ShowcaseGridSkeleton } from "@/components/showcase/showcase-grid-skeleton"
import { ShowcaseGridClient } from "@/components/showcase/showcase-grid-client"
import { ShowcaseSheetProvider } from "@/components/showcase/showcase-sheet-context"
import { ShowcasePushWrapper } from "@/components/showcase/showcase-push-wrapper"
import { ShowcaseSheet } from "@/components/showcase/showcase-sheet"

const title = "Showcase"
const description =
  "A collection of my creative work, from design to development."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/showcase",
  },
}

export default function Page() {
  return (
    <SiteShell showHatchStrips={false}>
      {/* Themed rules: p4's static line tokens repointed at the
          picker-driven grid ink at the main page's exact weights (16%),
          so every border on this page follows the picked hue like the
          home sheet's drafting rules. */}
      <div
        style={
          {
            "--line":
              "color-mix(in srgb, var(--grid-ink, #767165) 16%, transparent)",
            "--border":
              "color-mix(in srgb, var(--grid-ink, #767165) 16%, transparent)",
          } as React.CSSProperties
        }
      >
        <ShowcaseSheetProvider>
          <ShowcasePushWrapper>
            <div className="mx-auto min-h-svh w-full max-w-7xl">
              <PageHeading>
                <PageHeadingTagline>Showcase</PageHeadingTagline>
                <PageHeadingTitle>{title}</PageHeadingTitle>
                <PageHeadingDescription>{description}</PageHeadingDescription>
              </PageHeading>

              <div className="flex h-4" />
              <div className="screen-line-bottom flex h-px" />

              <div className="no-scrollbar max-w-full overflow-x-auto scroll-fade-effect-x p-4 whitespace-nowrap">
                <Suspense fallback={<ShowcaseNavSkeleton />}>
                  <ShowcaseNav />
                </Suspense>
              </div>

              <div className="screen-line-top screen-line-bottom">
                <div
                  className={cn(
                    "h-8 before:absolute before:left-[-100vw] before:-z-1 before:h-full before:w-[200vw]",
                    "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-line)]/56"
                  )}
                />
              </div>

              <Suspense fallback={<ShowcaseGridSkeleton />}>
                <ShowcaseGridClient />
              </Suspense>

              <div className="mt-4 p-2">
                <div className="relative border border-line p-4">
                  <p className="font-mono text-sm text-muted-foreground">
                    More projects on the way…
                  </p>

                  <div className="*:absolute *:flex *:size-2 *:border *:bg-background dark:*:border-line">
                    <div className="top-[-4.5px] left-[-4.5px]" />
                    <div className="bottom-[-4.5px] left-[-4.5px]" />
                    <div className="top-[-4.5px] right-[-4.5px]" />
                    <div className="right-[-4.5px] bottom-[-4.5px]" />
                  </div>
                </div>
              </div>
            </div>
          </ShowcasePushWrapper>
          <ShowcaseSheet />
        </ShowcaseSheetProvider>
      </div>
    </SiteShell>
  )
}
