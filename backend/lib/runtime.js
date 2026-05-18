export const isVercelServerless = (env = process.env) =>
  env.VERCEL === "1" || env.VERCEL === "true"

export const shouldStartHttpServer = (env = process.env) =>
  !isVercelServerless(env)

export const getRuntimePort = (env = process.env) => {
  const parsedPort = Number.parseInt(env.PORT, 10)
  return Number.isFinite(parsedPort) && parsedPort > 0 ? parsedPort : 8080
}
