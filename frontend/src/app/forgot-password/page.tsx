"use client"
import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import ReCAPTCHA from "react-google-recaptcha"
import { toast } from "sonner"
import ProtectedRoute from "../../components/ProtectedRoute"
import { api } from "../fetcher"

const accent = "#b39ddb"
const accentGreen = "#39ff14"

function ForgotPasswordContent() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      toast.error("Valid email required")
      return
    }
    if (!captchaToken) {
      toast.error("Please complete CAPTCHA verification")
      return
    }

    setLoading(true)
    try {
      await api.post(
        "/forgot-password",
        {
          email,
          captchaToken,
        },
        "auth",
      )
      toast.success("If that email exists, a reset link has been sent.")
      setTimeout(() => router.push("/login"), 1200)
    } catch (err: any) {
      toast.error(err.message || "Request failed. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#39ff14] border-2 border-black -rotate-12 opacity-60 z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm p-8 border-2 border-black bg-card text-foreground flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover"
        style={{ boxShadow: `8px 8px 0 0 ${accentGreen}` }}
      >
        <h1 className="text-3xl font-extrabold mb-2 text-foreground" style={{ letterSpacing: -1 }}>
          Forgot your <span style={{ color: accent }}>password</span>?
        </h1>
        <p className="text-foreground text-sm">
          Enter your account email and we’ll send a reset link.
        </p>

        <label className="flex flex-col gap-1 text-foreground font-bold text-lg">
          Email
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-card/90 dark:bg-input/70 text-foreground focus:bg-input/90 dark:focus:bg-input/90 focus:outline-none transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
          />
        </label>

        <div className="flex justify-center">
          <ReCAPTCHA
            sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
            onChange={(token: string | null) => setCaptchaToken(token)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 border-2 border-black bg-[#b39ddb] text-black dark:text-white font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#39ff14] hover:text-white focus:outline-none"
          style={{ boxShadow: `4px 4px 0 0 ${accent}` }}
        >
          {loading ? "Sending..." : "Send reset link"}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="underline text-foreground font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]"
          >
            Back to login
          </Link>
        </div>
      </form>

      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#b39ddb] border-2 border-black rotate-12 opacity-50 z-0"></div>
    </main>
  )
}

export default function ForgotPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <ForgotPasswordContent />
    </ProtectedRoute>
  )
}

