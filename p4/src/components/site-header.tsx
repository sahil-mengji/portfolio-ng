import dynamic from "next/dynamic"

import blocks from "@/__registry__/__blocks__.json"
import { getStargazerCount } from "@/components/nav-item-github"
import { MAIN_NAV, MOBILE_NAV } from "@/config/site"
import { getAllDocs } from "@/features/doc/data/documents"
import type { DocPreview } from "@/features/doc/types/document"
import { FloatingNavbar } from "@/components/floating-navbar"

export async function SiteHeader() {
  const docs = getAllDocs()
  const stargazersCount = await getStargazerCount()

  // Minimize data serialized to client component - only send necessary fields
  const docPreviews: DocPreview[] = docs.map((doc) => ({
    slug: doc.slug,
    title: doc.metadata.title,
    category: doc.metadata.category,
  }))

  return (
    <FloatingNavbar
      items={MAIN_NAV}
      mobileItems={MOBILE_NAV}
      stargazersCount={stargazersCount}
      docPreviews={docPreviews}
      blocks={blocks}
    />
  )
}

