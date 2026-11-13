"use client"

import React, { useState, useEffect } from "react"
import {
  GitHubActivity,
  gapFor,
  Contribution,
  ContributionLevel,
  ContributionStats,
  RepoContribution,
} from "@/components/github-activity"
import { useThemeColorContext } from "@/components/theme-provider"

// vertical chrome around the 7-row grid, measured exactly: card top
// padding (p-4 = 16) + collapsed repos-bar reserve (pb-48 = 48) +
// month-labels row (mt-3 = 12 + h-3 = 12 + row gap) + grid bottom air
// (pb-5 = 20) + tuned reserve. Cells fill the rest of the card height.
const CHROME = 122

interface RepoStat {
  fullName: string
  name: string
  count: number
  href: string
  /** undefined when the repo belongs to `username` themselves */
  ownerAvatar?: string
}

const levelIndex = (level: string): ContributionLevel =>
  level === "FIRST_QUARTILE"
    ? 1
    : level === "SECOND_QUARTILE"
      ? 2
      : level === "THIRD_QUARTILE"
        ? 3
        : level === "FOURTH_QUARTILE"
          ? 4
          : 0

export default function GitHubCalendar({ username }: { username: string }) {
  const [calendarData, setCalendarData] = useState<any>(null)
  const [repos, setRepos] = useState<RepoStat[]>([])
  const [error, setError] = useState<string | null>(null)
  const [cellSize, setCellSize] = useState(13)
  const boxRef = React.useRef<HTMLDivElement>(null)
  // Skeleton follows the picker too — defaults untouched when idle.
  const { palette, isOverridden } = useThemeColorContext()
  const sk = React.useMemo(() => {
    if (!isOverridden) return null
    const p = palette as any
    const text: string = p.cardText ?? "#171717"
    const surface: string = p.surface ?? "#ffffff"
    const tmix = (pct: number) =>
      `color-mix(in srgb, ${text} ${pct}%, transparent)`
    return {
      border: tmix(14),
      card: `color-mix(in srgb, ${surface} 70%, transparent)`,
      bar: tmix(12),
      barSoft: tmix(7),
    }
  }, [palette, isOverridden])

  useEffect(() => {
    let cancelled = false
    const emptyCalendar = () => {
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
      return { weeks, totalContributions: 0 }
    }
    fetch(`/api/github-contributions?username=${username}`)
      .then((res) => (res.ok ? res.json().catch(() => null) : null))
      .then((data) => {
        if (cancelled) return
        if (data && data.weeks) {
          setCalendarData(data)
        } else {
          // API/token unavailable — degrade quietly to an empty heatmap.
          setError("unavailable")
          setCalendarData(emptyCalendar())
        }
      })
      .catch(() => {
        if (cancelled) return
        setError("unavailable")
        setCalendarData(emptyCalendar())
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

  // Scale the 7-row grid to the vertical space available: pick the
  // largest cell that still leaves room for the surrounding chrome.
  // Uses the smallest positive height up the ancestor chain (self or the
  // card): taking the max would grab the whole grid/section height,
  // inflate the budget, and pin cells at the max so the card overflows.
  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const boxHeight = () => {
      let h = 0
      let node: HTMLElement | null = el
      for (let i = 0; i < 5 && node; i++) {
        if (node.clientHeight > 0 && (h === 0 || node.clientHeight < h)) {
          h = node.clientHeight
        }
        node = node.parentElement
      }
      return h
    }
    const fit = () => {
      const budget = Math.max(0, boxHeight() - CHROME)
      let next = 5
      // Fill the card height exactly — width is allowed to overflow into
      // its own x-scroll container, so height is the only constraint.
      for (let c = 24; c >= 5; c--) {
        if (7 * c + 6 * gapFor(c) <= budget) {
          next = c
          break
        }
      }
      setCellSize((prev) => (prev === next ? prev : next))
    }
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    if (el.parentElement) ro.observe(el.parentElement)
    return () => ro.disconnect()
  }, [])

  // Adapt this component's payloads to the shared card's data shapes.
  // Fetching above is untouched — only the presentation is shared.
  const weeks: any[] = calendarData?.weeks || []
  const contributions: Contribution[] = []
  for (const week of weeks) {
    for (const day of week.contributionDays ?? []) {
      if (!day?.date) continue
      contributions.push({
        date: day.date,
        count: day.contributionCount || 0,
        level: levelIndex(day.contributionLevel),
      })
    }
  }
  // columns are weeks, so the first day has to be a sunday
  const startIdx = contributions.findIndex(
    (d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 0
  )
  const aligned = startIdx > 0 ? contributions.slice(startIdx) : contributions

  const repoContribs: RepoContribution[] = repos.map((repo) => ({
    name: repo.name,
    count: repo.count,
    href: repo.href,
    // eslint-disable-next-line @next/next/no-img-element
    logo: repo.ownerAvatar ? (
      <img src={repo.ownerAvatar} alt="" />
    ) : undefined,
  }))

  const totals = calendarData?.totals
  const stats: ContributionStats | undefined = totals
    ? {
        commits: totals.commits,
        issues: totals.issues,
        pullRequests: totals.pullRequests,
        reviews: totals.reviews,
      }
    : undefined

  void error

  return (
    <div ref={boxRef} className="h-full w-full">
      {!calendarData ? (
        <div
          className="flex h-full w-full animate-pulse flex-col gap-3 rounded-[28px] border border-neutral-200/70 bg-white/70 p-4"
          style={
            sk
              ? { borderColor: sk.border, backgroundColor: sk.card }
              : undefined
          }
        >
          <div className="flex items-center justify-between">
            <div
              className="h-4 w-40 rounded-md bg-neutral-200/70"
              style={sk ? { backgroundColor: sk.bar } : undefined}
            />
            <div
              className="h-5 w-24 rounded-full bg-neutral-100"
              style={sk ? { backgroundColor: sk.barSoft } : undefined}
            />
          </div>
          <div
            className="h-[86px] w-full rounded-lg bg-neutral-100"
            style={sk ? { backgroundColor: sk.barSoft } : undefined}
          />
          <div
            className="h-9 w-full rounded-lg bg-neutral-100/70"
            style={sk ? { backgroundColor: sk.barSoft } : undefined}
          />
        </div>
      ) : (
        <GitHubActivity
          username={username}
          contributions={aligned}
          repos={repoContribs}
          stats={stats}
          months={12}
          showMonths
          cellSize={cellSize}
        />
      )}
    </div>
  )
}
