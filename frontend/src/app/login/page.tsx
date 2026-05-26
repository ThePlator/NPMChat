"use client"
import OAuthButtons from '@/components/OAuthButtons'
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthContext"
import { Eye, EyeOff } from "lucide-react"

import ProtectedRoute from "../../components/ProtectedRoute"
import { toast } from "sonner"
import ReCAPTCHA from "react-google-recaptcha"

const accent = "#b39ddb" // pastel purple
const accentGreen = "#39ff14" // neon green

function LoginPageContent() {
  const router = useRouter()
  const { login, error: authError, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ email: "", password: "" })
  const [errors, setErrors] = useState<{ email?: string; password?: string }>(
    {},
  )
  const [loading, setLoading] = useState(false)
  const [hidePassword, setHidePassword] = useState(true)

  // Recaptcha State
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const [captchaToken, setCaptchaToken] = useState<string | null>(
    recaptchaSiteKey ? null : "bypassed",
  )

  function validate() {
    const errs: typeof errors = {}
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      errs.email = "Valid email required"
    if (!form.password) errs.password = "Password required"
    return errs
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (recaptchaSiteKey && !captchaToken) {
      toast.error("Please complete CAPTCHA verification")
      return
    }
    setLoading(true)
    try {
      await login({
        ...form,
        captchaToken,
      })
      toast.success("LoggedIn successful")
      setTimeout(() => {
        router.push("/chat")
      }, 1500)
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Login failed"
      setErrors({ email: message })
      toast.error(message || "Login failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 relative overflow-hidden">
      {/* Floating accent shape */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#39ff14] border-2 border-black -rotate-12 opacity-60 z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm p-8 border-2 border-black bg-card text-foreground flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover"
        style={{ boxShadow: `8px 8px 0 0 ${accentGreen}` }}
      >
        <h1
          className="text-3xl font-extrabold mb-2 text-foreground"
          style={{ letterSpacing: -1 }}
        >
          Welcome Back to <span style={{ color: accent }}>NPMChat</span>
        </h1>
        <label className="flex flex-col gap-1 text-foreground font-bold text-lg">
          Email
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-card/90 dark:bg-input/70 text-foreground focus:bg-input/90 focus:outline-none focus:border-[${accent}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            type="email"
            value={form.email}
            onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            autoComplete="email"
          />
          {errors.email && (
            <span className="text-red-600 text-sm font-normal">
              {errors.email}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1 text-foreground font-bold text-lg relative">
          Password
          <div className="relative w-full">
            <input
              className="border-2 border-black px-4 py-2 text-lg bg-card/90 dark:bg-input/70 text-foreground focus:bg-input/90 focus:outline-none focus:border-[${accentGreen}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer] w-full pr-10"
              type={hidePassword ? "password" : "text"}
              value={form.password}
              onChange={(e) =>
                setForm((f) => ({ ...f, password: e.target.value }))
              }
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setHidePassword(!hidePassword)}
              className="absolute inset-y-0  right-0 pr-3 flex items-center"
              aria-label={hidePassword ? "Show password" : "Hide password"}
            >
              {hidePassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <span className="text-red-600 text-sm font-normal">
              {errors.password}
            </span>
          )}
        </label>
        {recaptchaSiteKey && (
          <div className="flex justify-center">
            <ReCAPTCHA
              sitekey={recaptchaSiteKey}
              onChange={(token: string | null) => setCaptchaToken(token)}
            />
          </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="mt-2 border-2 border-black bg-[#b39ddb] text-black dark:text-white font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#39ff14] hover:text-white focus:outline-none"
          style={{ boxShadow: `4px 4px 0 0 ${accent}` }}
        >
          {loading ? "Logging In..." : "Login"}
        </button>
        <div className="text-center mt-2">
          <Link
            href="/signup"
            className="underline text-foreground font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]"
          >
            Don't have an account? Sign up
          </Link>
        </div>
        <div className="text-center">
          <Link
            href="/forgot-password"
            className="underline text-foreground font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]"
          >
            Forgot password?
          </Link>
        </div>
        <OAuthButtons label="Log in" />
      </form>
      
      {/* Floating accent shape bottom left */}
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#b39ddb] border-2 border-black rotate-12 opacity-50 z-0"></div>
    </main>
  )
}

export default function LoginPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <LoginPageContent />
    </ProtectedRoute>
  )
}
