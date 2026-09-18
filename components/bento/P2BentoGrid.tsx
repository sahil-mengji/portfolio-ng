"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Text } from "@/components/ui/text"

import { BentoGithubBox } from "./boxes/BentoGithubBox"
import { BentoSocialBox } from "./boxes/BentoSocialBox"
import { BentoResumeBox } from "./boxes/BentoResumeBox"
import { BentoLikeBox } from "./boxes/BentoLikeBox"
import { BentoShowcaseBox } from "./boxes/BentoShowcaseBox"
import { BentoNftBox } from "./boxes/BentoNftBox"
import { BentoProjectsBox } from "./boxes/BentoProjectsBox"
import { BentoExtraBox } from "./boxes/BentoExtraBox"
import { BentoNotchedBox } from "./boxes/BentoNotchedBox"
import { BentoColorPickerBox } from "./boxes/BentoColorPickerBox"
import { BentoMapBox } from "./boxes/BentoMapBox"
import { BentoGalleryBox } from "./boxes/BentoGalleryBox"
import { BentoListBox } from "./boxes/BentoListBox"
import { BentoBannerBox } from "./boxes/BentoBannerBox"

/**
 * P2BentoGrid — dummy bento grid mirroring p2/src/pages/Home/Home.jsx
 *
 * Grid semantics (improved naming):
 * - Container: `bento-grid` (legacy alias: `bentogrid`)
 * - Row 1: notch 3×2 + like 2×2 + projects 2×2 + showcase 3×2 (= 10)
 * - Row 2: github 8×2 + extra 2×2 (= 10)
 * - Row 3: social 7×1 + resume 3×5 (= 10); colorpicker 3×3 + map 4×2 pack below social (= 7)
 * - Below colorpicker: gallery 3×3; below map: list 2×4 + nft 2×2, then banner 5×2
 * - Rest packs via dense flow.
 * - Areas:
 *   github      → BentoGithubBox      (.bento-github)
 *   social      → BentoSocialBox      (.bento-social)
 *   resume      → BentoResumeBox      (.bento-resume)
 *   like        → BentoLikeBox        (.bento-like)        ← was `homebox2`
 *   showcase    → BentoShowcaseBox    (.bento-showcase)    ← ProjectsFolder
 *   nft         → BentoNftBox         (.bento-nft)
 *   projects    → BentoProjectsBox    (.bento-projects)    ← was `hprojects` (commented in p2)
 *   extra       → BentoExtraBox       (.bento-extra)       ← extra for 7xl
 *   notch       → BentoNotchedBox     (.bento-notch)       ← 3×2 top-left notched SVG, allowOverflow
 *   colorpicker → BentoColorPickerBox (.bento-colorpicker) ← 3×3 wheel + semicircular lightness arc
 *   map         → BentoMapBox         (.bento-map)         ← 4×2 dummy location cell
 *   gallery     → BentoGalleryBox     (.bento-gallery)     ← 3×3 dummy photo grid
 *   list        → BentoListBox        (.bento-list)        ← 2×4 dummy tall list
 *   banner      → BentoBannerBox      (.bento-banner)      ← 5×2 dummy wide banner
 *
 * Fundamental cell is a fixed 110px square: auto-fit count as width grows
 * Mobile 2 cols, tablet 4, desktop 6/8/10 – dense flow, each box spans multiples of 110px
 * e.g. github 8×2 (880×220), social 7×1 bar, resume 3×5 tall, etc.
 * Width up to 7xl (80rem) centered, small squares shrink count responsively
 *
 * All boxes use `HomeBox` (components/bento/HomeBox.tsx) as base.
 */

const ITEMS = [
  { key: "notch", Comp: BentoNotchedBox, area: "notch" },
  { key: "like", Comp: BentoLikeBox, area: "like" },
  { key: "projects", Comp: BentoProjectsBox, area: "projects" },
  { key: "showcase", Comp: BentoShowcaseBox, area: "showcase" },
  { key: "github", Comp: BentoGithubBox, area: "github" },
  { key: "extra", Comp: BentoExtraBox, area: "extra" },
  { key: "social", Comp: BentoSocialBox, area: "social" },
  { key: "resume", Comp: BentoResumeBox, area: "resume" },
  { key: "colorpicker", Comp: BentoColorPickerBox, area: "colorpicker" },
  { key: "map", Comp: BentoMapBox, area: "map" },
  { key: "list", Comp: BentoListBox, area: "list" },
  { key: "gallery", Comp: BentoGalleryBox, area: "gallery" },
  { key: "nft", Comp: BentoNftBox, area: "nft" },
  { key: "banner", Comp: BentoBannerBox, area: "banner" },
] as const

export function P2BentoGrid({ bleed = false }: { bleed?: boolean }) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div className="w-full max-w-none min-w-0 space-y-3">
      {/* <div className="flex w-full max-w-none items-center justify-between">
        <Text.Subheading>Bento — from p2/src/pages/Home</Text.Subheading>
        <span className="font-mono text-xs text-muted-foreground">17 boxes (incl. notch 3×2 top-left + theme picker) · HomeBox base · 7xl · bento-grid</span>
      </div> */}

      {/* Preferred class is `bento-grid`; `bentogrid` kept as legacy alias in globals.css
          `bento-grid--bleed` makes it consume viewport width even inside max-w-7xl parent */}
      <div
        ref={ref}
        className={`mt-6 grid w-full min-w-0 ${bleed ? "bento-grid bento-grid--bleed" : "bento-grid"}`}
      >
        {ITEMS.map(({ key, Comp, area }, i) => (
          <motion.div
            key={key}
            className={`bento-${area} h-full w-full min-w-0 ${area === "notch" ? "overflow-visible relative z-10" : ""}`}
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: 0.45, delay: 0.05 * i, ease: "easeOut" }}
          >
            <Comp />
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default P2BentoGrid
