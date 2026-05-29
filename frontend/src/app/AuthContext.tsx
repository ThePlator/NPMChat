"use client"
import React, { createContext, useContext, useState, useEffect, useCallback } from "react"
import { api, setToken } from "./fetcher"

type SessionRestoreCallback = () => void
const sessionRestoreListeners: SessionRestoreCallback[] = []

export function addSessionRestoreListener(cb: SessionRestoreCallback) {
  sessionRestoreListeners.push(cb)
  return () => {
    const idx = sessionRestoreListeners.indexOf(cb)
    if (idx >= 0) sessionRestoreListeners.splice(idx, 1)
  }
}

export interface User {
  id?: string
  _id?: string
  name?: string
  email?: string
  avatarUrl?: string
  status?: "online" | "offline"
  bio?: string
  isGuest?: boolean
  roomId?: string
}

export interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signup: (data: Record<string, unknown>) => Promise<any>
  login: (data: Record<string, unknown>) => Promise<any>
  logout: () => void
  checkAuth: () => Promise<void>
  updateProfile: (data: Record<string, unknown>) => Promise<any>
  guestLogin: (data: Record<string, unknown>) => Promise<any>
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Initial restoration via refresh
    const restoreSession = async () => {
      try {
        const res = await api.post("/refresh", {}, "auth")
        setToken(res.token)
        await checkAuth()
        sessionRestoreListeners.forEach((cb) => cb())
      } catch (e) {
        setLoading(false)
      }
    }
    restoreSession()
  }, [])

  async function signup(data: Record<string, unknown>) {
    setError(null)
    setLoading(true)
    try {
      const res = await api.post("/signup", data, "auth")
      setToken(res.token)
      setUser(res.user)
      setLoading(false)
      return res
    } catch (e: any) {
      setError(e.message || "Signup failed")
      setLoading(false)
      throw e
    }
  }

  async function login(data: Record<string, unknown>) {
    setError(null)
    setLoading(true)
    try {
      const res = await api.post("/login", data, "auth")
      setToken(res.token)
      setUser(res.user)
      setLoading(false)
      return res
    } catch (e: any) {
      setError(e.message || "Login failed")
      setLoading(false)
      throw e
    }
  }

  async function guestLogin(data: Record<string, unknown>) {
    setError(null)
    setLoading(true)
    try {
      const res = await api.post("/guest-login", data, "auth")
      setToken(res.token)
      setUser(res.user)
      setLoading(false)
      return res
    } catch (e: any) {
      setError(e.message || "Guest login failed")
      setLoading(false)
      throw e
    }
  }

  async function checkAuth() {
    setLoading(true)
    try {
      const res = await api.get("/check-auth", "auth")
      setUser(res.user)
    } catch {
      setUser(null)
      setToken(null)
    }
    setLoading(false)
  }

  async function logout() {
    try {
      await api.post("/logout", {}, "auth")
    } catch (e) {
      console.error("Logout error", e)
    } finally {
      setUser(null)
      setToken(null)
    }
  }

  async function updateProfile(data: Record<string, unknown>) {
    setLoading(true)
    try {
      const res = await api.put("/update-profile", data, "auth")
      setUser(res.user)
      setLoading(false)
      return res
    } catch (e: any) {
      setError(e.message || "Update failed")
      setLoading(false)
      throw e
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        signup,
        login,
        logout,
        checkAuth,
        updateProfile,
        guestLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
