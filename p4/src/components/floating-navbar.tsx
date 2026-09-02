"use client"

import { motion, useMotionValueEvent, useScroll, AnimatePresence } from "motion/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import React, { useState, useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { ChanhDaiMark } from "./chanhdai-mark"
import { NavItem } from "@/types/nav"
import { CommandMenu } from "./command-menu"
import { ThemeToggle } from "./theme-toggle"
import { Separator } from "./ui/separator"
import { GitHubStars } from "./github-stars"
import { SOURCE_CODE_GITHUB_REPO } from "@/config/site"
import { NavMobile } from "./nav-mobile"
import dynamic from "next/dynamic"

const BrandContextMenu = dynamic(() =>
  import("@/components/brand-context-menu").then((mod) => mod.BrandContextMenu)
)

interface FloatingNavbarProps {
  items: NavItem[]
  mobileItems: NavItem[]
  stargazersCount: number
  docPreviews: any[]
  blocks: any[]
}

export function FloatingNavbar({
  items,
  mobileItems,
  stargazersCount,
  docPreviews,
  blocks,
}: FloatingNavbarProps) {
  const pathname = usePathname()
  const { scrollY } = useScroll()
  const [visible, setVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    setLastScrollY(window.scrollY)
  }, [])

  useMotionValueEvent(scrollY, "change", (current) => {
    if (typeof current !== "number") return

    const direction = current > lastScrollY ? "down" : "up"
    
    if (current < 50) {
      setVisible(true)
    } else if (direction === "down" && current > 100) {
      setVisible(false)
    } else if (direction === "up") {
      setVisible(true)
    }
    
    setLastScrollY(current)
  })

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="floating-navbar"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{
            duration: 0.3,
            ease: "easeInOut",
          }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex justify-center px-4 w-full max-w-[800px] pointer-events-none"
        >
          <motion.div 
            whileHover={{ scale: 1.02, y: -2 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className="flex items-center gap-2 rounded-full border border-border/50 bg-popover/80 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-black/5 dark:ring-white/10 w-full cursor-pointer pointer-events-auto"
          >
            {/* Logo Section */}
            <div className="flex items-center pl-2">
               <BrandContextMenu>
                  <Link
                    className="transition-[scale] ease-out active:scale-[0.98] [&_svg]:h-7 [&_svg]:shrink-0"
                    href="/"
                    aria-label="Home"
                  >
                    <ChanhDaiMark />
                  </Link>
                </BrandContextMenu>
            </div>

            <Separator orientation="vertical" className="h-6 mx-1" />

            {/* Desktop Nav Items */}
            <nav className="hidden md:flex items-center gap-1 flex-1">
              {items.map((item) => {
                const active = pathname.startsWith(item.href) && item.href !== "/" || pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "relative px-4 py-1.5 text-sm font-medium transition-colors hover:text-foreground",
                      active ? "text-foreground" : "text-muted-foreground"
                    )}
                  >
                    {active && (
                      <motion.div
                        layoutId="active-pill"
                        className="absolute inset-0 z-0 rounded-full bg-accent"
                        transition={{
                          type: "spring",
                          bounce: 0.2,
                          duration: 0.6,
                        }}
                      />
                    )}
                    <span className="relative z-10">{item.title}</span>
                  </Link>
                )
              })}
            </nav>

            <div className="flex-1 md:hidden" />

            {/* Actions Section */}
            <div className="flex items-center gap-1 sm:gap-2 pr-1">
              <CommandMenu docs={docPreviews} blocks={blocks} enabledHotkeys />
              
              <div className="hidden sm:flex items-center gap-1 sm:gap-2">
                  <GitHubStars repo={SOURCE_CODE_GITHUB_REPO} stargazersCount={stargazersCount} />
                  <Separator orientation="vertical" className="h-4" />
                  <ThemeToggle />
              </div>

              <div className="flex md:hidden">
                   <Separator orientation="vertical" className="h-6 mx-1" />
                   <NavMobile items={mobileItems} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

