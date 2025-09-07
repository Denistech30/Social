import React, { useState, useCallback, useEffect } from 'react'
import { Copy } from 'lucide-react'
import FormatGuide from './FormatGuide'
import Toast from './Toast'
import AIEnhancer from './AIEnhancer'
import HashtagGenerator from './HashtagGenerator'
import AdvancedAIFeatures from './AdvancedAIFeatures'

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

// Extra bold map for # headings (biggest)
const extraBoldMap: Record<string, string> = {
  A: "𝗔",
  B: "𝗕",
  C: "𝗖",
  D: "𝗗",
  E: "𝗘",
  F: "𝗙",
  G: "𝗚",
  H: "𝗛",
  I: "𝗜",
  J: "𝗝",
  K: "𝗞",
  L: "𝗟",
  M: "𝗠",
  N: "𝗡",
  O: "𝗢",
  P: "𝗣",
  Q: "𝗤",
  R: "𝗥",
  S: "𝗦",
  T: "𝗧",
  U: "𝗨",
  V: "𝗩",
  W: "𝗪",
  X: "𝗫",
  Y: "𝗬",
  Z: "𝗭",
  a: "𝗮",
  b: "𝗯",
  c: "𝗰",
  d: "𝗱",
  e: "𝗲",
  f: "𝗳",
  g: "𝗴",
  h: "𝗵",
  i: "𝗶",
  j: "𝗷",
  k: "𝗸",
  l: "𝗹",
  m: "𝗺",
  n: "𝗻",
  o: "𝗼",
  p: "𝗽",
  q: "𝗾",
  r: "𝗿",
  s: "𝘀",
  t: "𝘁",
  u: "𝘂",
  v: "𝘃",
  w: "𝘄",
  x: "𝘅",
  y: "𝘆",
  z: "𝘇",
  "0": "𝟬",
  "1": "𝟭",
  "2": "𝟮",
  "3": "𝟯",
  "4": "𝟰",
  "5": "𝟱",
  "6": "𝟲",
  "7": "𝟳",
  "8": "𝟴",
  "9": "𝟵",
}

// Small caps map for #### headings (tiny)
const smallCapsMap: Record<string, string> = {
  A: "ᴀ",
  B: "ʙ",
  C: "ᴄ",
  D: "ᴅ",
  E: "ᴇ",
  F: "ғ",
  G: "ɢ",
  H: "ʜ",
  I: "ɪ",
  J: "ᴊ",
  K: "ᴋ",
  L: "ʟ",
  M: "ᴍ",
  N: "ɴ",
  O: "ᴏ",
  P: "ᴘ",
  Q: "ǫ",
  R: "ʀ",
  S: "s",
  T: "ᴛ",
  U: "ᴜ",
  V: "ᴠ",
  W: "ᴡ",
  X: "x",
  Y: "ʏ",
  Z: "ᴢ",
  a: "ᴀ",
  b: "ʙ",
  c: "ᴄ",
  d: "ᴅ",
  e: "ᴇ",
  f: "ғ",
  g: "ɢ",
  h: "ʜ",
  i: "ɪ",
  j: "ᴊ",
  k: "ᴋ",
  l: "ʟ",
  m: "ᴍ",
  n: "ɴ",
  o: "ᴏ",
  p: "ᴘ",
  q: "ǫ",
  r: "ʀ",
  s: "s",
  t: "ᴛ",
  u: "ᴜ",
  v: "ᴠ",
  w: "ᴡ",
  x: "x",
  y: "ʏ",
  z: "ᴢ",
}

const TextFormatter: React.FC = () => {
  const [inputText, setInputText] = useState("")
  const [outputText, setOutputText] = useState("Your formatted text will appear here...")
  const [toastMessage, setToastMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [selectedHashtags, setSelectedHashtags] = useState<string[]>([])

  const convertToBold = useCallback((text: string): string => {
    return text
      .split("")
      .map((char) => boldMap[char] || char)
      .join("")
  }, [])

  const convertToItalic = useCallback((text: string): string => {
    return text
      .split("")
      .map((char) => italicMap[char] || char)
      .join("")
  }, [])

  const convertToExtraBold = useCallback((text: string): string => {
    return text
      .split("")
      .map((char) => extraBoldMap[char] || char)
      .join("")
  }, [])

  const convertToSmallCaps = useCallback((text: string): string => {
    return text
      .split("")
      .map((char) => smallCapsMap[char] || char)
      .join("")
  }, [])

  const addStrikethrough = useCallback((text: string): string => {
    return text
      .split("")
      .map((char) => char + "\u0336")
      .join("")
  }, [])

  const formatText = useCallback(
    (input: string): string => {
      let output = input

      // Convert headings - multiple levels (order matters - longest first)
      // # Big Heading → Extra bold, biggest
      output = output.replace(/^# (.+)$/gm, (_, text) => {
        return convertToExtraBold(text.toUpperCase())
      })

      // ## Medium Heading → Bold
      output = output.replace(/^## (.+)$/gm, (_, text) => {
        return convertToBold(text.toUpperCase())
      })

      // ### Small Heading → Regular bold (existing functionality)
      output = output.replace(/^### (.+)$/gm, (_, text) => {
        return convertToBold(text.toUpperCase())
      })

      // #### Tiny Heading → Small caps
      output = output.replace(/^#### (.+)$/gm, (_, text) => {
        return convertToSmallCaps(text.toLowerCase())
      })

      // Convert bold (**text**)
      output = output.replace(/\*\*(.+?)\*\*/g, (_, text) => {
        return convertToBold(text)
      })

      // Convert italic (*text*)
      output = output.replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, (_, text) => {
        return convertToItalic(text)
      })

      // Convert strikethrough (~~text~~)
      output = output.replace(/~~(.+?)~~/g, (_, text) => {
        return addStrikethrough(text)
      })

      return output
    },
    [convertToBold, convertToItalic, convertToExtraBold, convertToSmallCaps, addStrikethrough],
  )

  useEffect(() => {
    if (inputText.trim()) {
      setOutputText(formatText(inputText))
    } else {
      setOutputText("Your formatted text will appear here...")
    }
  }, [inputText, formatText])

  const handleCopy = async () => {
    if (!outputText || outputText === "Your formatted text will appear here...") {
      setToastMessage("Please enter some text to format first!")
      setShowToast(true)
      return
    }

    let textToCopy = outputText;
    
    // Add hashtags to the copied text if any are selected
    if (selectedHashtags.length > 0) {
      const hashtagString = selectedHashtags.map(tag => `#${tag}`).join(' ');
      textToCopy = `${outputText}\n\n${hashtagString}`;
    }
    
    try {
      await navigator.clipboard.writeText(textToCopy)
      setToastMessage("✅ Text and hashtags copied to clipboard!")
      setShowToast(true)
    } catch (err) {
      console.error("Failed to copy text: ", err)
      setToastMessage("❌ Failed to copy text to clipboard")
      setShowToast(true)
    }
  }


  const defaultPlaceholder = `Type your text here using markdown formatting...

Examples:
### My Awesome Post

🔥 **This is bold text**
*This is italic text*
~~This is strikethrough~~

Ready to share!`

  return (
    <div className="space-y-6">
      <FormatGuide />
      
      <AIEnhancer text={inputText} onTextChange={setInputText} />
      
      <HashtagGenerator text={inputText} onHashtagsChange={setSelectedHashtags} />
      
      <AdvancedAIFeatures text={inputText} onTextChange={setInputText} selectedHashtags={selectedHashtags} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
                <span className="text-emerald-600 text-xs font-bold">T</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Input Text</h2>
            </div>
            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">{inputText.length} chars</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Type your text using markdown formatting</p>
          
          {/* Format Buttons */}
          <div className="flex gap-2 mb-4">
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <span className="font-bold">B</span> Bold
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <span className="italic">I</span> Italic
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <span className="font-bold">H</span> Heading
            </button>
            <button className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium text-gray-700 transition-colors">
              <span className="line-through">S</span> Strike
            </button>
          </div>

          <div className="mb-3">
            <div className="text-xs text-gray-500 mb-1">💡 My Awesome Post</div>
            <div className="text-sm text-gray-700 mb-1">🔥 <span className="text-orange-500">"This is bold text"</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="text-blue-500">"This is italic text"</span></div>
            <div className="text-sm text-gray-700 mb-1"><span className="text-purple-500">"This is strikethrough"</span></div>
            <div className="text-sm text-gray-700">Ready to share!</div>
          </div>

          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={defaultPlaceholder}
            className="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
          />
        </div>

        {/* Output Section */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-emerald-100 rounded flex items-center justify-center">
                <span className="text-emerald-600 text-xs font-bold">✓</span>
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Formatted Output</h2>
            </div>
            <span className="bg-emerald-500 text-white text-xs px-2 py-1 rounded-full font-medium">{outputText === "Your formatted text will appear here..." ? 0 : outputText.length} chars</span>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">Copy this text to your social media posts</p>

          <div className="w-full h-80 p-4 border border-gray-300 rounded-lg bg-gray-50 overflow-y-auto whitespace-pre-wrap break-words text-sm leading-relaxed text-gray-700 mb-4">
            {outputText === "Your formatted text will appear here..." ? (
              <span className="text-gray-400 italic">Your formatted text will appear here...</span>
            ) : (
              <>
                {outputText}
                {selectedHashtags.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-300">
                    <div className="text-xs text-gray-500 mb-2">Selected Hashtags:</div>
                    <div className="flex flex-wrap gap-1">
                      {selectedHashtags.map((tag, index) => (
                        <span key={index} className="text-blue-600 text-sm">#{tag}</span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          <button
            onClick={handleCopy}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
            Copy to Clipboard
          </button>
        </div>
      </div>

      <Toast message={toastMessage} show={showToast} onClose={() => setShowToast(false)} />
    </div>
  )
}

export default TextFormatter
