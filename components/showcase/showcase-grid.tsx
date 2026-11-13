"use client"

import React, { useState, useMemo, useRef } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { projects } from "@/lib/showcase-projects"
import { ShowcaseCard } from "./showcase-card"
import { useShowcaseSheet } from "./showcase-sheet-context"
import type { ShowcaseSheetData } from "./showcase-sheet-context"
import { cn } from "@/lib/utils"
import { Text } from "@/components/ui/text"

const PAGE_SIZE = 24

// Pill labels for the editorial cell — same set as the home Blogs heading
// (4 + 3), each pill sizing to its own text.
const BLOG_PILLS = [
  "Design",
  "Grids",
  "Type",
  "Color",
  "Motion",
  "Draft",
  "Notes",
]

// One card per project — a project's photos club into the sheet's strip +
// lightbox instead of scattering as separate cards. Cover = first photo
// matching the active filter, else the project's first photo.
function projectsToItems(projectsData: any[], activeType?: string | null) {
  const items: (ShowcaseSheetData & {
    img: string
    type: string
    id: string
  })[] = []
  projectsData.forEach((project) => {
    const photos = (project.photos ?? []).filter(
      (photo: any) => !activeType || photo.type === activeType
    )
    if (photos.length === 0) return
    const cover = photos[0]
    items.push({
      id: project.title,
      img: cover.url,
      type: cover.type,
      title: project.title,
      description: project.description,
      logo: project.logo,
      tags: project.tags,
      tools: project.tools,
      url: project.url,
      categories: project.categories,
      photos: project.photos,
    })
  })
  return items
}

// Windowed page numbers: 1 … p-1 p p+1 … N (all pages when ≤ 7).
function getPageNumbers(page: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const keep = [
    ...new Set(
      [1, 2, page - 1, page, page + 1, total - 1, total].filter(
        (n) => n >= 1 && n <= total
      )
    ),
  ].sort((a, b) => a - b)
  const out: (number | "…")[] = []
  keep.forEach((n, i) => {
    if (i > 0 && n - keep[i - 1] > 1) out.push("…")
    out.push(n)
  })
  return out
}

export function ShowcaseGrid() {
  const { openSheet } = useShowcaseSheet()
  const searchParams = useSearchParams()
  const activeType = searchParams.get("type")
  const topRef = useRef<HTMLDivElement>(null)

  const allItems = useMemo(() => {
    const items = projectsToItems(projects, activeType)
    // Stable order per filter so pages don't reshuffle between visits
    return [...items].sort((a, b) => (a.id > b.id ? 1 : -1))
  }, [activeType])

  // Page resets when the filter changes — render-time adjustment, no effect.
  const [pageState, setPageState] = useState<{
    type: string | null
    page: number
  }>({
    type: activeType,
    page: 1,
  })
  if (pageState.type !== activeType) {
    setPageState({ type: activeType, page: 1 })
  }

  const totalPages = Math.max(1, Math.ceil(allItems.length / PAGE_SIZE))
  const page = Math.min(pageState.page, totalPages)
  const displayItems = useMemo(
    () => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [allItems, page]
  )

  const goToPage = (p: number) => {
    const next = Math.min(Math.max(1, p), totalPages)
    setPageState({ type: activeType, page: next })
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const pageNumbers = useMemo(
    () => getPageNumbers(page, totalPages),
    [page, totalPages]
  )

  return (
    <div
      ref={topRef}
      className="relative mx-auto min-h-[50vh] w-full max-w-7xl scroll-mt-6 overflow-hidden"
    >
      <div className="p-6">
        <div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
          {/* Editorial cell — the home Blogs heading + pills block.
              First in flow (top of column one). Static: never paged or
              filtered away. */}
          <div className="mb-6 flex min-h-[240px] flex-col justify-center break-inside-avoid bg-background p-5 md:p-6">
            <Text.Subheading className="text-right !text-4xl md:!text-5xl">
              Blogs.
            </Text.Subheading>
            <div className="mt-4 flex justify-end">
              <div aria-hidden className="flex w-auto shrink-0 flex-col gap-0">
                {[0, 1].map((row) => (
                  <div
                    key={row}
                    className="flex flex-wrap items-center justify-end gap-0"
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
            <div className="mt-4 flex justify-end">
              <Link
                href="/blogs"
                className="text-sm underline underline-offset-4"
              >
                View all
              </Link>
            </div>
          </div>
          <AnimatePresence mode="popLayout">
            {displayItems.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{
                  duration: 0.35,
                  delay: 0,
                  ease: [0.21, 0.47, 0.32, 0.98],
                }}
                className="mb-6 break-inside-avoid [contain-intrinsic-size:auto_420px] [content-visibility:auto]"
              >
                <ShowcaseCard data={item} onClick={() => openSheet(item)} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex flex-col items-center gap-3 px-6 pb-10">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              aria-label="Previous page"
              className="flex size-9 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            {pageNumbers.map((n, i) =>
              n === "…" ? (
                <span
                  key={`gap-${i}`}
                  className="px-1 font-mono text-sm text-muted-foreground/50"
                >
                  …
                </span>
              ) : (
                <button
                  key={n}
                  onClick={() => goToPage(n)}
                  aria-label={`Page ${n}`}
                  aria-current={n === page ? "page" : undefined}
                  className={cn(
                    "size-9 rounded-full border font-mono text-sm transition-colors",
                    n === page
                      ? "border-foreground bg-foreground text-background"
                      : "border-line text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                  )}
                >
                  {n}
                </button>
              )
            )}
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              aria-label="Next page"
              className="flex size-9 items-center justify-center rounded-full border border-line text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground disabled:pointer-events-none disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
          <p className="font-mono text-xs text-muted-foreground/60">
            Page {page} of {totalPages} · {allItems.length} projects
          </p>
        </div>
      )}
    </div>
  )
}
