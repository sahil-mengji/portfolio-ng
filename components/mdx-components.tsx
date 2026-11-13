import * as React from "react"
import type { MDXComponents } from "mdx/types"
// NOTE: direct named imports only — this map is consumed by an RSC, where
// `Text.X` member access on the client-module namespace is undefined.
import { Heading, Body, Link } from "@/components/ui/text"
import { Callout } from "@/components/callout"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Code } from "@/components/ui/typography"
import { mdxCodeBlockComponents } from "@/components/mdx-code-block"
import { CodeCollapsibleWrapper } from "@/components/code-collapsible-wrapper"
import { CodeTabs } from "@/components/code-tabs"
import { FramedImage, IframeEmbed, YouTubeEmbed } from "@/components/embed"
import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/base/ui/tabs"
import { ComponentPreview } from "@/components/component-preview"
import { ComponentSource } from "@/components/component-source"
import { AutoTypeTable } from "@/components/auto-type-table"
import { DocSponsors } from "@/components/doc-sponsors"
import { Testimonial } from "@/components/testimonial"
import { cn } from "@/lib/utils"

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

function MdxLink({
  href,
  children,
}: {
  href?: string
  children?: React.ReactNode
}) {
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

// Inline highlight usable as <Highlight>…</Highlight> inside MDX.
function Highlight({ children }: { children?: React.ReactNode }) {
  return (
    <mark
      className="rounded px-1"
      style={{
        background:
          "color-mix(in srgb, var(--accent, #4f46e5) 28%, transparent)",
        color: "inherit",
      }}
    >
      {children}
    </mark>
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
    <Body
      id={headingSlug(children)}
      className="mt-6 scroll-mt-28 font-semibold"
    >
      {children}
    </Body>
  ),
  p: ({ children }) => <Body className="leading-8 opacity-90">{children}</Body>,
  a: MdxLink as React.ComponentType<any>,
  ...mdxCodeBlockComponents,
  code: Code,
  ul: ({ children }) => (
    <ul className="list-inside list-disc space-y-1.5">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="list-inside list-decimal space-y-1.5">{children}</ol>
  ),
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
      <Body size="sm" className="italic opacity-80">
        {children}
      </Body>
    </blockquote>
  ),
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  hr: () => (
    <hr
      className="border-t"
      style={{
        borderColor:
          "color-mix(in srgb, var(--accent, #4f46e5) 25%, transparent)",
      }}
    />
  ),
  strong: ({ children }) => (
    <strong className="font-semibold">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="opacity-60">{children}</del>,
  img: ({ src, alt }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src ?? ""}
      alt={alt ?? ""}
      className="rounded-xl"
      loading="lazy"
    />
  ),
  input: (props) => (
    <input {...props} readOnly className="mr-1.5 accent-current" />
  ),
  Highlight,
  Callout,
  CodeCollapsibleWrapper,
  CodeTabs,
  Steps: (props: React.ComponentProps<"div">) => (
    <div
      className="md:ml-3.5 md:border-l md:pl-7.5 prose-h3:text-lg prose-h3:text-wrap"
      {...props}
    />
  ),
  Step: ({ className, ...props }: React.ComponentProps<"h3">) => (
    <h3 className={cn("step font-medium", className)} {...props} />
  ),
  Tabs,
  TabsList,
  TabsIndicator,
  TabsTrigger,
  TabsContent,
  TabsListInstallType: () => (
    <TabsList>
      <TabsTrigger value="cli">Command</TabsTrigger>
      <TabsTrigger value="manual">Manual</TabsTrigger>
      <TabsIndicator />
    </TabsList>
  ),
  YouTubeEmbed,
  IframeEmbed,
  FramedImage,
  ComponentPreview,
  ComponentSource,
  AutoTypeTable,
  DocSponsors,
  Testimonial,
}
