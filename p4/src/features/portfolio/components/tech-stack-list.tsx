"use client"

import { ChevronDownIcon } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import Image from "next/image"
import * as React from "react"

import type { TechStack } from "../types/tech-stack"
import { cn } from "@/lib/utils"

interface TechStackListProps {
  techStack: TechStack[]
}

export function TechStackList({ techStack }: TechStackListProps) {
  const [expanded, setExpanded] = React.useState<string | null>(null)

  // Group by category, maintaining order of first appearance
  const categoriesMap = new Map<string, TechStack[]>()
  for (const tech of techStack) {
    for (const category of tech.categories) {
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, [])
      }
      categoriesMap.get(category)!.push(tech)
    }
  }

  const categories = Array.from(categoriesMap.entries())

  return (
    <div className="flex flex-col">
      {categories.map(([category, items], index) => {
        const isExpanded = expanded === category
        return (
          <div key={category} className="border-b border-line last:border-b-0">
            <button
              onClick={() => setExpanded(isExpanded ? null : category)}
              className="flex w-full cursor-pointer items-center justify-between py-3 font-medium transition-colors hover:text-foreground text-muted-foreground"
            >
              <span>{category}</span>
              <ChevronDownIcon
                className={cn(
                  "size-4 shrink-0 transition-transform duration-300",
                  isExpanded && "rotate-180"
                )}
              />
            </button>

            <AnimatePresence initial={false}>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <div className="pb-4 pt-1">
                    <ul className="flex flex-wrap gap-2">
                      {items.map((tech) => (
                        <li key={tech.key} className="flex">
                          <a
                            href={tech.href}
                            target="_blank"
                            rel="noopener"
                            aria-label={tech.title}
                            className="flex items-center gap-1.5 rounded-full border bg-zinc-50 px-1.5 py-0.5 text-xs tracking-wide text-zinc-700 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 [&_img]:size-3.5 [&_img]:select-none"
                          >
                            {tech.theme ? (
                              <>
                                <Image
                                  className="hidden [html.light_&]:block"
                                  src={`https://assets.chanhdai.com/images/tech-stack-icons/${tech.key}-light.svg`}
                                  alt={`${tech.title} light icon`}
                                  width={14}
                                  height={14}
                                  unoptimized
                                />
                                <Image
                                  className="hidden [html.dark_&]:block"
                                  src={`https://assets.chanhdai.com/images/tech-stack-icons/${tech.key}-dark.svg`}
                                  alt={`${tech.title} dark icon`}
                                  width={14}
                                  height={14}
                                  unoptimized
                                />
                              </>
                            ) : (
                              <Image
                                src={`https://assets.chanhdai.com/images/tech-stack-icons/${tech.key}.svg`}
                                alt={`${tech.title} icon`}
                                width={14}
                                height={14}
                                unoptimized
                              />
                            )}
                            {tech.title}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
