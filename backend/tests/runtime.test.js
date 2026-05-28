import { describe, it, expect, vi, afterEach } from "vitest"
import { isVercel, parsePort, getPlatform } from "../lib/runtime.js"
import fs from "fs"

describe("Runtime Logic", () => {
    afterEach(() => {
        vi.unstubAllEnvs()
        vi.restoreAllMocks()
    })

    describe("isVercel", () => {
        it("returns true if VERCEL is '1'", () => {
            vi.stubEnv("VERCEL", "1")
            expect(isVercel()).toBe(true)
        })

        it("returns false if not vercel", () => {
            vi.stubEnv("VERCEL", "0")
            vi.stubEnv("NOW_REGION", undefined)
            expect(isVercel()).toBe(false)
        })
    })

    describe("parsePort", () => {
        it("returns parsed valid port", () => {
            expect(parsePort("3000")).toBe(3000)
        })

        it("returns default if invalid", () => {
            expect(parsePort("invalid")).toBe(8080)
            expect(parsePort("-1")).toBe(8080)
        })
    })

    describe("getPlatform", () => {
        it("returns vercel if isVercel", () => {
            vi.stubEnv("VERCEL", "1")
            expect(getPlatform()).toBe("vercel")
        })

        it("returns render if RENDER is true", () => {
            vi.stubEnv("VERCEL", "0")
            vi.stubEnv("RENDER", "true")
            expect(getPlatform()).toBe("render")
        })
        
        it("returns railway if RAILWAY_ENVIRONMENT", () => {
            vi.stubEnv("VERCEL", "0")
            vi.stubEnv("RAILWAY_ENVIRONMENT", "production")
            expect(getPlatform()).toBe("railway")
        })

        it("returns fly.io if FLY_APP_NAME", () => {
            vi.stubEnv("VERCEL", "0")
            vi.stubEnv("FLY_APP_NAME", "npmchat")
            expect(getPlatform()).toBe("fly.io")
        })

        it("returns docker if /.dockerenv exists", () => {
            vi.stubEnv("VERCEL", "0")
            vi.spyOn(fs, "existsSync").mockReturnValue(true)
            expect(getPlatform()).toBe("docker")
        })

        it("returns local otherwise", () => {
            vi.stubEnv("VERCEL", "0")
            vi.spyOn(fs, "existsSync").mockReturnValue(false)
            expect(getPlatform()).toBe("local")
        })
    })
})
