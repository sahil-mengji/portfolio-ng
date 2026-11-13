"use client"

import { useCallback, useEffect, useRef, useState } from "react"

export type CopyState = "idle" | "done" | "error"

export type UseCopyToClipboardOptions = {
  onCopySuccess?: (text: string) => void
  onCopyError?: (error: Error) => void
  resetDelay?: number
}

export function useCopyToClipboard({
  onCopySuccess,
  onCopyError,
  resetDelay = 2000,
}: UseCopyToClipboardOptions = {}) {
  const [state, setState] = useState<CopyState>("idle")
  const timer = useRef(0)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string | (() => string)) => {
      window.clearTimeout(timer.current)
      try {
        const value = typeof text === "function" ? text() : text
        await navigator.clipboard.writeText(value)
        setState("done")
        onCopySuccess?.(value)
      } catch (e) {
        setState("error")
        onCopyError?.(e as Error)
      }
      timer.current = window.setTimeout(() => setState("idle"), resetDelay)
    },
    [onCopySuccess, onCopyError, resetDelay]
  )

  return { state, copy }
}
