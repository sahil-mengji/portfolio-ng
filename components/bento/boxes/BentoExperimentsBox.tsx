"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoExperimentsBox() {
  return (
    <HomeBox boxKey="experiments" outerClassName="bento-experiments h-full w-full" className="flex flex-col p-5">
      <span className="text-xs font-mono tracking-widest text-muted-foreground">EXPERIMENTS</span>
      <div className="mt-4 flex gap-3 overflow-hidden">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="min-w-[160px] rounded-xl border bg-muted p-3">
            <div className="h-20 rounded-lg bg-foreground/10" />
            <div className="mt-2 h-2 w-2/3 rounded bg-foreground/20" />
          </div>
        ))}
      </div>
      <p className="mt-3 text-sm text-muted-foreground">Carousel — dummy experiments</p>
    </HomeBox>
  )
}
export default BentoExperimentsBox
