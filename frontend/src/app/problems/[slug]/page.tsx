import { notFound } from "next/navigation"
import Link from "next/link"
import { Play, ArrowLeft, Terminal, LayoutList, Lightbulb } from "lucide-react"

async function fetchProblem(slug: string) {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080"
  try {
    const res = await fetch(`${apiUrl}/api/v1/problems/${slug}`, {
      next: { revalidate: 60 },
    })
    if (!res.ok) {
      if (res.status === 404) return null
      throw new Error("Failed to fetch problem")
    }
    const data = await res.json()
    return data.problem
  } catch (error) {
    console.error(error)
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const problem = await fetchProblem(slug)
  if (!problem) return { title: "Problem Not Found" }

  return {
    title: `${problem.title} | NPMChat Problem Library`,
    description: problem.description.substring(0, 150) + "...",
  }
}

export default async function ProblemDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const problem = await fetchProblem(slug)

  if (!problem) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))] text-white relative">
      <div className="container mx-auto px-4 py-12 max-w-4xl relative z-10">
        <Link
          href="/problems"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-[#39ff14] text-sm font-medium mb-8 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Library
        </Link>

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-400">
              {problem.title}
            </h1>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold inline-flex items-center border ${
                  problem.difficulty === "Easy"
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                    : problem.difficulty === "Medium"
                      ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                }`}
              >
                {problem.difficulty}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 text-gray-400 text-xs font-medium border border-white/5">
                <LayoutList className="w-3.5 h-3.5" />
                {problem.category}
              </span>
            </div>
          </div>

          <Link
            href={`/room/new?problem=${problem.slug}`}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#39ff14] text-black font-bold rounded-xl hover:bg-white hover:shadow-[0_0_20px_rgba(57,255,20,0.4)] transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Play className="w-4 h-4 fill-black" />
            Start Session
          </Link>
        </div>

        <div className="bg-black/20 backdrop-blur-md rounded-3xl border border-white/10 p-8 shadow-2xl mb-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Terminal className="w-32 h-32" />
          </div>
          <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-a:text-[#39ff14] hover:prose-a:text-[#39ff14]/80 prose-code:text-purple-300 prose-code:bg-purple-500/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md max-w-none relative z-10">
            {problem.description.split("\\n").map((line: string, i: number) => (
              <p key={i} className="mb-4 leading-relaxed">
                {line}
              </p>
            ))}
          </div>
        </div>

        {problem.hints && problem.hints.length > 0 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <Lightbulb className="w-6 h-6 text-yellow-400" />
              Hints
            </h2>
            <div className="space-y-4">
              {problem.hints.map((hint: string, index: number) => (
                <details
                  key={index}
                  className="bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl p-5 group hover:border-white/10 transition-colors"
                >
                  <summary className="font-medium cursor-pointer text-purple-400 flex items-center select-none">
                    <span className="flex-1">Hint {index + 1}</span>
                    <span className="text-gray-500 group-open:rotate-180 transition-transform">
                      ▼
                    </span>
                  </summary>
                  <div className="mt-4 text-gray-300 leading-relaxed pl-4 border-l-2 border-purple-500/30">
                    {hint}
                  </div>
                </details>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Background blobs */}
      <div className="fixed top-[20%] right-[-10%] w-[30%] h-[30%] rounded-full bg-purple-600/10 blur-[120px] pointer-events-none"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#39ff14]/5 blur-[120px] pointer-events-none"></div>
    </div>
  )
}
