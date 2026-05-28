import Link from "next/link"
import { Search, Filter, Code2, Sparkles, ChevronRight } from "lucide-react"

// SSR fetching of problems
async function fetchProblems() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  try {
    const res = await fetch(`${apiUrl}/api/v1/problems`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) throw new Error("Failed to fetch problems")
    return res.json()
  } catch (error) {
    console.error(error)
    return { problems: [], pagination: { total: 0, page: 1, pages: 1 } }
  }
}

export default async function ProblemsPage() {
  const { problems } = await fetchProblems()

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white relative">
      <div className="container mx-auto px-4 py-16 max-w-6xl relative z-10">
        {/* Header Section */}
        <div className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-medium mb-4">
              <Sparkles className="w-4 h-4" />
              <span>Curated Challenges</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              Problem{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#39ff14] to-emerald-400">
                Library
              </span>
            </h1>
            <p className="text-gray-400 text-lg max-w-2xl">
              Master technical interviews with our hand-picked selection of
              coding challenges. Practice, collaborate, and ace your next
              interview.
            </p>
          </div>
          <div className="hidden md:flex h-32 w-32 bg-gradient-to-br from-[#39ff14]/20 to-purple-500/20 rounded-3xl items-center justify-center border border-white/5 shadow-[0_0_50px_rgba(57,255,20,0.1)] rotate-3 hover:rotate-6 transition-transform duration-500">
            <Code2 className="w-16 h-16 text-[#39ff14]/80" />
          </div>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white/5 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-xl">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-[#39ff14] transition-colors" />
            <input
              type="text"
              placeholder="Search by title, tags, or company..."
              className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-[#39ff14]/50 focus:ring-1 focus:ring-[#39ff14]/50 transition-all"
            />
          </div>
          <div className="relative md:w-48 group">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-purple-400 transition-colors" />
            <select className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white appearance-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 cursor-pointer transition-all">
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <select className="md:w-56 bg-black/40 border border-white/10 rounded-xl py-3 px-4 text-white appearance-none focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 cursor-pointer transition-all">
            <option value="">All Topics</option>
            <option value="Arrays">Arrays</option>
            <option value="Linked Lists">Linked Lists</option>
            <option value="Dynamic Programming">Dynamic Programming</option>
          </select>
        </div>

        {/* Problem List */}
        <div className="bg-black/20 backdrop-blur-md rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
          <div className="grid grid-cols-12 gap-4 p-5 font-semibold border-b border-white/5 bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
            <div className="col-span-1 text-center">Status</div>
            <div className="col-span-6">Title</div>
            <div className="col-span-2">Difficulty</div>
            <div className="col-span-3">Category</div>
          </div>

          <div className="divide-y divide-white/5">
            {problems.length === 0 ? (
              <div className="p-16 text-center flex flex-col items-center justify-center">
                <Code2 className="w-12 h-12 text-gray-600 mb-4" />
                <p className="text-gray-400 text-lg">
                  No problems found matching your criteria.
                </p>
              </div>
            ) : (
              problems.map((problem: any) => (
                <Link
                  href={`/problems/${problem.slug}`}
                  key={problem._id}
                  className="grid grid-cols-12 gap-4 p-5 items-center group hover:bg-white/[0.02] transition-all duration-300 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#39ff14]/0 via-[#39ff14]/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                  <div className="col-span-1 flex justify-center">
                    <div className="w-5 h-5 rounded-full border-2 border-gray-600 group-hover:border-[#39ff14]/50 transition-colors"></div>
                  </div>

                  <div className="col-span-6 flex items-center gap-3">
                    <span className="font-semibold text-lg text-gray-200 group-hover:text-white transition-colors">
                      {problem.title}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                  </div>

                  <div className="col-span-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center justify-center border ${
                        problem.difficulty === "Easy"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : problem.difficulty === "Medium"
                            ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                            : "bg-red-500/10 text-red-400 border-red-500/20"
                      }`}
                    >
                      {problem.difficulty}
                    </span>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <span className="inline-block px-3 py-1 rounded-md bg-white/5 text-gray-400 text-sm border border-white/5">
                      {problem.category}
                    </span>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Background blobs */}
      <div className="fixed top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#39ff14]/10 blur-[120px] pointer-events-none"></div>
    </div>
  )
}
