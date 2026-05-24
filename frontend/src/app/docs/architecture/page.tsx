import fs from "fs"
import path from "path"
import Link from "next/link"
import Header from "../../../components/Home/Header"
import Footer from "../../../components/Home/Footer"

export const metadata = {
  title: "Architecture | NPMChat Docs",
}

export default function ArchitecturePage() {
  const content = fs.readFileSync(
    path.resolve(process.cwd(), "..", "docs", "ARCHITECTURE.md"),
    "utf-8"
  )

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <section className="bg-white py-20 px-6">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center gap-3 mb-12">
            <Link
              href="/docs"
              className="bg-black text-white font-black px-4 py-2 border-2 border-black shadow-[3px_3px_0_0_rgba(0,0,0,0.3)] hover:bg-gray-800 transition-colors text-sm"
            >
              ← All Docs
            </Link>
            <span className="font-bold text-gray-400">/</span>
            <span className="font-black text-black text-sm uppercase">architecture</span>
          </div>

          <div className="bg-white border-4 border-black shadow-[8px_8px_0_0_rgba(0,0,0,1)] p-10">
            <div
              className="text-black [&_h1]:text-4xl [&_h1]:font-black [&_h1]:mb-4 [&_h1]:text-black [&_h2]:text-2xl [&_h2]:font-black [&_h2]:mt-10 [&_h2]:mb-4 [&_h2]:pb-3 [&_h2]:border-b-4 [&_h2]:border-black [&_h2]:text-black [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-6 [&_h3]:mb-3 [&_h3]:text-black [&_p]:text-gray-800 [&_p]:leading-relaxed [&_p]:mb-4 [&_ul]:mb-4 [&_ul]:space-y-2 [&_ol]:mb-4 [&_ol]:space-y-2 [&_li]:text-gray-800 [&_li]:ml-4 [&_pre]:bg-black [&_pre]:text-green-400 [&_pre]:p-6 [&_pre]:overflow-x-auto [&_pre]:text-sm [&_pre]:font-mono [&_pre]:my-6 [&_pre]:border-4 [&_pre]:border-black [&_pre]:shadow-[4px_4px_0_0_rgba(0,0,0,0.3)] [&_code]:bg-gray-100 [&_code]:text-black [&_code]:px-2 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-sm [&_code]:border [&_code]:border-gray-300 [&_pre_code]:bg-transparent [&_pre_code]:border-none [&_pre_code]:text-green-400 [&_pre_code]:p-0 [&_hr]:border-t-4 [&_hr]:border-black [&_hr]:my-8 [&_strong]:font-black [&_strong]:text-black [&_a]:text-black [&_a]:font-bold [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-black [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:text-gray-600 [&_blockquote]:my-4"
              dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }}
            />
          </div>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="/docs/setup" className="bg-white text-black font-black px-5 py-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-sm">⚙️ Setup</Link>
            <Link href="/docs/backend" className="bg-white text-black font-black px-5 py-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-sm">🔧 Backend</Link>
            <Link href="/docs/frontend" className="bg-white text-black font-black px-5 py-3 border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] hover:-translate-y-0.5 transition-all text-sm">🖥️ Frontend</Link>
          </div>

        </div>
      </section>

      <Footer />
    </div>
  )
}

function renderMarkdown(md: string): string {
  return md
  
    .replace(/```[\w]*\n([\s\S]*?)```/g, '<pre style="background:#0a0a0a;color:#4ade80;padding:1rem;overflow-x:auto;font-size:0.8rem;margin:1rem 0;border:2px solid black"><code>$1</code></pre>')
  
    .replace(/`([^`]+)`/g, '<code style="background:#f3f4f6;color:#111;padding:0.1rem 0.4rem;border-radius:4px;font-size:0.85em;border:1px solid #d1d5db">$1</code>')
   
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
    .replace(/^### (.+)$/gm, '<h3 style="font-size:1.1rem;font-weight:700;margin:1.5rem 0 0.5rem;color:black">$1</h3>')
    .replace(/^## (.+)$/gm,  '<h2 style="font-size:1.4rem;font-weight:800;margin:2rem 0 0.75rem;padding-bottom:0.4rem;border-bottom:2px solid black;color:black">$1</h2>')
    .replace(/^# (.+)$/gm,   '<h1 style="font-size:2rem;font-weight:900;margin-bottom:0.5rem;color:black">$1</h1>')
  
    .replace(/^---$/gm, '<hr style="border:none;border-top:2px solid black;margin:1.5rem 0"/>')
  
    .replace(/^- (.+)$/gm, '<li style="margin-left:1.5rem;list-style-type:disc;margin-bottom:0.25rem;color:black">$1</li>')
    .replace(/^\d+\. (.+)$/gm, '<li style="margin-left:1.5rem;list-style-type:decimal;margin-bottom:0.25rem;color:black">$1</li>')
  
    .replace(/^(?!<)(.+)$/gm, '<p style="margin:0.5rem 0;line-height:1.7;color:black">$1</p>')
  
    .replace(/<p[^>]*>\s*<\/p>/g, '')
  
    .replace(/(<li[^>]*>.*<\/li>\n?)+/g, '<ul style="margin:0.5rem 0 1rem 0">$&</ul>');
}