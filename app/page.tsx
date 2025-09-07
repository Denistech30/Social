import { TextFormatter } from "@/components/text-formatter"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-500 to-purple-700 p-4 md:p-8">
      <div className="mx-auto max-w-6xl">
        <TextFormatter />
      </div>
    </main>
  )
}
