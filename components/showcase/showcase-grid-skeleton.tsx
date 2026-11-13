import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// Gap guides at the home sheet's strong ink weight so the rules read
// clearly across the column/row gaps, like p4's lines.
const GUIDE = "color-mix(in srgb, var(--grid-ink,#767165) 32%, transparent)"

export function ShowcaseGridSkeleton() {
  return (
    <div className="relative mx-auto w-full max-w-7xl overflow-hidden border-line p-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ShowcaseCardSkeleton key={index} index={index} wide={index === 0} />
        ))}
      </div>
    </div>
  )
}

function ShowcaseCardSkeleton({
  index,
  wide,
}: {
  index: number
  wide?: boolean
}) {
  // Rotate through different aspect ratios to mimic the masonry feel
  const aspectRatios = [
    "aspect-[4/3]",
    "aspect-square",
    "aspect-[4/5]",
    "aspect-[4/3]",
  ]
  const aspectRatio = aspectRatios[index % aspectRatios.length]

  return (
    <div className={cn(wide && "lg:col-span-3", !wide && "lg:col-span-2")}>
      <div className={cn("relative border border-line", aspectRatio)}>
        {/* Grid lines mimic */}
        <div
          className="pointer-events-none absolute top-[-1px] -left-6 z-0 h-px w-[calc(100%+3rem)]"
          style={{ background: GUIDE }}
        />
        <div
          className="pointer-events-none absolute bottom-[-1px] -left-6 z-0 h-px w-[calc(100%+3rem)]"
          style={{ background: GUIDE }}
        />
        <div
          className="pointer-events-none absolute -top-6 left-[-1px] z-0 h-[calc(100%+3rem)] w-px"
          style={{ background: GUIDE }}
        />
        <div
          className="pointer-events-none absolute -top-6 right-[-1px] z-0 h-[calc(100%+3rem)] w-px"
          style={{ background: GUIDE }}
        />

        {/* Dots mimic */}
        <div
          className="absolute top-[-2.5px] left-[-2.5px] z-10 size-1.5"
          style={{ background: GUIDE }}
        />
        <div
          className="absolute top-[-2.5px] right-[-2.5px] z-10 size-1.5"
          style={{ background: GUIDE }}
        />
        <div
          className="absolute bottom-[-2.5px] left-[-2.5px] z-10 size-1.5"
          style={{ background: GUIDE }}
        />
        <div
          className="absolute right-[-2.5px] bottom-[-2.5px] z-10 size-1.5"
          style={{ background: GUIDE }}
        />

        <div className="relative flex h-full w-full flex-col justify-end overflow-hidden rounded-3xl border border-line bg-background p-4">
          <Skeleton className="absolute top-4 right-4 h-5 w-16 rounded-full" />
          <Skeleton className="absolute top-4 left-4 size-6 rounded-md" />

          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      </div>
    </div>
  )
}
