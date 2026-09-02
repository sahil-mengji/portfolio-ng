"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Text } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { blogPosts } from "@/lib/dummy-data"

export default function BlogPostPage() {
  const params = useParams<{ slug: string }>()
  const post = blogPosts.find((p) => p.slug === params.slug)

  if (!post) {
    return (
      <SiteShell>
        <Text.Heading>Not found</Text.Heading>
        <Text.Body>
          No blog with slug “{params.slug}”. <Text.Link href="/blogs">Back to blogs</Text.Link>
        </Text.Body>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <article className="max-w-3xl space-y-6">
        <Text.Caption>
          <Link href="/blogs" className="underline underline-offset-4">← Blogs</Link> · {post.date} · {post.readingTime}
        </Text.Caption>
        <Text.Heading>{post.title}</Text.Heading>
        <Text.Subheading>{post.excerpt}</Text.Subheading>
        <div className="flex gap-2 flex-wrap">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full border px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
        <Text.Body className="whitespace-pre-wrap leading-7">{post.body}</Text.Body>
      </article>
    </SiteShell>
  )
}
