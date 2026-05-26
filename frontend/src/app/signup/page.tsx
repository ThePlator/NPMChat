"use client"
import React, { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "../AuthContext"
import ProtectedRoute from "../../components/ProtectedRoute"
import zxcvbn from "zxcvbn"
import { toast } from "sonner"
import OAuthButtons from '@/components/OAuthButtons'
import { Eye, EyeOff, ArrowLeft } from "lucide-react"
import ReCAPTCHA from "react-google-recaptcha"
import { api } from "../fetcher"
import OTPInput from "../../components/OTPInput"

const accent = "#b39ddb" // pastel purple
const accentGreen = "#39ff14" // neon green

function SignupPageContent() {
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number
    feedback: string
  }>({ score: 0, feedback: "" })

  const router = useRouter()
  const { signup, error: authError, loading: authLoading } = useAuth()
  const [form, setForm] = useState({ name: "", email: "", password: "" })
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    name?: string
  }>({})
  
  // OTP Verification States
  const [step, setStep] = useState(1) // 1 = Details, 2 = OTP Entry
  const [otpValue, setOtpValue] = useState("")
  const [cooldown, setCooldown] = useState(0)
  const [sendingOtp, setSendingOtp] = useState(false)
  const [verifyingOtp, setVerifyingOtp] = useState(false)
  const [hidePassword, setHidePassword] = useState(true)

  // Recatcha state
  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY
  const [captchaToken, setCaptchaToken] = useState<string | null>(
    recaptchaSiteKey ? null : "bypassed",
  )

  // Handle Resend Cooldown Countdown
  useEffect(() => {
    if (cooldown === 0) return
    const interval = setInterval(() => {
      setCooldown((prev) => prev - 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [cooldown])

  function validate() {
    const errs: typeof errors = {}
    if (!form.name.trim()) errs.name = "Full name required"
    if (!form.email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email))
      errs.email = "Valid email required"
    if (!form.password || form.password.length < 6)
      errs.password = "Password must be at least 6 characters"
    return errs
  }

  async function handleRequestOtp(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    setErrors(errs)
    if (Object.keys(errs).length) return
    if (recaptchaSiteKey && !captchaToken) {
      toast.error("Please complete CAPTCHA verification")
      return
    }

    setSendingOtp(true)
    try {
      await api.post("/send-otp", { email: form.email, captchaToken }, "auth")
      toast.success("OTP verification code sent to your email!")
      setStep(2)
      setCooldown(60) // Start 60-second cooldown
    } catch (err: any) {
      setErrors({ email: err.message || "Failed to send OTP" })
      toast.error(err.message || "Failed to send OTP. Please try again.")
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleResendOtp() {
    if (cooldown > 0 || sendingOtp) return
    setSendingOtp(true)
    try {
      // reCAPTCHA is bypassed on resend if an OTP already exists in the backend
      await api.post("/send-otp", { email: form.email }, "auth")
      toast.success("A new verification code has been sent!")
      setCooldown(60)
      setOtpValue("")
    } catch (err: any) {
      toast.error(err.message || "Failed to resend OTP.")
    } finally {
      setSendingOtp(false)
    }
  }

  async function handleVerifyAndSignup(e: React.FormEvent) {
    e.preventDefault()
    if (otpValue.length !== 6) {
      toast.error("Please enter the 6-digit verification code.")
      return
    }

    setVerifyingOtp(true)
    try {
      // 1. Verify OTP with the backend to obtain an emailVerificationToken
      const verifyRes = await api.post("/verify-otp", { email: form.email, otp: otpValue }, "auth")
      const { emailVerificationToken } = verifyRes

      // 2. Finalize account creation
      await signup({
        ...form,
        emailVerificationToken,
      })

      toast.success("Account created successfully!")
      setTimeout(() => {
        router.push("/chat")
      }, 1500)
    } catch (err: any) {
      toast.error(err.message || "Verification failed. Please check the code and try again.")
    } finally {
      setVerifyingOtp(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 relative overflow-hidden">
      {/* Floating accent shape */}
      <div className="absolute -top-10 -left-10 w-40 h-40 bg-[#b39ddb] border-2 border-black rotate-12 opacity-60 z-0"></div>

      {step === 1 ? (
        <form
          onSubmit={handleRequestOtp}
          className="relative z-10 w-full max-w-sm p-8 border-2 border-black bg-white flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover"
          style={{ boxShadow: `8px 8px 0 0 ${accent}` }}
        >
          <h1
            className="text-3xl font-extrabold mb-2 text-black"
            style={{ letterSpacing: -1 }}
          >
            Create Your <span style={{ color: accent }}>NPMChat</span> Account
          </h1>
          <label className="flex flex-col gap-1 text-black font-bold text-lg">
            Full Name
            <input
              className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none focus:border-[${accent}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              autoComplete="name"
              required
            />
            {errors.name && (
              <span className="text-red-600 text-sm font-normal">
                {errors.name}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-black font-bold text-lg">
            Email
            <input
              className="border-2 border-black px-4 py-2 text-lg bg-[#f3e8ff] focus:bg-[#b39ddb]/60 focus:outline-none focus:border-[${accent}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer]"
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              autoComplete="email"
              required
            />
            {errors.email && (
              <span className="text-red-600 text-sm font-normal">
                {errors.email}
              </span>
            )}
          </label>
          <label className="flex flex-col gap-1 text-black font-bold text-lg relative">
            Password
            <div className="relative w-full">
              <input
                className="border-2 border-black px-4 py-2 text-lg bg-[#eaffea] focus:bg-[#39ff14]/40 focus:outline-none focus:border-[${accentGreen}] transition-all cursor-[url('/custom-cursor-arrow.svg'),_pointer] w-full pr-10"
                type={hidePassword ? "password" : "text"}
                value={form.password}
                onChange={(e) => {
                  const password = e.target.value
                  setForm((f) => ({ ...f, password }))
                  const result = zxcvbn(password)
                  setPasswordStrength({
                    score: result.score,
                    feedback: result.feedback.suggestions[0] || "",
                  })
                }}
                autoComplete="new-password"
                required
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
            {form.password && (
              <div className="mt-1 text-sm font-bold">
                <div
                  className={`h-2 rounded-sm transition-all`}
                  style={{
                    width: `${(passwordStrength.score + 1) * 20}%`,
                    backgroundColor:
                      passwordStrength.score < 2
                        ? "red"
                        : passwordStrength.score === 2
                          ? "orange"
                          : passwordStrength.score === 3
                            ? "#ffd700"
                            : "green",
                  }}
                />
                <div className="mt-1 text-black">
                  Strength:{" "}
                  {
                    ["Too Weak", "Weak", "Fair", "Good", "Strong"][
                    passwordStrength.score
                    ]
                  }
                </div>
                {passwordStrength.feedback && (
                  <div className="text-xs text-gray-600 mt-1">
                    {passwordStrength.feedback}
                  </div>
                )}
              </div>
            )}
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
                onChange={(token: string | null) =>
                  setCaptchaToken(token)
                }
              />
            </div>
          )}
<button
            type="submit"
            disabled={sendingOtp}
            className="mt-2 border-2 border-black bg-[#39ff14] text-black font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#b39ddb] hover:text-white focus:outline-none"
            style={{ boxShadow: `4px 4px 0 0 ${accentGreen}` }}
          >
            {sendingOtp ? "Requesting OTP..." : "Verify Email"}
          </button>
          <div className="text-center mt-2">
            <Link
              href="/login"
              className="underline text-black font-bold cursor-[url('/custom-cursor-click.svg'),_pointer] hover:text-[${accent}]"
            >
              Already have an account? Login
            </Link>
          </div>
          <OAuthButtons label="Sign up" />
        </form>
      ) : (
        <form
          onSubmit={handleVerifyAndSignup}
          className="relative z-10 w-full max-w-sm p-8 border-2 border-black bg-white flex flex-col gap-6 shadow-lg brutal-shadow hover:brutal-shadow-hover"
          style={{ boxShadow: `8px 8px 0 0 ${accent}` }}
        >
          <div>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm font-bold text-black hover:text-[#b39ddb] mb-4 cursor-[url('/custom-cursor-click.svg'),_pointer]"
            >
              <ArrowLeft className="w-4 h-4" /> Edit Details
            </button>
            <h1
              className="text-3xl font-extrabold mb-2 text-black"
              style={{ letterSpacing: -1 }}
            >
              Enter <span style={{ color: accent }}>OTP Code</span>
            </h1>
            <p className="text-sm font-bold text-gray-700 mt-2">
              We've sent a 6-digit verification code to <span className="underline text-black">{form.email}</span>.
            </p>
          </div>

          <div className="py-4">
            <OTPInput value={otpValue} onChange={setOtpValue} />
          </div>

          <div className="flex flex-col gap-2">
            <button
              type="submit"
              disabled={verifyingOtp || otpValue.length !== 6}
              className="border-2 border-black bg-[#39ff14] text-black font-extrabold text-lg py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-[#b39ddb] hover:text-white focus:outline-none disabled:opacity-50"
              style={{ boxShadow: `4px 4px 0 0 ${accentGreen}` }}
            >
              {verifyingOtp ? "Creating Account..." : "Verify & Sign Up"}
            </button>

            <button
              type="button"
              disabled={cooldown > 0 || sendingOtp}
              onClick={handleResendOtp}
              className="border-2 border-black bg-white text-black font-bold text-sm py-2 rounded-none transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] hover:bg-gray-100 focus:outline-none disabled:opacity-60"
            >
              {sendingOtp ? "Resending..." : cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Verification Code"}
            </button>
          </div>
        </form>
      )}

      {/* Floating accent shape bottom right */}
      <div className="absolute bottom-0 right-0 w-32 h-32 bg-[#39ff14] border-2 border-black -rotate-12 opacity-50 z-0"></div>
    </main>
  )
}

export default function SignupPage() {
  return (
    <ProtectedRoute requireAuth={false}>
      <SignupPageContent />
    </ProtectedRoute>
  )
}
