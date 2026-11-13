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
  brandBg: string
  brandIcon: string
}[] = [
  {
    href: "https://www.linkedin.com/in/sahil-mengji",
    label: "Linked In",
    lucide: RiLinkedinFill,
    remix: RiLinkedinFill,
    brandBg: "#0A66C2",
    brandIcon: "#FFFFFF",
  },
  {
    href: "https://www.github.com/sahil-mengji",
    label: "Github",
    lucide: RiGithubFill,
    remix: RiGithubFill,
    brandBg: "#24292F",
    brandIcon: "#FFFFFF",
  },
  {
    href: "https://www.instagram.com/sahil_mengji",
    label: "Instagram",
    lucide: RiInstagramFill,
    remix: RiInstagramFill,
    brandBg:
      "linear-gradient(45deg, #FEDA75, #FA7E1E, #D62976, #962FBF, #4F5BD5)",
    brandIcon: "#FFFFFF",
  },
  {
    href: "https://www.linkedin.com/in/sahil-mengji",
    label: "Dribble",
    lucide: RiDribbbleFill,
    remix: RiDribbbleFill,
    brandBg: "#EA4C89",
    brandIcon: "#FFFFFF",
  },
  {
    href: "#", // TODO: paste Kaggle profile URL
    label: "Kaggle",
    lucide: Trophy,
    remix: RiTrophyFill,
    brandBg: "#20BEFF",
    brandIcon: "#FFFFFF",
  },
  {
    href: "#", // TODO: paste Codeforces profile URL
    label: "Codeforces",
    lucide: Terminal,
    remix: RiTerminalFill,
    brandBg: "linear-gradient(135deg, #3B82C4, #E5484D)",
    brandIcon: "#FFFFFF",
  },
  {
    href: "#", // TODO: paste X/Twitter profile URL
    label: "X",
    lucide: RiTwitterXFill,
    remix: RiTwitterXFill,
    brandBg: "#000000",
    brandIcon: "#FFFFFF",
  },
]

const SocialMediaLink = ({
  href,
  icon: Icon,
  label,
  themed,
  brandBg,
  brandIcon,
}: {
  href: string
  icon: IconType
  label: string
  themed: boolean
  brandBg: string
  brandIcon: string
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className={`group/cell relative h-full flex-1 cursor-pointer overflow-hidden rounded-full border text-xl font-medium transition-[flex-grow,gap,max-width,opacity,transform] duration-[400ms] hover:flex-[1.5] ${
      themed ? "border-card-foreground/15 bg-card" : "border-black/10 bg-white"
    }`}
    style={{ "--brand-icon": brandIcon } as React.CSSProperties}
  >
    {/* Brand wash crossfades in slowly — opacity always animates,
        unlike background-color/image swaps which pop on gradients */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-0 shadow-[inset_0_0_0_2px_rgba(255,255,255,0.2)] transition-opacity duration-700 ease-out group-hover/cell:opacity-100"
      style={{ background: brandBg }}
    />
    <div className="relative z-10 flex h-full w-full items-center justify-center gap-0 transition-[gap,opacity] duration-[400ms] group-hover/cell:gap-3">
      <Icon
        size={38}
        className={`shrink-0 opacity-100 group-hover/cell:scale-130 group-hover/cell:text-(--brand-icon) group-hover/cell:opacity-100 ${
          themed ? "" : "text-[#1f2328]"
        } [transition:transform_300ms,color_700ms,opacity_300ms]`}
      />
      {/* <span
        className={`max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-[400ms] group-hover/cell:max-w-[200px] group-hover/cell:opacity-100 ${
          themed
            ? "text-card-foreground/80 group-hover/cell:text-card-foreground"
            : "text-[#1f2328]/50 group-hover/cell:text-[#1f2328]/60"
        }`}
      >
        {label}
      </span> */}
    </div>
  </a>
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
            brandBg={isOverridden ? "var(--accent)" : link.brandBg}
            brandIcon={
              isOverridden ? "var(--accent-foreground)" : link.brandIcon
            }
          />
        ))}
      </div>
    </HomeBox>
  )
}
export default BentoSocialBox
