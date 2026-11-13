"use client"

import { useEffect, useRef, useState } from "react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"
import { pixelText } from "@/lib/pixel-display"

const FLIGHTS = [
  ["09:10", "SM101", "TOKYO", "BOARDING"],
  ["10:25", "SM204", "LONDON", "ON TIME"],
  ["11:40", "SM305", "BERLIN", "GATE 04"],
]
const STUDIO = [
  ["01:00", "DS001", "DESIGN", "IDEATE"],
  ["02:00", "DV002", "DEVELOP", "BUILD"],
  ["03:00", "SH003", "DELIVER", "SHIPPED"],
]
const MESSAGE = "WELCOME ABOARD / DESIGN. BUILD. SHIP. / "
const WIDTH = 168,
  HEIGHT = 64,
  PITCH = 4

export function BentoBannerBox() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const elapsedRef = useRef(0)
  const [paused, setPaused] = useState(false)
  const [pageIndex, setPageIndex] = useState(0)
  const { palette, isOverridden } = useThemeColorContext()
  const background = isOverridden ? palette.effectSurface : "#101512"
  const ink = isOverridden ? palette.effectText : "#f6ca74"

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return
    const pixels = document.createElement("canvas")
    pixels.width = WIDTH
    pixels.height = HEIGHT
    const text = pixels.getContext("2d", { willReadFrequently: true })!
    const grid = document.createElement("canvas")
    grid.width = WIDTH * PITCH
    grid.height = HEIGHT * PITCH
    const dots = grid.getContext("2d")!
    dots.fillStyle = background
    dots.fillRect(0, 0, grid.width, grid.height)
    dots.fillStyle = ink
    dots.globalAlpha = 0.1
    dots.beginPath()
    for (let y = 0; y < HEIGHT; y++)
      for (let x = 0; x < WIDTH; x++) {
        dots.moveTo(x * PITCH + 3.4, y * PITCH + 2)
        dots.arc(x * PITCH + 2, y * PITCH + 2, 1.4, 0, Math.PI * 2)
      }
    dots.fill()
    const motion = matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0,
      timer = 0,
      last = 0,
      lastDraw = -100,
      inView = true,
      shown = -1,
      lastKey = "",
      animating = false
    function draw(now: number) {
      frame = 0
      if (!inView || document.hidden) {
        last = 0
        return
      }
      if (last && !paused && !motion.matches)
        elapsedRef.current += Math.min(now - last, 1000)
      last = now
      if (now - lastDraw >= 80) {
        lastDraw = now
        const elapsed = elapsedRef.current / 1000
        const cycle = elapsed % 28
        const section = motion.matches ? 0 : cycle < 9 ? 0 : cycle < 18 ? 1 : 2
        const view = (section + pageIndex) % 3
        if (shown !== view) {
          shown = view
          canvas!.dataset.mode = ["flights", "studio", "marquee"][view]
        }
        const age = cycle < 9 ? cycle : cycle < 18 ? cycle - 9 : cycle - 18
        animating = (view === 2 && !motion.matches) || age < 0.55
        const key = `${view}|${paused}|${animating ? Math.floor(elapsed * 12) : "still"}`
        if (key !== lastKey) {
          lastKey = key
          text.clearRect(0, 0, WIDTH, HEIGHT)
          pixelText(
            text,
            view === 0
              ? "DEMO DEPARTURES"
              : view === 1
                ? "STUDIO DEPARTURES"
                : "SAHIL / ON AIR",
            6,
            4,
            "#fff"
          )
          pixelText(text, paused ? ">" : "II", 141, 4, "#fff")
          pixelText(text, "+", 156, 4, "#fff")
          if (view === 2 && !motion.matches) {
            const x =
              WIDTH - Math.floor((cycle >= 18 ? cycle - 18 : elapsed % 10) * 80)
            pixelText(text, MESSAGE, x, 29, "#fff", 2)
            pixelText(text, "DESIGN / BUILD / SHIP", 6, 53, "#fff")
          } else {
            const data = view === 1 ? STUDIO : FLIGHTS
            ;["TIME", "FLIGHT", "TO", "STATUS"].forEach((label, i) =>
              pixelText(text, label, [4, 38, 75, 118][i], 17, "#fff")
            )
            data.forEach((row, rowIndex) =>
              row.forEach((value, col) =>
                pixelText(
                  text,
                  value,
                  [4, 38, 75, 118][col],
                  29 + rowIndex * 12,
                  "#fff"
                )
              )
            )
          }
          const image = text.getImageData(0, 0, WIDTH, HEIGHT).data
          ctx!.drawImage(grid, 0, 0)
          ctx!.fillStyle = ink
          ctx!.beginPath()
          // A single column sweep replaces full-panel flashing when rows change.
          const sweep =
            !motion.matches && !paused && age < 0.55
              ? Math.floor((age / 0.55) * WIDTH)
              : WIDTH
          for (let y = 0; y < HEIGHT; y++)
            for (let x = 0; x < WIDTH; x++) {
              if (!image[(y * WIDTH + x) * 4 + 3] || (y > 25 && x > sweep))
                continue
              ctx!.moveTo(x * PITCH + 3.55, y * PITCH + 2)
              ctx!.arc(x * PITCH + 2, y * PITCH + 2, 1.55, 0, Math.PI * 2)
            }
          ctx!.fill()
        }
      }
      if (!paused && !motion.matches) {
        if (animating) frame = requestAnimationFrame(draw)
        else timer = window.setTimeout(() => draw(performance.now()), 250)
      }
    }
    const wake = () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      last = 0
      lastDraw = -100
      draw(performance.now())
    }
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      wake()
    })
    observer.observe(canvas)
    document.addEventListener("visibilitychange", wake)
    motion.addEventListener("change", wake)
    wake()
    return () => {
      cancelAnimationFrame(frame)
      clearTimeout(timer)
      observer.disconnect()
      document.removeEventListener("visibilitychange", wake)
      motion.removeEventListener("change", wake)
    }
  }, [paused, pageIndex, ink, background])

  return (
    <HomeBox
      boxKey="banner"
      outerClassName="bento-banner h-full w-full"
      liveSurface={background}
    >
      <div className="relative h-full w-full p-3">
        <canvas
          ref={canvasRef}
          width={WIDTH * PITCH}
          height={HEIGHT * PITCH}
          className="h-full w-full rounded-xl"
          aria-hidden="true"
        />
        <div className="absolute top-2 right-2 flex">
          <button
            type="button"
            className="h-11 w-11 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: ink }}
            onClick={() => setPaused((value) => !value)}
            aria-label={
              paused ? "Resume departures board" : "Pause departures board"
            }
            aria-pressed={paused}
          />
          <button
            type="button"
            className="h-11 w-11 cursor-pointer rounded focus-visible:outline-2 focus-visible:outline-offset-2"
            style={{ outlineColor: ink }}
            onClick={() => setPageIndex((value) => (value + 1) % 3)}
            aria-label="Next departures display"
          />
        </div>
        <div className="sr-only">
          <p>
            Illustrative departures board. Cycles through a demo flight
            timetable, studio workflow, and a scrolling welcome message.
          </p>
          <table>
            <caption>Demo departures, not live flight information</caption>
            <thead>
              <tr>
                {["Time", "Flight", "Destination", "Status"].map((label) => (
                  <th key={label}>{label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FLIGHTS.map((row) => (
                <tr key={row[1]}>
                  {row.map((value, index) => (
                    <td key={index}>{value}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <p>Studio workflow: design, develop, deliver.</p>
          <p>{MESSAGE}</p>
        </div>
      </div>
    </HomeBox>
  )
}
export default BentoBannerBox
