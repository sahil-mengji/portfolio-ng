"use client"

import React, { createContext, useContext, useState, useCallback } from "react"

export type ShowcaseSheetData = {
  title: string
  description?: string
  logo?: string | null
  tags?: string[]
  tools?: string[]
  url?: string | string[]
  categories?: string[]
  photos?: Array<{ url: string; height?: number; type?: string }>
}

type ShowcaseSheetContextType = {
  open: boolean
  data: ShowcaseSheetData | null
  openSheet: (data: ShowcaseSheetData) => void
  closeSheet: () => void
}

const ShowcaseSheetContext = createContext<ShowcaseSheetContextType>({
  open: false,
  data: null,
  openSheet: () => {},
  closeSheet: () => {},
})

export function useShowcaseSheet() {
  return useContext(ShowcaseSheetContext)
}

export function ShowcaseSheetProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  const [data, setData] = useState<ShowcaseSheetData | null>(null)

  const openSheet = useCallback((d: ShowcaseSheetData) => {
    setData(d)
    setOpen(true)
  }, [])

  const closeSheet = useCallback(() => {
    setOpen(false)
  }, [])

  return (
    <ShowcaseSheetContext.Provider value={{ open, data, openSheet, closeSheet }}>
      {children}
    </ShowcaseSheetContext.Provider>
  )
}
