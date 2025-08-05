import Link from "next/link"

export default function Hero() {
  const accent = "#b39ddb" // pastel purple
  const accentGreen = "#39ff14" // neon green
  return (
    <section className="w-full bg-background py-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8">
            <div className="space-y-4">
              <h1
                className="text-5xl md:text-7xl font-black leading-tight text-primary"
                style={{ letterSpacing: -2 }}
              >
                Chat. Collaborate. Ship code.
                <br />
                <span style={{ color: accentGreen }}>Welcome to</span>{" "}
                <span style={{ color: accent }}>NPMChat</span>
                <span className="block text-2xl md:text-3xl font-bold mt-4 text-primary">
                  — the neo-brutalist chat for devs.
                </span>
              </h1>
            </div>
            <div className="space-y-4">
              <div className="flex flex-row gap-4">
                <Link href="/signup">
                  <button className="border-2 border-black bg-[#b39ddb] hover:bg-[#39ff14] text-black font-extrabold text-lg px-8 py-4 transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] brutal-shadow hover:brutal-shadow-hover">
                    Sign Up
                  </button>
                </Link>
                <Link href="/login">
                  <button className="border-2 border-black bg-white hover:bg-[#b39ddb] text-black font-extrabold text-lg px-8 py-4 transition-all cursor-[url('/custom-cursor-click.svg'),_pointer] brutal-shadow hover:brutal-shadow-hover">
                    Login
                  </button>
                </Link>
              </div>
              <p className="text-sm text-primary font-medium mt-2">
                Minimal. Bold. For devs who love npm.
              </p>
            </div>
          </div>

          {/* Right Illustration */}
          <div className="relative">
            <div className="bg-white border-2 border-black p-8 rounded-sm brutal-shadow">
              <div className="space-y-4">
                {/* Terminal Window */}
                <div className="bg-black text-[#39ff14] p-4 rounded-sm font-mono text-sm border-2 border-black">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex space-x-1">
                      <div className="w-3 h-3 bg-[#b39ddb] rounded-full border-2 border-black"></div>
                      <div className="w-3 h-3 bg-[#39ff14] rounded-full border-2 border-black"></div>
                      <div className="w-3 h-3 bg-white rounded-full border-2 border-black"></div>
                    </div>
                    <span className="text-xs text-white">
                      npm-chat@terminal
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div>$ npm run dev</div>
                    <div className="text-[#b39ddb]">✓ Local server started</div>
                    <div className="text-[#b39ddb]">💬 Ready to chat!</div>
                  </div>
                </div>
                {/* Chat Window */}
                <div className="bg-white border-2 border-black p-4 rounded-sm">
                  <div className="space-y-3">
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-[#b39ddb] rounded-sm flex items-center justify-center text-xs font-bold text-black border-2 border-black">
                        A
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-black">
                          Alice
                        </div>
                        <div className="text-sm text-black">
                          Testing out my new chat app!
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-2">
                      <div className="w-6 h-6 bg-[#39ff14] rounded-sm flex items-center justify-center text-xs font-bold text-black border-2 border-black">
                        B
                      </div>
                      <div className="flex-1">
                        <div className="text-xs font-bold text-black">Bob</div>
                        <div className="text-sm text-black">
                          Looks cool! Is this your side project?
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 w-16 h-16 bg-[#b39ddb] border-2 border-black transform rotate-12"></div>
            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-[#39ff14] border-2 border-black transform -rotate-12"></div>
          </div>
        </div>
      </div>
    </section>
  )
}
