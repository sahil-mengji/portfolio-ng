"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoIdBox() {
  return (
    <HomeBox boxKey="id" outerClassName="bento-id h-full w-full" className="flex flex-col justify-between p-6">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600" />
        <div>
          <p className="text-sm font-semibold">Sahil Mengji</p>
          <p className="text-xs text-muted-foreground">Full Stack Developer</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {["React", "Node.js", "TS", "GraphQL"].map((s) => (
          <span key={s} className="rounded bg-violet-500/15 px-2 py-1 text-xs font-mono text-violet-600 dark:text-violet-300">
            {s}
          </span>
        ))}
      </div>
      <p className="font-mono text-xs text-muted-foreground">@sahil.mengji • dummy ID card</p>
    </HomeBox>
  )
}
export default BentoIdBox
