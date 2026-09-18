"use client"
import { useEffect } from "react"
import { initLenis } from "@/lib/lenis"
import "lenis/dist/lenis.css"

// Mounts the site-wide Lenis smooth-scroll instance (client-only).
export function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => initLenis(), [])
  return <>{children}</>
}
