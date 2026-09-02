import { USER } from "@/features/portfolio/data/user"
import type { NavItem } from "@/types/nav"

export const SITE_INFO = {
  name: USER.displayName,
  url: process.env.APP_URL || "https://chanhdai.com",
  ogImage: USER.ogImage,
  description: USER.bio,
  keywords: USER.keywords,
}

export const META_THEME_COLORS = {
  light: "#ffffff",
  dark: "#09090b",
}

export const MAIN_NAV: NavItem[] = [
  {
    title: "Experiments",
    href: "/experiments",
  },
  {
    title: "Showcase",
    href: "/showcase",
  },
  {
    title: "Blog",
    href: "/blog",
  },
]

export const MOBILE_NAV: NavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  ...MAIN_NAV,
]

export const X_HANDLE = "@sahilmengji"
export const GITHUB_USERNAME = "sahil-mengji"
export const SOURCE_CODE_GITHUB_REPO = "sahil-mengji/portfolio"
export const SOURCE_CODE_GITHUB_URL = "https://github.com/sahil_mengji/portfolio"

export const SPONSORSHIP_URL = "https://github.com/sponsors/sahil-mengji"

export const UTM_PARAMS = {
  utm_source: "sahilmengji.com",
}
