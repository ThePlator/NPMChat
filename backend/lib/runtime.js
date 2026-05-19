import fs from "fs"

/**
 * Robustly detects if the current environment is Vercel Serverless.
 * @returns {boolean}
 */
export function isVercel() {
  return (
    process.env.VERCEL === "1" ||
    process.env.NOW_REGION !== undefined
  )
}

/**
 * Parses a port string/number safely, falling back to a default value.
 * @param {string|number} val 
 * @param {number} defaultPort 
 * @returns {number}
 */
export function parsePort(val, defaultPort = 8080) {
  const port = parseInt(val, 10)
  if (isNaN(port) || port < 0 || port > 65535) {
    return defaultPort
  }
  return port
}

/**
 * Detects the cloud platform NPMChat is currently running on.
 * @returns {string}
 */
export function getPlatform() {
  if (isVercel()) return "vercel"
  if (process.env.RENDER === "true" || process.env.RENDER) return "render"
  if (process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_STATIC_URL) return "railway"
  if (process.env.FLY_APP_NAME) return "fly.io"
  
  // Detect Docker container
  try {
    if (fs.existsSync("/.dockerenv")) {
      return "docker"
    }
  } catch (e) {
    // Ignore fs errors
  }

  return "local"
}
