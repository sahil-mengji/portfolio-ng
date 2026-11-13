import type { Metadata } from "next"
import "./globals.css"
import { ViewTransitions } from "next-view-transitions"
import { NuqsAdapter } from "nuqs/adapters/next/app"
import { ThemeProvider } from "@/components/theme-provider"
import { LenisProvider } from "@/components/lenis-provider"
import { TooltipProvider as BaseTooltipProvider } from "@/components/base/ui/tooltip"
import { TooltipProvider as RadixTooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
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
            <LenisProvider>
              <NuqsAdapter>
                <BaseTooltipProvider>
                  <RadixTooltipProvider>{children}</RadixTooltipProvider>
                </BaseTooltipProvider>
              </NuqsAdapter>
            </LenisProvider>
            <Toaster position="top-center" />
          </ThemeProvider>
        </ViewTransitions>
      </body>
    </html>
  )
}
