import { describe, it, expect, vi, afterEach } from "vitest"
import mongoose from "mongoose"
import { connectDB } from "../lib/db.js"

describe("Database Connection", () => {
    afterEach(() => {
        vi.restoreAllMocks()
    })

    it("connects successfully", async () => {
        vi.spyOn(mongoose, "connect").mockResolvedValueOnce(true)
        vi.spyOn(console, "log").mockImplementation(() => {})
        await connectDB()
        expect(console.log).toHaveBeenCalledWith("MongoDB connected successfully")
    })

    it("handles connection failure", async () => {
        vi.spyOn(mongoose, "connect").mockRejectedValueOnce(new Error("Connection Failed"))
        vi.spyOn(console, "error").mockImplementation(() => {})
        vi.spyOn(process, "exit").mockImplementation(() => {})
        
        await connectDB()
        expect(console.error).toHaveBeenCalledWith("MongoDB connection failed:", expect.any(Error))
    })
})
