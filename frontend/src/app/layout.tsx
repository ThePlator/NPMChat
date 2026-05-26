import "./globals.css"
import type { Metadata } from "next"
import { AuthProvider } from "./AuthContext"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import SmoothScroll from "@/components/SmoothScroll" // Import the new component
import { SettingsProvider } from "./SettingsContext"

export const metadata: Metadata = {
  title: "NPMChat",
  description: "A neo-brutalist chat app",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <SmoothScroll />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          themes={['light', 'dark', 'dracula', 'nord', 'synthwave', 'github-light', 'github-dark']}
        >
          <SettingsProvider>
            <AuthProvider>{children}</AuthProvider>
            <Toaster richColors />
          </SettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
