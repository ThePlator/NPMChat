import { Github } from "lucide-react"
import Link from "next/link"

export default function Footer() {
  return (
    <footer className="w-full bg-[#fef6e4] border-t-4 border-black px-6 py-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        {/* Made with love */}
        <div className="flex items-center space-x-2 font-bold text-black hover:scale-110">
          <span>Made with</span>
          <span className="text-yellow-700">☕</span>
          <span>and too many late nights by Sameer</span>
        </div>
        {/* Social Links */}
        <div className="flex items-center space-x-6">
          <a
            href="https://github.com/ThePlator/NPMChat"
            className="flex items-center space-x-2 font-semibold text-black hover:text-purple-400 border-2 border-black px-3 py-1 rounded-sm brutal-shadow"
          >
            <Github className="w-4 h-4" />
            <span>View Source on GitHub</span>
          </a>
        </div>
        {/* Legal Links */}
        <div className="flex flex-wrap items-center space-x-4 text-black font-semibold">
          <Link href="/privacy" className="hover:underline hover:scale-105">
            Privacy
          </Link>
          <span>|</span>

          <Link href="/terms" className="hover:underline hover:scale-105">
            Terms
          </Link>
          <span>|</span>
          <Link href="/license" className="hover:underline hover:scale-105">
            License
          </Link>
        </div>
      </div>
    </footer>
  )
}
