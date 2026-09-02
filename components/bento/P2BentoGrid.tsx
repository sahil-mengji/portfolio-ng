"use client"
import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import GithubCard from "./p2/GithubCard"
import SocialMediaCard from "./p2/SocialMediaCard"
import ResumeCard from "./p2/Resume"
import SkillsCard from "./p2/Skills"
import ProjectsFolderCard from "./p2/ProjectsFolder"
import LibraryCard from "./p2/Library"
import ExperimentsCard from "./p2/ExperimentsCarousel"
import NFTCard from "./p2/NFTCard"
import IDCard from "./p2/IDCard"
import LightboardCard from "./p2/LightboardCard"
import LikeCard from "./p2/LikeCard"
import { Text } from "@/components/ui/text"
import { useThemeColorContext } from "@/components/theme-provider"

export function P2BentoGrid() {
  const { palette } = useThemeColorContext()
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Text.Subheading>Bento — from p2/src/pages/Home</Text.Subheading>
        <span className="text-xs px-2 py-1 rounded-full border" style={{ borderColor: `color-mix(in srgb, ${palette.brand} 18%, transparent)`, color: palette.secondaryText }}>
          migrated • animated
        </span>
      </div>
      {/* Exact structure from p2/src/pages/Home/Home.jsx */}
      <div ref={ref} className="gap-5 grid mt-6 w-full h-full bentogrid">
        <GithubCard
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          style={{ gridArea: "github" }}
        />

        <SocialMed
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          style={{ gridArea: "hsocial" }}
        />

        <Resume
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          style={{ gridArea: "hresume" }}
        />

        <Skills
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          style={{ gridArea: "hskills" }}
        />

        <ProjectsFolder
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          style={{ gridArea: "hshowcase" }}
        />

        <Library
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          style={{ gridArea: "hlibrary" }}
        />

        <ExperimentsCarousel
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          style={{ gridArea: "hexperiments" }}
        />

        <NFTCard
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          style={{ gridArea: "hnft" }}
        />

        <IDCard
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          style={{ gridArea: "hidcard" }}
        />

        <LightBoardCard
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 1.0 }}
          style={{ gridArea: "hlightboard" }}
        />
        {/* 
             <Projects
               as={motion.div}
               initial={{ opacity: 0, y: 50 }}
               animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
               transition={{ duration: 0.6, delay: 1.1 }}
               style={{ gridArea: "hprojects" }}
             /> */}

        <LikeCard
          as={motion.div}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.6, delay: 0.0 }}
        />
      </div>
    </div>
  )
}
