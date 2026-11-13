"use client"

import { RepeatIcon } from "lucide-react"
import { useTheme } from "next-themes"
import React, { useMemo, useState } from "react"

import {
  Tabs,
  TabsContent,
  TabsIndicator,
  TabsList,
  TabsTrigger,
} from "@/components/base/ui/tabs"
import { cn } from "@/lib/utils"

import { Tooltip, TooltipContent, TooltipTrigger } from "./base/ui/tooltip"
import { CodeCollapsibleWrapper } from "./code-collapsible-wrapper"
import { Button } from "./ui/button"
import { Code as CodeInline } from "./ui/typography"
import { OpenInV0Button } from "./v0-open-button"
import AppleHelloEffectEnglishDemo from "@/registry/examples/apple-hello-effect-english-demo"
import AppleHelloEffectHindiDemo from "@/registry/examples/apple-hello-effect-hindi-demo"
import AppleHelloEffectSpanishDemo from "@/registry/examples/apple-hello-effect-spanish-demo"
import AppleHelloEffectVietnameseDemo from "@/registry/examples/apple-hello-effect-vietnamese-demo"
import CodeBlockCommandConvertDemo from "@/registry/examples/code-block-command-convert-demo"
import CodeBlockCommandDemo from "@/registry/examples/code-block-command-demo"
import CopyButtonDemo from "@/registry/examples/copy-button-demo"
import ElasticSliderDemo from "@/registry/examples/elastic-slider-demo"
import GitHubContributionsDemo from "@/registry/examples/github-contributions-demo"
import GitHubStarsDemo from "@/registry/examples/github-stars-demo"
import GlowCardGridDemo01 from "@/registry/examples/glow-card-grid-demo-01"
import HapticDemo from "@/registry/examples/haptic-demo"
import MiddleTruncationDemo from "@/registry/examples/middle-truncation-demo"
import ScrollFadeEffectDemo from "@/registry/examples/scroll-fade-effect-demo-01"
import ScrollFadeEffectHorizontalDemo from "@/registry/examples/scroll-fade-effect-demo-02"
import ScrollAreaDemo from "@/registry/examples/scroll-fade-effect-demo-03"
import ScrollAreaHorizontalDemo from "@/registry/examples/scroll-fade-effect-demo-04"
import ShimmeringTextDemo1 from "@/registry/examples/shimmering-text-demo-01"
import ShimmeringTextDemo2 from "@/registry/examples/shimmering-text-demo-02"
import SlideToUnlockDemo1 from "@/registry/examples/slide-to-unlock-demo-01"
import SlideToUnlockDemo2 from "@/registry/examples/slide-to-unlock-demo-02"
import SlideToUnlockDemo3 from "@/registry/examples/slide-to-unlock-demo-03"
import TestimonialDemo from "@/registry/examples/testimonial-demo"
import TestimonialSpotlightDemo from "@/registry/examples/testimonial-spotlight-demo-01"
import TestimonialSpotlightDemo02 from "@/registry/examples/testimonial-spotlight-demo-02"
import TestimonialsMarqueeDemo1 from "@/registry/examples/testimonials-marquee-demo-01"
import TestimonialsMarqueeDemo2 from "@/registry/examples/testimonials-marquee-demo-02"
import TextFlipDemo from "@/registry/examples/text-flip-demo"
import ThemeSwitcherDemo from "@/registry/examples/theme-switcher-demo"
import ThemeToggleEffectDemo from "@/registry/examples/theme-toggle-effect-demo"
import TOCMinimapDemo from "@/registry/examples/toc-minimap-demo"
import TwemojiDemo from "@/registry/examples/twemoji-demo"
import WheelPickerDemo from "@/registry/examples/wheel-picker-demo"
import WheelPickerFormDemo from "@/registry/examples/wheel-picker-form-demo"
import WorkExperienceDemo from "@/registry/examples/work-experience-demo"

// Local demo registry: name → live demo component. p4 resolves these
// through its generated registry index; the mapping is identical, only
// the lookup is local.
const DEMOS: Record<string, React.ComponentType> = {
  "apple-hello-effect-english-demo": AppleHelloEffectEnglishDemo,
  "apple-hello-effect-hindi-demo": AppleHelloEffectHindiDemo,
  "apple-hello-effect-spanish-demo": AppleHelloEffectSpanishDemo,
  "apple-hello-effect-vietnamese-demo": AppleHelloEffectVietnameseDemo,
  "code-block-command-convert-demo": CodeBlockCommandConvertDemo,
  "code-block-command-demo": CodeBlockCommandDemo,
  "copy-button-demo": CopyButtonDemo,
  "elastic-slider-demo": ElasticSliderDemo,
  "github-contributions-demo": GitHubContributionsDemo,
  "github-stars-demo": GitHubStarsDemo,
  "glow-card-grid-demo-01": GlowCardGridDemo01,
  "haptic-demo": HapticDemo,
  "middle-truncation-demo": MiddleTruncationDemo,
  "scroll-fade-effect-demo-01": ScrollFadeEffectDemo,
  "scroll-fade-effect-demo-02": ScrollFadeEffectHorizontalDemo,
  "scroll-fade-effect-demo-03": ScrollAreaDemo,
  "scroll-fade-effect-demo-04": ScrollAreaHorizontalDemo,
  "shimmering-text-demo-01": ShimmeringTextDemo1,
  "shimmering-text-demo-02": ShimmeringTextDemo2,
  "slide-to-unlock-demo-01": SlideToUnlockDemo1,
  "slide-to-unlock-demo-02": SlideToUnlockDemo2,
  "slide-to-unlock-demo-03": SlideToUnlockDemo3,
  "testimonial-demo": TestimonialDemo,
  "testimonial-spotlight-demo-01": TestimonialSpotlightDemo,
  "testimonial-spotlight-demo-02": TestimonialSpotlightDemo02,
  "testimonials-marquee-demo-01": TestimonialsMarqueeDemo1,
  "testimonials-marquee-demo-02": TestimonialsMarqueeDemo2,
  "text-flip-demo": TextFlipDemo,
  "theme-switcher-demo": ThemeSwitcherDemo,
  "theme-toggle-effect-demo": ThemeToggleEffectDemo,
  "toc-minimap-demo": TOCMinimapDemo,
  "twemoji-demo": TwemojiDemo,
  "wheel-picker-demo": WheelPickerDemo,
  "wheel-picker-form-demo": WheelPickerFormDemo,
  "work-experience-demo": WorkExperienceDemo,
}

export function ComponentPreview({
  className,
  name,
  openInV0Url,
  canReplay = false,
  prose = false,
  codeCollapsible = false,
  remountOnThemeChange = false,
  children,
  ...props
}: React.ComponentProps<"div"> & {
  name: string
  openInV0Url?: string
  canReplay?: boolean
  prose?: boolean
  codeCollapsible?: boolean
  remountOnThemeChange?: boolean
}) {
  const { resolvedTheme } = useTheme()

  const [replay, setReplay] = useState(0)

  const Codes = React.Children.toArray(children) as React.ReactElement[]
  const Code = Codes[0]

  const Preview = useMemo(() => {
    const Component = DEMOS[name]

    if (!Component) {
      return (
        <p className="text-sm text-muted-foreground">
          Component <CodeInline>{name}</CodeInline> not found in registry.
        </p>
      )
    }

    return <Component />
  }, [name])

  return (
    <div
      className={cn(
        "my-[1.25em] rounded-xl bg-code",
        prose === false && "not-prose",
        className
      )}
      {...props}
    >
      <Tabs defaultValue="preview" className="gap-0">
        <div className="z-1 px-4">
          <TabsList className="h-10 rounded-none bg-transparent p-0 dark:bg-transparent [&_svg]:me-2 [&_svg]:size-4 [&_svg]:text-muted-foreground">
            <TabsTrigger className="h-7 rounded-lg p-0 px-2" value="preview">
              Preview
            </TabsTrigger>
            <TabsTrigger className="h-7 rounded-lg p-0 px-2" value="code">
              Code
            </TabsTrigger>

            <TabsIndicator className="h-0.5 translate-y-px rounded-none bg-foreground shadow-none dark:bg-foreground" />
          </TabsList>
        </div>

        <TabsContent className="px-1 pb-1" value="preview">
          <div
            data-slot="preview"
            data-show-buttons={canReplay || !!openInV0Url}
            className="relative rounded-xl rounded-b-[9px] border bg-background p-2 data-[show-buttons=true]:py-10.5"
          >
            {(canReplay || openInV0Url) && (
              <div
                data-slot="buttons"
                className="absolute top-1.5 right-1.5 flex justify-end"
              >
                {canReplay && (
                  <Tooltip>
                    <TooltipTrigger
                      render={
                        <Button
                          className="size-7 rounded-md border-none"
                          variant="ghost"
                          size="icon-sm"
                          aria-label="Replay"
                          onClick={() => setReplay((v) => v + 1)}
                        >
                          <RepeatIcon />
                        </Button>
                      }
                    />
                    <TooltipContent>
                      <p>Replay</p>
                    </TooltipContent>
                  </Tooltip>
                )}

                {openInV0Url && (
                  <OpenInV0Button
                    className="h-7 rounded-md"
                    url={openInV0Url}
                  />
                )}
              </div>
            )}

            <div
              key={`${replay}-${remountOnThemeChange ? (resolvedTheme ?? "system") : "static"}`}
              data-slot="component-preview"
              className="flex min-h-72 items-center justify-center font-sans"
            >
              <React.Suspense
                fallback={
                  <div className="flex items-center justify-center text-sm text-muted-foreground">
                    Loading…
                  </div>
                }
              >
                {Preview}
              </React.Suspense>
            </div>
          </div>
        </TabsContent>

        <TabsContent
          value="code"
          className={cn(
            "px-1 pb-1 [--code:var(--background)]",
            "*:data-rehype-pretty-code-figure:m-0 *:data-rehype-pretty-code-figure:rounded-b-[9px] *:data-rehype-pretty-code-figure:border",
            "**:data-[slot=copy-button]:size-7"
          )}
        >
          {codeCollapsible ? (
            <CodeCollapsibleWrapper className="my-0">
              {Code}
            </CodeCollapsibleWrapper>
          ) : (
            Code
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
