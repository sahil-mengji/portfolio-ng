"use client"

import Image from "next/image"
import { useState } from "react"
import { motion, AnimatePresence } from "motion/react"

import {
  Collapsible,
  CollapsibleChevronsIcon,
} from "@/components/base/collapsible-animated"
import { CollapsibleTrigger } from "@/components/base/ui/collapsible"
import { TECH_STACK } from "../data/tech-stack"
import { Panel, PanelContent, PanelHeader, PanelTitle } from "./panel"
import { cn } from "@/lib/utils"
import type { TechStack as TechStackType } from "../types/tech-stack"

function TechPill({ tech }: { tech: TechStackType }) {
  return (
    <motion.li 
      layoutId={`tech-${tech.key}`}
      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
      className="flex"
    >
      <a
        href={tech.href}
        target="_blank"
        rel="noopener"
        aria-label={tech.title}
        className="flex items-center gap-2 rounded-full border bg-zinc-50 px-2.5 py-1 text-sm tracking-wide text-zinc-700 transition-colors hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 [&_img]:size-4 [&_img]:select-none"
      >
        {tech.theme ? (
          <>
            <Image
              className="hidden [html.light_&]:block"
              src={`https://assets.chanhdai.com/images/tech-stack-icons/${tech.key}-light.svg`}
              alt={`${tech.title} light icon`}
              width={16}
              height={16}
              unoptimized
            />
            <Image
              className="hidden [html.dark_&]:block"
              src={`https://assets.chanhdai.com/images/tech-stack-icons/${tech.key}-dark.svg`}
              alt={`${tech.title} dark icon`}
              width={16}
              height={16}
              unoptimized
            />
          </>
        ) : (
          <Image
            src={`https://assets.chanhdai.com/images/tech-stack-icons/${tech.key}.svg`}
            alt={`${tech.title} icon`}
            width={16}
            height={16}
            unoptimized
          />
        )}
        {tech.title}
      </a>
    </motion.li>
  )
}

export function TechStack() {
  const [isCategorized, setIsCategorized] = useState(false)

  // Group by category, maintaining order of first appearance
  const categoriesMap = new Map<string, TechStackType[]>()
  for (const tech of TECH_STACK) {
    for (const category of tech.categories) {
      if (!categoriesMap.has(category)) {
        categoriesMap.set(category, [])
      }
      categoriesMap.get(category)!.push(tech)
    }
  }

  const categories = Array.from(categoriesMap.entries())

  return (
    <Panel id="stack">
      <Collapsible open={isCategorized} onOpenChange={setIsCategorized}>
        <CollapsibleTrigger
          render={
            <PanelHeader className="flex cursor-pointer items-center justify-between transition-colors hover:bg-accent-muted">
              <PanelTitle>Stack</PanelTitle>
              <div className="shrink-0 text-muted-foreground [&_svg]:size-4">
                <CollapsibleChevronsIcon duration={0.15} />
              </div>
            </PanelHeader>
          }
        />

        <PanelContent className="overflow-hidden p-0">
          <motion.div layout transition={{ duration: 0.4, ease: "easeInOut" }} className="relative">
            {isCategorized ? (
              <div className="flex flex-col">
                {categories.map(([category, items], i) => (
                  <div 
                    key={category} 
                    className="border-b border-line last:border-b-0 p-4"
                  >
                    <motion.h3 
                      className="mb-3 font-medium text-foreground"
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05, duration: 0.3 }}
                    >
                      {category}
                    </motion.h3>
                    <ul className="flex flex-wrap gap-2">
                      {items.map((tech) => (
                        <TechPill key={tech.key} tech={tech} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4">
                <ul className="flex flex-wrap gap-2">
                  {TECH_STACK.map((tech) => (
                    <TechPill key={tech.key} tech={tech} />
                  ))}
                </ul>
              </div>
            )}
          </motion.div>
        </PanelContent>
      </Collapsible>
    </Panel>
  )
}
