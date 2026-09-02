"use client"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { useThemeColorContext } from "@/components/theme-provider"

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export function HomeBox({
  outerClassName = "",
  children,
  className = "",
}: {
  outerClassName?: string
  children: React.ReactNode
  className?: string
}) {
  const { palette } = useThemeColorContext()
  const ref = useRef<HTMLDivElement>(null)
  const [mouse, setMouse] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      setMouse({ x: e.clientX - r.left, y: e.clientY - r.top })
    }
    el.addEventListener("mousemove", onMove)
    return () => el.removeEventListener("mousemove", onMove)
  }, [])

  return (
    <div
      className={cn("relative group p-[2px] rounded-[26px] transition-all hover:scale-[1.015] shadow-sm", outerClassName)}
      style={{ background: `linear-gradient(to bottom right, ${hexToRgba(palette.brand, 0.35)}, ${hexToRgba(palette.primary, 0.15)})` }}
    >
      <div ref={ref} className="relative bg-card rounded-[24px] w-full h-full cursor-pointer overflow-hidden" style={{ background: `color-mix(in oklab, var(--card) 92%, transparent)` } as any}>
        <div className="hidden group-hover:block absolute inset-0 border border-white/10 rounded-[30px] pointer-events-none" style={{ transform: "translateZ(5px)" }}>
          <div className="top-[-4px] left-[-4px] absolute w-8 h-8 border-t-[4px] border-l-[4px] rounded-tl-[28px] border-violet-400" />
          <div className="top-[-4px] right-[-4px] absolute w-8 h-8 border-t-[4px] border-r-[4px] rounded-tr-[28px] border-violet-400" />
          <div className="bottom-[-4px] left-[-4px] absolute w-8 h-8 border-b-[4px] border-l-[4px] rounded-bl-[28px] border-violet-400" />
          <div className="right-[-4px] bottom-[-4px] absolute w-8 h-8 border-r-[4px] border-b-[4px] rounded-br-[28px] border-violet-400" />
        </div>
        <div className="relative w-full h-full overflow-hidden rounded-[24px] spotlight-card before:absolute before:inset-0 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity" style={{ "--x": `${mouse.x}px`, "--y": `${mouse.y}px` } as any}>
          <div className={cn("w-full h-full", className)} style={{ background: `radial-gradient(300px circle at var(--x) var(--y), ${hexToRgba(palette.brand, 0.12)}, transparent 70%)` }}>
            <div className="w-full h-full bg-gradient-to-b from-transparent to-black/5 dark:to-white/5">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default HomeBox
