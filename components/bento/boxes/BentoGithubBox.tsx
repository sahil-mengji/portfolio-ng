"use client"
import { HomeBox } from "@/components/bento/HomeBox"
import GitHubCalendar from "./GitHubCalendar"

export function BentoGithubBox() {
  return (
    <HomeBox boxKey="github" surfaceOverride="#FFFFFF" outerClassName="bento-github h-full w-full " className="flex flex-col items-stretch justify-end p-0">
      <GitHubCalendar username="sahil-mengji" />
    </HomeBox>
  )
}
export default BentoGithubBox
