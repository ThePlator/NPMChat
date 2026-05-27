"use client"

import { useState, useRef, useCallback } from "react"
import { Copy, Image, FileSpreadsheet, Check, ChevronDown } from "lucide-react"

const comparisonData = [
  { feature: "Code Editor", npmchat: true, slack: false, discord: false },
  { feature: "Code Execution", npmchat: true, slack: false, discord: false },
  { feature: "Interview Mode", npmchat: true, slack: false, discord: false },
  { feature: "Open Source", npmchat: true, slack: false, discord: false },
]

type ExportFormat = "markdown" | "csv" | "image"

export default function ComparisonTable() {
  const [copiedFormat, setCopiedFormat] = useState<ExportFormat | null>(null)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const tableRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const showCopiedFeedback = useCallback((format: ExportFormat) => {
    setCopiedFormat(format)
    setTimeout(() => setCopiedFormat(null), 2000)
  }, [])

  const generateMarkdown = useCallback(() => {
    const header = "| Feature | NPMChat | Slack | Discord |"
    const separator = "|---------|---------|-------|---------|"
    const rows = comparisonData.map(
      (row) =>
        `| ${row.feature} | ${row.npmchat ? "✓" : "✗"} | ${row.slack ? "✓" : "✗"} | ${row.discord ? "✓" : "✗"} |`
    )
    return [header, separator, ...rows].join("\n")
  }, [])

  const generateCSV = useCallback(() => {
    const header = "Feature,NPMChat,Slack,Discord"
    const rows = comparisonData.map(
      (row) =>
        `${row.feature},${row.npmchat ? "Yes" : "No"},${row.slack ? "Yes" : "No"},${row.discord ? "Yes" : "No"}`
    )
    return [header, ...rows].join("\n")
  }, [])

  const copyAsMarkdown = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generateMarkdown())
      showCopiedFeedback("markdown")
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea")
      textarea.value = generateMarkdown()
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      showCopiedFeedback("markdown")
    }
    setIsDropdownOpen(false)
  }, [generateMarkdown, showCopiedFeedback])

  const exportAsCSV = useCallback(() => {
    const csvContent = generateCSV()
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "npmchat-comparison.csv"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    showCopiedFeedback("csv")
    setIsDropdownOpen(false)
  }, [generateCSV, showCopiedFeedback])

  const exportAsImage = useCallback(async () => {
    if (!tableRef.current) return
    try {
      const html2canvas = (await import("html2canvas-pro")).default
      const canvas = await html2canvas(tableRef.current, {
        backgroundColor: "#ffffff",
        scale: 2,
        useCORS: true,
      })
      const url = canvas.toDataURL("image/png")
      const link = document.createElement("a")
      link.href = url
      link.download = "npmchat-comparison.png"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      showCopiedFeedback("image")
    } catch (err) {
      console.error("Failed to export as image:", err)
    }
    setIsDropdownOpen(false)
  }, [showCopiedFeedback])

  const exportActions: {
    format: ExportFormat
    label: string
    icon: React.ReactNode
    action: () => void
  }[] = [
    {
      format: "markdown",
      label: "Copy as Markdown",
      icon: <Copy className="w-4 h-4" />,
      action: copyAsMarkdown,
    },
    {
      format: "csv",
      label: "Export as CSV",
      icon: <FileSpreadsheet className="w-4 h-4" />,
      action: exportAsCSV,
    },
    {
      format: "image",
      label: "Export as Image",
      icon: <Image className="w-4 h-4" />,
      action: exportAsImage,
    },
  ]

  return (
    <div>
      {/* Export Controls */}
      <div className="flex justify-end mb-4">
        <div className="relative" ref={dropdownRef}>
          <button
            id="comparison-export-button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2 bg-white border-3 border-black px-4 py-2.5 font-bold text-sm shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:shadow-[2px_2px_0_0_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] transition-all active:shadow-none active:translate-x-[4px] active:translate-y-[4px]"
          >
            {copiedFormat ? (
              <>
                <Check className="w-4 h-4 text-green-600" />
                <span className="text-green-700">
                  {copiedFormat === "markdown"
                    ? "Copied!"
                    : copiedFormat === "csv"
                      ? "Downloaded!"
                      : "Saved!"}
                </span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy / Export</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                />
              </>
            )}
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white border-3 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] z-10">
              {exportActions.map(({ format, label, icon, action }) => (
                <button
                  key={format}
                  id={`comparison-export-${format}`}
                  onClick={action}
                  className="flex items-center gap-3 w-full px-4 py-3 text-left font-semibold text-sm hover:bg-[#39ff14]/20 transition-colors border-b-2 border-black last:border-b-0"
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Comparison Table */}
      <div ref={tableRef}>
        <div className="bg-white border-3 sm:border-4 border-black shadow-[4px_4px_0_0_rgba(0,0,0,1)] sm:shadow-[6px_6px_0_0_rgba(0,0,0,1)] lg:shadow-[8px_8px_0_0_rgba(0,0,0,1)] overflow-hidden">
          <div className="grid grid-cols-4 gap-0 text-black">
            {/* Header Row */}
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

            {/* Data Rows */}
            {comparisonData.map((row) => (
              <div key={row.feature} className="contents">
                <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 font-bold text-xs sm:text-sm lg:text-base">
                  {row.feature}
                </div>
                <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-green-600 font-bold">
                  {row.npmchat ? "✓" : "✗"}
                </div>
                <div className="border-r-2 sm:border-r-4 border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                  {row.slack ? "✓" : "✗"}
                </div>
                <div className="border-t-2 sm:border-t-4 border-black p-2.5 sm:p-3 lg:p-4 text-center text-red-600 font-bold">
                  {row.discord ? "✓" : "✗"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
