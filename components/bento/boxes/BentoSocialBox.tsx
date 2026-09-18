"use client"
import { Trophy, Terminal } from "lucide-react"
import {
  RiLinkedinFill,
  RiGithubFill,
  RiInstagramFill,
  RiDribbbleFill,
  RiTrophyFill,
  RiTerminalFill,
  RiTwitterXFill,
} from "@remixicon/react"
import { HomeBox } from "@/components/bento/HomeBox"
import { useThemeColorContext } from "@/components/theme-provider"

type IconType = React.ComponentType<any>

const socialLinks: {
  href: string
  label: string
  lucide: IconType
  remix: IconType
}[] = [
  {
    href: "https://www.linkedin.com/in/sahil-mengji",
    label: "Linked In",
    lucide: RiLinkedinFill,
    remix: RiLinkedinFill,
  },
  {
    href: "https://www.github.com/sahil-mengji",
    label: "Github",
    lucide: RiGithubFill,
    remix: RiGithubFill,
  },
  {
    href: "https://www.instagram.com/sahil_mengji",
    label: "Instagram",
    lucide: RiInstagramFill,
    remix: RiInstagramFill,
  },
  {
    href: "https://www.linkedin.com/in/sahil-mengji",
    label: "Dribble",
    lucide: RiDribbbleFill,
    remix: RiDribbbleFill,
  },
  {
    href: "#", // TODO: paste Kaggle profile URL
    label: "Kaggle",
    lucide: Trophy,
    remix: RiTrophyFill,
  },
  {
    href: "#", // TODO: paste Codeforces profile URL
    label: "Codeforces",
    lucide: Terminal,
    remix: RiTerminalFill,
  },
  {
    href: "#", // TODO: paste X/Twitter profile URL
    label: "X",
    lucide: RiTwitterXFill,
    remix: RiTwitterXFill,
  },
]

const SocialMediaLink = ({
  href,
  icon: Icon,
  label,
  themed,
}: {
  href: string
  icon: IconType
  label: string
  themed: boolean
}) => (
  <div
    className={`group/cell h-full flex-1 cursor-pointer overflow-hidden rounded-full border text-xl font-medium transition-[flex-grow,gap,max-width,opacity,transform] duration-[400ms] hover:flex-2 ${
      themed ? "border-card-foreground/15 bg-card" : "border-black/10 bg-white"
    }`}
    onClick={() => window.open(href, "_blank")}
  >
    <div className="flex h-full w-full items-center justify-center gap-0 transition-[gap,opacity] duration-[400ms] group-hover/cell:gap-3">
      <Icon
        size={24}
        className={`shrink-0 transition-transform duration-300 group-hover/cell:scale-110 ${
          themed ? "" : "text-[#1f2328]"
        }`}
      />
      <span
        className={`max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-[400ms] group-hover/cell:max-w-[200px] group-hover/cell:opacity-100 ${
          themed
            ? "text-card-foreground/80 group-hover/cell:text-card-foreground"
            : "text-[#1f2328]/50 group-hover/cell:text-[#1f2328]/60"
        }`}
      >
        {label}
      </span>
    </div>
  </div>
)

export function BentoSocialBox() {
  const { isOverridden } = useThemeColorContext()
  return (
    <HomeBox
      boxKey="social"
      transparent
      outerClassName="bento-social h-full w-full"
      className="h-full w-full p-0"
    >
      <div className="grid h-full w-full grid-cols-2 grid-rows-2 items-center gap-4 text-card-foreground md:flex md:flex-wrap">
        {socialLinks.map((link, index) => (
          <SocialMediaLink
            key={index}
            href={link.href}
            icon={isOverridden ? link.remix : link.lucide}
            label={link.label}
            themed={isOverridden}
          />
        ))}
      </div>
    </HomeBox>
  )
}
export default BentoSocialBox
