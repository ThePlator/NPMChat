"use client"
import { useEffect, useState, useRef } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { useMessageContext, MessageProvider } from "@/app/MessageContext"
import { useAuth } from "@/app/AuthContext"
import Editor from "@monaco-editor/react"
import { Button } from "@/components/ui/button"
import { fetcher } from "@/app/fetcher"
import { Loader2 } from "lucide-react"

export default function ChallengeRoomPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-black">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    )
  }

  return (
    <MessageProvider currentUser={user}>
      <ChallengeRoomInner />
    </MessageProvider>
  )
}

function ChallengeRoomInner() {
  const params = useParams()
  const searchParams = useSearchParams()
  const { socket } = useMessageContext()

  const challengeId = params.id as string
  const isSpectator = searchParams.get("spectate") === "true"

  const [challenge, setChallenge] = useState<any>(null)
  const [code, setCode] = useState("// Write your solution here\n")
  const [language, setLanguage] = useState("javascript")
  const [output, setOutput] = useState("")
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchChallengeData()
    if (socket) {
      socket.emit("joinChallengeRoom", challengeId)

      socket.on("leaderboardUpdate", (data) => {
        setLeaderboard(data.submissions)
      })

      return () => {
        socket.emit("leaveChallengeRoom", challengeId)
        socket.off("leaderboardUpdate")
      }
    }
  }, [challengeId, socket])

  const fetchChallengeData = async () => {
    try {
      const data = await fetcher(
        `/challenges/${challengeId}`,
        { method: "GET" },
        "v1",
      )
      setChallenge(data)
      setLeaderboard(data.submissions || [])
      if (data.problemId?.solutionTemplate && !isSpectator) {
        setCode(data.problemId.solutionTemplate)
      }
    } catch (error) {
      console.error("Failed to load challenge", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    setOutput("Running...")
    try {
      const data = await fetcher(
        `/challenges/${challengeId}/submit`,
        {
          method: "POST",
          body: JSON.stringify({ code, language }),
        },
        "v1",
      )

      let outStr = ""
      if (data.errorOutput) outStr += `Error:\n${data.errorOutput}\n`
      if (data.output) outStr += `Output:\n${data.output}\n`

      outStr += `\nResult: ${data.isCorrect ? "✅ Correct" : "❌ Incorrect"}`
      setOutput(outStr)

      // Emit socket event to notify others
      if (socket) {
        socket.emit("challengeSubmission", { challengeId })
      }
    } catch (error: any) {
      setOutput(error.message || "Submission failed.")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fef6e4] dark:bg-zinc-900">
        <div className="text-4xl font-black uppercase text-black dark:text-white tracking-widest animate-pulse">
          Loading Room...
        </div>
      </div>
    )
  if (!challenge)
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-[#fef6e4] dark:bg-zinc-900">
        <div className="text-4xl font-black uppercase text-red-500 tracking-widest border-4 border-red-500 p-8 shadow-[8px_8px_0_0_rgba(239,68,68,1)] bg-white dark:bg-zinc-800">
          Challenge not found
        </div>
      </div>
    )

  // Sort leaderboard: correct first, then by time complexity (placeholder sort), then by submission time
  const sortedLeaderboard = [...leaderboard].sort((a, b) => {
    if (a.isCorrect !== b.isCorrect) return a.isCorrect ? -1 : 1
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime()
  })

  return (
    <div className="flex h-[calc(100vh-4rem)] w-full overflow-hidden bg-[#fef6e4] dark:bg-zinc-900">
      {/* LEFT: Problem Description & Leaderboard */}
      <div className="w-1/3 flex flex-col border-r-4 border-sidebar-border h-full overflow-y-auto bg-white dark:bg-zinc-800">
        <div className="p-8 border-b-4 border-sidebar-border bg-[#b39ddb] dark:bg-zinc-900">
          <h1 className="text-3xl font-black text-black dark:text-white mb-4 uppercase tracking-tight">
            {challenge.title}
          </h1>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="px-3 py-1 text-sm font-black bg-white dark:bg-zinc-800 text-black dark:text-white border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase">
              {challenge.problemId?.difficulty || "Medium"}
            </span>
            <span className="px-3 py-1 text-sm font-black bg-[#39ff14] text-black border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] uppercase">
              {challenge.timeLimit} mins
            </span>
            {isSpectator && (
              <span className="px-3 py-1 text-sm font-black bg-black text-white border-2 border-white shadow-[2px_2px_0_0_rgba(255,255,255,1)] uppercase">
                Spectator Mode
              </span>
            )}
          </div>
          <div className="prose dark:prose-invert max-w-none text-base text-gray-900 dark:text-gray-100 font-medium p-4 bg-white dark:bg-zinc-800 border-4 border-sidebar-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]">
            {challenge.problemId?.description || "No description provided."}
          </div>
        </div>

        <div className="p-8 flex-1 bg-[#fef6e4] dark:bg-zinc-800">
          <h3 className="text-2xl font-black text-black dark:text-white mb-6 uppercase tracking-wider flex items-center gap-3">
            <span className="text-3xl">🏆</span> Live Leaderboard
          </h3>
          <div className="space-y-4">
            {sortedLeaderboard.map((sub, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center bg-white dark:bg-zinc-900 p-4 border-4 border-sidebar-border shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)]"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl font-black text-black dark:text-white w-8">
                    #{idx + 1}
                  </div>
                  <div>
                    <div className="text-black dark:text-white font-bold text-lg leading-tight">
                      {sub.username}
                    </div>
                    <div className="text-sm font-bold text-gray-500 uppercase tracking-wider">
                      {sub.language}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`font-black text-lg uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)] ${sub.isCorrect ? "bg-[#39ff14] text-black" : "bg-red-500 text-white"}`}
                  >
                    {sub.isCorrect ? "Passed" : "Failed"}
                  </div>
                  {sub.executionTimeMs && (
                    <div className="text-sm font-bold text-gray-600 dark:text-gray-400 mt-2">
                      {sub.executionTimeMs}ms
                    </div>
                  )}
                </div>
              </div>
            ))}
            {sortedLeaderboard.length === 0 && (
              <div className="text-lg font-bold text-gray-600 dark:text-gray-400 text-center py-8 border-4 border-dashed border-gray-400 uppercase">
                No submissions yet. Be the first!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RIGHT: Editor and Terminal */}
      <div className="flex-1 flex flex-col h-full relative border-l-0">
        {isSpectator && (
          <div className="absolute inset-0 z-10 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="text-black font-black text-2xl uppercase tracking-widest bg-[#39ff14] p-8 border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] max-w-lg text-center">
              You are spectating. You can only view the leaderboard.
            </div>
          </div>
        )}

        <div className="h-20 border-b-4 border-sidebar-border flex items-center justify-between px-6 bg-[#e9d5ff] dark:bg-zinc-900 shrink-0">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white dark:bg-zinc-800 text-black dark:text-white text-base font-bold uppercase rounded-none border-4 border-black px-4 py-2 outline-none shadow-[4px_4px_0_0_rgba(0,0,0,1)] dark:shadow-[4px_4px_0_0_rgba(255,255,255,1)] cursor-pointer"
          >
            {challenge.allowedLanguages?.map((l: string) => (
              <option key={l} value={l} className="font-bold uppercase">
                {l}
              </option>
            ))}
          </select>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#39ff14] hover:bg-black hover:text-white text-black font-black text-lg py-6 px-8 rounded-none border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] transition-all hover:translate-x-1 hover:translate-y-1 hover:shadow-none uppercase tracking-widest"
          >
            {submitting ? "RUNNING..." : "SUBMIT SOLUTION"}
          </Button>
        </div>

        <div className="flex-1 min-h-0 relative bg-[#1e1e1e]">
          <Editor
            height="100%"
            language={language === "cpp" ? "cpp" : language}
            theme="vs-dark"
            value={code}
            onChange={(val) => setCode(val || "")}
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              fontFamily: "JetBrains Mono, monospace",
            }}
          />
        </div>

        <div className="h-64 border-t-4 border-sidebar-border bg-black flex flex-col shrink-0">
          <div className="px-6 py-3 border-b-4 border-sidebar-border bg-white dark:bg-zinc-800 text-sm font-black text-black dark:text-white uppercase tracking-widest flex items-center justify-between">
            <span>Execution Output</span>
            <span className="bg-black text-white px-2 py-1 text-xs shadow-[2px_2px_0_0_rgba(255,255,255,1)]">
              TERMINAL
            </span>
          </div>
          <div className="p-6 flex-1 overflow-auto bg-black text-[#39ff14]">
            <pre className="text-base font-mono font-bold whitespace-pre-wrap">
              {output || "> Run your code to see the output here."}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
