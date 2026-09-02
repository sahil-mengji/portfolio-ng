"use client"

import Link from "next/link"
import { Text, CardContext } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { blogPosts } from "@/lib/dummy-data"
import { useThemeColorContext } from "@/components/theme-provider"

export default function BlogsPage() {
  const { palette } = useThemeColorContext()
  return (
    <SiteShell>
      <div className="max-w-3xl space-y-8">
        <Text.Heading>Blogs</Text.Heading>
        <Text.Subheading>Dummy posts — Instrument Serif subheadings</Text.Subheading>
        <div className="grid gap-4">
          {blogPosts.map((post) => (
            <CardContext.Provider key={post.slug} value={true}>
              <Link
                href={`/blogs/${post.slug}`}
                className="block rounded-2xl border p-5 backdrop-blur hover:opacity-95 transition hover:scale-[1.01]"
                style={{
                  background: `color-mix(in srgb, ${palette.surface} 88%, transparent)`,
                  borderColor: `color-mix(in srgb, ${palette.brand} 18%, transparent)`,
                  boxShadow: `0 1px 2px color-mix(in srgb, ${palette.brand} 6%, transparent), 0 4px 12px color-mix(in srgb, ${palette.primary} 4%, transparent)`,
                }}
              >
                <Text.Subheading as="h3" size="sm" className="!text-lg">
                  {post.title}
                </Text.Subheading>
                <Text.Body size="sm" className="mt-2 opacity-90">
                  {post.excerpt}
                </Text.Body>
                <Text.Caption className="mt-3 block">{post.date} · {post.readingTime} · {post.tags.join(" · ")}</Text.Caption>
              </Link>
            </CardContext.Provider>
          ))}
        </div>
      </div>
    </SiteShell>
  )
}
