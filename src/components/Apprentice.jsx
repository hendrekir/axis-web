import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getApprentice, correctApprentice } from '../api'

const SECTIONS = [
  { key: 'voice_insights', title: 'Voice', description: 'How Axis writes as you' },
  { key: 'time_patterns', title: 'Time patterns', description: 'When you get things done' },
  { key: 'relationship_insights', title: 'Relationships', description: 'Who matters and how you interact' },
  { key: 'attention_patterns', title: 'Attention', description: 'What you engage with vs ignore' },
]

export default function Apprentice() {
  const { getToken, isLoaded } = useAuth()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [correcting, setCorrecting] = useState(null) // { section, index }
  const [correctionText, setCorrectionText] = useState('')
  const [correctionSent, setCorrectionSent] = useState(null)

  useEffect(() => {
    if (!isLoaded) return
    loadApprentice()
  }, [isLoaded])

  async function loadApprentice() {
    try {
      const token = await getToken()
      const result = await getApprentice(token)
      setData(result)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function submitCorrection(patternType) {
    if (!correctionText.trim()) return
    try {
      const token = await getToken()
      await correctApprentice(patternType, correctionText, token)
      setCorrectionSent(patternType)
      setCorrecting(null)
      setCorrectionText('')
      setTimeout(() => setCorrectionSent(null), 3000)
    } catch (e) {
      setError(e.message)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        Loading...
      </div>
    )
  }

  // Learning state — empty user model
  if (data?.status === 'learning') {
    return (
      <div className="h-full overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold text-white">Apprentice</h1>
          <p className="text-neutral-400 mt-1 mb-8">What Axis has learned about you</p>
          <div className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1A1726] flex items-center justify-center mx-auto mb-4">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 6v6l4 2" className="text-neutral-500" />
                <circle cx="12" cy="12" r="10" className="text-neutral-600" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">Axis is still learning</h2>
            <p className="text-neutral-400 text-sm max-w-md mx-auto">
              {data.message}
            </p>
            <p className="text-neutral-500 text-xs mt-4">
              Axis learns from your emails, tasks, thread interactions, and brain dumps.
              The more you use Axis, the smarter it gets.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const insights = data?.insights || {}

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Apprentice</h1>
          <p className="text-neutral-400 mt-1">What Axis has learned about you</p>
          {data?.last_updated && (
            <p className="text-neutral-600 text-xs mt-1">
              Last updated: {new Date(data.last_updated).toLocaleDateString()}
            </p>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Learned this week highlight */}
        {insights.learned_this_week && (
          <div className="bg-[#8B5CF6]/5 border border-[#8B5CF6]/20 rounded-xl px-5 py-4">
            <p className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-wider mb-1">Learned this week</p>
            <p className="text-white text-sm">{insights.learned_this_week}</p>
          </div>
        )}

        {/* Insight cards */}
        {SECTIONS.map(({ key, title, description }) => {
          const items = insights[key] || []
          if (items.length === 0) return null

          return (
            <section key={key} className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-5">
              <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">{title}</h2>
              <p className="text-neutral-600 text-xs mt-0.5 mb-3">{description}</p>

              <ul className="space-y-2">
                {items.map((insight, i) => (
                  <li key={i} className="flex items-start justify-between gap-3">
                    <span className="text-white text-sm leading-relaxed">{insight}</span>
                    <button
                      onClick={() => {
                        if (correcting?.section === key && correcting?.index === i) {
                          setCorrecting(null)
                          setCorrectionText('')
                        } else {
                          setCorrecting({ section: key, index: i })
                          setCorrectionText('')
                        }
                      }}
                      className="text-neutral-600 hover:text-neutral-400 text-xs whitespace-nowrap mt-0.5 transition-colors"
                    >
                      wrong?
                    </button>
                  </li>
                ))}
              </ul>

              {/* Correction input */}
              {correcting?.section === key && (
                <div className="mt-3 flex gap-2">
                  <input
                    type="text"
                    value={correctionText}
                    onChange={(e) => setCorrectionText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && submitCorrection(key)}
                    placeholder="What's wrong? e.g. 'I actually prefer mornings'"
                    className="flex-1 bg-[#1A1726] border border-[#2A2540] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#8B5CF6]"
                    autoFocus
                  />
                  <button
                    onClick={() => submitCorrection(key)}
                    className="px-3 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Send
                  </button>
                </div>
              )}

              {/* Correction confirmation */}
              {correctionSent === key && (
                <p className="text-green-400 text-xs mt-2">Noted. Axis will adjust.</p>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
