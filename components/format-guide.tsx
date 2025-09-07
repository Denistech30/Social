import { Card } from "@/components/ui/card"
import { Info } from "lucide-react"

export function FormatGuide() {
  const examples = [
    { input: "**bold text**", output: "𝐛𝐨𝐥𝐝 𝐭𝐞𝐱𝐭" },
    { input: "*italic text*", output: "𝘪𝘵𝘢𝘭𝘪𝘤 𝘵𝘦𝘹𝘵" },
    { input: "### Heading", output: "𝗛𝗘𝗔𝗗𝗜𝗡𝗚" },
    { input: "~~strikethrough~~", output: "s̶t̶r̶i̶k̶e̶t̶h̶r̶o̶u̶g̶h̶" },
  ]

  return (
    <Card className="bg-blue-50 border-l-4 border-l-blue-500 mb-8">
      <div className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900">Formatting Guide</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
          {examples.map((example, index) => (
            <div key={index} className="font-mono text-gray-700">
              <span className="text-blue-600">{example.input}</span>
              <span className="mx-2">→</span>
              <span>{example.output}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
