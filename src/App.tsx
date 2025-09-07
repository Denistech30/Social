import TextFormatter from "./components/TextFormatter"
import "./App.css"

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-emerald-50/30 p-6">
      <div className="max-w-5xl mx-auto">
        <header className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 transform hover:scale-105 transition-transform duration-200">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-800 via-gray-700 to-emerald-700 bg-clip-text text-transparent">
              Social Text Formatter
            </h1>
          </div>
          <p className="text-gray-600 text-lg font-medium max-w-2xl mx-auto leading-relaxed">
            Transform your text with beautiful Unicode formatting for Facebook, LinkedIn, TikTok, Instagram, X, and more!
          </p>
        </header>

        <TextFormatter />
      </div>
    </div>
  )
}

export default App
