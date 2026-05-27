"use client"
import React, { useRef, useEffect } from "react"

interface OTPInputProps {
  value: string
  onChange: (value: string) => void
}

export default function OTPInput({ value, onChange }: OTPInputProps) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value.replace(/[^0-9]/g, "")
    
    const newValue = value.split("")
    newValue[index] = val ? val.substring(val.length - 1) : ""
    const finalValue = newValue.join("")
    onChange(finalValue)

    // Focus next input if a digit was entered
    if (val && index < 5) {
      inputsRef.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === "Backspace") {
      e.preventDefault()
      const newValue = value.split("")
      
      // If current box is not empty, clear it
      if (newValue[index]) {
        newValue[index] = ""
        onChange(newValue.join(""))
      } else if (index > 0) {
        // If current box is empty, go to previous and clear it
        newValue[index - 1] = ""
        onChange(newValue.join(""))
        inputsRef.current[index - 1]?.focus()
      }
    }
  }

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    const pastedText = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6)
    if (pastedText.length === 6) {
      onChange(pastedText)
      inputsRef.current[5]?.focus()
    }
  }

  // Auto focus first field on mount
  useEffect(() => {
    inputsRef.current[0]?.focus()
  }, [])

  return (
    <div className="flex justify-center gap-2 max-w-xs mx-auto">
      {Array.from({ length: 6 }).map((_, index) => {
        const val = value[index] || ""
        return (
          <input
            key={index}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={val}
            ref={(el) => {
              inputsRef.current[index] = el
            }}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className="w-11 h-14 border-2 border-black text-center text-2xl font-extrabold bg-card/90 dark:bg-input/70 text-foreground focus:bg-input/90 focus:outline-none transition-all focus:ring-0 cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            style={{
              boxShadow: "3px 3px 0 0 rgba(0, 0, 0, 1)"
            }}
          />
        )
      })}
    </div>
  )
}
