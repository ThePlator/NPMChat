const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"

if (!process.env.NEXT_PUBLIC_API_URL && process.env.NODE_ENV === "production") {
  console.error(
    "[NPMChat] WARNING: NEXT_PUBLIC_API_URL is not set. " +
      "All API calls will target http://localhost:8080, which will fail in production. " +
      "Set NEXT_PUBLIC_API_URL to your backend URL.",
  )
}

const BASES = {
  auth: process.env.NEXT_PUBLIC_AUTH_API_BASE || `${API_URL}/api/v1/auth`,
  messages:
    process.env.NEXT_PUBLIC_MESSAGES_API_BASE || `${API_URL}/api/v1/messages`,
  v1: `${API_URL}/api/v1`,
}

let token: string | null = null
type RefreshListener = (newToken: string) => void
const listeners: RefreshListener[] = []

export function addTokenRefreshListener(cb: RefreshListener) {
  listeners.push(cb)
}

export function setToken(newToken: string | null) {
  token = newToken
  if (newToken) {
    listeners.forEach((cb) => cb(newToken))
  }
}

export function getToken() {
  return token
}

// Singleton promise for handling multiple concurrent refresh triggers
let refreshPromise: Promise<string | null> | null = null

export async function fetcher(
  path: string,
  options: RequestInit = {},
  base: "auth" | "messages" | "v1" = "messages",
  isRetry = false,
): Promise<any> {
  const headers: any = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  }

  const t = getToken()
  if (t) headers["Authorization"] = `Bearer ${t}`

  // Always include credentials for cookies (refresh token)
  const fetchOptions: RequestInit = {
    ...options,
    headers,
    credentials: "include",
  }

  const res = await fetch(`${BASES[base]}${path}`, fetchOptions)

  let data
  try {
    data = await res.json()
  } catch {
    data = {}
  }

  if (!res.ok) {
    // If token expired, try to refresh
    if (
      res.status === 401 &&
      data.code === "TOKEN_EXPIRED" &&
      !isRetry &&
      !(base === "auth" && path === "/refresh")
    ) {
      if (!refreshPromise) {
        refreshPromise = (async () => {
          try {
            const refreshRes = await fetch(`${BASES.auth}/refresh`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
            })

            if (refreshRes.ok) {
              const refreshData = await refreshRes.json()
              const newToken = refreshData.token
              setToken(newToken)
              return newToken
            }
            return null
          } catch (refreshErr) {
            console.error("Token refresh failed", refreshErr)
            return null
          } finally {
            refreshPromise = null
          }
        })()
      }

      const refreshedToken = await refreshPromise
      if (refreshedToken) {
        // Retry original request with NEW token
        return fetcher(path, options, base, true)
      }
    }

    const errorMsg = data?.message || res.statusText || "API Error"
    const error = new Error(errorMsg)
    ;(error as any).data = data
    ;(error as any).status = res.status
    throw error
  }
  return data
}

export const api = {
  get: (path: string, base: "auth" | "messages" = "messages") =>
    fetcher(path, { method: "GET" }, base),
  post: (path: string, body?: any, base: "auth" | "messages" = "messages") =>
    fetcher(path, { method: "POST", body: JSON.stringify(body) }, base),
  put: (path: string, body?: any, base: "auth" | "messages" = "messages") =>
    fetcher(path, { method: "PUT", body: JSON.stringify(body) }, base),
  delete: (path: string, base: "auth" | "messages" = "messages") =>
    fetcher(path, { method: "DELETE" }, base),
}
