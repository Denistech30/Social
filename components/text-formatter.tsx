"use client"

import { useState, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Copy, Trash2, Edit3, Smartphone } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { FormatGuide } from "./format-guide"
import { CharacterCounter } from "./character-counter"

// Unicode character maps for styling
const boldMap: Record<string, string> = {
  A: "𝐀",
  B: "𝐁",
  C: "𝐂",
  D: "𝐃",
  E: "𝐄",
  F: "𝐅",
  G: "𝐆",
  H: "𝐇",
  I: "𝐈",
  J: "𝐉",
  K: "𝐊",
  L: "𝐋",
  M: "𝐌",
  N: "𝐍",
  O: "𝐎",
  P: "𝐏",
  Q: "𝐐",
  R: "𝐑",
  S: "𝐒",
  T: "𝐓",
  U: "𝐔",
  V: "𝐕",
  W: "𝐖",
  X: "𝐗",
  Y: "𝐘",
  Z: "𝐙",
  a: "𝐚",
  b: "𝐛",
  c: "𝐜",
  d: "𝐝",
  e: "𝐞",
  f: "𝐟",
  g: "𝐠",
  h: "𝐡",
  i: "𝐢",
  j: "𝐣",
  k: "𝐤",
  l: "𝐥",
  m: "𝐦",
  n: "𝐧",
  o: "𝐨",
  p: "𝐩",
  q: "𝐪",
  r: "𝐫",
  s: "𝐬",
  t: "𝐭",
  u: "𝐮",
  v: "𝐯",
  w: "𝐰",
  x: "𝐱",
  y: "𝐲",
  z: "𝐳",
  "0": "𝟎",
  "1": "𝟏",
  "2": "𝟐",
  "3": "𝟑",
  "4": "𝟒",
  "5": "𝟓",
  "6": "𝟔",
  "7": "𝟕",
  "8": "𝟖",
  "9": "𝟗",
}

const italicMap: Record<string, string> = {
  A: "𝐴",
  B: "𝐵",
  C: "𝐶",
  D: "𝐷",
  E: "𝐸",
  F: "𝐹",
  G: "𝐺",
  H: "𝐻",
  I: "𝐼",
  J: "𝐽",
  K: "𝐾",
  L: "𝐿",
  M: "𝑀",
  N: "𝑁",
  O: "𝑂",
  P: "𝑃",
  Q: "𝑄",
  R: "𝑅",
  S: "𝑆",
  T: "𝑇",
  U: "𝑈",
  V: "𝑉",
  W: "𝑊",
  X: "𝑋",
  Y: "𝑌",
  Z: "𝑍",
  a: "𝘢",
  b: "𝘣",
  c: "𝘤",
  d: "𝘥",
  e: "𝘦",
  f: "𝘧",
  g: "𝘨",
  h: "𝘩",
  i: "𝘪",
  j: "𝘫",
  k: "𝘬",
  l: "𝘭",
  m: "𝘮",
  n: "𝘯",
  o: "𝘰",
  p: "𝘱",
  q: "𝘲",
  r: "𝘳",
  s: "𝘴",
  t: "𝘵",
  u: "𝘶",
  v: "𝘷",
  w: "𝘸",
  x: "𝘹",
  y: "𝘺",
  z: "𝘻",
}

function convertToBold(text: string): string {
  return text
    .split("")
    .map((char) => boldMap[char] || char)
    .join("")
}

function convertToItalic(text: string): string {
  return text
    .split("")
    .map((char) => italicMap[char] || char)
    .join("")
}

function addStrikethrough(text: string): string {
  return text
    .split("")
    .map((char) => char + "\u0336")
    .join("")
}

function formatText(input: string): string {
  let output = input

  // Convert headings (### text)
  output = output.replace(/^### (.+)$/gm, (match, text) => {
    return convertToBold(text.toUpperCase())
  })

  // Convert bold (**text**)
  output = output.replace(/\*\*(.+?)\*\*/g, (match, text) => {
    return convertToBold(text)
  })

  // Convert italic (*text*)
  output = output.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, (match, text) => {
    return convertToItalic(text)
  })

  // Convert strikethrough (~~text~~)
  output = output.replace(/~~(.+?)~~/g, (match, text) => {
    return addStrikethrough(text)
  })

  return output
}

const defaultText = `### My Awesome Post

🔥 **This is bold text**
*This is italic text*
~~This is strikethrough~~

Ready to share!`

export function TextFormatter() {
  const [inputText, setInputText] = useState(defaultText)
  const [outputText, setOutputText] = useState("")
  const { toast } = useToast()

  const updateOutput = useCallback((text: string) => {
    const formatted = formatText(text)
    setOutputText(formatted)
  }, [])

  const handleInputChange = (value: string) => {
    setInputText(value)
    updateOutput(value)
  }

  const copyToClipboard = async () => {
    if (!outputText || outputText === "Your formatted text will appear here...") {
      toast({
        title: "Nothing to copy",
        description: "Please enter some text to format first!",
        variant: "destructive",
      })
      return
    }

    try {
      await navigator.clipboard.writeText(outputText)
      toast({
        title: "Copied!",
        description: "Text copied to clipboard successfully",
      })
    } catch (err) {
      console.error("Failed to copy text: ", err)
      toast({
        title: "Copy failed",
        description: "Failed to copy text to clipboard",
        variant: "destructive",
      })
    }
  }

  const clearAll = () => {
    setInputText("")
    setOutputText("")
  }

  // Initialize output on mount
  useState(() => {
    updateOutput(defaultText)
  })

  return (
    <Card className="bg-white/95 backdrop-blur-sm border-0 shadow-2xl">
      <div className="p-6 md:p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-3">
            Social Text Formatter
          </h1>
          <p className="text-lg text-muted-foreground">
            Format your text for Facebook, LinkedIn, TikTok, Instagram, X, and more!
          </p>
        </div>

        {/* Format Guide */}
        <FormatGuide />

        {/* Editor Container */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Input Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Edit3 className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Input Text (Markdown)</h2>
            </div>
            <div className="space-y-2">
              <Textarea
                value={inputText}
                onChange={(e) => handleInputChange(e.target.value)}
                placeholder="Type your text here using markdown formatting..."
                className="min-h-[300px] font-mono text-sm resize-none"
              />
              <CharacterCounter count={inputText.length} />
            </div>
          </div>

          {/* Output Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <Smartphone className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-semibold">Social Media Ready</h2>
            </div>
            <div className="space-y-2">
              <div className="min-h-[300px] p-4 border-2 border-border rounded-lg bg-background overflow-y-auto whitespace-pre-wrap break-words text-sm">
                {outputText || "Your formatted text will appear here..."}
              </div>
              <CharacterCounter count={outputText.length} />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={copyToClipboard}
            className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-200"
            size="lg"
          >
            <Copy className="w-4 h-4 mr-2" />
            Copy to Clipboard
          </Button>
          <Button onClick={clearAll} variant="secondary" size="lg" className="hover:bg-secondary/80">
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All
          </Button>
        </div>
      </div>
    </Card>
  )
}
