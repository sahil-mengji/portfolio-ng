"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { LaptopMockupCard } from "@/components/laptop-mockup-card"
import { PhoneMockupCard } from "@/components/phone-mockup-card"

const COMMON_WRAPPER_CLASSES =
  "group relative border border-line bg-background hover:border-foreground/50 overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-3xl w-full h-full"

const TAG_LABEL_CLASSES =
  "absolute top-4 right-4 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full font-medium text-muted-foreground text-[10px] z-20 transition-all duration-500 border border-border/50 uppercase tracking-widest group-hover:bg-background group-hover:text-foreground"

const LOGO_CLASSES =
  "absolute top-4 left-4 z-20 transition-all duration-500 group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1"

const OVERLAY_CLASSES =
  "absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-end backdrop-blur-[2px] z-20"

const FALLBACK_LOGO = "https://via.placeholder.com/50x50/ffffff/000000?text=L"

// Gap guides at the home sheet's strong ink weight so the rules read
// clearly across the 24px column/row gaps, like p4's lines. Frames stay
// at the 16% hairline weight.
const GUIDE = "color-mix(in srgb, var(--grid-ink,#767165) 32%, transparent)"

function CardOverlay({ data }: { data: any }) {
  return (
    <div className={OVERLAY_CLASSES}>
      <div className="w-full translate-y-8 transform p-6 transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-y-0">
        <h3 className="mb-1.5 line-clamp-1 translate-y-4 transform font-heading text-lg font-medium text-foreground transition-transform delay-100 duration-700 group-hover:translate-y-0">
          {data.title || "Project"}
        </h3>
        <p className="line-clamp-2 translate-y-4 transform text-sm leading-relaxed text-muted-foreground transition-transform delay-150 duration-700 group-hover:translate-y-0">
          {data.description || "Creative project"}
        </p>
        <div className="mt-4 flex translate-y-4 transform items-center space-x-2 transition-transform delay-200 duration-700 group-hover:translate-y-0">
          <div className="flex size-8 items-center justify-center rounded-full border border-line bg-background/50 transition-colors duration-300 group-hover:bg-foreground group-hover:text-background">
            <ExternalLink className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-medium tracking-wide text-foreground/70">
            View Case Study
          </span>
        </div>
      </div>
    </div>
  )
}

export function ShowcaseCard({
  data,
  onClick,
}: {
  data: any
  onClick?: () => void
}) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const type = data.type || "default"

  let aspectRatio = "aspect-[4/3]"
  let imageContainerClasses = ""
  let innerImageClasses = ""

  if (type === "logo") {
    aspectRatio = "aspect-square"
    imageContainerClasses =
      "flex justify-center items-center p-12 w-full h-full z-10 relative group-hover:scale-[1.08] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses =
      "max-w-full max-h-full object-contain drop-shadow-md transition-opacity duration-1000"
  } else if (type === "desktop" || type === "web") {
    aspectRatio = "aspect-[4/3]"
    // Centered slot for the fixed-width laptop mockup (intrinsic 384px
    // at md) — symmetric crop only on narrower columns.
    imageContainerClasses =
      "absolute inset-x-0 top-10 z-10 flex justify-center group-hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses =
      "h-full w-full object-cover object-top transition-opacity duration-1000"
  } else if (type === "mobile") {
    aspectRatio = "aspect-[4/5]"
    imageContainerClasses =
      "absolute top-8 inset-x-8 z-10 flex justify-center overflow-hidden group-hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses =
      "w-full h-full object-cover object-top transition-opacity duration-1000"
  } else {
    aspectRatio = "aspect-[4/3]"
    imageContainerClasses =
      "flex justify-center items-center p-8 w-full h-full z-10 relative group-hover:scale-[1.08] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses =
      "max-w-full max-h-full object-contain drop-shadow-md transition-opacity duration-1000"
  }

  return (
    <motion.div
      className={cn("relative border border-line", aspectRatio)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Extended lines — strong-ink gap guides bridging the gutters */}
      <div
        className="pointer-events-none absolute top-[-1px] -left-6 z-0 h-px w-[calc(100%+3rem)]"
        style={{ background: GUIDE }}
      />
      <div
        className="pointer-events-none absolute bottom-[-1px] -left-6 z-0 h-px w-[calc(100%+3rem)]"
        style={{ background: GUIDE }}
      />
      <div
        className="pointer-events-none absolute -top-6 left-[-1px] z-0 h-[calc(100%+3rem)] w-px"
        style={{ background: GUIDE }}
      />
      <div
        className="pointer-events-none absolute -top-6 right-[-1px] z-0 h-[calc(100%+3rem)] w-px"
        style={{ background: GUIDE }}
      />

      {/* Small corner decorators */}
      <div
        className="absolute top-[-2.5px] left-[-2.5px] z-10 size-1.5"
        style={{ background: GUIDE }}
      />
      <div
        className="absolute top-[-2.5px] right-[-2.5px] z-10 size-1.5"
        style={{ background: GUIDE }}
      />
      <div
        className="absolute bottom-[-2.5px] left-[-2.5px] z-10 size-1.5"
        style={{ background: GUIDE }}
      />
      <div
        className="absolute right-[-2.5px] bottom-[-2.5px] z-10 size-1.5"
        style={{ background: GUIDE }}
      />

      <div
        className={cn(COMMON_WRAPPER_CLASSES, !imgLoaded && "animate-pulse")}
        onClick={onClick}
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onKeyDown={
          onClick
            ? (e) => {
                if (e.key === "Enter" || e.key === " ") onClick()
              }
            : undefined
        }
      >
        <div className={TAG_LABEL_CLASSES}>
          <span>{type}</span>
        </div>

        {data.logo && (
          <div className={LOGO_CLASSES}>
            <img
              src={data.logo || FALLBACK_LOGO}
              alt="Logo"
              decoding="async"
              className="h-7 w-7 object-contain opacity-40 grayscale filter transition-all duration-500 group-hover:opacity-100 group-hover:grayscale-0"
            />
          </div>
        )}

        <div className={imageContainerClasses}>
          {type === "desktop" || type === "web" ? (
            <LaptopMockupCard className="shrink-0">
              <img
                src={data.img}
                alt={data.title}
                decoding="async"
                className={cn(
                  innerImageClasses,
                  imgLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImgLoaded(true)}
                loading="lazy"
              />
            </LaptopMockupCard>
          ) : type === "mobile" ? (
            <PhoneMockupCard className="shrink-0 shadow-2xl">
              <img
                src={data.img}
                alt={data.title}
                decoding="async"
                className={cn(
                  innerImageClasses,
                  imgLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImgLoaded(true)}
                loading="lazy"
              />
            </PhoneMockupCard>
          ) : (
            <img
              src={data.img}
              alt={data.title}
              decoding="async"
              className={cn(
                "transition-opacity duration-1000",
                innerImageClasses,
                imgLoaded ? "opacity-100" : "opacity-0"
              )}
              onLoad={() => setImgLoaded(true)}
              loading="lazy"
            />
          )}
        </div>

        <CardOverlay data={data} />
      </div>
    </motion.div>
  )
}
