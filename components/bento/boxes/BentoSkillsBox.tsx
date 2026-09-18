"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoSkillsBox() {
  return (
    <HomeBox boxKey="skills" outerClassName="bento-skills h-full w-full" className="flex flex-col justify-between p-6">
      <h3 className="text-2xl font-serif">Web Development<br />UI/UX — App</h3>
      <div>
        <p className="text-sm text-violet-500">View Skills & technologies →</p>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {["React", "Next.js", "TypeScript", "Tailwind", "Figma", "Node"].map((t) => (
            <span key={t} className="rounded-full border px-2 py-1 text-xs">
              {t}
            </span>
          ))}
        </div>
      </div>
    </HomeBox>
  )
}
export default BentoSkillsBox
