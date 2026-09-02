import type { Metadata } from "next"
import { 
  PageHeading, 
  PageHeadingDescription, 
  PageHeadingTitle,
  PageHeadingTagline 
} from "@/components/page-heading"
import { cn } from "@/lib/utils"
import { ExperimentsContent } from "@/features/portfolio/components/experiments-content"

const title = "Experiments"
const description = "Explore my playground of creative code, animations, and interactive design concepts."

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "/experiments",
  },
}

export default function ExperimentsPage() {
  return (
    <div className="min-h-svh flex flex-col">
      <PageHeading>
        <PageHeadingTagline>Laboratory</PageHeadingTagline>
        <PageHeadingTitle>{title}</PageHeadingTitle>
        <PageHeadingDescription>{description}</PageHeadingDescription>
      </PageHeading>

      <div className="flex h-4" />
      <div className="screen-line-bottom flex h-px" />

      <div className="screen-line-top screen-line-bottom">
        <div
          className={cn(
            "h-8 before:absolute before:left-[-100vw] before:-z-1 before:h-full before:w-[200vw]",
            "before:bg-[repeating-linear-gradient(315deg,var(--pattern-foreground)_0,var(--pattern-foreground)_1px,transparent_0,transparent_50%)] before:bg-size-[10px_10px] before:[--pattern-foreground:var(--color-line)]/56"
          )}
        />
      </div>

      <ExperimentsContent />
      
      <div className="p-2 mt-4 border-t border-line">
        <div className="relative border border-line p-4">
          <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
            Legacy: Re-imagining the old portfolio experiments
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
  )
}
