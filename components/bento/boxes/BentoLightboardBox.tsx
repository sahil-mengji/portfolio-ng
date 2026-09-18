"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoLightboardBox() {
  return (
    <HomeBox boxKey="lightboard" outerClassName="bento-lightboard h-full w-full" className="flex items-center justify-between p-6">
      <div>
        <h3 className="text-lg font-semibold">Lightboard</h3>
        <p className="text-sm text-muted-foreground">Drawing canvas — dummy placeholder</p>
      </div>
      <div className="hidden h-20 w-32 rounded-lg border-2 border-dashed bg-muted md:block" />
    </HomeBox>
  )
}
export default BentoLightboardBox
