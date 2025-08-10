"use client"
import { useEffect } from "react"
import Lenis from "lenis"

export default function SmoothScroll() {
  useEffect(() => {
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

  return null // This component doesn't render anything visible
}
