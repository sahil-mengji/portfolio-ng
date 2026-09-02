"use client"

import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { useThemeColorContext } from "@/components/theme-provider"

const textVariants = cva("max-w-full", {
  variants: {
    variant: {
      heading: "font-heading font-bold tracking-tight text-balance leading-[0.95]",
      subheading: "font-heading font-normal tracking-tight text-balance leading-tight",
      body: "font-sans leading-relaxed text-pretty",
      link: "font-sans underline underline-offset-4 decoration-1 hover:decoration-2 transition-colors",
      caption: "font-sans tracking-wide leading-snug",
      label: "font-sans font-medium tracking-wide leading-none",
    },
    size: {
      default: "",
      sm: "",
      lg: "",
    },
  },
  compoundVariants: [
    { variant: "heading", size: "default", class: "text-4xl md:text-5xl lg:text-6xl" },
    { variant: "heading", size: "sm", class: "text-2xl md:text-3xl" },
    { variant: "heading", size: "lg", class: "text-5xl md:text-6xl lg:text-7xl" },
    { variant: "subheading", size: "default", class: "text-2xl md:text-3xl" },
    { variant: "subheading", size: "sm", class: "text-lg md:text-xl" },
    { variant: "subheading", size: "lg", class: "text-3xl md:text-4xl" },
    { variant: "body", size: "default", class: "text-base" },
    { variant: "body", size: "sm", class: "text-sm" },
    { variant: "body", size: "lg", class: "text-lg" },
    { variant: "link", size: "default", class: "text-base" },
    { variant: "link", size: "sm", class: "text-sm" },
    { variant: "link", size: "lg", class: "text-lg" },
    { variant: "caption", size: "default", class: "text-xs" },
    { variant: "caption", size: "sm", class: "text-[0.7rem]" },
    { variant: "caption", size: "lg", class: "text-sm" },
    { variant: "label", size: "default", class: "text-sm" },
    { variant: "label", size: "sm", class: "text-xs" },
    { variant: "label", size: "lg", class: "text-base" },
  ],
  defaultVariants: {
    variant: "body",
    size: "default",
  },
})

type TextVariantProps = VariantProps<typeof textVariants>

type BaseProps = {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  // allow overriding color explicitly; if omitted, theme-aware default is used
  color?: string
}

export const CardContext = React.createContext(false)

function useTextColor(variant: NonNullable<TextVariantProps["variant"]>) {
  const { palette } = useThemeColorContext()
  const inCard = React.useContext(CardContext)
  const p: any = palette
  // Automated via CSS vars, but keep JS fallback for inline style; inCard → card tokens
  if (inCard) {
    if (variant === "caption") return p.cardSecondaryText ?? palette.secondaryText
    if (variant === "subheading") return p.cardSecondaryText ?? palette.secondaryText
    return p.cardText ?? palette.text
  }
  if (variant === "caption") return palette.secondaryText
  return palette.text
}

// Heading: h1 by default
const Heading = React.forwardRef<HTMLHeadingElement, BaseProps & TextVariantProps & React.HTMLAttributes<HTMLHeadingElement> & { as?: "h1" | "h2" | "h3" | "h4" }>(
  ({ children, className, style, color, variant = "heading", size, as: Comp = "h1", ...props }, ref) => {
    const themeColor = useTextColor("heading")
    return (
      <Comp
        ref={ref as any}
        className={cn(textVariants({ variant, size, className }))}
        style={{ color: color ?? themeColor, ...style }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Heading.displayName = "Text.Heading"

// Subheading: h2 by default
const Subheading = React.forwardRef<HTMLHeadingElement, BaseProps & TextVariantProps & React.HTMLAttributes<HTMLHeadingElement> & { as?: "h2" | "h3" | "h4" }>(
  ({ children, className, style, color, variant = "subheading", size, as: Comp = "h2", ...props }, ref) => {
    const themeColor = useTextColor("subheading")
    return (
      <Comp
        ref={ref as any}
        className={cn(textVariants({ variant, size, className }))}
        style={{ color: color ?? themeColor, ...style }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Subheading.displayName = "Text.Subheading"

// Body: p by default
const Body = React.forwardRef<HTMLParagraphElement, BaseProps & TextVariantProps & React.HTMLAttributes<HTMLParagraphElement> & { as?: "p" | "span" | "div" }>(
  ({ children, className, style, color, variant = "body", size, as: Comp = "p", ...props }, ref) => {
    const themeColor = useTextColor("body")
    return (
      <Comp
        ref={ref as any}
        className={cn(textVariants({ variant, size, className }))}
        style={{ color: color ?? themeColor, ...style }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Body.displayName = "Text.Body"

// Link: a by default – underline tinted with brand for hue, text stays high-contrast
const Link = React.forwardRef<HTMLAnchorElement, BaseProps & TextVariantProps & React.AnchorHTMLAttributes<HTMLAnchorElement>>(
  ({ children, className, style, color, variant = "link", size, ...props }, ref) => {
    const themeColor = useTextColor("link")
    const { palette } = useThemeColorContext()
    return (
      <a
        ref={ref}
        className={cn(textVariants({ variant, size, className }))}
        style={{ color: color ?? themeColor, textDecorationColor: (palette as any).brand ?? themeColor, ...style }}
        {...props}
      >
        {children}
      </a>
    )
  }
)
Link.displayName = "Text.Link"

const Caption = React.forwardRef<HTMLSpanElement, BaseProps & TextVariantProps & React.HTMLAttributes<HTMLSpanElement> & { as?: "span" | "p" | "div" }>(
  ({ children, className, style, color, variant = "caption", size, as: Comp = "span", ...props }, ref) => {
    const themeColor = useTextColor("caption")
    return (
      <Comp
        ref={ref as any}
        className={cn(textVariants({ variant, size, className }))}
        style={{ color: color ?? themeColor, ...style }}
        {...props}
      >
        {children}
      </Comp>
    )
  }
)
Caption.displayName = "Text.Caption"

const LabelInner = React.forwardRef<HTMLSpanElement, BaseProps & TextVariantProps & React.HTMLAttributes<HTMLSpanElement> & { as?: "span" | "label" | "div" }>(
  ({ children, className, style, color, variant = "label", size, as: Comp = "span", ...props }, ref) => {
    const themeColor = useTextColor("label")
    return (
      <Comp ref={ref as any} className={cn(textVariants({ variant, size, className }))} style={{ color: color ?? themeColor, ...style }} {...props}>
        {children}
      </Comp>
    )
  }
)

export const Text = {
  Heading,
  Subheading,
  Body,
  Link,
  Caption,
  Label: LabelInner,
  // lowercase aliases for convenience: Text.heading etc.
  heading: Heading,
  subheading: Subheading,
  subHeading: Subheading,
  body: Body,
  link: Link,
  caption: Caption,
  label: LabelInner,
}

export { textVariants, Heading, Subheading, Body, Link, Caption }
export type { TextVariantProps }
