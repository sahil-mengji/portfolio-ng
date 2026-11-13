"use client"

import { useTransitionRouter } from "next-view-transitions"
import { Caption } from "@/components/ui/text"
import { readBlogReturn, restoreScrollY } from "@/lib/blog-return"

// Back to the card that opened the article: transitions back to the
// remembered list route and restores its scroll position (so the reader
// lands on the card). Falls back to history back, then /blogs.
export function BlogBackButton() {
  const router = useTransitionRouter()
  const goBack = () => {
    const ret = readBlogReturn()
    if (ret) {
      // scroll:false — Next must not yank to top; we place the exact
      // remembered Y ourselves. Early restore positions the new snapshot
      // so nothing jumps mid-animation; the late check only fires if
      // something drifted afterwards (never snaps a correct position).
      router.push(ret.route, {
        scroll: false,
        onTransitionReady: () => restoreScrollY(ret.y),
      })
      window.setTimeout(() => {
        if (Math.abs(window.scrollY - ret.y) > 4) restoreScrollY(ret.y)
      }, 700)
      return
    }
    if (typeof window !== "undefined" && window.history.length > 1) {
      router.back()
    } else {
      router.push("/blogs")
    }
  }
  return (
    <Caption>
      <button
        type="button"
        onClick={goBack}
        className="cursor-pointer transition-opacity hover:opacity-60"
      >
        ← Back
      </button>
    </Caption>
  )
}
