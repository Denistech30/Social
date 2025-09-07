import type React from "react"

const FormatGuide: React.FC = () => {
  const examples = [
    { label: "**bold**", output: "𝐛𝐨𝐥𝐝", icon: "B" },
    { label: "*italic*", output: "𝘪𝘵𝘢𝘭𝘪𝘤", icon: "I" },
    { label: "# big heading", output: "𝗕𝗜𝗚 𝗛𝗘𝗔𝗗𝗜𝗡𝗚", icon: "H1" },
    { label: "## medium", output: "𝐌𝐄𝐃𝐈𝐔𝐌", icon: "H2" },
    { label: "### small", output: "𝐒𝐌𝐀𝐋𝐋", icon: "H3" },
    { label: "#### tiny", output: "ᴛɪɴʏ", icon: "H4" },
    { label: "~~strike~~", output: "s̶t̶r̶i̶k̶e̶", icon: "S" },
  ]

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-xl shadow-gray-200/50 border border-gray-100 mb-8 hover:shadow-2xl hover:shadow-gray-200/60 transition-all duration-300">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
          <span className="text-white text-xs font-bold">?</span>
        </div>
        <h3 className="text-xl font-bold text-gray-800">Quick Format Guide</h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        {examples.map((example, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-3 text-center hover:from-emerald-50 hover:to-emerald-100/50 transition-all duration-200 cursor-pointer group border border-gray-200/50 hover:border-emerald-200 hover:shadow-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center mx-auto mb-2 shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-200">
              <span className="text-white font-bold text-xs">{example.icon}</span>
            </div>
            <div className="text-xs text-gray-500 mb-1 font-medium">{example.label}</div>
            <div className="text-xs font-semibold text-gray-800">{example.output}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default FormatGuide
