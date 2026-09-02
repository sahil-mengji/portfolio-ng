"use client"

import React, { useEffect, useState, useMemo } from "react"
import DraftingGridBackground from "./DraftingGridBackground"
import { useThemeColorContext } from "@/components/theme-provider"

interface AdaptiveDraftingGridBackgroundProps {
  majorEvery?: number
  cellSize?: number
  bgColor?: string
  inkColor?: string
  showArcs?: boolean
  showAngles?: boolean
  margin?: number
  extraUnits?: number // additional units beyond viewport coverage
}

/**
 * Renders the drafting grid as a full‑screen background.
 * The grid's origin (bottom‑left corner of the plot area)
 * is pinned to the bottom‑left of the viewport. Extra grid
 * units cause the pattern to overflow to the top and right,
 * which is clipped by the container.
 */
export default function AdaptiveDraftingGridBackground({
  majorEvery = 5,
  cellSize = 20,
  bgColor,
  inkColor,
  showArcs = true,
  showAngles = true,
  margin = 60,
  extraUnits = 2,
}: AdaptiveDraftingGridBackgroundProps) {
  const { palette } = useThemeColorContext()

  // Primary is site bg, guidelines: white on dark hues, darker shade on light
  // palette.gridBg / gridInk implement the luminance rule
  const backgroundColor = bgColor ?? (palette as any).gridBg ?? palette.primary
  const drawingColor = inkColor ?? (palette as any).gridInk ?? palette.primaryForeground

  const [mounted, setMounted] = useState(false)
  const [viewport, setViewport] = useState({
    width: 800,
    height: 600,
  })

  useEffect(() => {
    setMounted(true)
    setViewport({ width: window.innerWidth, height: window.innerHeight })
    const handleResize = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight })
    }
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Compute the number of units needed to cover the viewport
  // plus a little extra so the grid can overflow to top/right.
  const xUnits = useMemo(
    () => Math.ceil(viewport.width / cellSize) + extraUnits,
    [viewport.width, cellSize, extraUnits]
  )
  const yUnits = useMemo(
    () => Math.ceil(viewport.height / cellSize) + extraUnits,
    [viewport.height, cellSize, extraUnits]
  )

  // SVG pixel dimensions (including margins)
  const svgWidth = xUnits * cellSize + 2 * margin
  const svgHeight = yUnits * cellSize + 2 * margin

  // Avoid hydration mismatch from floating-point SVG geometry:
  // render a solid placeholder on server, full grid only after mount
  if (!mounted) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 0,
          backgroundColor,
        }}
      />
    )
  }

  return (
    <div
      suppressHydrationWarning
      style={{
        position: "fixed",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none", // allow clicks to pass through if needed
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          left: -margin,
          bottom: -margin,
          width: svgWidth,
          height: svgHeight,
        }}
      >
        <DraftingGridBackground
          xUnits={xUnits}
          yUnits={yUnits}
          majorEvery={majorEvery}
          cellSize={cellSize}
          bgColor={backgroundColor}
          inkColor={drawingColor}
          showArcs={showArcs}
          showAngles={showAngles}
          margin={margin}
          svgWidth={svgWidth}
          svgHeight={svgHeight}
        />
      </div>
    </div>
  )
}
