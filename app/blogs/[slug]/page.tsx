import { Link } from "next-view-transitions"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import { Heading, Body, Link as TextLink, Caption } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { mdxComponents } from "@/components/mdx-components"
import { BlogMinimap } from "@/components/blog-minimap"
import { BlogBackButton } from "@/components/blog-back-button"
import { blogPosts } from "@/lib/dummy-data"

// Static bodies — prerender every post (also sidesteps next-themes'
// inline bootstrap script, which Next 16 rejects during dynamic renders).
export function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = blogPosts.find((p) => p.slug === slug)

  if (!post) {
    return (
      <SiteShell showHatch={false}>
        <div className="mx-auto max-w-3xl px-4">
          <Heading>Not found</Heading>
          <Body>
            No blog with slug “{slug}”.{" "}
            <TextLink href="/blogs">Back to blogs</TextLink>
          </Body>
        </div>
      </SiteShell>
    )
  }

  const idx = blogPosts.findIndex((p) => p.slug === slug)
  const prevPost = idx > 0 ? blogPosts[idx - 1] : undefined
  const nextPost =
    idx >= 0 && idx < blogPosts.length - 1 ? blogPosts[idx + 1] : undefined
  const taken = new Set([slug, prevPost?.slug, nextPost?.slug].filter(Boolean))
  const sharedTags = (p: (typeof blogPosts)[number]) =>
    p.tags.filter((t) => post.tags.includes(t)).length
  const recommended = [...blogPosts]
    .filter((p) => !taken.has(p.slug))
    .sort((a, b) => sharedTags(b) - sharedTags(a))
    .slice(0, 2)

  return (
    <SiteShell showHatch={false}>
      {/* Left heading minimap (hover reveals the nested tree). */}
      <BlogMinimap targetId="blog-article" />
      {/* Centered reading column: title top, meta, tags, description, MDX body. */}
      <article
        id="blog-article"
        className="mx-auto max-w-3xl space-y-6 px-4 pt-10 lg:pt-16"
      >
        <BlogBackButton />

        <div></div>
        <Caption style={{ marginTop: "clamp(2rem, 4vw, 3rem)" }}>
          {post.date}
        </Caption>
        {/* Date sits just above the title; excerpt tucks close under it. */}
        <Heading
          className="-mb-1f font-medium"
          style={{ viewTransitionName: `blog-title-${slug}` }}
        >
          {post.title}
        </Heading>
        <Body
          className="text-lg leading-relaxed opacity-80"
          style={{
            marginTop: "0.75rem",
            viewTransitionName: `blog-excerpt-${slug}`,
          }}
        >
          {post.excerpt}
        </Body>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((t) => (
            <span key={t} className="rounded-full border px-3 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
        <hr
          className="border-t"
          style={{
            borderColor:
              "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
          }}
        />
        <div className="space-y-5">
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{ mdxOptions: { remarkPlugins: [remarkGfm] } }}
          />
        </div>
        {/* Bottom navigation: prev / next across the index, plus
            tag-related recommended reads. The ← Blogs link lives only
            at the top. */}
        <hr
          className="border-t"
          style={{
            borderColor:
              "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
          }}
        />
        <nav
          aria-label="More posts"
          className="flex flex-wrap justify-between gap-4"
        >
          <div className="min-w-0 flex-1">
            {prevPost ? (
              <Link
                href={`/blogs/${prevPost.slug}`}
                className="underline underline-offset-4"
              >
                <Caption>← Prev</Caption>
                <Body className="mt-1 font-medium">{prevPost.title}</Body>
              </Link>
            ) : (
              <span />
            )}
          </div>
          <div className="min-w-0 flex-1 text-right">
            {nextPost ? (
              <Link
                href={`/blogs/${nextPost.slug}`}
                className="underline underline-offset-4"
              >
                <Caption>Next →</Caption>
                <Body className="mt-1 font-medium">{nextPost.title}</Body>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
        {recommended.length > 0 && (
          <div>
            <Caption>Recommended</Caption>
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              {recommended.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blogs/${r.slug}`}
                  className="block rounded-2xl border p-5 transition-transform hover:scale-[1.01]"
                >
                  <Caption>
                    {r.date} · {r.readingTime}
                  </Caption>
                  <Body className="mt-2 font-medium">{r.title}</Body>
                  <Body size="sm" className="mt-2 line-clamp-2 opacity-80">
                    {r.excerpt}
                  </Body>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </SiteShell>
  )
}
