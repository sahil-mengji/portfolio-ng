"use client"
import { useMemo } from "react"
import qrcode from "qrcode-generator"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"
import { readableInkOn } from "@/lib/color-utils"
import { HomeBox } from "@/components/bento/HomeBox"

const URL = "https://www.modul.day"
const QUIET = 4

export function BentoExtraBox() {
  const { palette, isOverridden } = useThemeColorContext()
  const surface = (isOverridden ? palette : (getBoxPalette("extra") ?? palette))
    .surface
  const ink = readableInkOn(surface)
  const code = useMemo(() => {
    const qr = qrcode(0, "H")
    qr.addData(URL)
    qr.make()
    const size = qr.getModuleCount()
    const corners = [
      [0, 0],
      [size - 7, 0],
      [0, size - 7],
    ]
    const dots = []
    for (let y = 0; y < size; y++)
      for (let x = 0; x < size; x++) {
        if (
          qr.isDark(y, x) &&
          !corners.some(
            ([cx, cy]) => x >= cx && x < cx + 7 && y >= cy && y < cy + 7
          )
        )
          dots.push([x + QUIET + 0.5, y + QUIET + 0.5])
      }
    return { size, corners, dots }
  }, [])
  return (
    <HomeBox
      boxKey="extra"
      outerClassName="bento-extra h-full w-full"
      className="relative overflow-hidden p-0"
    >
      <a
        aria-label="Open modul.day"
        className="absolute inset-5 grid place-items-center rounded-lg focus-visible:ring-2 focus-visible:ring-current focus-visible:outline-none"
        href={URL}
        rel="noreferrer"
        target="_blank"
        style={{ color: ink }}
      >
        <svg
          role="img"
          aria-label="Dotted QR code linking to modul.day"
          viewBox={`0 0 ${code.size + QUIET * 2} ${code.size + QUIET * 2}`}
          className="h-full w-full"
          fill="currentColor"
        >
          {code.dots.map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r=".44" />
          ))}
          {code.corners.map(([x, y]) => (
            <g
              key={`${x}-${y}`}
              transform={`translate(${x + QUIET} ${y + QUIET})`}
            >
              <rect width="7" height="7" rx="1" />
              <rect x="1" y="1" width="5" height="5" rx=".55" fill={surface} />
              <rect x="2" y="2" width="3" height="3" rx=".6" />
            </g>
          ))}
        </svg>
      </a>
    </HomeBox>
  )
}
export default BentoExtraBox
