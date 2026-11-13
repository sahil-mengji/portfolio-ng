import { NextResponse } from 'next/server';

const CACHE_TTL = 3600;

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const username = searchParams.get('username');
        if (!username) {
            return NextResponse.json({ error: 'username is required' }, { status: 400 });
        }
        const token = process.env.GITHUB_TOKEN;
        if (!token) {
            return NextResponse.json({ error: 'GitHub token not configured' }, { status: 500 });
        }
        const response = await fetch('https://api.github.com/graphql', {
            method: 'POST',
            headers: {
                'Authorization': `bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: `query {
                    user(login: "${username}") {
                        contributionsCollection {
                            contributionCalendar {
                                totalContributions
                                weeks {
                                    contributionDays {
                                        contributionCount
                                        contributionLevel
                                        date
                                    }
                                }
                            }
                            totalCommitContributions
                            totalIssueContributions
                            totalPullRequestContributions
                            totalPullRequestReviewContributions
                        }
                    }
                }`
            }),
            next: {
                revalidate: CACHE_TTL,
                tags: [`github-contributions-${username}`]
            }
        });
        if (!response.ok) {
            return NextResponse.json(
                { error: `GitHub API responded with status: ${response.status}` },
                { status: 502 }
            );
        }
        const data = await response.json();
        if (data?.errors?.length) {
            return NextResponse.json(
                { error: data.errors[0]?.message ?? 'GitHub API error' },
                { status: 502 }
            );
        }
        const collection = data?.data?.user?.contributionsCollection;
        const calendar = collection?.contributionCalendar;
        if (!calendar) {
            throw new Error('Invalid response from GitHub API');
        }
        const totals = {
            commits: collection?.totalCommitContributions ?? 0,
            issues: collection?.totalIssueContributions ?? 0,
            pullRequests: collection?.totalPullRequestContributions ?? 0,
            reviews: collection?.totalPullRequestReviewContributions ?? 0,
        };
        return NextResponse.json({ ...calendar, totals }, {
            headers: {
                'Cache-Control': `public, max-age=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 24}`
            }
        });
    } catch (error) {
        console.error('GitHub contributions API error:', error);
        return NextResponse.json({ error: 'Failed to fetch contributions' }, { status: 500 });
    }
}
