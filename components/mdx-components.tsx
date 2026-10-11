import * as React from "react"
import type { MDXComponents } from "mdx/types"
// NOTE: direct named imports only — this map is consumed by an RSC, where
// `Text.X` member access on the client-module namespace is undefined.
import { Heading, Body, Link } from "@/components/ui/text"

// Plain-text extraction + slug for stable heading anchors (minimap targets).
function headingText(node: React.ReactNode): string {
  return React.Children.toArray(node)
    .map((c) => {
      if (typeof c === "string" || typeof c === "number") return String(c)
      if (React.isValidElement(c)) {
        return headingText((c.props as { children?: React.ReactNode }).children)
      }
      return ""
    })
    .join("")
}

function headingSlug(children: React.ReactNode): string {
  const slug = headingText(children)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  return slug || "section"
}

function MdxLink({ href, children }: { href?: string; children?: React.ReactNode }) {
  const external = !!href && /^https?:\/\//.test(href)
  return (
    <Link
      href={href ?? "#"}
      {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
    >
      {children}
    </Link>
  )
}

function MdxPre({ children }: { children?: React.ReactNode }) {
  return (
    <pre
      className="overflow-x-auto rounded-xl border p-4 font-mono text-[13px] leading-relaxed"
      style={{
        background: "color-mix(in srgb, var(--surface, #f4f4f2) 70%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--accent, #4f46e5) 22%, transparent)",
      }}
    >
      {children}
    </pre>
  )
}

function MdxCode({ children }: { children?: React.ReactNode }) {
  return (
    <code
      className="rounded-md px-1.5 py-0.5 font-mono text-[0.85em]"
      style={{
        background: "color-mix(in srgb, var(--accent, #4f46e5) 12%, transparent)",
      }}
    >
      {children}
    </code>
  )
}

// Inline highlight usable as <Highlight>…</Highlight> inside MDX.
function Highlight({ children }: { children?: React.ReactNode }) {
  return (
    <mark
      className="rounded px-1"
      style={{
        background: "color-mix(in srgb, var(--accent, #4f46e5) 28%, transparent)",
        color: "inherit",
      }}
    >
      {children}
    </mark>
  )
}

// Callout box usable as <Callout title="…">…</Callout> inside MDX.
function Callout({
  title,
  children,
}: {
  title?: string
  children?: React.ReactNode
}) {
  return (
    <aside
      className="rounded-xl border border-l-4 p-4"
      style={{
        background: "color-mix(in srgb, var(--surface, #f4f4f2) 70%, transparent)",
        borderColor:
          "color-mix(in srgb, var(--accent, #4f46e5) 22%, transparent)",
        borderLeftColor: "var(--accent, #4f46e5)",
      }}
    >
      {title && (
        <Body size="sm" className="mb-1 font-semibold">
          {title}
        </Body>
      )}
      <Body size="sm" className="opacity-90">
        {children}
      </Body>
    </aside>
  )
}

export const mdxComponents: MDXComponents = {
  h1: ({ children }) => (
    <Heading id={headingSlug(children)} className="mt-10 scroll-mt-28">
      {children}
    </Heading>
  ),
  h2: ({ children }) => (
    <h2
      id={headingSlug(children)}
      className="mt-10 scroll-mt-28 font-sans text-2xl font-medium tracking-tight text-balance"
    >
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3
      id={headingSlug(children)}
      className="mt-8 scroll-mt-28 font-sans text-xl font-medium tracking-tight text-balance"
    >
      {children}
    </h3>
  ),
  h4: ({ children }) => (
    <Body id={headingSlug(children)} className="mt-6 scroll-mt-28 font-semibold">
      {children}
    </Body>
  ),
  p: ({ children }) => <Body className="leading-8 opacity-90">{children}</Body>,
  a: MdxLink as React.ComponentType<any>,
  pre: MdxPre,
  // Inline code only — fenced blocks arrive as <pre><code>, and the
  // pre above carries the block styling. Unwrap to avoid double chips.
  code: ({ children, className }: { children?: React.ReactNode; className?: string }) => {
    const text = React.Children.toArray(children).join("")
    const inBlock = typeof text === "string" && text.includes("\n")
    if (inBlock || className) {
      return <code className={className}>{children}</code>
    }
    return <MdxCode>{children}</MdxCode>
  },
  ul: ({ children }) => <ul className="list-inside list-disc space-y-1.5">{children}</ul>,
  ol: ({ children }) => <ol className="list-inside list-decimal space-y-1.5">{children}</ol>,
  li: ({ children }) => (
    <li>
      <Body as="span" size="sm" className="opacity-90">
        {children}
      </Body>
    </li>
  ),
  blockquote: ({ children }) => (
    <blockquote
      className="rounded-r-xl border-l-4 py-1 pl-4"
      style={{ borderLeftColor: "var(--accent, #4f46e5)" }}
    >
      <Body size="sm" className="opacity-80 italic">
        {children}
      </Body>
    </blockquote>
  ),
  table: ({ children }) => (
    <div className="overflow-x-auto rounded-xl border">
      <table className="w-full border-collapse text-left text-sm">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead
      style={{
        background: "color-mix(in srgb, var(--accent, #4f46e5) 12%, transparent)",
      }}
    >
      {children}
    </thead>
  ),
  th: ({ children }) => (
    <th className="border-b px-4 py-2.5 font-semibold">
      <Body as="span" size="sm" className="font-semibold">
        {children}
      </Body>
    </th>
  ),
  td: ({ children }) => (
    <td className="border-b px-4 py-2.5 align-top last:border-b-0">
      <Body as="span" size="sm" className="opacity-90">
        {children}
      </Body>
    </td>
  ),
  hr: () => (
    <hr
      className="border-t"
      style={{
        borderColor:
          "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
      }}
    />
  ),
  strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="opacity-60">{children}</del>,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src ?? ""} alt={alt ?? ""} className="rounded-xl" loading="lazy" />
  ),
  input: (props) => (
    <input {...props} readOnly className="mr-1.5 accent-current" />
  ),
  Highlight,
  Callout,
}
