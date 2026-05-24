import nodemailer from "nodemailer"

export async function sendOTPEmail(email, otp) {
  const host = process.env.SMTP_HOST
  const port = parseInt(process.env.SMTP_PORT || "587", 10)
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  const from = process.env.SMTP_FROM || '"NPMChat" <noreply@npmchat.com>'

  // Fallback to console log if SMTP settings are missing
  if (!host || !user || !pass) {
    console.log("\n========================================")
    console.log(`[DEV MODE] OTP for ${email}: ${otp}`)
    console.log("========================================\n")
    return {
      success: true,
      devMode: true,
      message: "OTP logged to backend console (dev fallback).",
    }
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  })

  const mailOptions = {
    from,
    to: email,
    subject: "Verify Your Email - NPMChat",
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 2px solid black; padding: 20px; box-shadow: 4px 4px 0 0 #b39ddb; background: white;">
        <h2 style="color: black; margin-top: 0; font-size: 24px; font-weight: 800;">Verify Your Email Address</h2>
        <p style="font-size: 16px; color: #333;">Thank you for registering at NPMChat! Use the following One-Time Password (OTP) to complete your signup process. This OTP is valid for 5 minutes.</p>
        <div style="background: #f3e8ff; border: 2px solid black; padding: 15px; text-align: center; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: 800; letter-spacing: 5px; color: black;">${otp}</span>
        </div>
        <p style="font-size: 14px; color: #666; margin-bottom: 0;">If you didn't request this email, you can safely ignore it.</p>
      </div>
    `,
  }

  await transporter.sendMail(mailOptions)
  return { success: true, devMode: false }
}
