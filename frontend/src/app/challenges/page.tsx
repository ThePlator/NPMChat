"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"

import { fetcher } from "@/app/fetcher"

export default function ChallengesPage() {
  const [challenges, setChallenges] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const data = await fetcher("/challenges", { method: "GET" }, "v1")
      setChallenges(data)
    } catch (error) {
      console.error("Failed to fetch challenges:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading)
    return (
      <div className="p-8 text-center text-gray-400 animate-pulse">
        Loading challenges...
      </div>
    )

  return (
    <div className="container mx-auto p-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 border-b-4 border-sidebar-border pb-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-black text-black dark:text-white uppercase tracking-tight mb-2">
            Public Coding Challenges
          </h1>
          <p className="text-xl font-bold text-gray-700 dark:text-gray-300">
            Compete with others on the live leaderboard.
          </p>
        </div>
        <Button
          onClick={() => router.push("/challenges/new")}
          className="mt-6 md:mt-0 bg-[#39ff14] text-black hover:bg-[#b39ddb] hover:text-white font-extrabold text-lg py-6 px-8 rounded-none border-4 border-black brutal-shadow hover:brutal-shadow-hover hover:scale-105 transition-all shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]"
        >
          CREATE CHALLENGE
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.map((challenge) => (
          <div
            key={challenge._id}
            className="bg-white dark:bg-zinc-800 border-4 border-sidebar-border rounded-none shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] dark:hover:shadow-[10px_10px_0_0_rgba(255,255,255,1)] hover:-translate-y-2 transition-all duration-200 flex flex-col"
          >
            <div className="p-6 border-b-4 border-sidebar-border bg-[#fef6e4] dark:bg-zinc-900">
              <h2 className="text-2xl font-black text-black dark:text-white uppercase truncate">
                {challenge.title}
              </h2>
              <p className="text-sm text-black mt-3 font-bold bg-[#b39ddb] inline-block px-3 py-1.5 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                Problem: {challenge.problemId?.title || "Unknown"}
              </p>
            </div>
            <div className="p-6 flex flex-col flex-1">
              <div className="flex justify-between text-base font-black text-black mb-8">
                <span className="flex items-center gap-2 bg-[#39ff14] px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  ⏱ {challenge.timeLimit} MINS
                </span>
                <span className="flex items-center gap-2 bg-[#e9d5ff] px-3 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  👥 {challenge.participants?.length || 0}
                </span>
              </div>
              <div className="flex gap-4 mt-auto">
                <Button
                  onClick={() => router.push(`/challenges/${challenge._id}`)}
                  className="flex-1 bg-black text-white hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200 font-black text-base rounded-none border-4 border-sidebar-border shadow-[4px_4px_0_0_rgba(179,157,219,1)] hover:shadow-[2px_2px_0_0_rgba(179,157,219,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  JOIN
                </Button>
                <Button
                  variant="outline"
                  onClick={() =>
                    router.push(`/challenges/${challenge._id}?spectate=true`)
                  }
                  className="bg-transparent text-black dark:text-white hover:bg-[#b39ddb] hover:text-black font-black text-base rounded-none border-4 border-sidebar-border shadow-[4px_4px_0_0_rgba(57,255,20,1)] hover:shadow-[2px_2px_0_0_rgba(57,255,20,1)] hover:translate-x-1 hover:translate-y-1 transition-all"
                >
                  SPECTATE
                </Button>
              </div>
            </div>
          </div>
        ))}
        {challenges.length === 0 && (
          <div className="col-span-full text-center py-16 bg-[#fef6e4] dark:bg-zinc-800 border-4 border-sidebar-border shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
            <h3 className="text-3xl font-black mb-4 text-black dark:text-white uppercase tracking-wider">
              No active challenges
            </h3>
            <p className="text-xl font-bold text-gray-800 dark:text-gray-300 mb-8">
              Be the first to create one and invite your friends!
            </p>
            <Button
              onClick={() => router.push("/challenges/new")}
              className="bg-[#39ff14] text-black hover:bg-[#b39ddb] hover:text-white font-extrabold text-lg py-6 px-8 rounded-none border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:scale-105"
            >
              CREATE CHALLENGE
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
