import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getInitials(name?: string): string {
  if (!name) return "?"
  const trimmed = name.trim()
  if (!trimmed) return "?"
  const parts = trimmed.split(/\s+/)
  if (parts.length >= 2) {
    const firstInitial = parts[0][0] || ""
    const lastInitial = parts[parts.length - 1][0] || ""
    return (firstInitial + lastInitial).toUpperCase()
  }
  return (trimmed[0] || "?").toUpperCase()
}

