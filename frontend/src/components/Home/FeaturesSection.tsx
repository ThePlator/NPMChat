const features = [
  {
    icon: "💬",
    title: "Real-time Messaging",
    desc: "Instant chat with zero setup and no vendor lock-in.",
  },
  {
    icon: "⚡",
    title: "Blazing Fast",
    desc: "Optimized for speed and developer happiness.",
  },
  {
    icon: "🔐",
    title: "Secure by Default",
    desc: "End-to-end encrypted and privacy-first.",
  },
  {
    icon: "📝",
    title: "Real-Time Collaborative Code Editor",
    desc: "Write and edit code together live with your team.",
  },
  {
    icon: "📋",
    title: "Shared Scratchpads & Snippet Boards",
    desc: "Each chat room has a shared notepad and code snippet area with saved snippets, titles, and language previews.",
  },
  {
    icon: "🎤",
    title: "Live Interview Mode",
    desc: "Turn chat into an interview room with real-time coding, timer, prompts, and private notes for mock interviews or hiring.",
  },
  {
    icon: "📁",
    title: "File Sharing + Code Preview",
    desc: "Upload and preview .js, .py, and more files directly in chat. Drag-and-drop supported.",
  },
  {
    icon: "⚙️",
    title: "Code Execution Engine",
    desc: "Run code in chat with Monaco editor and see output instantly using external APIs like Piston or Judge0.",
  },
]

const bgColors = [
  "bg-[#e9d5ff]", // pastel purple
  "bg-[#d9f99d]", // lime
  "bg-[#fef6e4]", // beige
  "bg-[#e9d5ff]", // pastel purple again
]

export default function FeaturesSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black mb-10 text-primary hover:scale-105 transition-transform duration-300">
          Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`flex flex-col items-start p-8 border-4 border-black rounded-sm brutal-shadow hover:brutal-shadow-hover hover:scale-110 hover:-rotate-3 hover:translate-y-[-8px] transition-all duration-500 cursor-pointer group transform-gpu hover:z-10 relative ${
                bgColors[i % bgColors.length]
              }`}
              style={{
                transformOrigin: "center center",
                backfaceVisibility: "hidden",
              }}
            >
              <span className="text-4xl mb-4 group-hover:animate-bounce group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 transform-gpu">
                {f.icon}
              </span>
              <h3 className="text-xl font-bold mb-2 text-black group-hover:scale-105 group-hover:animate-pulse transition-all duration-300">
                {f.title}
              </h3>
              <p className="text-base font-medium text-black group-hover:scale-105 group-hover:translate-x-1 transition-all duration-300">
                {f.desc}
              </p>

              {/* Floating particles effect */}
              <div className="absolute -top-2 -right-2 w-3 h-3 bg-black rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
              <div className="absolute -bottom-2 -left-2 w-2 h-2 bg-black rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700"></div>
              <div className="absolute top-1/2 -right-1 w-1 h-1 bg-black rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-600"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
