import { cache } from "react"

import type { BlogPost } from "@/lib/dummy-data"
import { getAllDocs } from "@/lib/docs"

function readingTimeFor(content: string) {
  const words = content.split(/\s+/).filter(Boolean).length
  return `${Math.max(1, Math.round(words / 200))} min`
}

// gray-matter parses unquoted YAML dates (createdAt: 2025-07-14) into
// Date objects — normalize back to YYYY-MM-DD strings for rendering.
function isoDate(value: unknown) {
  if (value instanceof Date) return value.toISOString().slice(0, 10)
  return String(value ?? "")
}

// p4 docs → site posts. Same sort (pinned first, newest first); the rest
// of the blog UI (list, article, minimap, recommendations, transitions)
// keeps working unchanged on the BlogPost shape.
export const getBlogPosts = cache((): BlogPost[] => {
  return getAllDocs().map((doc) => ({
    slug: doc.slug,
    title: doc.metadata.title,
    excerpt: doc.metadata.description,
    date: isoDate(doc.metadata.createdAt),
    readingTime: readingTimeFor(doc.content),
    tags: [],
    image: doc.metadata.image ?? "/profile.jpg",
    body: doc.content,
  }))
})

export function getBlogPost(slug: string) {
  return getBlogPosts().find((p) => p.slug === slug)
}
