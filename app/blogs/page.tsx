import { Suspense } from "react"

import {
  PageHeading,
  PageHeadingTagline,
  PageHeadingTitle,
} from "@/components/page-heading"
import { SiteShell } from "@/components/site-shell"
import { PostList } from "@/components/post-list"
import { PostListWithSearch } from "@/components/post-list-with-search"
import { PostSearchInput } from "@/components/post-search-input"
import { getBlogPosts } from "@/lib/blog"

const title = "Blog"
const description = "Writing about code, design, and everything in between."

export const metadata = {
  title,
  description,
  alternates: {
    canonical: "/blogs",
  },
}

export default function BlogsPage() {
  const allPosts = getBlogPosts()

  return (
    <SiteShell showHatch={false}>
      <div className="min-h-svh">
        <PageHeading>
          <PageHeadingTagline>Blog</PageHeadingTagline>
          <PageHeadingTitle>{title}</PageHeadingTitle>
        </PageHeading>

        <div className="h-4" />

        <div className="screen-line-top screen-line-bottom p-2">
          <Suspense
            fallback={
              <div className="flex h-9 w-full rounded-lg border border-input dark:bg-input/30" />
            }
          >
            <PostSearchInput />
          </Suspense>
        </div>

        <Suspense fallback={<PostList posts={allPosts} />}>
          <PostListWithSearch posts={allPosts} />
        </Suspense>

        <div className="h-4" />
      </div>
    </SiteShell>
  )
}
