import Link from "next/link"
import Header from "../../components/Home/Header"
import Footer from "../../components/Home/Footer"
import {
  Settings,
  BookOpen,
  Server,
  Layout,
} from "lucide-react"

const docs = [
  {
    href: "/docs/setup",
    icon: <Settings className="w-8 h-8 text-orange-600" />,
    title: "Setup Guide",
    description:
      "Get NPMChat running locally from scratch. Prerequisites, environment variables, and step-by-step instructions to have everything up and running.",
    bgColor: "bg-[#fef6e4]",
    details: ["Prerequisites", "Backend setup", "Frontend setup", "Env variables"],
  },
  {
    href: "/docs/architecture",
    icon: <BookOpen className="w-8 h-8 text-purple-600" />,
    title: "Architecture",
    description:
      "High-level overview of the NPMChat monorepo structure, data flow between frontend and backend, and key design decisions.",
    bgColor: "bg-[#e9d5ff]",
    details: ["Monorepo structure", "Data flow", "Design decisions", "Tech stack"],
  },
  {
    href: "/docs/backend",
    icon: <Server className="w-8 h-8 text-green-600" />,
    title: "Backend",
    description:
      "Express.js API reference covering all routes, Socket.IO events, MongoDB models, and environment configuration.",
    bgColor: "bg-[#d9f99d]",
    details: ["API routes", "Socket.IO events", "MongoDB models", "Configuration"],
  },
  {
    href: "/docs/frontend",
    icon: <Layout className="w-8 h-8 text-blue-600" />,
    title: "Frontend",
    description:
      "Next.js app folder structure, key pages, routing conventions, and how to add new pages or components to the project.",
    bgColor: "bg-[#e0f2fe]",
    details: ["Folder structure", "Key routes", "Components", "Adding new pages"],
  },
]

export const metadata = {
  title: "Documentation | NPMChat",
  description: "NPMChat developer documentation",
}

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero */}
      <section className="bg-white py-20 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-8">
            <span className="bg-[#39ff14] text-black font-bold px-4 py-2 border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              DEVELOPER DOCS
            </span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-black mb-6 leading-tight">
            Build with <span className="text-[#b39ddb]">NPMChat</span>
          </h1>
          <p className="text-2xl text-gray-700 mb-8 max-w-4xl mx-auto font-medium">
            Everything you need to understand, run, and contribute to NPMChat —
            from local setup to architecture deep dives.
          </p>
        </div>
      </section>

      {/* Doc Cards */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
              Documentation
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Four guides covering everything from first setup to internal architecture
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {docs.map((doc, index) => (
              <Link key={index} href={doc.href} className="block group">
                <div
                  className={`${doc.bgColor} border-4 border-black p-8 shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[10px_10px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1 h-full`}
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-white border-4 border-black mb-6 shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                    {doc.icon}
                  </div>
                  <h3 className="text-2xl font-black text-black mb-4">
                    {doc.title}
                  </h3>
                  <p className="text-gray-800 leading-relaxed mb-6 text-lg">
                    {doc.description}
                  </p>
                  <div className="space-y-2">
                    {doc.details.map((detail, idx) => (
                      <div
                        key={idx}
                        className="flex items-center text-sm font-bold text-gray-700"
                      >
                        <div className="w-2 h-2 bg-black mr-3 flex-shrink-0"></div>
                        {detail}
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 inline-block bg-black text-white font-black px-4 py-2 text-sm shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] group-hover:bg-gray-800 transition-colors">
                    Read docs →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">
            Ready to Contribute?
          </h2>
          <p className="text-xl mb-10 text-gray-300">
            NPMChat is open source. Pick up an issue, read the docs, and send a PR.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://github.com/ThePlator/NPMChat"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#39ff14] text-black font-black py-4 px-8 border-4 border-white shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-[6px_6px_0_0_rgba(255,255,255,1)] hover:-translate-y-1 transition-all text-xl"
            >
              View on GitHub
            </a>
            <Link
              href="/docs/setup"
              className="bg-transparent text-white font-black py-4 px-8 border-4 border-white hover:bg-white hover:text-black transition-all text-xl shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-[6px_6px_0_0_rgba(255,255,255,1)] hover:-translate-y-1"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
