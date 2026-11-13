import fs from "fs"
import matter from "gray-matter"
import path from "path"
import { cache } from "react"

import type { Doc, DocMetadata } from "@/types/document"

function parseFrontmatter(fileContent: string) {
  const file = matter(fileContent)

  return {
    metadata: file.data as DocMetadata,
    content: file.content,
  }
}

function getMDXFiles(dir: string) {
  return fs.readdirSync(dir).filter((file) => path.extname(file) === ".mdx")
}

// p4's remark pipeline injects each previewed demo's source as the Code
// tab at build time. Same outcome here: expand self-closing
// <ComponentPreview name="x" /> tags with the demo file fenced as
// children, so the Code tab renders through the highlight pipeline.
// Titles/descriptions/table/callout text mentioning backticks is left
// untouched — only ComponentPreview tags are rewritten.
function injectPreviewSources(content: string) {
  return content.replace(
    /<ComponentPreview\b([^>]*?)\/>/g,
    (tag, attrs: string) => {
      const name = /name="([^"]*)"/.exec(attrs)?.[1]
      if (!name) return tag
      try {
        const source = fs.readFileSync(
          path.join(process.cwd(), "registry", "examples", `${name}.tsx`),
          "utf-8"
        )
        return `<ComponentPreview${attrs}>\n\`\`\`tsx\n${source}\n\`\`\`\n</ComponentPreview>`
      } catch {
        return tag
      }
    }
  )
}

function readMDXFile(filePath: string) {
  const rawContent = fs.readFileSync(filePath, "utf-8")
  const { metadata, content } = parseFrontmatter(rawContent)
  return { metadata, content: injectPreviewSources(content) }
}

function getMDXData(dir: string) {
  const mdxFiles = getMDXFiles(dir)

  return mdxFiles.map<Doc>((file) => {
    const { metadata, content } = readMDXFile(path.join(dir, file))

    const slug = path.basename(file, path.extname(file))

    return {
      metadata,
      slug,
      content,
    }
  })
}

export const getAllDocs = cache(() => {
  return getMDXData(path.join(/*turbopackIgnore: true*/ process.cwd(), "content/blog")).sort(
    (a, b) => {
      if (a.metadata.pinned && !b.metadata.pinned) return -1
      if (!a.metadata.pinned && b.metadata.pinned) return 1

      return (
        new Date(b.metadata.createdAt).getTime() -
        new Date(a.metadata.createdAt).getTime()
      )
    }
  )
})

export function getDocBySlug(slug: string) {
  return getAllDocs().find((doc) => doc.slug === slug)
}

export function getDocsByCategory(category: string) {
  return getAllDocs().filter((doc) => doc.metadata?.category === category)
}

export function findNeighbour(docs: Doc[], slug: string) {
  const len = docs.length

  for (let i = 0; i < len; ++i) {
    if (docs[i].slug === slug) {
      return {
        previous: i > 0 ? docs[i - 1] : null,
        next: i < len - 1 ? docs[i + 1] : null,
      }
    }
  }

  return { previous: null, next: null }
}
