import React, { useState } from "react"
import { useAuth } from "../../app/AuthContext"
import { Loader2 } from "lucide-react"

export default function GuestLoginModal({
  roomId,
  onSuccess,
}: {
  roomId: string
  onSuccess: () => void
}) {
  const [name, setName] = useState("")
  const { guestLogin, loading, error } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    try {
      await guestLogin({ name, roomId })
      onSuccess()
    } catch (err) {
      // Error handled by AuthContext
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border-4 border-[#b39ddb] shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="bg-gradient-to-r from-[#b39ddb] to-[#b39ddb]/80 p-6 text-center border-b-4 border-black">
          <h2 className="text-3xl font-extrabold mb-1 text-black">
            Join the Room
          </h2>
          <p className="text-black/80 font-medium">
            Enter your display name to jump right in!
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="p-6 bg-[#f3e8ff] dark:bg-accent"
        >
          <div className="mb-6">
            <label className="block text-sm font-bold text-primary mb-2">
              Display Name
            </label>
            <input
              type="text"
              required
              className="w-full px-4 py-3 rounded-full border-2 border-sidebar-border font-medium text-base bg-white dark:bg-accent text-primary focus:outline-none focus:border-[#39ff14] transition-all"
              placeholder="e.g. Alex"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500 font-bold text-sm mb-4">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading || !name.trim()}
            className="w-full py-3 px-4 bg-[#39ff14] text-black hover:bg-[#b39ddb] hover:text-white font-extrabold text-lg rounded-full border-2 border-black transition-all shadow-sm flex items-center justify-center disabled:opacity-70 hover:scale-105"
          >
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              "Join Instantly"
            )}
          </button>

          <div className="mt-5 text-center text-xs font-bold text-gray-500 dark:text-gray-400">
            No account required. Your session is temporary.
          </div>
        </form>
      </div>
    </div>
  )
}
