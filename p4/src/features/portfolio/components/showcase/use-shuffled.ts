"use client"

import React, { useEffect, useLayoutEffect, useState, useRef } from "react"
import { useShowcaseSheet } from "./showcase-sheet-context"
import type { ShowcaseSheetData } from "./showcase-sheet-context"

// Fix hydration error — shuffle only on client after mount
function useShuffled<T>(items: T[], ready: boolean): T[] {
  const [shuffled, setShuffled] = useState<T[]>(items)
  useEffect(() => {
    if (ready) setShuffled([...items].sort(() => Math.random() - 0.5))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready])
  return shuffled
}

export { useShuffled }
