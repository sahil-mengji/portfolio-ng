import dynamic from "next/dynamic"

import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { ShowcaseSheetProvider } from "@/features/portfolio/components/showcase/showcase-sheet-context"
import { ShowcasePushWrapper } from "@/features/portfolio/components/showcase/showcase-push-wrapper"
import { ShowcaseSheet } from "@/features/portfolio/components/showcase/showcase-sheet"

const ScrollToTop = dynamic(() =>
  import("@/components/scroll-to-top").then((mod) => mod.ScrollToTop)
)

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <ShowcaseSheetProvider>
      <SiteHeader />
      <ShowcasePushWrapper>
        <div className="group/layout">
          <main className="max-w-screen overflow-x-clip px-2">{children}</main>
          <SiteFooter />
          <ScrollToTop />
        </div>
      </ShowcasePushWrapper>

      {/*
        Sheet is a SIBLING of the push wrapper, not a child.
        Being outside the transformed element, it is positioned relative
        to the viewport (not the shifted content), so right:0 stays pinned
        to the right edge of the screen correctly.
      */}
      <ShowcaseSheet />
    </ShowcaseSheetProvider>
  )
}
