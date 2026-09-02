"use client"
import * as React from "react"
import { cn } from "@/lib/utils"

export function Panel({ className, ...props }: React.ComponentProps<"section">) {
  return <section data-slot="panel" className={cn("border-x border-border bg-card text-card-foreground", className)} {...props} />
}
export function PanelHeader({ className, ...props }: React.ComponentProps<"header">) {
  return <header data-slot="panel-header" className={cn("border-b border-border px-4 py-3 flex items-center justify-between", className)} {...props} />
}
export function PanelTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="panel-title" className={cn("font-heading text-2xl font-semibold tracking-tight", className)} {...props} />
}
export function PanelDescription({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-description" className={cn("px-4 py-2 text-sm text-muted-foreground", className)} {...props} />
}
export function PanelContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="panel-body" className={cn("p-4", className)} {...props} />
}
