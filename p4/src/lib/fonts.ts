import { GeistMono } from "geist/font/mono"
import { GeistPixelSquare } from "geist/font/pixel"
import { GeistSans } from "geist/font/sans"
import { Instrument_Sans, Instrument_Serif } from "next/font/google"
import localFont from "next/font/local"

import { cn } from "@/lib/utils"

const fontSans = GeistSans
const fontMono = GeistMono

const fontInstrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
})

const fontInstrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-instrument-serif",
})

const fontSerif = localFont({
  src: "../assets/fonts/charter_regular.woff2",
  weight: "400",
  fallback: ["Georgia", "serif"],
  variable: "--font-serif",
})

const fontPixel = localFont({
  src: "../assets/fonts/DepartureMono-Regular.woff2",
  weight: "400",
  fallback: ["monospace"],
  variable: "--font-pixel",
})

const fontThunder = localFont({
  src: "../assets/fonts/thunder.ttf",
  weight: "100 900",
  variable: "--font-thunder",
})

export const fontVariables = cn(
  fontSans.variable,
  fontMono.variable,
  fontSerif.variable,
  fontPixel.variable,
  fontThunder.variable,
  GeistPixelSquare.variable,
  fontInstrumentSans.variable,
  fontInstrumentSerif.variable,
  "[--font-sans:var(--font-geist-sans)]",
  "[--font-mono:var(--font-geist-mono)]"
)
