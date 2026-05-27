"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"

import { fetcher } from "@/app/fetcher"
import { useAuth } from "@/app/AuthContext"

export default function CreateChallengePage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(false)
  const [problems, setProblems] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: "",
    problemId: "",
    timeLimit: 30,
    allowedLanguages: "javascript,python,cpp",
  })

  useEffect(() => {
    fetchProblems()
  }, [])

  const fetchProblems = async () => {
    try {
      const data = await fetcher("/problems", { method: "GET" }, "v1")
      const problemsList = data.problems || []
      setProblems(problemsList)
      if (problemsList.length > 0) {
        setFormData((prev) => ({ ...prev, problemId: problemsList[0]._id }))
      }
    } catch (error) {
      console.error("Failed to fetch problems", error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.problemId) {
      alert(
        "Please select a problem. If the list is empty, you need to create a problem first!",
      )
      return
    }

    setLoading(true)
    try {
      const allowedLangs = formData.allowedLanguages
        .split(",")
        .map((l) => l.trim())
      const data = await fetcher(
        "/challenges",
        {
          method: "POST",
          body: JSON.stringify({
            ...formData,
            allowedLanguages: allowedLangs,
          }),
        },
        "v1",
      )
      router.push(`/challenges/${data._id}`)
    } catch (error: any) {
      console.error("Failed to create challenge", error)
      alert(`Failed to create challenge: ${error.message || "Unknown error"}`)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="p-8 text-center text-black dark:text-white font-black text-2xl uppercase tracking-widest">
        Loading...
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto p-8 max-w-2xl text-center mt-20">
        <div className="bg-[#fef6e4] dark:bg-zinc-800 border-4 border-black p-12 shadow-[8px_8px_0_0_rgba(0,0,0,1)] dark:shadow-[8px_8px_0_0_rgba(255,255,255,1)]">
          <h2 className="text-4xl font-black text-black dark:text-white mb-6 uppercase tracking-tight">
            Authentication Required
          </h2>
          <p className="text-xl font-bold text-gray-800 dark:text-gray-300 mb-8">
            You must be logged in to create a public coding challenge.
          </p>
          <Button
            onClick={() => router.push("/login")}
            className="bg-[#39ff14] text-black hover:bg-[#b39ddb] hover:text-white font-extrabold text-lg py-6 px-8 rounded-none border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:scale-105 uppercase tracking-wider"
          >
            Go to Login
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-8 max-w-2xl mt-10">
      <div className="bg-white dark:bg-zinc-800 border-4 border-black rounded-none shadow-[12px_12px_0_0_rgba(0,0,0,1)] dark:shadow-[12px_12px_0_0_rgba(255,255,255,1)]">
        <div className="p-8 border-b-4 border-black bg-[#b39ddb] dark:bg-zinc-900">
          <h2 className="text-4xl font-black text-black dark:text-white tracking-tight uppercase">
            Create Public Challenge
          </h2>
        </div>
        <div className="p-8 bg-[#fef6e4] dark:bg-zinc-800">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label className="block text-lg font-black text-black dark:text-white mb-3 uppercase tracking-wider">
                Challenge Title
              </label>
              <input
                required
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="e.g. WEEKLY SPEEDRUN"
                className="w-full h-14 px-4 py-2 rounded-none bg-white dark:bg-zinc-900 border-4 border-black text-black dark:text-white font-bold text-lg focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-transform focus:-translate-y-1 focus:translate-x-1"
              />
            </div>

            <div>
              <label className="block text-lg font-black text-black dark:text-white mb-3 uppercase tracking-wider">
                Select Problem
              </label>
              <select
                required
                value={formData.problemId}
                onChange={(e) =>
                  setFormData({ ...formData, problemId: e.target.value })
                }
                className="w-full h-14 px-4 py-2 rounded-none bg-white dark:bg-zinc-900 border-4 border-black text-black dark:text-white font-bold text-lg focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-transform focus:-translate-y-1 focus:translate-x-1 appearance-none cursor-pointer"
              >
                {problems.map((p: any) => (
                  <option key={p._id} value={p._id} className="font-bold">
                    {p.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-lg font-black text-black dark:text-white mb-3 uppercase tracking-wider">
                  Time Limit (mins)
                </label>
                <input
                  type="number"
                  required
                  min={5}
                  max={120}
                  value={formData.timeLimit}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      timeLimit: parseInt(e.target.value),
                    })
                  }
                  className="w-full h-14 px-4 py-2 rounded-none bg-white dark:bg-zinc-900 border-4 border-black text-black dark:text-white font-bold text-lg focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-transform focus:-translate-y-1 focus:translate-x-1"
                />
              </div>
              <div>
                <label className="block text-lg font-black text-black dark:text-white mb-3 uppercase tracking-wider">
                  Allowed Languages
                </label>
                <input
                  required
                  value={formData.allowedLanguages}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      allowedLanguages: e.target.value,
                    })
                  }
                  placeholder="javascript, python"
                  className="w-full h-14 px-4 py-2 rounded-none bg-white dark:bg-zinc-900 border-4 border-black text-black dark:text-white font-bold text-lg focus:outline-none focus:ring-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] transition-transform focus:-translate-y-1 focus:translate-x-1"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-[#39ff14] text-black hover:bg-black hover:text-white font-extrabold text-xl py-8 rounded-none border-4 border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] dark:shadow-[6px_6px_0_0_rgba(255,255,255,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none uppercase tracking-widest mt-8"
            >
              {loading ? "CREATING..." : "START CHALLENGE"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
