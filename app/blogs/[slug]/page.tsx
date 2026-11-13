import { Link } from "next-view-transitions"
import { MDXRemote } from "next-mdx-remote/rsc"
import remarkGfm from "remark-gfm"
import rehypeExternalLinks from "rehype-external-links"
import rehypeSlug from "rehype-slug"
import {
  rehypeCodeRawString,
  rehypeHighlightCode,
  rehypeHighlightCodeRawString,
} from "@/lib/rehype-code-block"
import { Heading, Body, Link as TextLink, Caption } from "@/components/ui/text"
import { Prose } from "@/components/ui/typography"
import { SiteShell } from "@/components/site-shell"
import { mdxComponents } from "@/components/mdx-components"
import { BlogMinimap } from "@/components/blog-minimap"
import { BlogBackButton } from "@/components/blog-back-button"
import { PostKeyboardShortcuts } from "@/components/post-keyboard-shortcuts"
import { PostShareMenu } from "@/components/post-share-menu"
import { LLMCopyButtonWithViewOptions } from "@/components/post-page-actions"
import { SITE_INFO } from "@/config/site"
import type { BlogPost } from "@/lib/dummy-data"
import { getBlogPost, getBlogPosts } from "@/lib/blog"

// Static bodies — prerender every post (also sidesteps next-themes'
// inline bootstrap script, which Next 16 rejects during dynamic renders).
export function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)
  if (!post) return { title: "Not found" }
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blogs/${slug}` },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = getBlogPost(slug)

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

  const blogPosts = getBlogPosts()
  const idx = blogPosts.findIndex((p) => p.slug === slug)
  const prevPost = idx > 0 ? blogPosts[idx - 1] : undefined
  const nextPost =
    idx >= 0 && idx < blogPosts.length - 1 ? blogPosts[idx + 1] : undefined
  const taken = new Set([slug, prevPost?.slug, nextPost?.slug].filter(Boolean))
  const sharedTags = (p: BlogPost) =>
    p.tags.filter((t) => post.tags.includes(t)).length
  const recommended = [...blogPosts]
    .filter((p) => !taken.has(p.slug))
    .sort((a, b) => sharedTags(b) - sharedTags(a))
    .slice(0, 2)

  return (
    <SiteShell showHatch={false}>
      {/* Structured metadata for search engines (BlogPosting). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            image: post.image,
            url: `${SITE_INFO.url}/blogs/${slug}`,
            datePublished: new Date(post.date).toISOString(),
            author: { "@type": "Person", name: SITE_INFO.name },
          }).replace(/</g, "\\u003c"),
        }}
      />
      <PostKeyboardShortcuts
        previous={prevPost ? `/blogs/${prevPost.slug}` : null}
        next={nextPost ? `/blogs/${nextPost.slug}` : null}
      />
      {/* Left heading minimap (hover reveals the nested tree). */}
      <BlogMinimap targetId="blog-article" />
      {/* Centered reading column: title top, meta, tags, description, MDX body. */}
      <article
        id="blog-article"
        className="mx-auto max-w-3xl space-y-6 px-4 pt-10 lg:pt-16"
      >
        <BlogBackButton />

        <div></div>
        {/* Page actions: copy-as-markdown + AI/share menu. */}
        <div className="flex items-center gap-2 pb-2">
          <LLMCopyButtonWithViewOptions markdownUrl={`/blogs/${slug}/raw`} />
          <PostShareMenu title={post.title} url={`/blogs/${slug}`} />
        </div>
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
        <Prose>
          <MDXRemote
            source={post.body}
            components={mdxComponents}
            options={{
              mdxOptions: {
                remarkPlugins: [remarkGfm],
                rehypePlugins: [
                  [
                    rehypeExternalLinks,
                    { target: "_blank", rel: "nofollow noopener" },
                  ],
                  rehypeSlug,
                  rehypeCodeRawString,
                  rehypeHighlightCode,
                  rehypeHighlightCodeRawString,
                ],
              },
            }}
          />
        </Prose>
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
        <nav aria-label="More posts" className="mt-24! mb-24">
          <Caption>More posts</Caption>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {prevPost ? (
              <Link
                key={prevPost.slug}
                href={`/blogs/${prevPost.slug}`}
                className="group flex min-w-0 items-center gap-4 rounded-2xl border p-5 transition-all hover:scale-[1.01]"
                style={{
                  background:
                    "color-mix(in srgb, var(--surface, #f4f4f2) 88%, transparent)",
                  borderColor:
                    "color-mix(in srgb, var(--accent, #4f46e5) 18%, transparent)",
                }}
              >
                <span
                  aria-hidden
                  className="font-mono text-2xl opacity-40 transition-transform duration-300 group-hover:-translate-x-1"
                >
                  ←
                </span>
                <span className="min-w-0">
                  <Caption>Prev</Caption>
                  <Body className="mt-1 truncate font-medium">
                    {prevPost.title}
                  </Body>
                  <Caption className="mt-1 block opacity-60">
                    {prevPost.date} · {prevPost.readingTime}
                  </Caption>
                </span>
              </Link>
            ) : (
              <span />
            )}
            {nextPost ? (
              <Link
                key={nextPost.slug}
                href={`/blogs/${nextPost.slug}`}
                className="group flex min-w-0 items-center justify-end gap-4 rounded-2xl border p-5 text-right transition-all hover:scale-[1.01]"
                style={{
                  background:
                    "color-mix(in srgb, var(--surface, #f4f4f2) 88%, transparent)",
                  borderColor:
                    "color-mix(in srgb, var(--accent, #4f46e5) 18%, transparent)",
                }}
              >
                <span className="min-w-0">
                  <Caption>Next</Caption>
                  <Body className="mt-1 truncate font-medium">
                    {nextPost.title}
                  </Body>
                  <Caption className="mt-1 block opacity-60">
                    {nextPost.date} · {nextPost.readingTime}
                  </Caption>
                </span>
                <span
                  aria-hidden
                  className="font-mono text-2xl opacity-40 transition-transform duration-300 group-hover:translate-x-1"
                >
                  →
                </span>
              </Link>
            ) : (
              <span />
            )}
          </div>
        </nav>
        {recommended.length > 0 && (
          <div className="mb-16">
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
