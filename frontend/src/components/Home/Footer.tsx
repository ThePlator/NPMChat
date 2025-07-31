import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-[#fef6e4] border-t-4 border-black px-6 py-8 mt-12">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between space-y-6 md:space-y-0">
        {/* Made with love */}
        <div className="flex items-center space-x-2 font-bold text-black">
          <span>Made with</span>
          <span className="text-yellow-700">☕</span>
          <span>and too many late nights by Sameer</span>
        </div>
        {/* Social Links */}
        <div className="flex items-center space-x-6">
          <a
            href="https://github.com/ThePlator/NPMChat"
            className="flex items-center space-x-2 font-semibold text-black hover:text-purple-400 border-2 border-black px-3 py-1 rounded-sm brutal-shadow">
            <Github className="w-4 h-4" />
            <span>View Source on GitHub</span>
          </a>
        </div>
        {/* Legal Links */}
        <div className="flex flex-wrap items-center space-x-4 text-black font-semibold">
          <a href="/privacy" className="hover:underline">
            Privacy
          </a>
          <span>|</span>
          <a href="/terms" className="hover:underline">
            Terms
          </a>
          <span>|</span>
          <a href="/license" className="hover:underline">
            License
          </a>
        </div>
      </div>
    </footer>
  );
}
