"use client";

import { useEffect, useState } from "react";
import { GitHubActivity, Contribution, RepoContribution, ContributionLevel } from "./github-activity";

interface GitHubCalendarResponse {
  totalContributions: number;
  weeks: {
    contributionDays: {
      contributionCount: number;
      contributionLevel: number;
      date: string;
    }[];
  }[];
}

export function GitHubActivityWrapper({ username = "sahil-mengji" }: { username?: string }) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [repos, setRepos] = useState<RepoContribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch contributions
        const contribRes = await fetch(`/api/github-contributions?username=${username}`);
        if (!contribRes.ok) throw new Error("Failed to fetch contributions");
        const contribData: GitHubCalendarResponse = await contribRes.json();

        // Transform contributions
        const transformedContributions: Contribution[] = [];
        for (const week of contribData.weeks) {
          for (const day of week.contributionDays) {
            transformedContributions.push({
              date: day.date,
              count: day.contributionCount,
              level: Math.min(4, Math.max(0, day.contributionLevel)) as ContributionLevel,
            });
          }
        }

        // Find first Sunday to align weeks
        const startIdx = transformedContributions.findIndex(
          (d) => new Date(`${d.date}T00:00:00Z`).getUTCDay() === 0
        );
        const aligned = startIdx >= 0 ? transformedContributions.slice(startIdx) : transformedContributions;

        if (active) setContributions(aligned);

        // Fetch repos from GitHub Events API
        const eventsRes = await fetch(
          `https://api.github.com/users/${username}/events/public?per_page=100`
        );
        if (eventsRes.ok) {
          const events = await eventsRes.json();
          const counts = new Map<string, number>();

          for (const event of events) {
            if (event.type !== "PushEvent" || !event.repo) continue;
            const commits = event.payload?.commits?.length ?? 1;
            counts.set(event.repo.name, (counts.get(event.repo.name) ?? 0) + commits);
          }

          const transformedRepos: RepoContribution[] = [...counts.entries()]
            .sort(([, a], [, b]) => b - a)
            .slice(0, 3)
            .map(([fullName, count]) => {
              const [owner, name] = fullName.split("/");
              return {
                name,
                count,
                href: `https://github.com/${fullName}`,
                logo:
                  owner.toLowerCase() === username.toLowerCase() ? undefined : (
                    <img src={`https://github.com/${owner}.png?size=64`} alt="" />
                  ),
              };
            });

          if (active) setRepos(transformedRepos);
        }
      } catch (err) {
        if (active) setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        if (active) setLoading(false);
      }
    }

    fetchData();
    return () => { active = false; };
  }, [username]);

  if (loading) {
    return (
      <div className="rounded-[28px] bg-white p-4 dark:bg-black min-h-[200px] flex items-center justify-center">
        <div className="text-foreground/50">Loading GitHub activity…</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[28px] bg-white p-4 dark:bg-black min-h-[200px] flex items-center justify-center">
        <div className="text-red-500">Failed to load: {error}</div>
      </div>
    );
  }

  return (
    <GitHubActivity
      username={username}
      contributions={contributions}
      repos={repos}
      months={12}
      showMonths={true}
      cellSize={11}
      accent="#39d353"
    />
  );
}