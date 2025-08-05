export default function CodeSnippetSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black text-primary mb-6 hover:scale-105 transition-all duration-500 cursor-default transform-gpu">
          How It's Built & How You Can Contribute
        </h2>
        <div className="bg-[#fef6e4] border-4 border-black rounded-sm brutal-shadow hover:brutal-shadow-hover p-6 mb-6 hover:scale-110 transition-all duration-500 cursor-pointer group transform-gpu relative">
          <pre className="font-mono text-lg text-black whitespace-pre-wrap group-hover:scale-102 group-hover:animate-pulse transition-all duration-300">
            {`Built using Node.js, Socket.IO, Next.js & Tailwind CSS.\n\nThis project is open source — contributions, issues, and ideas are welcome!\n\nTo try locally: npm run dev`}
          </pre>
          
          {/* Floating code particles */}
          <div className="absolute -top-2 -right-2 w-4 h-1 bg-[#39ff14] opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#b39ddb] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700"></div>
          <div className="absolute top-4 -right-1 text-xs opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-600">{'</>'}</div>
        </div>
        
        <p className="text-base text-primary mb-6 hover:scale-105 hover:translate-x-2 hover:animate-pulse transition-all duration-300 cursor-default">
          Explore the code, open a pull request, or suggest a feature. Let's
          build together!
        </p>
        
        <a
          href="https://github.com/ThePlator/NPMChat"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block hover:scale-110 hover:-rotate-3 hover:translate-y-[-4px] transition-all duration-500 transform-gpu group">
          <button className="bg-[#e9d5ff] hover:bg-[#d8b4fe] border-4 border-black px-8 py-4 text-lg font-bold brutal-shadow hover:brutal-shadow-hover text-black group-hover:animate-pulse relative overflow-hidden">
            <span className="relative z-10 group-hover:scale-105 transition-transform duration-300">
              View & Contribute on GitHub
            </span>
            
            {/* Button particles */}
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39ff14] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
            <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-black rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl opacity-0 group-hover:opacity-20 group-hover:animate-spin transition-all duration-1000">⚡</div>
          </button>
        </a>
      </div>
    </section>
  );
}