"use client"
import React, { createContext, useContext, useState, useEffect } from "react"
import { api, setToken, getToken } from "./fetcher"

export interface User { // CHANGED: Added User interface to replace any
  id?: string;
  _id?: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  status?: "online" | "offline";
  bio?: string;
}

export interface AuthContextType { // CHANGED: Added AuthContextType to replace any
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (data: Record<string, unknown>) => Promise<any>;
  login: (data: Record<string, unknown>) => Promise<any>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  updateProfile: (data: Record<string, unknown>) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null) // CHANGED: Use AuthContextType instead of any
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null) // CHANGED: Use User type instead of any
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const t = getToken()
    if (t) checkAuth()
    else setLoading(false)
  }, [])

  async function signup(data: Record<string, unknown>) { // CHANGED: Replaced any with Record<string, unknown>
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

  async function login(data: Record<string, unknown>) { // CHANGED: Replaced any with Record<string, unknown>
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

  function logout() {
    setUser(null)
    setToken(null)
  }

  async function updateProfile(data: Record<string, unknown>) { // CHANGED: Replaced any with Record<string, unknown>
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
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
