import { getLenis } from "@/lib/lenis"

// Remembers which list route + scroll position a blog card was opened
// from, so the article back button can transition back to the card and
// land exactly where the reader left off.
const KEY = "blog-return"

export function rememberBlogReturn() {
  try {
    sessionStorage.setItem(KEY, `${window.location.pathname}|${window.scrollY}`)
  } catch {
    /* storage unavailable — back falls back to history */
  }
}

export function readBlogReturn(): { route: string; y: number } | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const sep = raw.lastIndexOf("|")
    const route = raw.slice(0, sep)
    if (!route.startsWith("/")) return null
    return { route, y: Number(raw.slice(sep + 1)) || 0 }
  } catch {
    return null
  }
}

// Jump (no tween) to an absolute Y through Lenis when present.
export function restoreScrollY(y: number) {
  requestAnimationFrame(() => {
    const l = getLenis()
    if (l) l.scrollTo(y, { immediate: true })
    else window.scrollTo(0, y)
  })
}
