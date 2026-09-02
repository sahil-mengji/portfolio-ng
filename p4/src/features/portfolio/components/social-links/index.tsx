import { SOCIAL_LINKS } from "../../data/social-links"
import { Panel } from "../panel"
import { SocialLinkItem } from "./social-link-item"

export function SocialLinks() {
  return (
    <Panel className="">
      <h2 className="sr-only">Social Links</h2>

      <div className="flex flex-col md:flex-row gap-2">
        {SOCIAL_LINKS.map((link, index) => {
          return (
            <SocialLinkItem
              key={index}
              {...link}
            />
          )
        })}
      </div>
    </Panel>
  )
}
