"use client"

import React, { useState, useEffect } from "react"
import ChatSidebar from "./ChatSidebar"
import ChatPanel from "./ChatPanel"
import ProfileModal from "./ProfileModal"
import { useAuth } from "../../app/AuthContext"
import { api } from "../../app/fetcher"
import { io, Socket } from "socket.io-client"
import { MessageProvider, useMessageContext } from "../../app/MessageContext"
import { toast } from "sonner"

const ChatPanels: React.FC<{ currentUser: any }> = ({ currentUser }) => {
  const {
    users,
    unseenMessages,
    selectedUser,
    setSelectedUser,
    loadingUsers,
    loadingMessages,
    error,
  } = useMessageContext()
  const [search, setSearch] = React.useState("")
  const [showProfile, setShowProfile] = React.useState(false)
  const [profileDraft, setProfileDraft] = React.useState<any>(null)
  const [mobileView, setMobileView] = React.useState<"sidebar" | "chat">(
    "sidebar",
  )
  const { user, logout, updateProfile } = useAuth()

  function handleUserClick(u: any) {
    setSelectedUser(u)
    if (window.innerWidth < 768) setMobileView("chat")
  }
  function handleBack() {
    setMobileView("sidebar")
  }
  async function handleProfileSave() {
    if (!profileDraft) return
    await updateProfile(profileDraft)
    setShowProfile(false)
  }
  function handleLogout() {
    try {
      logout()
      toast.success("Logged out successfully!")
    } catch (err: any) {
      toast.error(err.message || "Logout failed, Try again!")
    }
  }

  const filteredUsers = users
    .filter((u: any) => u.name.toLowerCase().includes(search.toLowerCase()))
    .map((u: any) => ({
      ...u,
      unread: unseenMessages[u._id || u.id] || 0,
    }))

  return (
    <div className="flex flex-col md:flex-row h-screen w-screen font-sans bg-gradient-to-br from-[#b39ddb]/40 via-white to-[#39ff14]/20 text-black relative overflow-hidden">
      {/* Sidebar */}
      <div
        className={`h-full w-full md:w-80 ${
          mobileView === "chat" ? "hidden md:block" : ""
        }`}
      >
        <ChatSidebar
          users={filteredUsers}
          selectedUser={selectedUser || {}}
          onUserSelect={handleUserClick}
          onProfile={() => {
            setProfileDraft({
              name: user?.name || "",
              bio: user?.bio || "",
              avatarUrl: user?.avatarUrl || "",
            })
            setShowProfile(true)
          }}
          onLogout={handleLogout}
          search={search}
          setSearch={setSearch}
        />
        {loadingUsers && (
          <div className="p-4 text-center">Loading users...</div>
        )}
      </div>
      {/* Chat Panel */}
      <div
        className={`flex-1 h-full ${
          mobileView === "sidebar" ? "hidden md:flex" : ""
        }`}
      >
        <ChatPanel selectedUser={selectedUser} onBack={handleBack} />
        {loadingMessages && (
          <div className="p-4 text-center">Loading messages...</div>
        )}
      </div>
      {/* Profile Modal */}
      <ProfileModal
        open={showProfile}
        onClose={() => setShowProfile(false)}
        profileDraft={profileDraft || { name: "", bio: "", avatarUrl: "" }}
        setProfileDraft={setProfileDraft}
        onSave={handleProfileSave}
      />
      {error && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg shadow">
          {error}
        </div>
      )}
    </div>
  )
}

const ModernNPMChat: React.FC = () => {
  const { user } = useAuth()
  if (!user) return null
  return (
    <MessageProvider currentUser={user}>
      <ChatPanels currentUser={user} />
    </MessageProvider>
  )
}

export default ModernNPMChat
