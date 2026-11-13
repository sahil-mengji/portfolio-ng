"use client"
import { HomeBox } from "@/components/bento/HomeBox"

export function BentoCell({
  boxKey,
  area,
  title,
  titleClassName,
  header,
  children,
  allowOverflow = false,
}: {
  boxKey: string
  area: string
  title: string
  titleClassName?: string
  // Custom header node (icon + title row etc.) — renders instead of the
  // default h3 when provided.
  header?: React.ReactNode
  children?: React.ReactNode
  allowOverflow?: boolean
}) {
  return (
    <HomeBox
      boxKey={boxKey}
      outerClassName={`${area} h-full w-full`}
      className="flex flex-col p-5"
      allowOverflow={allowOverflow}
    >
      {header ?? (
        <h3
          className={`text-2xl font-normal ${titleClassName ?? ""}`}
          style={{
            fontFamily: "var(--font-heading)",
            color: "var(--card-heading)",
          }}
        >
          {title}
        </h3>
      )}
      {children}
    </HomeBox>
  )
}
export default BentoCell
