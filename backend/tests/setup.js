import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"
import { beforeAll, afterAll, afterEach, vi } from "vitest"

let mongoServer

// Ensure a test JWT_SECRET is always available for token generation during testing
process.env.JWT_SECRET = "test-secret"

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create()
  const uri = mongoServer.getUri()

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect()
  }
  await mongoose.connect(uri)
})

afterAll(async () => {
  await mongoose.disconnect()
  if (mongoServer) {
    await mongoServer.stop()
  }
})

afterEach(() => {
  vi.clearAllMocks()
})

// Global mocks
vi.mock("../lib/cloudinary.js", () => ({
  default: {
    uploader: {
      upload: vi
        .fn()
        .mockResolvedValue({
          secure_url: "https://mock.cloudinary.com/image.png",
        }),
    },
  },
}))

vi.mock("../lib/verifyRecaptcha.js", () => ({
  verifyRecaptcha: vi.fn().mockResolvedValue(true),
}))
