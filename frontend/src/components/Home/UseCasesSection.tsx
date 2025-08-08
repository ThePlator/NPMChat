import { CheckCircle } from "lucide-react"

const useCases = [
  { text: "Contribute to Open Source" },
  { text: "Learn in Public & Grow" },
  { text: "Collaborate on Features" },
  { text: "Share Feedback & Ideas" },
  { text: "Tinker with WebSockets" },
  { text: "Test your UI skills" },
  { text: "Show off your side project" },
]

export default function UseCasesSection() {
  return (
    <section className="w-full py-16 px-4">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left Title */}
        <div>
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-4 hover:scale-112 hover:animate-pulse  transition-all duration-500 cursor-default transform-gpu">
            Who's This For? Anyone Who Loves to Build & Learn!
          </h2>
        </div>
        {/* Right Use Cases */}
        <div className="space-y-6">
          {useCases.map((uc, index) => (
            <div
              key={uc.text}
              className="flex items-center p-4 bg-[#fef6e4] border-4 border-black rounded-sm brutal-shadow hover:brutal-shadow-hover hover:scale-110 hover:-rotate-2 hover:translate-y-[-6px] transition-all duration-500 cursor-pointer group transform-gpu relative"
              style={{
                animationDelay: `${index * 100}ms`,
                transformOrigin: "center center",
              }}
            >
              <CheckCircle className="w-6 h-6 text-[#39ff14] mr-3 group-hover:scale-125 group-hover:rotate-180 group-hover:animate-pulse transition-all duration-500" />
              <span className="text-lg font-bold text-black group-hover:scale-105 group-hover:translate-x-2 group-hover:animate-pulse transition-all duration-300">
                {uc.text}
              </span>

              {/* Floating effects */}
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#39ff14] rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-ping transition-all duration-500"></div>
              <div className="absolute -bottom-1 -left-1 w-1 h-1 bg-black rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-bounce transition-all duration-700"></div>
              <div className="absolute top-1/2 -right-2 w-3 h-1 bg-[#b39ddb] opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-all duration-600"></div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
