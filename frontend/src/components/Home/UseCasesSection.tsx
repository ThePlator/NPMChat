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
          <h2 className="text-3xl md:text-4xl font-black text-primary mb-4">
            Who's This For? Anyone Who Loves to Build & Learn!
          </h2>
        </div>
        {/* Right Use Cases */}
        <div className="space-y-6">
          {useCases.map((uc) => (
            <div
              key={uc.text}
              className="flex items-center p-4 bg-[#fef6e4] border-4 border-black rounded-sm brutal-shadow"
            >
              <CheckCircle className="w-6 h-6 text-[#39ff14] mr-3" />
              <span className="text-lg font-bold text-black">{uc.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
