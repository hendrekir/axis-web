import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getBrief } from '../api'

export default function Brief() {
  const { getToken } = useAuth()
  const [brief, setBrief] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function fetchBrief() {
    setLoading(true)
    setError(null)
    try {
      const token = await getToken()
      const data = await getBrief(token)
      setBrief(data.brief)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Daily Brief</h1>
            <p className="text-neutral-400 mt-1">
              {new Date().toLocaleDateString('en-AU', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <button
            onClick={fetchBrief}
            disabled={loading}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? 'Generating...' : brief ? 'Refresh' : 'Generate Brief'}
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {brief ? (
          <div className="space-y-3">
            {(() => {
              let cleaned = brief.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
              let messages
              try {
                const parsed = JSON.parse(cleaned)
                messages = Array.isArray(parsed) ? parsed : [cleaned]
              } catch {
                messages = cleaned.split('\n\n').filter(Boolean)
              }
              return messages.map((msg, i) => (
                <div key={i} className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl px-5 py-4">
                  <p className="text-neutral-200 text-sm leading-relaxed">{msg}</p>
                </div>
              ))
            })()}
          </div>
        ) : !loading ? (
          <div className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-8 text-center">
            <p className="text-neutral-500 text-sm">
              Tap "Generate Brief" to get your morning digest.
            </p>
            <p className="text-neutral-600 text-xs mt-2">
              Pulls your tasks, emails, and overnight activity into a quick summary.
            </p>
          </div>
        ) : (
          <div className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-8 text-center">
            <p className="text-neutral-400 text-sm animate-pulse">
              Axis is assembling your brief...
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
