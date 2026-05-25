import Header from "../../components/Home/Header"
import Footer from "../../components/Home/Footer"
import FeatureCard from "../../components/Features/FeatureCard"
import ComparisonTable from "../../components/Features/ComparisonTable"
import {
  MessageSquare,
  Code2,
  Clock,
  FileText,
  Upload,
  Play,
  Zap,
  Shield,
  Users,
  Smartphone,
  Globe,
  Heart,
} from "lucide-react"

const mainFeatures = [
  {
    icon: <MessageSquare className="w-8 h-8 text-purple-600" />,
    title: "Real-time Messaging",
    description:
      "Instant, room-based chat powered by WebSockets. Connect with your team in real-time with zero delay and perfect synchronization.",
    bgColor: "bg-[#e9d5ff]",
    details: [
      "WebSocket technology",
      "Room-based organization",
      "Typing indicators",
      "Message history",
    ],
  },
  {
    icon: <Code2 className="w-8 h-8 text-green-600" />,
    title: "Collaborative Code Editor",
    description:
      "A live, shared Monaco editor for pair programming. Write, edit, and debug code together with real-time collaboration features.",
    bgColor: "bg-[#d9f99d]",
    details: [
      "Monaco Editor integration",
      "Live cursor tracking",
      "Syntax highlighting",
      "Multi-language support",
    ],
  },
  {
    icon: <Clock className="w-8 h-8 text-orange-600" />,
    title: "Live Interview Mode",
    description:
      "A specialized room with a timer and prompts to conduct mock interviews. Perfect for technical assessments and coding challenges.",
    bgColor: "bg-[#fef6e4]",
    details: [
      "Built-in timer",
      "Question prompts",
      "Screen sharing",
      "Assessment tools",
    ],
  },
  {
    icon: <FileText className="w-8 h-8 text-blue-600" />,
    title: "Shared Scratchpads",
    description:
      "A persistent notepad and code snippet manager for each chat room. Save, organize, and share your thoughts and code snippets.",
    bgColor: "bg-[#e0f2fe]",
    details: [
      "Persistent storage",
      "Code snippet library",
      "Markdown support",
      "Quick notes",
    ],
  },
  {
    icon: <Upload className="w-8 h-8 text-pink-600" />,
    title: "File Sharing & Previews",
    description:
      "Drag-and-drop file sharing with syntax highlighting for code files. Upload and preview .js, .py, and more directly in chat.",
    bgColor: "bg-[#fce7f3]",
    details: [
      "Drag & drop support",
      "Code previews",
      "Multiple file formats",
      "Download protection",
    ],
  },
  {
    icon: <Play className="w-8 h-8 text-red-600" />,
    title: "Code Execution Engine",
    description:
      "Run code snippets directly within the chat and see the output instantly. Powered by external APIs like Piston and Judge0.",
    bgColor: "bg-[#fee2e2]",
    details: [
      "Multiple languages",
      "Instant execution",
      "Output display",
      "Error handling",
    ],
  },
]

const additionalFeatures = [
  {
    icon: <Zap className="w-6 h-6 text-yellow-600" />,
    title: "Lightning Fast",
    description: "Optimized performance with minimal load times",
  },
  {
    icon: <Shield className="w-6 h-6 text-green-600" />,
    title: "Secure & Private",
    description: "End-to-end encryption and privacy-first design",
  },
  {
    icon: <Users className="w-6 h-6 text-blue-600" />,
    title: "Team Management",
    description: "Organize teams, roles, and permissions easily",
  },
  {
    icon: <Smartphone className="w-6 h-6 text-purple-600" />,
    title: "Mobile Ready",
    description: "Fully responsive design for all devices",
  },
  {
    icon: <Globe className="w-6 h-6 text-indigo-600" />,
    title: "Open Source",
    description: "Transparent, community-driven development",
  },
  {
    icon: <Heart className="w-6 h-6 text-red-600" />,
    title: "Developer Love",
    description: "Built by developers, for developers",
  },
]

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="bg-white py-12 sm:py-16 lg:py-20 px-4 sm:px-6 border-black">
        <div className="max-w-6xl mx-auto text-center">
          <div className="mb-6 sm:mb-8">
            <span className="bg-[#39ff14] text-black font-bold px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base border-2 border-black shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
              FEATURES OVERVIEW
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-black mb-4 sm:mb-6 leading-tight">
            Powerful <span className="text-[#b39ddb]">Features</span>
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-gray-700 mb-6 sm:mb-8 max-w-4xl mx-auto font-medium leading-relaxed">
            Everything you need for seamless team collaboration, real-time
            coding, and productive development workflows — all in one place.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-3 sm:mb-4">
              Core Features
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Six powerful tools that transform how development teams
              communicate and collaborate
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {mainFeatures.map((feature, index) => (
              <div
                key={index}
                className={`${feature.bgColor} border-3 sm:border-4 border-black p-5 sm:p-6 lg:p-8 shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] lg:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] lg:hover:shadow-[8px_8px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1 min-w-0`}
              >
                <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-white border-3 sm:border-4 border-black mb-4 sm:mb-6 shadow-[2px_2px_0_0_rgba(0,0,0,1)] sm:shadow-[3px_3px_0_0_rgba(0,0,0,1)]">
                  {feature.icon}
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-black mb-3 sm:mb-4">
                  {feature.title}
                </h3>
                <p className="text-gray-800 leading-relaxed mb-4 sm:mb-6 text-base sm:text-lg">
                  {feature.description}
                </p>
                <div className="space-y-1.5 sm:space-y-2">
                  {feature.details.map((detail, idx) => (
                    <div
                      key={idx}
                      className="flex items-center text-xs sm:text-sm font-bold text-gray-700"
                    >
                      <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-black mr-2 sm:mr-3 shrink-0"></div>
                      {detail}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-3 sm:mb-4">
              Why Choose NPMChat?
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">
              More reasons to love our platform
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6 lg:gap-8">
            {additionalFeatures.map((feature, index) => (
              <div
                key={index}
                className="bg-white border-3 sm:border-4 border-black p-5 sm:p-6 shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] lg:shadow-[8px_8px_0_0_rgba(0,0,0,1)] hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:hover:shadow-[6px_6px_0_0_rgba(0,0,0,1)] transition-all hover:-translate-y-1"
              >
                <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-[#39ff14] border-2 border-black mb-3 sm:mb-4 shadow-[2px_2px_0_0_rgba(0,0,0,1)]">
                  {feature.icon}
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-black mb-2 sm:mb-3">
                  {feature.title}
                </h3>
                <p className="text-sm sm:text-base text-gray-700">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-black mb-3 sm:mb-4">
              NPMChat vs Others
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600">See what makes us different</p>
          </div>
          <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="min-w-[520px] sm:min-w-0 px-4 sm:px-0">
              <div className="bg-white border-3 sm:border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] lg:shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
                <div className="grid grid-cols-4 gap-0 text-black">
                  <div className="bg-[#b39ddb] border-r-2 sm:border-r-4 border-black p-3 sm:p-4 lg:p-6 font-black text-black text-sm sm:text-base lg:text-lg">
                    Feature
                  </div>
                  <div className="bg-[#39ff14] border-r-2 sm:border-r-4 border-black p-3 sm:p-4 lg:p-6 font-black text-black text-center text-sm sm:text-base">
                    NPMChat
                  </div>
                  <div className="bg-gray-200 border-r-2 sm:border-r-4 border-black p-3 sm:p-4 lg:p-6 font-bold text-black text-center text-sm sm:text-base">
                    Slack
                  </div>
                  <div className="bg-gray-200 p-3 sm:p-4 lg:p-6 font-bold text-black text-center text-sm sm:text-base">
                    Discord
                  </div>

                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 font-bold text-xs sm:text-sm lg:text-base">
                    Code Editor
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-green-600 font-bold">
                    ✓
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>
                  <div className="border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>

                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 font-bold text-xs sm:text-sm lg:text-base">
                    Code Execution
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-green-600 font-bold">
                    ✓
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>
                  <div className="border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>

                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 font-bold text-xs sm:text-sm lg:text-base">
                    Interview Mode
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-green-600 font-bold">
                    ✓
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>
                  <div className="border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>

                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 font-bold text-xs sm:text-sm lg:text-base">
                    Open Source
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-green-600 font-bold">
                    ✓
                  </div>
                  <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>
                  <div className="border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                    ✗
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 bg-black text-white">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black mb-4 sm:mb-6">
            Ready to Level Up?
          </h2>
          <p className="text-base sm:text-lg md:text-xl mb-8 sm:mb-10 text-gray-300 leading-relaxed">
            Join thousands of developers who are already using NPMChat for their
            team collaboration.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <button className="bg-[#39ff14] text-black font-black py-3 sm:py-4 px-6 sm:px-8 border-3 sm:border-4 border-white shadow-[4px_4px_0_0_rgba(255,255,255,1)] sm:shadow-[6px_6px_0_0_rgba(255,255,255,1)] lg:shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] sm:hover:shadow-[6px_6px_0_0_rgba(255,255,255,1)] hover:-translate-y-1 transition-all text-base sm:text-lg lg:text-xl">
              Start Chatting Now
            </button>
            <button className="bg-transparent text-white font-black py-3 sm:py-4 px-6 sm:px-8 border-3 sm:border-4 border-white hover:bg-white hover:text-black transition-all text-base sm:text-lg lg:text-xl shadow-[4px_4px_0_0_rgba(255,255,255,1)] sm:shadow-[6px_6px_0_0_rgba(255,255,255,1)] lg:shadow-[8px_8px_0_0_rgba(255,255,255,1)] hover:shadow-[4px_4px_0_0_rgba(255,255,255,1)] sm:hover:shadow-[6px_6px_0_0_rgba(255,255,255,1)] hover:-translate-y-1">
              View Demo
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
