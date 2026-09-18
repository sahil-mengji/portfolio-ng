"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoLibraryBox() {
  return (
    <HomeBox boxKey="library" outerClassName="bento-library h-full w-full" className="flex flex-col p-5">
      <span className="text-xs font-mono tracking-widest text-muted-foreground">LIBRARY</span>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[3/4] rounded-md border bg-muted" />
        ))}
      </div>
      <p className="mt-auto pt-4 text-sm text-muted-foreground">Books & resources — dummy shelf</p>
    </HomeBox>
  )
}
export default BentoLibraryBox
