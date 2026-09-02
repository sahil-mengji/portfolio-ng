"use client"

import { format } from "date-fns"
import { LoaderIcon } from "lucide-react"
import { use } from "react"

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/base/ui/tooltip"
import { GITHUB_USERNAME, UTM_PARAMS } from "@/config/site"
import type { Activity } from "@/registry/components/contribution-graph"
import {
  ContributionGraph,
  ContributionGraphBlock,
  ContributionGraphCalendar,
  ContributionGraphFooter,
  ContributionGraphLegend,
  ContributionGraphTotalCount,
} from "@/registry/components/contribution-graph"
import { addQueryParams } from "@/utils/url"

export function GitHubContributionGraph({
  contributions,
}: {
  contributions: Promise<Activity[]>
}) {
  const data = use(contributions)

  return (
    <div className="relative group min-h-[160px]">
        <div className="opacity-100 group-hover:opacity-0 transition-opacity duration-300">
            <ContributionGraph
            className="mx-auto py-2"
            data={data}
            blockSize={11}
            blockMargin={3}
            blockRadius={2}
            >
            <ContributionGraphCalendar
                className="no-scrollbar px-2"
                title="GitHub Contributions"
            >
                {({ activity, dayIndex, weekIndex }) => (
                <Tooltip>
                    <TooltipTrigger
                    render={
                        <g>
                        <ContributionGraphBlock
                            activity={activity}
                            dayIndex={dayIndex}
                            weekIndex={weekIndex}
                        />
                        </g>
                    }
                    />
                    <TooltipContent className="font-sans">
                    <p>
                        {activity.count} contribution{activity.count > 1 ? "s" : null}{" "}
                        on {format(new Date(activity.date), "dd.MM.yyyy")}
                    </p>
                    </TooltipContent>
                </Tooltip>
                )}
            </ContributionGraphCalendar>

            <ContributionGraphFooter className="px-2">
                <ContributionGraphTotalCount>
                {({ totalCount, year }) => (
                    <div className="text-muted-foreground">
                    {totalCount.toLocaleString("en")} contributions in {year} on{" "}
                    <a
                        className="text-foreground link-underline"
                        href={addQueryParams(
                        `https://github.com/${GITHUB_USERNAME}`,
                        UTM_PARAMS
                        )}
                        target="_blank"
                        rel="noopener"
                    >
                        GitHub
                    </a>
                    .
                    </div>
                )}
                </ContributionGraphTotalCount>

                <ContributionGraphLegend />
            </ContributionGraphFooter>
            </ContributionGraph>
        </div>

        {/* Hover Stats Reveal */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none group-hover:pointer-events-auto">
            <a 
                href={`https://github.com/${GITHUB_USERNAME}`} 
                target="_blank" 
                rel="noopener"
                className="block w-full max-w-md px-4"
            >
                <img
                    className="w-full h-auto drop-shadow-md invert dark:invert-0"
                    src={`https://streak-stats.demolab.com/?user=${GITHUB_USERNAME}&theme=highcontrast&border=EB545400&background=EB545400&stroke=2F2F2E&ring=AB73FFAB&fire=AB73FF&currStreakNum=FFFFFF&sideNums=FFFFFF&currStreakLabel=AB73FF&dates=8E8E8E&excludeDaysLabel=8E8E8E8F&sideLabels=EBEBEB`}
                    alt="GitHub Streak Stats"
                />
            </a>
        </div>
    </div>
  )
}

export function GitHubContributionFallback() {
  return (
    <div className="flex w-full items-center justify-center">
      <LoaderIcon className="animate-spin text-muted-foreground" />
    </div>
  )
}
