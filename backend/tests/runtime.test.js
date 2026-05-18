import assert from "node:assert/strict"
import test from "node:test"

import {
  getRuntimePort,
  isVercelServerless,
  shouldStartHttpServer,
} from "../lib/runtime.js"

test("detects Vercel serverless runtime from env", () => {
  assert.equal(isVercelServerless({ VERCEL: "1" }), true)
  assert.equal(isVercelServerless({ VERCEL: "true" }), true)
  assert.equal(isVercelServerless({ VERCEL: undefined }), false)
})

test("starts HTTP server on persistent WebSocket hosts", () => {
  assert.equal(
    shouldStartHttpServer({ NODE_ENV: "production", PORT: "8080" }),
    true,
  )
  assert.equal(shouldStartHttpServer({ NODE_ENV: "development" }), true)
  assert.equal(shouldStartHttpServer({ VERCEL: "1" }), false)
})

test("normalizes runtime port", () => {
  assert.equal(getRuntimePort({ PORT: "3001" }), 3001)
  assert.equal(getRuntimePort({ PORT: "0" }), 8080)
  assert.equal(getRuntimePort({ PORT: "not-a-number" }), 8080)
  assert.equal(getRuntimePort({}), 8080)
})
