import fs from "fs"
import path from "path"

import { CopyButton } from "@/components/copy-button"

// Registry source viewer: resolves the display path against the local
// tree and renders the file with a copy button. p4 serves these through
// its generated registry JSONs; reading the mirrored files directly is
// equivalent here since the tree is copied 1:1.
const ROOTS = ["registry", "", "app", "components", "lib", "hooks"]

const ALIASES: Record<string, string> = {
  "components/tabs.tsx": "components/base/ui/tabs.tsx",
}

async function resolveSource(title?: string, src?: string, name?: string) {
  // `src` wins when present (p4's src/… paths map to the mirrored tree
  // by stripping the leading src/). Otherwise the display title doubles
  // as the path; demo names fall back to the examples folder.
  const rel = (src ? src.replace(/^src\//, "") : title) ?? ""
  const key = ALIASES[rel] ?? rel
  const candidates = [
    key,
    `${key}.tsx`,
    `${key}.ts`,
    ...(name
      ? [
          `registry/examples/${name}.tsx`,
          `registry/components/${name}/${name}.tsx`,
          `registry/components/${name}.tsx`,
        ]
      : []),
  ]
  for (const root of ROOTS) {
    for (const c of candidates) {
      if (!c) continue
      const full = path.join(process.cwd(), root, c)
      try {
        if (fs.statSync(full).isFile()) return full
      } catch {
        // missing — try the next candidate
      }
    }
  }
  return null
}

export async function ComponentSource({
  name: _name,
  title,
  src,
  showLineNumbers = false,
  collapsible: _collapsible,
}: {
  name?: string
  title?: string
  src?: string
  showLineNumbers?: boolean
  collapsible?: boolean | string
}) {
  const file = await resolveSource(title, src, _name)

  if (!file) {
    return (
      <div className="my-[1.25em] rounded-xl border border-line p-4">
        <p className="font-mono text-sm text-muted-foreground">
          Source not available for {title ?? src ?? _name ?? "this file"}.
        </p>
      </div>
    )
  }

  const source = fs.readFileSync(file, "utf-8")

  return (
    <div className="my-[1.25em] rounded-xl bg-code text-code-foreground">
      <div className="flex items-center gap-3 border-b px-4 py-2.5 text-sm text-muted-foreground">
        <p className="truncate">{title}</p>
        <span className="ml-auto">
          <CopyButton text={source} />
        </span>
      </div>
      <pre className="no-scrollbar overflow-x-auto overscroll-x-contain px-4 py-4">
        <code
          className="min-w-full font-mono text-sm"
          {...(showLineNumbers ? { "data-line-numbers": "" } : {})}
        >
          {source}
        </code>
      </pre>
    </div>
  )
}
