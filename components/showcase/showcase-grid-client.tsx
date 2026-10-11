"use client"

import dynamic from "next/dynamic"
import { ShowcaseGridSkeleton } from "./showcase-grid-skeleton"

export const ShowcaseGridClient = dynamic(
  () => import("./showcase-grid").then((mod) => mod.ShowcaseGrid),
  {
    ssr: false,
    loading: () => <ShowcaseGridSkeleton />,
  }
)
