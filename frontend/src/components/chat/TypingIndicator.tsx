"use client"

interface Props {
  typingUsers: string[]
}

export function TypingIndicator({ typingUsers }: Props) {
  if (typingUsers.length === 0) return null

  const text =
    typingUsers.length === 1
      ? `${typingUsers[0]} is typing...`
      : typingUsers.length === 2
        ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
        : `${typingUsers[0]} and ${typingUsers.length - 1} others are typing...`

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 text-xs md:text-sm font-bold text-black dark:text-white border-2 border-sidebar-border bg-white dark:bg-zinc-800 rounded-md shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] mb-2 w-fit animate-slide-in">
      {/* Animated dots */}
      <span className="flex gap-1 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-[#39ff14] border border-black dark:border-white rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </span>
      <span>{text}</span>
    </div>
  )
}
