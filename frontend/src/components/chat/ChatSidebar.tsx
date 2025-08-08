"use client"
import React from "react"

export default function ChatSidebar({
  users,
  selectedUser,
  onUserSelect,
  onProfile,
  onLogout,
  search,
  setSearch,
}: {
  users: any[]
  selectedUser: any
  onUserSelect: (user: any) => void
  onProfile: () => void
  onLogout: () => void
  search: string
  setSearch: (s: string) => void
}) {
  console.log("users", users)
  return (
    <aside className="flex flex-col w-full md:w-80 bg-[#e9d5ff] dark:bg-background border-r-2 border-sidebar-border  h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b-2 border-sidebar-border ">
        <div className="w-8 h-8 bg-[#39ff14] rounded-lg flex items-center justify-center text-xl font-extrabold border-2 border-sidebar-border  select-none">
          N
        </div>
        <span className="inline text-xl font-extrabold tracking-tight text-primary">
          NPMChat
        </span>
      </div>
      {/* Search */}
      <div className="px-4 py-2 border-b-2 border-sidebar-border ">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search..."
          className="w-full px-3 py-2 border-2 border-sidebar-border  rounded-lg bg-accent text-black font-bold text-base focus:outline-none focus:border-[#39ff14] placeholder:text-gray-400"
        />
      </div>
      {/* User List */}
      <ul className="flex-1 overflow-y-auto py-2 space-y-1">
        {users.map((user) => (
          <li
            key={user._id || user.id}
            onClick={() => onUserSelect(user)}
            className={`flex items-center gap-3 px-4 py-3 cursor-pointer rounded-lg transition-all duration-100 select-none
              ${
                selectedUser.id === user.id
                  ? "bg-sidebar shadow border border-[#39ff14]"
                  : "hover:bg-[#f3e8ff]"
              }
            `}
          >
            <div className="w-10 h-10 rounded-full bg-[#39ff14] flex items-center justify-center text-xl font-extrabold border-2 border-sidebar-border ">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                user.name[0]
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="truncate font-bold text-primary">{user.name}</div>
              <div className="flex items-center gap-1 text-xs">
                <span
                  className={`w-2 h-2 rounded-full border-2 border-black ${
                    user.status === "online" ? "bg-[#39ff14]" : "bg-gray-400"
                  }`}
                ></span>
                <span className="text-gray-600">{user.status}</span>
              </div>
            </div>
            {user.unread > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full bg-[#b39ddb] text-black text-xs font-extrabold border-2 border-black">
                {user.unread}
              </span>
            )}
          </li>
        ))}
      </ul>
      {/* Profile/Logout */}
      <div className="flex flex-col gap-2 p-4 border-t-2 border-sidebar-border ">
        <button
          onClick={onProfile}
          className="w-full py-2 rounded-lg border-2 border-sidebar-border  bg-sidebar-accent text-primary font-bold hover:bg-[#b39ddb]"
        >
          Profile
        </button>
        <button
          onClick={onLogout}
          className="w-full py-2 rounded-lg border-2 border-sidebar-border  bg-sidebar-accent text-primary font-bold hover:bg-red-500 hover:text-white"
        >
          Logout
        </button>
      </div>
    </aside>
  )
}
