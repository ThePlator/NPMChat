import { v2 as cloudinary } from "cloudinary"

// Validate required environment variables
const requiredEnvVars = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
}

// Check if all required variables are present
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value || value === `your_cloudinary_${key}`)
  .map(([key]) => `CLOUDINARY_${key.toUpperCase()}`)

if (missingVars.length > 0) {
  console.warn(
    `⚠️  Cloudinary not configured. Missing: ${missingVars.join(", ")}`,
  )
  console.warn("Please add your Cloudinary credentials to the .env file")
}

cloudinary.config({
  cloud_name: requiredEnvVars.cloud_name,
  api_key: requiredEnvVars.api_key,
  api_secret: requiredEnvVars.api_secret,
})

export default cloudinary
