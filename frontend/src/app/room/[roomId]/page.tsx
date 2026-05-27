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

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  // If not logged in at all, show guest login
  if (!user) {
    return <GuestLoginModal roomId={roomId} onSuccess={() => {}} />
  }

  return (
    <MessageProvider currentUser={user}>
      <RoomChatPanel roomId={roomId} />
    </MessageProvider>
  )
}
