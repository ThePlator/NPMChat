"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "../app/AuthContext"

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean // true = requires auth, false = requires no auth
}

export default function ProtectedRoute({
  children,
  requireAuth = false,
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (requireAuth && !user) {
        // User needs to be authenticated but isn't
        router.push("/login")
      } else if (!requireAuth && user) {
        // User is authenticated but shouldn't be on this page (login/signup)
        router.push("/chat")
      }
    }
  }, [user, loading, requireAuth, router])

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20">
        <div className="border-2 border-black bg-white p-8 brutal-shadow">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-[#b39ddb] border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="font-bold text-black">Loading...</p>
          </div>
        </div>
      </div>
    )
  }

  // Don't render children if user should be redirected
  if (requireAuth && !user) {
    return null // Will redirect to login
  }

  if (!requireAuth && user) {
    return null // Will redirect to chat
  }

  return <>{children}</>
}
