import { unstable_cache } from "next/cache"

import { GITHUB_USERNAME } from "@/config/site"
import type { Activity } from "@/registry/components/contribution-graph"

type GitHubContributionsResponse = {
  contributions: Activity[]
}

export const getGitHubContributions = unstable_cache(
  async () => {
    try {
      const res = await fetch(
        `${process.env.GITHUB_CONTRIBUTIONS_API_URL}/v4/${GITHUB_USERNAME}?y=last`,
        {
          signal: AbortSignal.timeout(5000), // 5s timeout
        }
      )
      
      if (!res.ok) {
        throw new Error(`GitHub API returned ${res.status}`)
      }

      const data = (await res.json()) as GitHubContributionsResponse
      return data.contributions || []
    } catch (error) {
      console.error("Failed to fetch GitHub contributions:", error)
      return [] // Return empty array as fallback
    }
  },
  ["github-contributions"],
  { revalidate: 86400 } // Cache for 1 day
)
