import React from "react"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function ShowcaseGridSkeleton() {
  return (
    <div className="relative border-line p-6 w-full overflow-hidden">
      <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <ShowcaseCardSkeleton key={index} index={index} />
        ))}
      </div>
    </div>
  )
}

function ShowcaseCardSkeleton({ index }: { index: number }) {
  // Rotate through different aspect ratios to mimic the masonry feel
  const aspectRatios = ["aspect-[4/3]", "aspect-square", "aspect-[4/5]", "aspect-[4/3]"]
  const aspectRatio = aspectRatios[index % aspectRatios.length]

  return (
    <div className="break-inside-avoid mb-6">
      <div className={cn("relative border border-line", aspectRatio)}>
        {/* Grid lines mimic */}
        <div className="absolute top-[-1px] -left-6 w-[calc(100%+3rem)] h-px bg-line z-0 pointer-events-none" />
        <div className="absolute bottom-[-1px] -left-6 w-[calc(100%+3rem)] h-px bg-line z-0 pointer-events-none" />
        <div className="absolute left-[-1px] -top-6 h-[calc(100%+3rem)] w-px bg-line z-0 pointer-events-none" />
        <div className="absolute right-[-1px] -top-6 h-[calc(100%+3rem)] w-px bg-line z-0 pointer-events-none" />

        {/* Dots mimic */}
        <div className="absolute top-[-2.5px] left-[-2.5px] size-1.5 bg-line/80 z-10" />
        <div className="absolute top-[-2.5px] right-[-2.5px] size-1.5 bg-line/80 z-10" />
        <div className="absolute bottom-[-2.5px] left-[-2.5px] size-1.5 bg-line/80 z-10" />
        <div className="absolute bottom-[-2.5px] right-[-2.5px] size-1.5 bg-line/80 z-10" />

        <div className="relative border border-line bg-background overflow-hidden rounded-3xl w-full h-full p-4 flex flex-col justify-end">
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
