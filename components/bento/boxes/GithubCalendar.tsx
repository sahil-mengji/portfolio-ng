"use client"

import React, { useState, useEffect, useCallback } from "react"
import { useThemeColorContext } from "@/components/theme-provider"
import { getBoxPalette } from "@/components/bento/box-palettes"

const CELL = 11
const GAP = 4
const COL = CELL + GAP

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

function GithubMark({ color }: { color: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 16 16"
      fill={color}
      aria-hidden
      className="shrink-0"
    >
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

function ArrowUpRight({ color }: { color: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M2.5 9.5 9.5 2.5M9.5 2.5H4M9.5 2.5V8"
        stroke={color}
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

interface RepoStat {
  fullName: string
  name: string
  count: number
  href: string
  /** undefined when the repo belongs to `username` themselves */
  ownerAvatar?: string
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
    if (!isOverridden)
      return ["#ebedf0", "#9be9a8", "#40c463", "#30a14e", "#216e39"]
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
  const [repos, setRepos] = useState<RepoStat[]>([])
  const [error, setError] = useState<string | null>(null)

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

    // Non-blocking: top repos from the public events stream.
    // Failures are swallowed — the calendar never depends on this.
    fetch(`https://api.github.com/users/${username}/events/public?per_page=100`)
      .then((res) => (res.ok ? res.json() : []))
      .then((events: any[]) => {
        if (cancelled || !Array.isArray(events)) return
        const counts = new Map<string, number>()
        for (const event of events) {
          if (event.type !== "PushEvent" || !event.repo?.name) continue
          const commits = event.payload?.commits?.length ?? 1
          counts.set(
            event.repo.name,
            (counts.get(event.repo.name) ?? 0) + commits
          )
        }
        const top: RepoStat[] = [...counts.entries()]
          .sort(([, a], [, b]) => b - a)
          .slice(0, 3)
          .map(([fullName, count]) => {
            const [owner, name] = fullName.split("/")
            const own = owner.toLowerCase() === username.toLowerCase()
            return {
              fullName,
              name: name ?? fullName,
              count,
              href: `https://github.com/${fullName}`,
              ownerAvatar: own
                ? undefined
                : `https://github.com/${owner}.png?size=64`,
            }
          })
        if (!cancelled) setRepos(top)
      })
      .catch(() => {})

    return () => {
      cancelled = true
    }
  }, [username])

  // labels tuned for a white background – GitHub's own light-theme text colors
  const labelMuted = !isOverridden ? "#656d76" : palette.secondaryText
  const labelStrong = !isOverridden ? "#1f2328" : palette.cardText

  if (!calendarData) {
    return (
      <div className="flex w-full animate-pulse flex-col gap-3 rounded-2xl border border-border/60 bg-card/60 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-[22px] w-[22px] rounded-lg bg-muted/30" />
            <div className="h-4 w-28 rounded-md bg-muted/30" />
          </div>
          <div className="h-5 w-24 rounded-full bg-muted/20" />
        </div>
        <div className="h-[86px] w-full rounded-lg bg-muted/20" />
        <div className="h-9 w-full rounded-lg bg-muted/10" />
      </div>
    )
  }

  const weeks: any[] = calendarData.weeks || []
  const total = calendarData.totalContributions || 0

  // Current streak back from today/yesterday.
  const currentStreak = (() => {
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
    return cur
  })()

  // Month label per week column: shown only when the month changes
  // (classic GitHub graph style).
  let prevMonth = -1
  const monthLabels = weeks.map((w: any) => {
    const first = w.contributionDays.find((d: any) => d.date)
    const m = first ? new Date(first.date + "T00:00:00").getMonth() : -1
    const show = m !== -1 && m !== prevMonth
    prevMonth = m
    return show
      ? new Date(first.date + "T00:00:00").toLocaleString("default", {
          month: "short",
        })
      : ""
  })

  return (
    <div
      className="relative flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden rounded-2xl border border-border/60"
      style={
        {
          // background:
          //   "linear-gradient(160deg, color-mix(in srgb, var(--accent) 6%, transparent), transparent 55%)",
          // boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
        }
      }
    >
      {/* faint brand glow in the corner */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full blur-3xl"
        style={{ background: hexToRgba(brand, 0.08) }}
      />

      {/* Header: identity + total left, streak + legend right */}
      <div className="relative flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg"
            style={{
              background: hexToRgba(brand, 0.1),
              boxShadow: `inset 0 0 0 1px ${hexToRgba(brand, 0.18)}`,
            }}
          >
            <GithubMark color={brand} />
          </div>
          <span
            className="truncate text-[13px] font-semibold tracking-tight"
            style={{ color: labelStrong }}
          >
            {username}
          </span>
          <span
            className="hidden font-heading text-[22px] leading-none font-normal tabular-nums min-[420px]:inline"
            style={{ color: labelStrong }}
          >
            {total.toLocaleString()}
          </span>
          <span
            className="hidden font-mono text-[9px] tracking-widest uppercase min-[420px]:inline"
            style={{ color: labelMuted }}
          >
            contributions in the last year
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {currentStreak > 1 && (
            <span
              className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1 font-mono text-[10px] font-medium whitespace-nowrap"
              style={{
                borderColor: hexToRgba(brand, 0.35),
                color: brand,
                background: hexToRgba(brand, 0.08),
              }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: brand }}
              />
              {currentStreak}-day streak
            </span>
          )}

          <div
            className="flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1"
            style={{
              background: "color-mix(in srgb, var(--accent) 3%, transparent)",
            }}
          >
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
                  className="h-[9px] w-[9px] rounded-[2px]"
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

      {/* Graph: continuous week columns, always 7 rows */}
      <div className="relative min-h-0 w-full max-w-full flex-1 cursor-grab touch-pan-x [scrollbar-width:none] overflow-x-auto overflow-y-hidden select-none [-ms-overflow-style:none] active:cursor-grabbing [&::-webkit-scrollbar]:hidden">
        <div
          className="flex h-full flex-col justify-end"
          style={{ minWidth: `${weeks.length * COL + 30}px` }}
        >
          {/* Month labels + weekday label column */}
          <div className="flex shrink-0">
            <span
              className="mr-1 w-[24px] shrink-0 text-[9px] font-medium"
              style={{ color: labelMuted }}
            />
            <div className="flex" style={{ gap: GAP }}>
              {monthLabels.map((label, i) => (
                <span
                  key={i}
                  className="shrink-0 overflow-hidden text-[9px] font-medium whitespace-nowrap"
                  style={{ width: CELL, color: labelMuted }}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-1 flex min-h-0 flex-1">
            {/* weekday labels */}
            <div
              className="mr-1 flex shrink-0 flex-col justify-between text-[9px] font-medium"
              style={{ width: 24, color: labelMuted }}
            >
              <span className="leading-none">Mon</span>
              <span className="leading-none">Wed</span>
              <span className="leading-none">Fri</span>
            </div>

            <div className="flex min-h-0 flex-1" style={{ gap: GAP }}>
              {weeks.map((week: any, wi: number) => (
                <div
                  key={wi}
                  className="flex min-h-0 shrink-0 flex-col"
                  style={{ gap: GAP }}
                >
                  {week.contributionDays.map((day: any, di: number) => {
                    const level = levelIndex(day.contributionLevel)
                    return (
                      <div
                        key={day.date || di}
                        title={
                          day.date
                            ? `${day.contributionCount} contributions on ${new Date(
                                day.date + "T00:00:00"
                              ).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}`
                            : undefined
                        }
                        className="rounded-[3px] transition-all duration-150 ease-out hover:z-10 hover:scale-125 hover:rounded-full"
                        style={{
                          width: CELL,
                          height: CELL,
                          boxShadow:
                            day.date && level === 4
                              ? `0 0 6px ${hexToRgba(
                                  !isOverridden ? "#216e39" : brand,
                                  0.45
                                )}`
                              : undefined,
                          ...(day.date
                            ? getLevelStyle(day.contributionLevel)
                            : { background: "transparent" }),
                        }}
                      />
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top repos strip (from public events) — renders only once loaded */}
      {repos.length > 0 && (
        <div className="relative -mx-4 -mb-4 shrink-0 border-t border-border/60 px-4 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <span
              className="shrink-0 font-mono text-[9px] tracking-widest uppercase"
              style={{ color: labelMuted }}
            >
              Most active
            </span>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-1.5">
              {repos.map((repo) => (
                <a
                  key={repo.fullName}
                  href={repo.href}
                  target="_blank"
                  rel="noreferrer"
                  className="group/repo flex min-w-0 items-center gap-1.5 rounded-full border border-border/60 py-1 pr-2.5 pl-1 transition-all duration-150 hover:border-transparent"
                  style={{ background: hexToRgba(brand, 0.05) }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = hexToRgba(brand, 0.1)
                    e.currentTarget.style.boxShadow = `inset 0 0 0 1px ${hexToRgba(brand, 0.25)}`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = hexToRgba(brand, 0.05)
                    e.currentTarget.style.boxShadow = "none"
                  }}
                >
                  <span
                    className="flex h-[18px] w-[18px] shrink-0 items-center justify-center overflow-hidden rounded-full"
                    style={{
                      background: hexToRgba(brand, 0.1),
                      boxShadow: `inset 0 0 0 1px ${hexToRgba(brand, 0.15)}`,
                    }}
                  >
                    {repo.ownerAvatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={repo.ownerAvatar}
                        alt=""
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <GithubMark color={brand} />
                    )}
                  </span>
                  <span
                    className="truncate text-[11px] font-medium max-[380px]:hidden"
                    style={{ color: labelStrong }}
                  >
                    {repo.name}
                  </span>
                  <span
                    className="shrink-0 font-mono text-[10px] tabular-nums"
                    style={{ color: brand }}
                  >
                    {repo.count}
                  </span>
                  <span
                    className="opacity-0 transition-opacity duration-150 group-hover/repo:opacity-100"
                    style={{ color: labelMuted }}
                  >
                    <ArrowUpRight color="currentColor" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
