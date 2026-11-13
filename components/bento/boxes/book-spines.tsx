import { readableInkOn } from "@/lib/color-utils"

export function Spine({
  title,
  h,
  w,
  color,
}: {
  title: string
  h: number
  w: number
  color: string
}) {
  return (
    <div
      className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-t-[2px] border-x border-black/15"
      style={{
        height: h,
        width: w,
        background: color,
        color: readableInkOn(color),
        boxShadow: "inset 2px 0 2px #ffffff33,inset -2px 0 2px #0003",
      }}
    >
      <span className="absolute inset-x-1 top-2 h-px bg-current opacity-40" />
      <span
        className="max-h-[85%] rotate-180 overflow-hidden font-serif text-[10px] font-medium whitespace-nowrap"
        style={{ writingMode: "vertical-rl" }}
      >
        {title}
      </span>
      <span className="absolute inset-x-1 bottom-2 h-px bg-current opacity-40" />
    </div>
  )
}
export function Paper({ h, tilt }: { h: number; tilt: string }) {
  return (
    <div
      aria-hidden
      className={`w-2 shrink-0 origin-bottom ${tilt}`}
      style={{
        height: h,
        background:
          "repeating-linear-gradient(90deg,var(--card-foreground) 0 1px,var(--card) 1px 3px)",
        opacity: 0.55,
      }}
    />
  )
}
