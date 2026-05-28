"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"

export default function NewRoomPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    // Generate a random room ID
    const randomRoomId =
      Math.random().toString(36).substring(2, 10) +
      "-" +
      Math.random().toString(36).substring(2, 10)

    // Pass along query params (like problem slug)
    const problem = searchParams.get("problem")
    const query = problem ? `?problem=${problem}` : ""

    // Redirect to the new room
    router.replace(`/room/${randomRoomId}${query}`)
  }, [router, searchParams])

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-12 h-12 border-4 border-[#39ff14] border-t-transparent rounded-full animate-spin mb-4"></div>
      <h2 className="text-xl font-bold dark:text-white">
        Creating your secure room...
      </h2>
    </div>
  )
}
