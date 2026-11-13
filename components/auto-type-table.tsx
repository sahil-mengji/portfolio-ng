// API reference placeholder: p4 generates these tables from TypeScript
// types at registry-build time (fumadocs-typescript). The prop
// documentation lives with each demo's source, linked above.
export function AutoTypeTable({ name }: { name: string; path?: string }) {
  return (
    <div className="my-[1.25em] rounded-xl border border-line p-4">
      <p className="font-mono text-sm text-muted-foreground">
        API reference: <span className="text-foreground">{name}</span> — see
        the source above for full prop documentation.
      </p>
    </div>
  )
}
