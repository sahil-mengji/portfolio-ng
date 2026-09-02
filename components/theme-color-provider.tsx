"use client"

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { useThemeColor } from "@/lib/color-utils"

type ThemeColorContextProps = {
  color: string
  palette: ReturnType<typeof import("@/lib/color-utils").generateColorPalette>
  updatePalette: (color: string) => void
}

const ThemeColorContext = React.createContext<ThemeColorContextProps | null>(null)

export function ThemeColorProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { color, palette, updatePalette } = useThemeColor()

  const value = {
    color,
    palette,
    updatePalette
  }

  return (
    <ThemeColorContext.Provider value={value}>
      <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
        {children}
      </NextThemesProvider>
    </ThemeColorContext.Provider>
  )
}

export function useThemeColorContext() {
  const context = React.useContext(ThemeColorContext)
  if (context === null) {
    throw new Error("useThemeColorContext must be used within a ThemeColorProvider")
  }
  return context
}