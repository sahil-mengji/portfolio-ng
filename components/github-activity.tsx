"use client"

import * as React from "react"
import { createPortal } from "react-dom"
import {
  AnimatePresence,
  motion,
  useReducedMotion,
  type Transition,
} from "motion/react"
import { cn } from "@/lib/utils"
import { RiGithubFill } from "@remixicon/react"
import { ensureContrast, hexToOklch, oklchToHex } from "@/lib/color-utils"
import { useThemeColorContext } from "@/components/theme-provider"

export type ContributionLevel = 0 | 1 | 2 | 3 | 4

// Null = default hardcoded look (byte-identical). Non-null only while the
// site picker overrides the palette — every element repaints through these
// tokens, zero layout or structural change.
type GithubTheme = {
  scale: string[]
  track: string
  statBg: string
  statText: string
  statValue: string
  tooltipBg: string
  tooltipFg: string
  monthText: string
  avatarBg: string
  avatarFg: string
  avatarRing: string
  rowHoverVar: string
  repoName: string
  repoCount: string
  chevron: string
  cardBg: string
  panelBorder: string
  panelBg: string
  toggleBg: string
  emptyText: string
}

function useGithubColors(): GithubTheme | null {
  const { palette, isOverridden } = useThemeColorContext()
  return React.useMemo(() => {
    if (!isOverridden) return null
    const surface = palette.surface
    const text = palette.cardText
    const muted = palette.cardSecondaryText
    const accent = ensureContrast(palette.brand, surface, 4.5)
    const from = hexToOklch(surface),
      to = hexToOklch(accent)
    const level = (amount: number) =>
      oklchToHex(
        from.l + (to.l - from.l) * amount,
        from.c + (to.c - from.c) * amount,
        to.h
      )
    return {
      scale: [
        "transparent",
        ensureContrast(level(0.55), surface, 3),
        level(0.7),
        level(0.85),
        accent,
      ],
      track: level(0.18),
      statBg: surface,
      statText: muted,
      statValue: text,
      tooltipBg: text,
      tooltipFg: surface,
      monthText: muted,
      avatarBg: surface,
      avatarFg: text,
      avatarRing: palette.cardBorder,
      rowHoverVar: surface,
      repoName: text,
      repoCount: muted,
      chevron: text,
      cardBg: surface,
      panelBorder: palette.cardBorder,
      panelBg: surface,
      toggleBg: surface,
      emptyText: muted,
    }
  }, [palette, isOverridden])
}

export type Contribution = {
  date: string
  count: number
  level: ContributionLevel
}

export type RepoContribution = {
  name: string
  count: number
  logo?: React.ReactNode
  href?: string
}

export type ContributionStats = {
  commits?: number
  issues?: number
  pullRequests?: number
  reviews?: number
}

const DEFAULT_ACCENT = [
  "transparent",
  "#9be9a8",
  "#40c463",
  "#30a14e",
  "#216e39",
]
const DEFAULT_CELL_SIZE = 11
const DEFAULT_LABEL = "Top contributions in:"
const DEFAULT_MONTHS = 12
const WEEKS_PER_MONTH = 365.25 / 12 / 7
const STACK_LIMIT = 3
const MIN_CARD_WIDTH = 320
const CARD_PADDING = 32

export const gapFor = (cellSize: number) =>
  Math.max(2, Math.round(cellSize / 4))
const monthGapFor = (cellSize: number) => gapFor(cellSize) * 3
const weeksFor = (months: number) =>
  Math.max(1, Math.ceil(months * WEEKS_PER_MONTH))

const useIsoLayoutEffect =
  typeof window !== "undefined" ? React.useLayoutEffect : React.useEffect

const EASE_OUT = [0.22, 1, 0.36, 1] as const
const SPRING = { type: "spring", bounce: 0.2, duration: 0.62 } as const
const HEADER_SPRING = { ...SPRING, bounce: 0.45 } as const
const ROW_SPRING = { ...SPRING, bounce: 0.26, delay: 0.08 } as const
const ROW_OFFSET = 16
const CELL_FADE = { duration: 0.2, ease: EASE_OUT } as const
const TOOLTIP_FADE = { duration: 0.14, ease: EASE_OUT } as const
const TOOLTIP_EDGE = 8
const COLUMN_STAGGER = 0.012
const LABEL_BLUR = 6
const LABEL_REVEAL = { duration: 0.45, ease: EASE_OUT } as const

const LEVELS = [0, 1, 2, 3, 4] as const

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
]

type MonthBlock = {
  key: string
  label: string
  columns: (Contribution | null)[][]
}

// months are cut at the exact flipping cell: each block holds precisely
// its own calendar days, re-weeked Sunday-first with leading/trailing
// blanks, so every month keeps its true shape
function toMonthBlocks(
  contributions: Contribution[],
  months: number
): MonthBlock[] {
  const byMonth = new Map<string, Contribution[]>()
  for (const day of contributions) {
    const key = day.date.slice(0, 7)
    const list = byMonth.get(key)
    if (list) list.push(day)
    else byMonth.set(key, [day])
  }
  return [...byMonth.entries()]
    .slice(-Math.max(1, months))
    .map(([key, days]) => {
      const month = Number(key.slice(5, 7))
      const cells: (Contribution | null)[] = [
        ...Array<null>(new Date(`${days[0].date}T00:00:00Z`).getUTCDay()).fill(
          null
        ),
        ...days,
      ]
      while (cells.length % 7 !== 0) cells.push(null)
      const columns: (Contribution | null)[][] = []
      for (let i = 0; i < cells.length; i += 7) {
        columns.push(cells.slice(i, i + 7))
      }
      return { key, label: MONTH_NAMES[month - 1] ?? "", columns }
    })
}

const LEVEL_OPACITY: Record<ContributionLevel, number> = {
  0: 0,
  1: 0.3,
  2: 0.52,
  3: 0.76,
  4: 1,
}

type LevelStyle = { backgroundColor: string; opacity: number }

type HoveredDay = { day: Contribution; x: number; y: number }

const DATE_FORMAT = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

function describeDay({ count, date }: Contribution) {
  const noun = count === 1 ? "contribution" : "contributions"
  return `${count} ${noun} on ${DATE_FORMAT.format(new Date(`${date}T00:00:00`))}`
}

function getStreaks(days: Contribution[]) {
  let longest = 0
  let run = 0
  for (const day of days) {
    run = day.count > 0 ? run + 1 : 0
    if (run > longest) longest = run
  }
  // a quiet today doesn't break the streak — count back from yesterday
  let current = 0
  let end = days.length - 1
  if (end >= 0 && days[end].count === 0) end -= 1
  for (let i = end; i >= 0 && days[i].count > 0; i--) current += 1
  return { current, longest }
}

const Stat = ({ value, label }: { value: React.ReactNode; label: string }) => {
  const t = useGithubColors()
  return (
    <span
      className="inline-flex shrink-0 items-baseline gap-1 rounded-full bg-neutral-900/[0.05] px-2 py-0.5 text-[11px] whitespace-nowrap text-neutral-500"
      style={t ? { backgroundColor: t.statBg, color: t.statText } : undefined}
    >
      <span
        className="font-semibold text-neutral-900 tabular-nums"
        style={t ? { color: t.statValue } : undefined}
      >
        {value}
      </span>
      {label}
    </span>
  )
}

const StatsStrip = ({
  streak,
  average,
  stats,
}: {
  streak: { current: number; longest: number }
  average: string
  stats?: ContributionStats
}) => (
  <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1.5 overflow-hidden [mask-image:linear-gradient(to_right,black_75%,transparent)]">
    <Stat
      value={streak.current}
      label={streak.current === 1 ? "day streak" : "days streak"}
    />
    <Stat value={streak.longest} label="best" />
    <Stat value={average} label="/day" />
    {stats?.pullRequests !== undefined && (
      <Stat value={stats.pullRequests} label="PRs" />
    )}
    {stats?.reviews !== undefined && (
      <Stat value={stats.reviews} label="reviews" />
    )}
    {stats?.issues !== undefined && (
      <Stat value={stats.issues} label="issues" />
    )}
  </div>
)

function toScale(accent: string | string[]): LevelStyle[] {
  if (typeof accent === "string") {
    return LEVELS.map((level) => ({
      backgroundColor: accent,
      opacity: LEVEL_OPACITY[level],
    }))
  }

  const colors = accent.length > 4 ? accent : ["transparent", ...accent]
  return LEVELS.map((level) => {
    const color = colors[level] ?? colors.at(-1) ?? "transparent"
    return { backgroundColor: color, opacity: color === "transparent" ? 0 : 1 }
  })
}

const Tooltip = ({
  hovered,
  reduceMotion,
}: {
  hovered: HoveredDay
  reduceMotion: boolean | null
}) => {
  const ref = React.useRef<HTMLDivElement>(null)
  const [left, setLeft] = React.useState(hovered.x)
  const t = useGithubColors()

  useIsoLayoutEffect(() => {
    const half = (ref.current?.offsetWidth ?? 0) / 2
    const edge = TOOLTIP_EDGE + half
    setLeft(Math.min(Math.max(hovered.x, edge), window.innerWidth - edge))
  }, [hovered])

  return createPortal(
    <div
      className="pointer-events-none fixed z-50"
      style={{
        left,
        top: hovered.y,
        transform: "translate(-50%, calc(-100% - 8px))",
      }}
    >
      <motion.div
        ref={ref}
        className="rounded-lg bg-neutral-900 px-2 py-1 text-[11px] font-medium whitespace-nowrap text-white shadow-md"
        style={
          t ? { backgroundColor: t.tooltipBg, color: t.tooltipFg } : undefined
        }
        initial={reduceMotion ? false : { opacity: 0, scale: 0.94 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.94 }}
        transition={reduceMotion ? { duration: 0 } : TOOLTIP_FADE}
      >
        {describeDay(hovered.day)}
      </motion.div>
    </div>,
    document.body
  )
}

const ContributionGrid = ({
  contributions,
  scale,
  cellSize,
  months,
  showMonths,
  label,
  reduceMotion,
}: {
  contributions: Contribution[]
  scale: LevelStyle[]
  cellSize: number
  months: number
  showMonths: boolean
  label: string
  reduceMotion: boolean | null
}) => {
  const gap = gapFor(cellSize)
  const monthGap = monthGapFor(cellSize)
  const [hovered, setHovered] = React.useState<HoveredDay>()
  const t = useGithubColors()

  const blocks = React.useMemo(
    () => toMonthBlocks(contributions, months),
    [contributions, months]
  )

  // All month blocks always render — the grid scrolls horizontally
  // instead of trimming months to fit the measured width.
  const visible = blocks

  const totalColumns = visible.reduce((n, b) => n + b.columns.length, 0)
  const sweepEnd =
    Math.max(0, totalColumns - 1) * COLUMN_STAGGER + CELL_FADE.duration

  const hover = (day: Contribution) => (event: React.PointerEvent) => {
    const cell = event.currentTarget.getBoundingClientRect()
    setHovered({ day, x: cell.left + cell.width / 2, y: cell.top })
  }

  return (
    <div
      data-slot="github-activity-grid"
      role="img"
      aria-label={label}
      className="relative"
    >
      {/* months + cells share one x-scroll container — width overflows
          here, never by trimming months or resizing cells. Scrollbar
          hidden: overflow is discoverable via drag/trackpad scroll */}
      <div className="[scrollbar-width:none] overflow-x-auto rounded-2xl [&::-webkit-scrollbar]:hidden">
        <div className="w-fit min-w-full rounded-2xl">
          {showMonths && (
            <motion.div
              className="mt-3 flex justify-center"
              style={{ gap: monthGap, marginBottom: gap }}
              initial={
                reduceMotion
                  ? false
                  : { opacity: 0, filter: `blur(${LABEL_BLUR}px)` }
              }
              animate={{ opacity: 1, filter: "blur(0px)" }}
              transition={{
                ...LABEL_REVEAL,
                delay: reduceMotion ? 0 : sweepEnd,
              }}
            >
              {visible.map((block) => (
                <div key={block.key} className="flex" style={{ gap }}>
                  {block.columns.map((_, ci) => (
                    <div
                      key={ci}
                      className="relative h-3 shrink-0"
                      style={{ width: cellSize }}
                    >
                      {ci === 0 && (
                        <span
                          className="absolute top-0 left-0 text-[10px] leading-none whitespace-nowrap text-neutral-500"
                          style={t ? { color: t.monthText } : undefined}
                        >
                          {block.label}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </motion.div>
          )}

          <div
            className="flex justify-center overflow-hidden pb-5"
            style={{ gap: monthGap }}
            onPointerLeave={() => setHovered(undefined)}
          >
            {(() => {
              let gi = 0
              return visible.map((block) => (
                <div key={block.key} className="flex" style={{ gap }}>
                  {block.columns.map((column, ci) => {
                    const index = gi++
                    return (
                      <div key={ci} className="flex flex-col" style={{ gap }}>
                        {column.map((day, di) =>
                          day ? (
                            <motion.div
                              key={day.date}
                              onPointerEnter={hover(day)}
                              className="shrink-0 rounded-[3px] bg-neutral-900/[0.08]"
                              style={{
                                width: cellSize,
                                height: cellSize,
                                ...(t ? { backgroundColor: t.track } : null),
                              }}
                              initial={
                                reduceMotion
                                  ? false
                                  : { opacity: 0, scale: 0.4 }
                              }
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{
                                ...CELL_FADE,
                                delay: reduceMotion
                                  ? 0
                                  : index * COLUMN_STAGGER,
                              }}
                            >
                              <div
                                className="h-full w-full rounded-[3px]"
                                style={scale[day.level] ?? scale[0]}
                              />
                            </motion.div>
                          ) : (
                            <div
                              key={`blank-${di}`}
                              aria-hidden
                              style={{ width: cellSize, height: cellSize }}
                            />
                          )
                        )}
                      </div>
                    )
                  })}
                </div>
              ))
            })()}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {hovered && (
          <Tooltip
            key="tooltip"
            hovered={hovered}
            reduceMotion={reduceMotion}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

const Avatar = ({
  repo,
  layoutId,
  transition,
  className,
}: {
  repo: RepoContribution
  layoutId: string
  transition: Transition
  className?: string
}) => {
  const t = useGithubColors()
  return (
    <motion.span
      layoutId={layoutId}
      transition={transition}
      className={cn(
        "grid size-7 shrink-0 place-items-center overflow-hidden rounded-full bg-neutral-200 text-[11px] font-medium text-neutral-500 uppercase ring-2 ring-white",
        "[&_img]:size-full [&_img]:object-cover [&_svg]:size-full",
        className
      )}
      style={
        t
          ? {
              backgroundColor: t.avatarBg,
              color: t.avatarFg,
              boxShadow: `0 0 0 2px ${t.avatarRing}`,
            }
          : undefined
      }
    >
      {repo.logo ?? repo.name.charAt(0)}
    </motion.span>
  )
}

const RepoRow = ({
  repo,
  layoutId,
  transition,
}: {
  repo: RepoContribution
  layoutId: string
  transition: Transition
}) => {
  const t = useGithubColors()
  const className = t
    ? "flex items-center gap-3 rounded-xl mx-2 px-2 py-2 transition-colors hover:bg-(--gh-row-hover)"
    : "flex items-center gap-3 rounded-xl mx-2 px-2 py-2 transition-colors hover:bg-neutral-900/[0.04]"

  const content = (
    <>
      <Avatar repo={repo} layoutId={layoutId} transition={transition} />
      <span
        className="flex-1 truncate text-sm text-neutral-900"
        style={t ? { color: t.repoName } : undefined}
      >
        {repo.name}
      </span>
      <span
        className="text-sm text-neutral-500 tabular-nums"
        style={t ? { color: t.repoCount } : undefined}
      >
        {repo.count}
      </span>
    </>
  )

  return repo.href ? (
    <a
      href={repo.href}
      target="_blank"
      rel="noreferrer"
      className={className}
      style={
        t
          ? ({ "--gh-row-hover": t.rowHoverVar } as React.CSSProperties)
          : undefined
      }
    >
      {content}
    </a>
  ) : (
    <div
      className={className}
      style={
        t
          ? ({ "--gh-row-hover": t.rowHoverVar } as React.CSSProperties)
          : undefined
      }
    >
      {content}
    </div>
  )
}

const Chevron = ({
  open,
  transition,
}: {
  open: boolean
  transition: Transition
}) => {
  const t = useGithubColors()
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      className="size-7 text-[#C4C9CC]"
      style={t ? { color: t.chevron } : undefined}
      initial={false}
      animate={{ rotate: open ? 180 : 0 }}
      transition={transition}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m16 10-4 4-4-4" />
    </motion.svg>
  )
}

export type GitHubActivityProps = React.ComponentProps<"div"> & {
  username: string
  contributions: Contribution[]
  repos: RepoContribution[]
  stats?: ContributionStats
  year?: number
  accent?: string | string[]
  cellSize?: number
  months?: number
  showMonths?: boolean
  label?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const GitHubActivity = ({
  className,
  username,
  contributions,
  repos,
  stats,
  year,
  accent = DEFAULT_ACCENT,
  cellSize = DEFAULT_CELL_SIZE,
  months = DEFAULT_MONTHS,
  showMonths = false,
  label = DEFAULT_LABEL,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  style,
  ...props
}: GitHubActivityProps) => {
  const reduceMotion = useReducedMotion()
  const uid = React.useId()
  const [openState, setOpenState] = React.useState(defaultOpen)

  const open = openProp ?? openState
  const toggle = () => {
    if (openProp === undefined) setOpenState(!open)
    onOpenChange?.(!open)
  }

  const t = useGithubColors()
  const scale = React.useMemo(() => toScale(t?.scale ?? accent), [t, accent])
  const transition = reduceMotion ? { duration: 0 } : SPRING
  const headerTransition = reduceMotion ? { duration: 0 } : HEADER_SPRING
  const rowTransition = reduceMotion ? { duration: 0 } : ROW_SPRING

  const kick = reduceMotion ? {} : { x: ROW_OFFSET, y: ROW_OFFSET }
  const listMotion = {
    initial: { opacity: 0, ...kick },
    animate: { opacity: 1, x: 0, y: 0 },
    exit: { opacity: 0, ...kick },
  }

  const total = React.useMemo(
    () => contributions.reduce((sum, day) => sum + day.count, 0),
    [contributions]
  )

  const streak = React.useMemo(() => getStreaks(contributions), [contributions])
  const average = contributions.length
    ? (total / contributions.length).toFixed(1)
    : "0.0"

  const parsedYear = Number(contributions.at(-1)?.date.slice(0, 4))
  const displayYear = year ?? (Number.isFinite(parsedYear) ? parsedYear : null)
  const heading = `${total} contributions${displayYear ? ` in ${displayYear}` : ""}`

  const gap = gapFor(cellSize)
  const monthGap = monthGapFor(cellSize)
  const columns = Math.min(
    Math.ceil(contributions.length / 7),
    weeksFor(months)
  )
  const width = Math.max(
    MIN_CARD_WIDTH,
    columns * (cellSize + gap) - gap + months * (monthGap - gap) + CARD_PADDING
  )

  return (
    <div
      data-slot="github-activity"
      className={cn(
        "relative h-full min-w-full overflow-hidden rounded-[28px] bg-white p-4 [color-scheme:light]",
        "pb-[48px]",
        className
      )}
      // Never wider than the bento cell — excess grid width scrolls
      // inside (see the x-scroll container above), the card never clips.
      style={{
        width,
        maxWidth: "100%",
        ...(t ? { backgroundColor: t.cardBg } : null),
        ...style,
      }}
      {...props}
    >
      <ContributionGrid
        contributions={contributions}
        scale={scale}
        cellSize={cellSize}
        months={months}
        showMonths={showMonths}
        label={heading}
        reduceMotion={reduceMotion}
      />

      {
        <motion.div
          layout
          id={`${uid}-panel`}
          data-slot="github-activity-panel"
          data-state={open ? "open" : "closed"}
          className={cn(
            "absolute inset-x-3 bottom-3 overflow-hidden border border-neutral-200/70 bg-white/90 backdrop-blur-xl",
            open && "top-3"
          )}
          style={{
            borderRadius: 18,
            ...(t
              ? { borderColor: t.panelBorder, backgroundColor: t.panelBg }
              : null),
          }}
          transition={transition}
        >
          <motion.div
            layout="position"
            transition={headerTransition}
            className="flex items-center justify-between gap-3 px-4 py-2"
          >
            {open ? (
              <span
                className="truncate text-sm text-neutral-900"
                style={t ? { color: t.repoName } : undefined}
              >
                {label}
              </span>
            ) : (
              <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-2 overflow-hidden">
                <p
                  className="flex min-w-0 flex-1 items-center gap-1.5 truncate text-sm text-neutral-900"
                  style={t ? { color: t.repoName } : undefined}
                >
                  <RiGithubFill size={16} className="shrink-0" aria-hidden />
                  <span className="truncate">
                    <span className="font-bold tabular-nums">{total}</span>{" "}
                    contributions{displayYear ? ` in ${displayYear}` : ""}
                  </span>
                </p>
                <StatsStrip streak={streak} average={average} stats={stats} />
              </div>
            )}

            <div className="flex items-center gap-3">
              {!open && (
                <div className="flex items-center">
                  {repos.slice(0, STACK_LIMIT).map((repo, index) => (
                    <Avatar
                      key={index}
                      repo={repo}
                      layoutId={`${uid}-${index}`}
                      transition={transition}
                      className="-ml-2 first:ml-0"
                    />
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={toggle}
                aria-expanded={open}
                aria-controls={`${uid}-panel`}
                aria-label={
                  open ? "Hide top repositories" : "Show top repositories"
                }
                className="grid size-7 shrink-0 place-items-center rounded-full bg-neutral-100"
                style={t ? { backgroundColor: t.toggleBg } : undefined}
              >
                <Chevron open={open} transition={transition} />
              </button>
            </div>
          </motion.div>

          <AnimatePresence initial={false} mode="popLayout">
            {open && (
              <motion.ul
                key="list"
                layout="position"
                {...listMotion}
                transition={rowTransition}
                className="px-0.5 pb-1"
              >
                {repos.length === 0 && (
                  <li
                    className="px-4 py-3 text-sm text-neutral-500"
                    style={t ? { color: t.emptyText } : undefined}
                  >
                    No recent repositories
                  </li>
                )}
                {repos.map((repo, index) => (
                  <li key={index}>
                    <RepoRow
                      repo={repo}
                      layoutId={`${uid}-${index}`}
                      transition={transition}
                    />
                  </li>
                ))}
              </motion.ul>
            )}
          </AnimatePresence>
        </motion.div>
      }
    </div>
  )
}

export { GitHubActivity }
export default GitHubActivity
