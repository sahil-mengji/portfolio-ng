import type { Metadata } from "next"
import "./globals.css"
import { ViewTransitions } from "next-view-transitions"
import { ThemeProvider } from "@/components/theme-provider"
import { LenisProvider } from "@/components/lenis-provider"
import { fontVariables } from "@/lib/fonts"
import { Agentation } from "agentation"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: {
    default: "Sahil Mengji",
    template: "%s — Sahil Mengji",
  },
  description:
    "Designer–engineer building editorial, grid-driven portfolios where one color drives everything.",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("antialiased", fontVariables)}
    >
      <body>
        <ViewTransitions>
          <ThemeProvider>
            {process.env.NODE_ENV === "development" && <Agentation />}
            <LenisProvider>{children}</LenisProvider>
          </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  )
}
