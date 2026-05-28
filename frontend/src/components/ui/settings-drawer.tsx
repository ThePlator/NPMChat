"use client"

import React, { useState } from "react"
import { useSettings } from "@/app/SettingsContext"
import { useTheme } from "next-themes"
import { X } from "lucide-react"

export function SettingsDrawer({
  isOpen,
  onClose,
}: {
  isOpen: boolean
  onClose: () => void
}) {
  const { theme, setTheme } = useTheme()
  const {
    accentColor,
    setAccentColor,
    textScale,
    setTextScale,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
  } = useSettings()

  const developerThemes = [
    { value: "light", label: "Light" },
    { value: "dark", label: "Dark" },
    { value: "dracula", label: "Dracula" },
    { value: "nord", label: "Nord" },
    { value: "synthwave", label: "Synthwave / Cyberpunk" },
    { value: "github-light", label: "Github Light" },
    { value: "github-dark", label: "Github Dark" },
  ]

  const textScales = [
    { value: "small", label: "Small" },
    { value: "medium", label: "Medium" },
    { value: "large", label: "Large" },
    { value: "xlarge", label: "Extra Large" },
  ]

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-background border-l-2 border-sidebar-border shadow-2xl z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        } flex flex-col`}
        role="dialog"
        aria-label="Settings Drawer"
        aria-expanded={isOpen}
      >
        <div className="flex items-center justify-between p-4 border-b-2 border-sidebar-border bg-card">
          <h2 className="text-xl font-bold text-foreground">Settings</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Theme Selector */}
          <div className="space-y-2">
            <label htmlFor="theme-select" className="block text-sm font-bold text-foreground">
              Developer Theme
            </label>
            <select
              id="theme-select"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full p-2 border-2 border-sidebar-border rounded-md bg-input text-foreground focus:outline-none focus:border-ring"
              aria-label="Select theme"
            >
              {developerThemes.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Accent Color */}
          <div className="space-y-2">
            <label htmlFor="accent-color" className="block text-sm font-bold text-foreground">
              Primary Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                id="accent-color"
                value={accentColor}
                onChange={(e) => setAccentColor(e.target.value)}
                className="w-10 h-10 p-0 border-2 border-sidebar-border rounded-md cursor-pointer"
                aria-label="Choose accent color"
              />
              <span className="text-sm font-mono text-muted-foreground">{accentColor}</span>
            </div>
          </div>

          <div className="border-t-2 border-sidebar-border my-4" />

          <h3 className="text-lg font-bold text-foreground">Accessibility (a11y)</h3>

          {/* Text Scale */}
          <div className="space-y-2">
            <label htmlFor="text-scale" className="block text-sm font-bold text-foreground">
              Text Scale
            </label>
            <input
              type="range"
              id="text-scale"
              min="0"
              max="3"
              step="1"
              value={textScales.findIndex((s) => s.value === textScale)}
              onChange={(e) => setTextScale(textScales[parseInt(e.target.value)].value as any)}
              className="w-full accent-primary"
              aria-label="Adjust text scale"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-1">
              {textScales.map((s) => (
                <span key={s.value}>{s.label}</span>
              ))}
            </div>
          </div>

          {/* High Contrast Mode */}
          <div className="flex items-center justify-between">
            <label htmlFor="high-contrast" className="text-sm font-bold text-foreground">
              High Contrast Mode
            </label>
            <input
              type="checkbox"
              id="high-contrast"
              checked={highContrast}
              onChange={(e) => setHighContrast(e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer border-2 border-sidebar-border rounded"
              aria-label="Toggle high contrast mode"
            />
          </div>

          {/* Reduce Motion */}
          <div className="flex items-center justify-between">
            <label htmlFor="reduce-motion" className="text-sm font-bold text-foreground">
              Reduce Motion
            </label>
            <input
              type="checkbox"
              id="reduce-motion"
              checked={reduceMotion}
              onChange={(e) => setReduceMotion(e.target.checked)}
              className="w-5 h-5 accent-primary cursor-pointer border-2 border-sidebar-border rounded"
              aria-label="Toggle reduce motion"
            />
          </div>
        </div>
      </div>
    </>
  )
}
