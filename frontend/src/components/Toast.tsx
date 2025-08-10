"use client"
import React, { useState, useEffect } from "react"

interface ToastProps {
  message: string
  type: "success" | "error"
  isVisible: boolean
  onClose: () => void
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  if (!isVisible) return null

  const bgColor = type === "success" ? "bg-green-500" : "bg-red-500"
  const borderColor = type === "success" ? "border-green-600" : "border-red-600"

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div
        className={`${bgColor} ${borderColor} border-2 border-black text-white px-6 py-3 rounded-none shadow-lg brutal-shadow`}
      >
        <div className="flex items-center gap-2">
          <span className="font-bold">{type === "success" ? "✓" : "✗"}</span>
          <span className="font-semibold">{message}</span>
        </div>
      </div>
    </div>
  )
}
