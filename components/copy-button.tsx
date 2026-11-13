"use client"

import type { CopyButtonProps } from "@/registry/components/copy-button"
import { CopyButton as CopyButtonPrimitive } from "@/registry/components/copy-button"

import { Icons } from "./icons"

// p4's wrapper verbatim except click-tracking: this repo has no posthog
// analytics pipeline, so the `event` prop is accepted (call-site
// compatible) and otherwise ignored.
export function CopyButton({
  size = "icon-sm",
  event: _event,
  ...props
}: CopyButtonProps & {
  event?: string
}) {
  return (
    <CopyButtonPrimitive
      variant="secondary"
      size={size}
      idleIcon={<Icons.copy />}
      {...props}
    />
  )
}
