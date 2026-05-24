"use client"
import React, { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import ProtectedRoute from "../../components/ProtectedRoute"
import { api } from "../fetcher"
import { Eye, EyeOff } from "lucide-react"

const accent = "#b39ddb"
const accentGreen = "#39ff14"

function ResetPasswordContent() {
  const router = useRouter()
  const params = useSearchParams()
  const token = useMemo(() => params.get("token") || "", [params])

  const [form, setForm] = useState({ password: "", confirm: "" })
  const [loading, setLoading] = useState(false)
  const [hidePassword, setHidePassword] = useState(true)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      toast.error("Missing reset token.")
      return
    }
    if (!form.password || form.password.length < 6) {
      toast.error("Password must be at least 6 characters long.")
      return
    }
    if (form.password !== form.confirm) {
      toast.error("Passwords do not match.")
      return
    }

    setLoading(true)
    try {
      await api.post(
        "/reset-password",
        { token, password: form.password },
        "auth",
      )
      toast.success("Password reset successful. Please log in.")
      setTimeout(() => router.push("/login"), 1200)
    } catch (err: any) {
      toast.error(err.message || "Reset failed. Please request a new link.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 relative overflow-hidden">
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-[#39ff14] border-2 border-black -rotate-12 opacity-60 z-0"></div>

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-sm p-8 border-2 border-black bg-white flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover"
        style={{ boxShadow: `8px 8px 0 0 ${accentGreen}` }}
      >
        <h1 className="text-3xl font-extrabold mb-2 text-black" style={{ letterSpacing: -1 }}>
          Reset <span style={{ color: accent }}>password</span>
        </h1>

        <label className="flex flex-col gap-1 text-black font-bold text-lg relative">
          New Password
          <div className="relative w-full">
            <input
              className="border-2 border-black px-4 py-2 text-lg bg-[#eaffea] focus:bg-[#39ff14]/40 focus:outline-none transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer] w-full pr-10"
              type={hidePassword ? "password" : "text"}
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={() => setHidePassword(!hidePassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
              aria-label={hidePassword ? "Show password" : "Hide password"}
            >
              {hidePassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
        </label>

        <label className="flex flex-col gap-1 text-black font-bold text-lg">
          Confirm Password
          <input
            className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
            type={hidePassword ? "password" : "text"}
            value={form.confirm}
            onChange={(e) => setForm((f) => ({ ...f, confirm: e.target.value }))}
            autoComplete="new-password"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-2 border-2 border-black bg-[#b39ddb] text-black font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#39ff14] hover:text-white focus:outline-none"
          style={{ boxShadow: `4px 4px 0 0 ${accent}` }}
        >
          {loading ? "Resetting..." : "Reset password"}
        </button>

        <div className="text-center">
          <Link
            href="/login"
            className="underline text-black font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]"
          >
            Back to login
          </Link>
        </div>
      </form>

      <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#b39ddb] border-2 border-black rotate-12 opacity-50 z-0"></div>
    </main>
  )
}

export default function ResetPasswordPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <ResetPasswordContent />
    </ProtectedRoute>
  )
}

