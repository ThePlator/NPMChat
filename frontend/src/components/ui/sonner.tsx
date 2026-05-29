"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, ToasterProps, toast as originalToast } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

const toast = {
  ...originalToast,
  success: (msg: string, data?: any) => {
    if (!(window as any).isFocusMode) return originalToast.success(msg, data)
  },
  info: (msg: string, data?: any) => {
    if (!(window as any).isFocusMode) return originalToast.info(msg, data)
  },
  // We don't mute errors as they might be essential
  error: originalToast.error,
  warning: originalToast.warning,
}

export { Toaster, toast }
