"use client"

import React, { useEffect, useRef, useState } from "react"
import { useMotionValueEvent } from "motion/react"

interface ImageSequenceProps {
  progress: any // MotionValue<number>
  imageUrls: string[]
  className?: string
}

export function ImageSequence({ progress, imageUrls, className }: ImageSequenceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const [imagesLoaded, setImagesLoaded] = useState(false)

  // Preload images
  useEffect(() => {
    let loadedCount = 0
    const images: HTMLImageElement[] = []

    imageUrls.forEach((url, i) => {
      const img = new Image()
      img.src = url
      img.onload = () => {
        loadedCount++
        if (loadedCount === imageUrls.length) {
          setImagesLoaded(true)
        }
      }
      images[i] = img
    })

    imagesRef.current = images
  }, [imageUrls])

  const imgAspectRef = useRef<number | null>(null)

  const renderFrame = (index: number) => {
    const canvas = canvasRef.current
    if (!canvas || !imagesLoaded || !imagesRef.current[index]) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = imagesRef.current[index]
    
    // Cache image aspect ratio if not already cached
    if (imgAspectRef.current === null && img.width > 0) {
      imgAspectRef.current = img.width / img.height
    }
    
    const imgAspect = imgAspectRef.current || img.width / img.height
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    // Draw image (cover style)
    const canvasAspect = canvas.width / canvas.height
    
    let drawWidth, drawHeight, drawX, drawY

    if (canvasAspect > imgAspect) {
      drawWidth = canvas.width
      drawHeight = canvas.width / imgAspect
      drawX = 0
      drawY = (canvas.height - drawHeight) / 2
    } else {
      drawWidth = canvas.height * imgAspect
      drawHeight = canvas.height
      drawX = (canvas.width - drawWidth) / 2
      drawY = 0
    }

    ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight)
  }

  // Handle resizing
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = canvasRef.current.offsetWidth * window.devicePixelRatio
        canvasRef.current.height = canvasRef.current.offsetHeight * window.devicePixelRatio
        // Re-render current frame on resize
        const currentIndex = Math.floor(progress.get() * (imageUrls.length - 1))
        renderFrame(currentIndex)
      }
    }

    window.addEventListener("resize", handleResize)
    handleResize()
    return () => window.removeEventListener("resize", handleResize)
  }, [imagesLoaded, progress, imageUrls.length])

  const lastIndexRef = useRef<number>(-1)
  const requestRef = useRef<number>(null)

  // Update frame on scroll
  useMotionValueEvent(progress, "change", (latest: number) => {
    const index = Math.floor(latest * (imageUrls.length - 1))
    
    if (index !== lastIndexRef.current) {
      lastIndexRef.current = index
      
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
      
      requestRef.current = requestAnimationFrame(() => {
        renderFrame(index)
      })
    }
  })

  // Initial render once loaded
  useEffect(() => {
    if (imagesLoaded) {
      renderFrame(0)
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [imagesLoaded])

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
      }}
    />
  )
}
