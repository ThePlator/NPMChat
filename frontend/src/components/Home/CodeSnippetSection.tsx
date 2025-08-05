export default function CodeSnippetSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary mb-6">
          How It's Built & How You Can Contribute
        </h2>
        <div className="bg-[#fef6e4] border-4 border-black rounded-sm brutal-shadow p-6 mb-6">
          <pre className="font-mono text-lg text-black whitespace-pre-wrap">
            {`Built using Node.js, Socket.IO, Next.js & Tailwind CSS.\n\nThis project is open source — contributions, issues, and ideas are welcome!\n\nTo try locally: npm run dev`}
          </pre>
        </div>
        <p className="text-base text-primary mb-6">
          Explore the code, open a pull request, or suggest a feature. Let’s
          build together!
        </p>
        <a
          href="https://github.com/ThePlator/NPMChat"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="bg-[#e9d5ff] hover:bg-[#d8b4fe] border-4 border-black px-8 py-4 text-lg font-bold brutal-shadow text-black">
            View & Contribute on GitHub
          </button>
        </a>
      </div>
    </section>
  )
}
