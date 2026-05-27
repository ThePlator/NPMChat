"use client"
import React, { useEffect, useState } from "react"
import { useAuth } from "../../../app/AuthContext"
import { MessageProvider } from "../../../app/MessageContext"
import GuestLoginModal from "../../../components/chat/GuestLoginModal"
import RoomChatPanel from "../../../components/chat/RoomChatPanel"
import { useParams } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function RoomPage() {
  const params = useParams()
  const roomId = params.roomId as string
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)
  // Fetch problem if specified in query params
  const [problemData, setProblemData] = useState<any>(null)
  const searchParams =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search)
      : null
  const problemSlug = searchParams?.get("problem")

  useEffect(() => {
    if (problemSlug) {
      fetch(
        `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"}/api/v1/problems/${problemSlug}`,
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.problem) setProblemData(data.problem)
        })
        .catch(console.error)
    }
  }, [problemSlug])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Loader2 className="w-8 h-8 animate-spin text-[#39ff14]" />
      </div>
    )
  }

  // If not logged in at all, show guest login
  if (!user) {
    return <GuestLoginModal roomId={roomId} onSuccess={() => {}} />
  }

  return (
    <MessageProvider currentUser={user}>
      <div className="flex h-screen w-screen bg-gray-50 dark:bg-gray-900 overflow-hidden">
        {/* Editor / Problem Area (Left) */}
        <div className="flex-1 flex flex-col md:flex-row h-full">
          {problemData ? (
            <>
              {/* Problem Description Panel */}
              <div className="w-full md:w-1/3 border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto p-6">
                <h2 className="text-2xl font-bold dark:text-white mb-2">
                  {problemData.title}
                </h2>
                <div className="flex items-center gap-2 mb-6">
                  <span
                    className={`px-2 py-1 rounded text-xs font-bold ${
                      problemData.difficulty === "Easy"
                        ? "bg-green-100 text-green-700"
                        : problemData.difficulty === "Medium"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                    }`}
                  >
                    {problemData.difficulty}
                  </span>
                  <span className="text-sm text-gray-500">
                    {problemData.category}
                  </span>
                </div>

                <div className="prose dark:prose-invert max-w-none mb-8">
                  {problemData.description
                    .split("\\n")
                    .map((line: string, i: number) => (
                      <p key={i} className="mb-2 text-sm">
                        {line}
                      </p>
                    ))}
                </div>

                {problemData.hints && problemData.hints.length > 0 && (
                  <div className="mt-8">
                    <h3 className="font-bold mb-3 dark:text-white">Hints</h3>
                    <div className="space-y-2">
                      {problemData.hints.map((hint: string, i: number) => (
                        <details
                          key={i}
                          className="bg-gray-50 dark:bg-gray-900 p-3 rounded border border-gray-200 dark:border-gray-700"
                        >
                          <summary className="text-sm font-medium cursor-pointer text-[#b39ddb]">
                            Hint {i + 1}
                          </summary>
                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            {hint}
                          </p>
                        </details>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Basic Editor Placeholder */}
              <div className="w-full md:w-2/3 flex flex-col bg-[#1e1e1e] border-r border-gray-800">
                <div className="h-10 bg-[#2d2d2d] border-b border-gray-800 flex items-center px-4">
                  <span className="text-gray-400 text-sm font-medium">
                    main.js
                  </span>
                </div>
                <textarea
                  className="flex-1 w-full bg-[#1e1e1e] text-[#d4d4d4] font-mono p-4 resize-none outline-none"
                  defaultValue={
                    problemData.starterCode?.javascript ||
                    "// Write your solution here..."
                  }
                  spellCheck={false}
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
              <div className="text-center">
                <h2 className="text-2xl font-bold mb-2 dark:text-white">
                  Collaborative Room
                </h2>
                <p className="text-gray-500">
                  Wait for others to join, or load a problem to start coding.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Panel (Right) */}
        <div className="w-full md:w-80 lg:w-96 h-full flex-shrink-0">
          <RoomChatPanel roomId={roomId} />
        </div>
      </div>
    </MessageProvider>
  )
}
