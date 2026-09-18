"use client"

import React, { useState, useEffect, useCallback } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"

const MIN_CELL = 11
const CELL_GAP = 3

function hexToRgba(hex: string, a: number) {
  const h = hex.replace("#", "")
  const f =
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h
  const n = parseInt(f, 16)
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`
}

export default function GithubCalendar({ username }: { username: string }) {
  const { palette: universalPalette, isOverridden } = useThemeColorContext()
  const palette = !isOverridden
    ? (getBoxPalette("github") ?? universalPalette)
    : universalPalette
  const brand = palette.brand

  // Single dynamic ramp low→high: GitHub greens by default, brand
  // opacities when the site theme is overridden. Cells AND legend both
  // read from here, so everything follows the theme together.
  const ramp = React.useMemo<string[]>(() => {
    if (!isOverridden) return ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
    return [
      hexToRgba(brand, 0.1),
      hexToRgba(brand, 0.32),
      hexToRgba(brand, 0.55),
      hexToRgba(brand, 0.78),
      brand,
    ]
  }, [brand, isOverridden])
  const levelIndex = (level: string) =>
    level === "FIRST_QUARTILE"
      ? 1
      : level === "SECOND_QUARTILE"
        ? 2
        : level === "THIRD_QUARTILE"
          ? 3
          : level === "FOURTH_QUARTILE"
            ? 4
            : 0
  // Memoized so throttled commits (not per-pixel previews) rebuild cell styles.
  const getLevelStyle = useCallback(
    (level: string): React.CSSProperties =>
      ({ background: ramp[levelIndex(level)] }) as any,
    [ramp]
  )

  const [calendarData, setCalendarData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [containerHeight, setContainerHeight] = React.useState(0)

  useEffect(() => {
    let cancelled = false
    fetch(`/api/github-contributions?username=${username}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch contributions")
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        if (data && data.weeks) {
          setCalendarData(data)
        } else {
          throw new Error("Invalid data")
        }
      })
      .catch((err) => {
        console.error("GitHub calendar error:", err)
        if (cancelled) return
        setError(err.message)
        // fallback: render empty heatmap so UI not stuck on skeleton
        const today = new Date()
        const weeks = Array.from({ length: 53 }, (_, wi) => ({
          contributionDays: Array.from({ length: 7 }, (_, di) => {
            const d = new Date(today)
            d.setDate(today.getDate() - (52 - wi) * 7 - (6 - di))
            return {
              date: d.toISOString().split("T")[0],
              contributionCount: 0,
              contributionLevel: "NONE",
            }
          }),
        }))
        setCalendarData({ weeks, totalContributions: 0 })
      })
    return () => {
      cancelled = true
    }
  }, [username])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(([e]) =>
      setContainerHeight(e.contentRect.height)
    )
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  if (!calendarData) {
    return (
      <div className="flex w-full animate-pulse flex-col gap-3 font-sans">
        <div className="h-4 w-full rounded bg-muted/30" />
        <div className="h-[44px] w-full rounded bg-muted/30" />
        <div className="h-4 w-full rounded bg-muted/20" />
      </div>
    )
  }

  const weeks = calendarData.weeks || []
  const total = calendarData.totalContributions || 0
  const allTimeTotal = calendarData.allTimeTotal ?? null
  // Streaks from daily data: current (back from today/yesterday) + longest run
  const { currentStreak, longestStreak } = (() => {
    const active = new Map<string, boolean>()
    weeks.forEach((w: any) =>
      w.contributionDays.forEach((d: any) => {
        if (d.date) active.set(d.date, (d.contributionCount || 0) > 0)
      })
    )
    const key = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
    let cur = 0
    const d = new Date()
    if (!active.get(key(d))) d.setDate(d.getDate() - 1)
    while (active.get(key(d))) {
      cur++
      d.setDate(d.getDate() - 1)
    }
    let longest = 0
    let run = 0
    let prev: string | null = null
    for (const k of [...active.keys()].sort()) {
      if (!active.get(k)) {
        run = 0
        prev = k
        continue
      }
      if (prev) {
        const pd = new Date(prev + "T00:00:00")
        pd.setDate(pd.getDate() + 1)
        run = key(pd) === k ? run + 1 : 1
      } else {
        run = 1
      }
      longest = Math.max(longest, run)
      prev = k
    }
    return { currentStreak: cur, longestStreak: longest }
  })()
  // strict month division: build date->day map, then generate per-month weeks strictly within month
  const dayMap = new Map<string, any>()
  weeks.forEach((w: any) =>
    w.contributionDays.forEach((d: any) => dayMap.set(d.date, d))
  )
  const firstDate = new Date(
    weeks[0].contributionDays.find((d: any) => d.date)?.date || new Date()
  )
  const lastDate = new Date(
    weeks[weeks.length - 1].contributionDays
      .slice()
      .reverse()
      .find((d: any) => d.date)?.date || new Date()
  )
  const startYear = firstDate.getFullYear()
  const startMonth = firstDate.getMonth()
  const endYear = lastDate.getFullYear()
  const endMonth = lastDate.getMonth()
  const strictMonths: { label: string; weeks: any[][] }[] = []
  let cur = new Date(startYear, startMonth, 1)
  const end = new Date(endYear, endMonth, 1)
  while (cur <= end) {
    const y = cur.getFullYear(),
      m = cur.getMonth()
    const label = cur.toLocaleString("default", { month: "short" })
    const firstDayWeekday = new Date(y, m, 1).getDay() // 0 Sun
    const daysInMonth = new Date(y, m + 1, 0).getDate()
    const monthWeeks: any[][] = []
    let week: any[] = Array(firstDayWeekday)
      .fill(null)
      .map(() => ({
        date: "",
        contributionCount: 0,
        contributionLevel: "NONE",
        empty: true,
      }))
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`
      const day = dayMap.get(dateStr) || {
        date: dateStr,
        contributionCount: 0,
        contributionLevel: "NONE",
      }
      week.push(day)
      if (week.length === 7) {
        monthWeeks.push(week)
        week = []
      }
    }
    if (week.length > 0) {
      while (week.length < 7)
        week.push({
          date: "",
          contributionCount: 0,
          contributionLevel: "NONE",
          empty: true,
        })
      monthWeeks.push(week)
    }
    strictMonths.push({ label, weeks: monthWeeks })
    cur.setMonth(cur.getMonth() + 1)
  }
  // keep last 12 months for strict view
  const displayMonths = strictMonths.slice(-12)
  const minGridWidth = displayMonths.reduce(
    (acc, m) => acc + m.weeks.length * (MIN_CELL + CELL_GAP),
    0
  )

  // labels tuned for a white background – GitHub's own light-theme text colors
  const labelMuted = !isOverridden ? "#656d76" : palette.secondaryText
  const labelStrong = !isOverridden ? "#1f2328" : palette.cardText

  // 7 rows ideal, but if height < 140px shrink to 5 rows and spill horizontally
  const idealRows = 7
  const rowHeight = 11 // MIN_CELL
  const availableRows = containerHeight
    ? Math.max(
        4,
        Math.min(7, Math.floor((containerHeight - 32) / (rowHeight + 4)))
      )
    : idealRows
  const visibleRows = availableRows < 7 ? availableRows : 7

  return (
    <TooltipProvider>
      <div className="flex h-full min-h-0 w-full flex-col justify-start gap-1.5 bg-transparent">
        {/* Header: serif total + divider-separated stats + dynamic legend */}
        <div className="flex shrink-0 flex-wrap items-end justify-between gap-x-4 gap-y-1">
          <div className="flex items-baseline gap-2">
            <strong
              className="font-heading leading-none font-normal tracking-tight tabular-nums"
              style={{ color: labelStrong, fontSize: "32px" }}
            >
              {total.toLocaleString()}
            </strong>
            <span className="flex flex-col leading-tight">
              <span
                className="text-[11px] font-semibold tracking-wide"
                style={{ color: labelStrong }}
              >
                contributions
              </span>
              <span
                className="font-mono text-[9px] tracking-widest uppercase"
                style={{ color: labelMuted }}
              >
                this year
              </span>
            </span>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            {[
              { v: currentStreak, l: "day streak" },
              { v: longestStreak, l: "best" },
              { v: allTimeTotal, l: "all-time" },
            ].map(
              (s, i) =>
                s.v !== null && (
                  <div
                    key={i}
                    className={`flex flex-col items-end ${i > 0 ? "border-l border-black/10 pl-3" : ""}`}
                  >
                    <strong
                      className="font-heading text-[17px] leading-none font-normal tabular-nums"
                      style={{ color: labelStrong }}
                    >
                      {s.v?.toLocaleString()}
                    </strong>
                    <span
                      className="font-mono text-[9px] tracking-wider uppercase"
                      style={{ color: labelMuted }}
                    >
                      {s.l}
                    </span>
                  </div>
                )
            )}
            <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-black/10 bg-black/[0.03] px-2.5 py-1 backdrop-blur">
              <span
                style={{ color: labelMuted }}
                className="font-mono text-[9px]"
              >
                Less
              </span>
              <div className="flex gap-[3px]">
                {ramp.map((c, i) => (
                  <div
                    key={i}
                    className="h-[9px] w-[9px] rounded-[2px] border-0 shadow-none"
                    style={{ background: c }}
                  />
                ))}
              </div>
              <span
                style={{ color: labelMuted }}
                className="font-mono text-[9px]"
              >
                More
              </span>
            </div>
          </div>
        </div>

        <div
          ref={containerRef}
          className="min-h-0 w-full max-w-full flex-1 cursor-grab touch-pan-x [scrollbar-width:none] overflow-x-auto overflow-y-hidden select-none [-ms-overflow-style:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden"
        >
          <div
            style={{ minWidth: `${minGridWidth}px`, height: "100%" }}
            className="flex flex-col justify-end"
          >
            <div className="flex w-full shrink-0 gap-3">
              {displayMonths.map((m) => (
                <span
                  key={m.label + m.weeks[0][0]?.date}
                  className="shrink-0 overflow-hidden text-center text-[10px] font-medium"
                  style={{
                    width: `${m.weeks.length * (MIN_CELL + CELL_GAP)}px`,
                    color: labelMuted,
                  }}
                >
                  {m.label}
                </span>
              ))}
            </div>

            <div className="mt-1 flex min-h-0 w-full flex-1 items-stretch gap-3">
              {displayMonths.map((month, mi) => (
                <div key={mi} className="flex shrink-0 gap-1">
                  {month.weeks.map((week: any, wi: number) => (
                    <div key={wi} className="flex min-h-0 flex-col gap-1">
                      {week.slice(0, visibleRows).map((day: any, di: number) =>
                        day.empty ? (
                          <div
                            key={di}
                            className="aspect-square w-[11px] rounded-[2px] bg-transparent"
                          />
                        ) : (
                          <Tooltip key={day.date}>
                            <TooltipTrigger asChild>
                              <div
                                className="aspect-square w-[11px] rounded-[2px]"
                                style={getLevelStyle(day.contributionLevel)}
                              />
                            </TooltipTrigger>
                            <TooltipContent
                              side="top"
                              sideOffset={4}
                              className="px-2 py-1.5 text-xs"
                            >
                              <strong className="font-medium">
                                {day.contributionCount}
                              </strong>{" "}
                              contributions on{" "}
                              {new Date(day.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </TooltipContent>
                          </Tooltip>
                        )
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}