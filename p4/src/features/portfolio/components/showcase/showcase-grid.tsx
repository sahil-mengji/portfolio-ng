"use client"

import React, { useState, useEffect, useMemo, useRef } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "motion/react"
import { projects } from "@/features/portfolio/data/showcase-projects"
import { ShowcaseCard } from "./showcase-card"
import { useShowcaseSheet } from "./showcase-sheet-context"
import type { ShowcaseSheetData } from "./showcase-sheet-context"
import { cn } from "@/lib/utils"

const ITEMS_PER_PAGE = 24
const INITIAL_ITEMS = 36

function flattenProjectsToItems(projectsData: any[], activeType?: string | null) {
  const items: (ShowcaseSheetData & { img: string; type: string; id: string })[] = []
  projectsData.forEach((project) => {
    if (!project.photos) return
    project.photos.forEach((photo: any, photoIndex: number) => {
      if (activeType && photo.type !== activeType) return
      items.push({
        id: `${project.title}-${photo.url}-${photoIndex}`,
        img: photo.url,
        type: photo.type,
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
  })
  return items
}

export function ShowcaseGrid() {
  const { openSheet } = useShowcaseSheet()
  const searchParams = useSearchParams()
  const activeType = searchParams.get("type")
  
  const allItems = useMemo(() => {
    const flattened = flattenProjectsToItems(projects, activeType)
    // Stable shuffle based on activeType so it doesn't reshuffle on every scroll
    return [...flattened].sort((a, b) => (a.id > b.id ? 1 : -1))
  }, [activeType])

  const [visibleCount, setVisibleCount] = useState(INITIAL_ITEMS)
  const loaderRef = useRef<HTMLDivElement>(null)

  const displayItems = useMemo(() => allItems.slice(0, visibleCount), [allItems, visibleCount])
  const hasMore = visibleCount < allItems.length

  useEffect(() => {
    setVisibleCount(INITIAL_ITEMS)
  }, [activeType])

  useEffect(() => {
    if (!hasMore) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allItems.length))
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px 150% 0px" }
    )

    if (loaderRef.current) {
      observer.observe(loaderRef.current)
    }

    return () => observer.disconnect()
  }, [hasMore, allItems.length])

  return (
    <div className="relative w-full overflow-hidden min-h-[50vh]">
      <div className="p-6">
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6">
          <AnimatePresence mode="popLayout">
            {displayItems.map((item, index) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.4, 
                  delay: (index % ITEMS_PER_PAGE) * 0.05,
                  ease: [0.21, 0.47, 0.32, 0.98] 
                }}
                className="break-inside-avoid mb-6"
              >
                <ShowcaseCard
                  data={item}
                  onClick={() => openSheet(item)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {hasMore && (
        <div 
          ref={loaderRef} 
          className="h-20 w-full flex items-center justify-center"
        >
          <div className="size-6 border-2 border-line border-t-foreground animate-spin rounded-full" />
        </div>
      )}
    </div>
  )
}
