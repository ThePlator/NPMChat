import { z } from "zod"

const captchaTokenSchema =
  process.env.NODE_ENV === "test"
    ? z.string().optional()
    : z.string().min(1, "CAPTCHA is required")

export const signupSchema = z.object({
  name: z
    .string({ required_error: "Full name is required" })
    .trim()
    .min(2, "Name must be at least 2 characters long"),
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
  avatarUrl: z.string().optional(),
  bio: z.string().optional(),
  captchaToken: captchaTokenSchema,
})

export const loginSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  password: z
    .string({ required_error: "Password is required" }),
  captchaToken: captchaTokenSchema,
})

export const forgotPasswordSchema = z.object({
  email: z
    .string({ required_error: "Email is required" })
    .trim()
    .email("Invalid email address"),
  captchaToken: captchaTokenSchema,
})

export const resetPasswordSchema = z.object({
  token: z.string({ required_error: "Reset token is required" }).trim().min(20),
  password: z
    .string({ required_error: "Password is required" })
    .min(6, "Password must be at least 6 characters long"),
})
