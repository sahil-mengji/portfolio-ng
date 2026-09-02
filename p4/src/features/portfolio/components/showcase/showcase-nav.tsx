"use client"

import { useSearchParams } from "next/navigation"

import { Nav } from "@/components/nav"
import type { NavItem } from "@/types/nav"
import { projects } from "@/features/portfolio/data/showcase-projects"

export function ShowcaseNav() {
  const searchParams = useSearchParams()
  const activeType = searchParams.get("type")

  // Determine unique photo types across all projects
  const uniqueTypes = new Set<string>()
  projects.forEach(project => {
    if (project.photos) {
      project.photos.forEach((photo: any) => {
        if (photo.type) {
          uniqueTypes.add(photo.type)
        }
      })
    }
  })

  // Format them for the Nav
  const categories = Array.from(uniqueTypes).sort().map(type => ({
    name: type.charAt(0).toUpperCase() + type.slice(1),
    slug: type
  }))

  const NAV_ITEMS: NavItem[] = [
    {
      href: "/showcase",
      title: "All",
    },
    ...categories.map((category) => ({
      href: `/showcase?type=${category.slug}`,
      title: category.name,
    })),
  ]

  // If there's an active type, make sure it highlights correctly in the Nav
  const activeId = activeType ? `/showcase?type=${activeType}` : "/showcase"

  return <Nav items={NAV_ITEMS} activeId={activeId} exactMatch />
}

export function ShowcaseNavSkeleton() {
  return (
    <div className="flex items-center space-x-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="h-9 w-20 animate-pulse bg-muted/20 rounded-full" />
      ))}
    </div>
  )
}
