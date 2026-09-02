"use client"

import React, { useState } from "react"
import { motion } from "motion/react"
import { ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"

const COMMON_WRAPPER_CLASSES =
  "group relative border border-line bg-background hover:border-foreground/50 overflow-hidden cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] rounded-3xl w-full h-full"

const TAG_LABEL_CLASSES =
  "absolute top-4 right-4 bg-background/50 backdrop-blur-sm px-3 py-1 rounded-full font-medium text-muted-foreground text-[10px] z-20 transition-all duration-500 border border-border/50 uppercase tracking-widest group-hover:bg-background group-hover:text-foreground"

const LOGO_CLASSES =
  "absolute top-4 left-4 z-20 transition-all duration-500 group-hover:scale-110 group-hover:translate-x-1 group-hover:translate-y-1"

const OVERLAY_CLASSES =
  "absolute inset-0 bg-gradient-to-t from-background/95 via-background/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] flex items-end backdrop-blur-[2px] z-20"

const FALLBACK_LOGO = "https://via.placeholder.com/50x50/ffffff/000000?text=L"

function CardBackdrop({ img, isLoaded }: { img: string; isLoaded: boolean }) {
  return (
    <div className="absolute inset-0 z-0">
      <img
        src={img}
        alt=""
        className={cn(
          "blur-2xl w-full h-full object-cover scale-110 saturate-0 transition-opacity duration-1000",
          isLoaded ? "opacity-[0.05]" : "opacity-0"
        )}
      />
    </div>
  )
}

function CardOverlay({ data }: { data: any }) {
  return (
    <div className={OVERLAY_CLASSES}>
      <div className="p-6 transition-transform translate-y-8 group-hover:translate-y-0 duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] transform w-full">
        <h3 className="mb-1.5 font-heading font-medium text-lg text-foreground transition-transform translate-y-4 group-hover:translate-y-0 duration-700 delay-100 transform line-clamp-1">
          {data.title || "Project"}
        </h3>
        <p className="text-muted-foreground text-sm transition-transform translate-y-4 group-hover:translate-y-0 duration-700 delay-150 transform line-clamp-2 leading-relaxed">
          {data.description || "Creative project"}
        </p>
        <div className="flex items-center space-x-2 mt-4 transition-transform translate-y-4 group-hover:translate-y-0 duration-700 delay-200 transform">
          <div className="size-8 rounded-full border border-line flex items-center justify-center bg-background/50 group-hover:bg-foreground group-hover:text-background transition-colors duration-300">
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
          <span className="text-foreground/70 text-xs font-medium tracking-wide">View Case Study</span>
        </div>
      </div>
    </div>
  )
}

export function ShowcaseCard({ data, onClick }: { data: any; onClick?: () => void }) {
  const [imgLoaded, setImgLoaded] = useState(false)
  const type = data.type || "default"
  
  let aspectRatio = "aspect-[4/3]"
  let imageContainerClasses = ""
  let innerImageClasses = ""

  if (type === "logo") {
    aspectRatio = "aspect-square"
    imageContainerClasses = "flex justify-center items-center p-12 w-full h-full z-10 relative group-hover:scale-[1.08] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses = "max-w-full max-h-full object-contain drop-shadow-md transition-opacity duration-1000"
  } else if (type === "desktop" || type === "web") {
    aspectRatio = "aspect-[4/3]"
    imageContainerClasses = "absolute top-10 left-10 z-10 w-full group-hover:-translate-y-2 group-hover:-translate-x-1 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses = "w-full h-full object-cover object-left transition-opacity duration-1000"
  } else if (type === "mobile") {
    aspectRatio = "aspect-[4/5]"
    imageContainerClasses = "absolute top-8 inset-x-8 z-10 flex justify-center overflow-hidden group-hover:-translate-y-2 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses = "w-full h-full object-cover object-top transition-opacity duration-1000"
  } else {
    aspectRatio = "aspect-[4/3]"
    imageContainerClasses = "flex justify-center items-center p-8 w-full h-full z-10 relative group-hover:scale-[1.08] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
    innerImageClasses = "max-w-full max-h-full object-contain drop-shadow-md transition-opacity duration-1000"
  }

  return (
    <motion.div 
      className={cn("relative border border-line", aspectRatio)}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.97, rotate: -0.5 }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
    >
      {/* Extended lines */}
      <div className="absolute top-[-1px] -left-6 w-[calc(100%+3rem)] h-px bg-line z-0 pointer-events-none opacity-50" />
      <div className="absolute bottom-[-1px] -left-6 w-[calc(100%+3rem)] h-px bg-line z-0 pointer-events-none opacity-50" />
      <div className="absolute left-[-1px] -top-6 h-[calc(100%+3rem)] w-px bg-line z-0 pointer-events-none opacity-50" />
      <div className="absolute right-[-1px] -top-6 h-[calc(100%+3rem)] w-px bg-line z-0 pointer-events-none opacity-50" />

      {/* Small corner decorators */}
      <div className="absolute top-[-2.5px] left-[-2.5px] size-1.5 bg-line z-10" />
      <div className="absolute top-[-2.5px] right-[-2.5px] size-1.5 bg-line z-10" />
      <div className="absolute bottom-[-2.5px] left-[-2.5px] size-1.5 bg-line z-10" />
      <div className="absolute bottom-[-2.5px] right-[-2.5px] size-1.5 bg-line z-10" />

      <div 
        className={cn(COMMON_WRAPPER_CLASSES, !imgLoaded && "animate-pulse")} 
        onClick={onClick} 
        role={onClick ? "button" : undefined} 
        tabIndex={onClick ? 0 : undefined} 
        onKeyDown={onClick ? (e) => { if (e.key === "Enter" || e.key === " ") onClick() } : undefined}
      >
        <div className={TAG_LABEL_CLASSES}>
          <span>{type}</span>
        </div>

        {data.logo && (
          <div className={LOGO_CLASSES}>
            <img
              src={data.logo || FALLBACK_LOGO}
              alt="Logo"
              className="w-7 h-7 object-contain filter grayscale group-hover:grayscale-0 opacity-40 group-hover:opacity-100 transition-all duration-500"
            />
          </div>
        )}

        <CardBackdrop img={data.img} isLoaded={imgLoaded} />

        <div className={imageContainerClasses}>
          {type === "desktop" || type === "web" ? (
            <div className="w-full aspect-[4/3] rounded-tl-2xl border-t border-l border-line bg-background shadow-2xl overflow-hidden flex flex-col">
              <div className="h-9 border-b border-line bg-muted/20 flex items-center px-4 space-x-2 shrink-0">
                <div className="size-2.5 rounded-full bg-line/60" />
                <div className="size-2.5 rounded-full bg-line/60" />
                <div className="size-2.5 rounded-full bg-line/60" />
              </div>
              <div className="flex-1 overflow-hidden relative bg-muted/5">
                <img
                  src={data.img}
                  alt={data.title}
                  className={cn("absolute inset-0 transition-opacity duration-1000", innerImageClasses, imgLoaded ? "opacity-100" : "opacity-0")}
                  onLoad={() => setImgLoaded(true)}
                  loading="lazy"
                />
              </div>
            </div>
          ) : type === "mobile" ? (
            <div className="w-[75%] relative">
              <div className="absolute top-16 -left-[2px] w-[2px] h-8 bg-line/50 rounded-l-sm z-0" />
              <div className="absolute top-28 -left-[2px] w-[2px] h-8 bg-line/50 rounded-l-sm z-0" />
              <div className="absolute top-24 -right-[2px] w-[2px] h-12 bg-line/50 rounded-r-sm z-0" />

              <div className="w-full aspect-[9/19] rounded-t-[2.5rem] border-t border-x border-line bg-muted/20 p-2 pb-0 shadow-2xl relative flex flex-col z-10">
                <div className="flex-1 overflow-hidden relative rounded-t-[2rem] border-t border-x border-line bg-background">
                  <img
                    src={data.img}
                    alt={data.title}
                    className={cn("absolute inset-0 transition-opacity duration-1000", innerImageClasses, imgLoaded ? "opacity-100" : "opacity-0")}
                    onLoad={() => setImgLoaded(true)}
                    loading="lazy"
                  />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={data.img}
              alt={data.title}
              className={cn("transition-opacity duration-1000", innerImageClasses, imgLoaded ? "opacity-100" : "opacity-0")}
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
