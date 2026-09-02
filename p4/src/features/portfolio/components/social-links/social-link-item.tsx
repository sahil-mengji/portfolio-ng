import { ArrowUpRightIcon } from "lucide-react"
import Image from "next/image"

import { UTM_PARAMS } from "@/config/site"
import type { SocialLink } from "@/features/portfolio/types/social-links"
import { cn } from "@/lib/utils"
import { addQueryParams } from "@/utils/url"

export function SocialLinkItem({ icon, title, href }: SocialLink) {
  return (
    <div
      className={cn(
        "flex flex-1 transition-all duration-500 ease-out hover:flex-[2]",
        "max-md:border-y md:border-x border-line",
        "md:first:border-l-0 md:last:border-r-0 max-md:first:border-t-0 max-md:last:border-b-0",
        "max-md:first:screen-line-top max-md:first:screen-line-bottom",
        "md:first:screen-line-top md:first:screen-line-bottom"
      )}
    >
      <a
        className={cn(
          "flex flex-1 cursor-pointer items-center gap-4 rounded-full border border-line  bg-background p-4 pr-5 transition-colors hover:bg-accent-muted"
        )}
        href={addQueryParams(href, UTM_PARAMS)}
        target="_blank"
        rel="noopener"
      >
        <div className="relative size-8 shrink-0">
          <Image
            className="rounded-lg select-none"
            src={icon}
            alt={title}
            width={32}
            height={32}
            quality={100}
            unoptimized
          />
          <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-black/10 ring-inset dark:ring-white/15" />
        </div>

        <h3 className="flex-1 truncate font-medium">{title}</h3>

        <ArrowUpRightIcon className="size-4 shrink-0 text-muted-foreground" />
      </a>
    </div>
  )
}
