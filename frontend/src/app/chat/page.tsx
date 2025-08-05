"use client"
import ModernNPMChat from "@/components/chat/ModernNPMChat"
import ProtectedRoute from "../../components/ProtectedRoute"

export default function ChatPage() {
  return (
    <ProtectedRoute requireAuth={true}>
      <ModernNPMChat />
    </ProtectedRoute>
  )
}
