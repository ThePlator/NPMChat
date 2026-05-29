import React, { useEffect, useState } from "react"
import { useAuth } from "../../app/AuthContext"
import { useMessageContext } from "../../app/MessageContext"

interface PomodoroTimerProps {
  roomId: string
}

export default function PomodoroTimer({ roomId }: PomodoroTimerProps) {
  const { user } = useAuth()
  const { socket } = useMessageContext()
  
  const [timeLeft, setTimeLeft] = useState(25 * 60)
  const [state, setState] = useState<"idle" | "active" | "paused">("idle")
  const [type, setType] = useState<"focus" | "break">("focus")

  useEffect(() => {
    if (!socket) return

    const handleTick = (data: { timeLeft: number; state: "idle" | "active" | "paused"; type: "focus" | "break" }) => {
      setTimeLeft(data.timeLeft)
      setState(data.state)
      setType(data.type)

      // Manage focus mode state on window for notification muting
      if (data.state === "active" && data.type === "focus") {
        ;(window as any).isFocusMode = true
      } else {
        ;(window as any).isFocusMode = false
      }
    }

    socket.on("pomodoroTick", handleTick)
    return () => {
      socket.off("pomodoroTick", handleTick)
    }
  }, [socket])

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  const handleAction = (action: "start" | "pause" | "reset", actionType?: "focus" | "break") => {
    if (socket) {
      socket.emit("pomodoroAction", { roomId, action, type: actionType || type })
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mx-4 mt-4 flex flex-col md:flex-row items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-3xl font-extrabold text-primary font-mono tracking-wider">
          {formatTime(timeLeft)}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-bold uppercase tracking-wider text-gray-500">
            {type === "focus" ? "Focus Session" : "Break Time"}
          </span>
          <span className={`text-xs font-semibold ${state === "active" ? "text-green-500" : state === "paused" ? "text-yellow-500" : "text-gray-400"}`}>
            {state === "active" ? "Running" : state === "paused" ? "Paused" : "Idle"}
          </span>
        </div>
      </div>
      
      {!user?.isGuest && (
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          {(state === "idle" || state === "paused") && (
            <button
              onClick={() => handleAction("start", "focus")}
              className="px-4 py-2 bg-[#39ff14] text-black font-bold rounded-lg border border-black hover:bg-green-400 transition-colors shadow-sm text-sm"
            >
              Start Focus
            </button>
          )}
          {(state === "idle" || state === "paused") && (
            <button
              onClick={() => handleAction("start", "break")}
              className="px-4 py-2 bg-blue-400 text-white font-bold rounded-lg border border-blue-500 hover:bg-blue-500 transition-colors shadow-sm text-sm"
            >
              Start Break
            </button>
          )}
          {state === "active" && (
            <button
              onClick={() => handleAction("pause")}
              className="px-4 py-2 bg-yellow-400 text-black font-bold rounded-lg border border-yellow-500 hover:bg-yellow-500 transition-colors shadow-sm text-sm"
            >
              Pause
            </button>
          )}
          <button
            onClick={() => handleAction("reset")}
            className="px-4 py-2 bg-gray-200 text-gray-700 font-bold rounded-lg border border-gray-300 hover:bg-gray-300 transition-colors shadow-sm text-sm"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  )
}
