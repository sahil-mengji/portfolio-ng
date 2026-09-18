"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoQuotesBox() {
  return (
    <HomeBox boxKey="quotes" outerClassName="bento-quotes h-full w-full" className="flex flex-col justify-center p-6">
      <p className="font-serif text-lg leading-relaxed">“Design is intelligence made visible.”</p>
      <span className="mt-2 text-xs font-mono text-muted-foreground">— Alina Wheeler • dummy quote</span>
    </HomeBox>
  )
}
export default BentoQuotesBox
