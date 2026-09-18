"use client"
import { HomeBox } from "@/components/bento/HomeBox"
import GithubCalendar from "./GithubCalendar"

export function BentoGithubBox() {
  return (
    <HomeBox boxKey="github" surfaceOverride="#FFFFFF" outerClassName="bento-github h-full w-full " className="flex flex-col items-stretch justify-end px-3 pt-2 pb-1.5">
      <GithubCalendar username="sahil-mengji" />
    </HomeBox>
  )
}
export default BentoGithubBox
