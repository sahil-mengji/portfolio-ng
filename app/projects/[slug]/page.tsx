"use client"

import Link from "next/link"
import { useParams } from "next/navigation"
import { Text } from "@/components/ui/text"
import { SiteShell } from "@/components/site-shell"
import { projects } from "@/lib/dummy-data"

export default function ProjectPage() {
  const params = useParams<{ slug: string }>()
  const proj = projects.find((p) => p.slug === params.slug)

  if (!proj) {
    return (
      <SiteShell>
        <Text.Heading>Not found</Text.Heading>
        <Text.Body>
          No project “{params.slug}”. <Text.Link href="/projects">Back to projects</Text.Link>
        </Text.Body>
      </SiteShell>
    )
  }

  return (
    <SiteShell>
      <article className="max-w-3xl space-y-6">
        <Text.Caption>
          <Link href="/projects" className="underline underline-offset-4">← Projects</Link> · {proj.year}
        </Text.Caption>
        <Text.Heading>{proj.title}</Text.Heading>
        <Text.Subheading>{proj.excerpt}</Text.Subheading>
        <div className="flex gap-2 flex-wrap">
          {proj.stack.map((s) => (
            <span key={s} className="rounded-full border px-3 py-1 text-xs">
              {s}
            </span>
          ))}
        </div>
        <Text.Body className="whitespace-pre-wrap leading-7">{proj.body}</Text.Body>
      </article>
    </SiteShell>
  )
}
