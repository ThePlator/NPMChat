import nodemailer from "nodemailer"

function missingSmtpConfig() {
  return !process.env.SMTP_HOST || !process.env.SMTP_PORT || !process.env.SMTP_USER || !process.env.SMTP_PASS
}

export function createTransporter() {
  if (missingSmtpConfig()) return null

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
}

export async function sendPasswordResetEmail({ to, resetUrl }) {
  const transporter = createTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("[mailer] SMTP not configured. Password reset link:", resetUrl)
    }
    return
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await transporter.sendMail({
    from,
    to,
    subject: "Reset your NPMChat password",
    text: `Reset your password using this link (expires soon): ${resetUrl}`,
    html: `<p>Click the link below to reset your password (expires soon):</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
  })
}

export async function sendOTPEmail(to, otp) {
  const transporter = createTransporter()

  if (!transporter) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[mailer] SMTP not configured. OTP for ${to}: ${otp}`)
    }
    return { devMode: true }
  }

  const from = process.env.SMTP_FROM || process.env.SMTP_USER
  await transporter.sendMail({
    from,
    to,
    subject: "Verify your email - NPMChat",
    text: `Your OTP for NPMChat signup is: ${otp}. It will expire in 5 minutes.`,
    html: `<p>Your OTP for NPMChat signup is: <strong>${otp}</strong>. It will expire in 5 minutes.</p>`,
  })
  return { devMode: false }
}

