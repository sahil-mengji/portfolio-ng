"use client"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"

export function BentoNotchedBox() {
  const { palette, isOverridden } = useThemeColorContext()
  // themified folder: blue #72b6f7 when unset, universal brand when overridden
  const folderFill = isOverridden ? palette.brand : "#72b6f7"
  const folderOpacity = 0.8
  return (
    <HomeBox
      boxKey="notch"
      allowOverflow
      outerClassName="bento-notch h-full w-full overflow-visible"
      className="relative overflow-visible p-0"
    >
      {/* Layer: backdrop blur + white files behind notched folder */}
      <div className="absolute inset-0 overflow-visible">
        {/* subtle backdrop blur behind folder */}
        <div className="absolute inset-0 rounded-[24px] border border-white/20 bg-white/15 backdrop-blur-xl" />
        {/* white files stack peeking from behind folder */}
        <div className="absolute -top-2 right-8 bottom-10 left-5 rotate-[1.2deg] rounded-[18px] border border-black/[0.06] bg-white" />
        <div className="absolute -top-1 right-10 bottom-12 left-8 -rotate-[0.8deg] rounded-[18px] border border-black/[0.04] bg-white/95" />
        {/* subtle file lines */}top-l
        <div className="absolute top-10 right-16 left-12 h-1.5 rounded-full bg-black/[0.04]" />
        <div className="absolute top-14 right-20 left-12 h-1.5 rounded-full bg-black/[0.03]" />

        {/* Backdrop blur clipped to SAME notched shape as SVG – very strong */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <clipPath id="notchClip" clipPathUnits="objectBoundingBox">
              <path
                d="M2253.12 365.705C2286.11 407.569 2336.48 432 2389.78 432H4868C4964.1 432 5042 509.902 5042 606V2546C5042 2642.1 4964.1 2720 4868 2720H174C77.9026 2720 0 2642.1 0 2546V174C0 77.9024 77.9025 0 174 0H1880.49C1933.79 0 1984.15 24.4314 2017.15 66.2953L2253.12 365.705Z"
                transform="scale(0.00019833 0.00036765)"
              />
            </clipPath>
          </defs>
        </svg>
        <div
          className="absolute bottom-0 left-0 h-[112%] w-full overflow-visible bg-white/[0.08] backdrop-blur-[28px] border border-white/10"
          style={{ clipPath: "url(#notchClip)", WebkitClipPath: "url(#notchClip)" } as any}
        />
        <div
          className="absolute bottom-0 left-0 h-[112%] w-full overflow-visible bg-gradient-to-br from-white/20 via-transparent to-transparent backdrop-blur-3xl"
          style={{ clipPath: "url(#notchClip)", WebkitClipPath: "url(#notchClip)" } as any}
        />
        <svg
          viewBox="0 0 5042 2720"
          preserveAspectRatio="none"
          className="absolute bottom-0 left-0 h-[112%] w-full overflow-visible"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            opacity={folderOpacity}
            d="M2253.12 365.705C2286.11 407.569 2336.48 432 2389.78 432H4868C4964.1 432 5042 509.902 5042 606V2546C5042 2642.1 4964.1 2720 4868 2720H174C77.9026 2720 0 2642.1 0 2546V174C0 77.9024 77.9025 0 174 0H1880.49C1933.79 0 1984.15 24.4314 2017.15 66.2953L2253.12 365.705Z"
            fill={folderFill}
          />
        </svg>
      </div>

      {/* Content – positioned over shape, allowed to overflow */}
      <div className="relative z-10 flex h-full flex-col justify-between p-6 text-white">
        <div className="flex items-start justify-between">
          <span className="rounded-full bg-white/20 px-3 py-1 font-mono text-xs tracking-widest backdrop-blur">
            NOTCHED — 3×2
          </span>
          <span className="rounded-full bg-black/10 px-2 py-1 text-xs backdrop-blur">
            top-left
          </span>
        </div>
        <div>
          <h3 className="text-2xl leading-tight font-semibold text-white drop-shadow">
            Overflow cell
          </h3>
          <p className="mt-1 max-w-[32ch] text-sm text-white/90">
            Shape from provided SVG — HomeBox with{" "}
            <code className="rounded bg-white/20 px-1">allowOverflow</code>.
          </p>
        </div>
        {/* Example overflow element protruding top-right outside grid */}
      </div>
    </HomeBox>
  )
}
export default BentoNotchedBox