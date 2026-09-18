"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoStatsBox() {
  return (
    <HomeBox boxKey="stats" outerClassName="bento-stats h-full w-full" className="flex flex-col justify-between p-5">
      <span className="text-xs font-mono tracking-widest text-muted-foreground">STATS — EXTRA 1</span>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold leading-none">42k</h3>
        <p className="text-sm text-muted-foreground">Views · dummy cell added for 7xl</p>
        <div className="flex gap-1 pt-1">
          {[40, 65, 50, 80, 60, 90].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-primary/30" style={{ height: `${h}%`, minHeight: "18px" }} />
          ))}
        </div>
      </div>
      <span className="text-xs text-muted-foreground">Added to fill 7xl width</span>
    </HomeBox>
  )
}
export default BentoStatsBox
