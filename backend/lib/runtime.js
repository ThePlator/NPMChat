import fs from "fs"

export function isVercel(env = process.env) {
  return env.VERCEL === "1" || env.VERCEL === "true" || env.NOW_REGION !== undefined
}

export const isVercelServerless = isVercel

export function shouldStartHttpServer(env = process.env) {
  return !isVercel(env)
}

export function parsePort(value, defaultPort = 8080) {
  const port = Number.parseInt(value, 10)
  return Number.isFinite(port) && port > 0 && port <= 65535 ? port : defaultPort
}

export function getRuntimePort(env = process.env) {
  return parsePort(env.PORT, 8080)
}

export function getPlatform(env = process.env) {
  if (isVercel(env)) return "vercel"
  if (env.RENDER === "true" || env.RENDER) return "render"
  if (env.RAILWAY_ENVIRONMENT || env.RAILWAY_STATIC_URL) return "railway"
  if (env.FLY_APP_NAME) return "fly.io"

  try {
    if (fs.existsSync("/.dockerenv")) return "docker"
  } catch {
    // Ignore filesystem probe failures and fall back to local runtime.
  }

  return "local"
}
