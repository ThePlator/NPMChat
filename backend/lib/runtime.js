import fs from "fs"

export function isVercel() {
  return process.env.VERCEL === "1" || process.env.NOW_REGION !== undefined
}

export function parsePort(val, defaultPort = 8080) {
  const port = parseInt(val, 10)
  if (isNaN(port) || port < 0 || port > 65535) return defaultPort
  return port
}

export function getPlatform() {
  if (isVercel()) return "vercel"
  if (process.env.RENDER === "true" || process.env.RENDER) return "render"
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL) return "railway"
  if (process.env.FLY_APP_NAME) return "fly.io"
  try {
    if (fs.existsSync("/.dockerenv")) return "docker"
  } catch (e) {}
  return "local"
}