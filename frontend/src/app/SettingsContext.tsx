"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

type TextScale = "small" | "medium" | "large" | "xlarge"

interface SettingsContextType {
  accentColor: string
  setAccentColor: (color: string) => void
  textScale: TextScale
  setTextScale: (scale: TextScale) => void
  highContrast: boolean
  setHighContrast: (enabled: boolean) => void
  reduceMotion: boolean
  setReduceMotion: (enabled: boolean) => void
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [accentColor, setAccentColor] = useState<string>("#39ff14") // Default neon green
  const [textScale, setTextScale] = useState<TextScale>("medium")
  const [highContrast, setHighContrast] = useState<boolean>(false)
  const [reduceMotion, setReduceMotion] = useState<boolean>(false)

  // Load from localStorage on mount
  useEffect(() => {
    const savedAccentColor = localStorage.getItem("npmchat-accent-color")
    const savedTextScale = localStorage.getItem("npmchat-text-scale") as TextScale
    const savedHighContrast = localStorage.getItem("npmchat-high-contrast")
    const savedReduceMotion = localStorage.getItem("npmchat-reduce-motion")

    if (savedAccentColor) setAccentColor(savedAccentColor)
    if (savedTextScale) setTextScale(savedTextScale)
    if (savedHighContrast) setHighContrast(savedHighContrast === "true")
    if (savedReduceMotion) setReduceMotion(savedReduceMotion === "true")
  }, [])

  // Update variables and localStorage on change
  useEffect(() => {
    localStorage.setItem("npmchat-accent-color", accentColor)
    document.documentElement.style.setProperty("--color-neon-green", accentColor)
    document.documentElement.style.setProperty("--neon-green", accentColor)
  }, [accentColor])

  useEffect(() => {
    localStorage.setItem("npmchat-text-scale", textScale)
    document.documentElement.setAttribute("data-text-scale", textScale)
  }, [textScale])

  useEffect(() => {
    localStorage.setItem("npmchat-high-contrast", String(highContrast))
    document.documentElement.setAttribute("data-high-contrast", String(highContrast))
  }, [highContrast])

  useEffect(() => {
    localStorage.setItem("npmchat-reduce-motion", String(reduceMotion))
    document.documentElement.setAttribute("data-reduce-motion", String(reduceMotion))
  }, [reduceMotion])

  return (
    <SettingsContext.Provider
      value={{
        accentColor,
        setAccentColor,
        textScale,
        setTextScale,
        highContrast,
        setHighContrast,
        reduceMotion,
        setReduceMotion,
      }}
    >
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  const context = useContext(SettingsContext)
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider")
  }
  return context
}
