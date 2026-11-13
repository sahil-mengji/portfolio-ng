"use client"
import LikeButton from "@/components/LikeButton"
import { BentoCell } from "./BentoCell"

export function BentoProjectsBox() {
  return (
    <BentoCell
      boxKey="projects"
      area="bento-projects"
      title="Liked the Portfolio ?"
      titleClassName="relative z-10 leading-tight"
    >
      <LikeButton className="absolute -bottom-7 left-1/2 -translate-x-1/2 [&>button]:grid [&>button]:size-[184px] [&>button]:place-items-center" />
    </BentoCell>
  )
}
export default BentoProjectsBox
