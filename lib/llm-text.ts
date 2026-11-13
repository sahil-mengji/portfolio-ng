import type { BlogPost } from "@/lib/dummy-data"

function longDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

// Plain-text rendering of a post for "Copy Page" / "View as Markdown" —
// title, description, raw MDX body, updated stamp. Kept dependency-free
// (p4's version runs the body through fumadocs remark plugins; the raw
// JSX tags travel along harmlessly as text here).
export function getLLMText(post: BlogPost) {
  return `# ${post.title}

${post.excerpt}

${post.body}

Last updated on ${longDate(post.date)}`
}
