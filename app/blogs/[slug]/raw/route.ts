import { notFound } from "next/navigation"

import { getBlogPost, getBlogPosts } from "@/lib/blog"
import { getLLMText } from "@/lib/llm-text"

export const revalidate = false
export const dynamic = "force-static"
export const dynamicParams = false

export async function generateStaticParams() {
  return getBlogPosts().map((p) => ({ slug: p.slug }))
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  return new Response(getLLMText(post), {
    headers: {
      "Content-Type": "text/markdown;charset=utf-8",
    },
  })
}
