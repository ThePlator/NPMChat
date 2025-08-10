"use client"
import { useEffect } from "react"
import Lenis from "lenis"

export default function SmoothScroll() {
  useEffect(() => {
    // Check if the user has a preference for reduced motion
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches

    // If the user prefers reduced motion, do not initialize Lenis
    if (prefersReducedMotion) {
      return
    }

    // Initialize Lenis for smooth scrolling
    const lenis = new Lenis()
    let frame: number

    function raf(time: number) {
      lenis.raf(time)
      frame = requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      cancelAnimationFrame(frame)
      lenis.destroy()
    }
  }, [])

  return null
}
