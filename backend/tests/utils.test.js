import { describe, it, expect } from "vitest"
import { generateToken } from "../lib/utils.js"

describe("Utils", () => {
    it("throws an error if no user ID is provided", () => {
        expect(() => generateToken(null)).toThrow("User ID is required to generate a token")
    })

    it("generates a token successfully", () => {
        const token = generateToken("12345")
        expect(typeof token).toBe("string")
        expect(token.length).toBeGreaterThan(10)
    })
})
