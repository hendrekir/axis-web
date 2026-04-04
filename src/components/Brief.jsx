import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getBrief, authHeaders } from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const TABS = ['Today', 'World', 'Learn']

const WORLD_CARDS = [
  {
    tag: 'Conflict',
    tagClasses: 'bg-red-500/20 text-red-400',
    headline: 'Iran conflict \u2014 Day 33',
    summary: 'US-Israel strikes continue. Strait of Hormuz partially blockaded. Australian petrol prices up ~30% since late February.',
  },
  {
    tag: 'Fuel',
    tagClasses: 'bg-amber-500/20 text-amber-400',
    headline: 'Brisbane fuel today',
    summary: 'ULP 202.58c/L \u00b7 Diesel 292.73c/L. Government excise cut of 26.3c/L started April 1 for 3 months.',
  },
  {
    tag: 'AI',
    tagClasses: 'bg-purple-500/20 text-purple-400',
    headline: 'AI model releases \u2014 March 2026',
    summary: 'GPT-5.4, Gemini 3.1 Pro, Claude Sonnet 4.6 all released. Claude Mythos leaked \u2014 described as step change.',
  },
  {
    tag: 'Economy',
    tagClasses: 'bg-green-500/20 text-green-400',
    headline: 'Global VC Q1 2026',
    summary: 'Hit $297B, up 150% YoY. AI capturing 81% of total venture investment.',
  },
]

function SpeakerIcon({ playing }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
      className={`w-4 h-4 ${playing ? 'text-[#8B5CF6] animate-pulse' : 'text-neutral-400'}`}
    >
      <path d="M10 3.75a.75.75 0 0 0-1.264-.546L5.203 6H3.006a.75.75 0 0 0-.75.75v6.5c0 .414.336.75.75.75h2.197l3.533 2.796A.75.75 0 0 0 10 16.25V3.75ZM15.95 5.05a.75.75 0 1 0-1.06 1.06 4.5 4.5 0 0 1 0 6.364.75.75 0 0 0 1.06 1.06 6 6 0 0 0 0-8.485ZM13.829 7.172a.75.75 0 0 0-1.06 1.06 1.5 1.5 0 0 1 0 2.122.75.75 0 0 0 1.06 1.06 3 3 0 0 0 0-4.243Z" />
    </svg>
  )
}

function PlayButton({ text, getToken }) {
  const [playing, setPlaying] = useState(false)

  async function speak() {
    if (playing) return
    setPlaying(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { setPlaying(false); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setPlaying(false); URL.revokeObjectURL(url) }
      audio.play()
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button
      onClick={speak}
      className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-[#1A1726] hover:bg-[#8B5CF6]/20 transition-colors"
      title="Listen to brief"
    >
      <SpeakerIcon playing={playing} />
    </button>
  )
}

function TodayTab({ brief, loading, error, fetchBrief, getToken }) {
  return (
    <div className="space-y-4">
      {/* Generate / Refresh button */}
      <div className="flex items-center justify-between">
        <button
          onClick={fetchBrief}
          disabled={loading}
          className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {loading ? 'Generating...' : brief ? 'Refresh' : 'Generate Brief'}
        </button>
        {brief && <PlayButton text={brief} getToken={getToken} />}
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

      {/* Placeholder info cards */}
      <div className="space-y-3 pt-2">
        <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl px-5 py-4">
          <p className="text-neutral-500 text-sm">Weather data available when Calendar is connected</p>
        </div>
        <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl px-5 py-4">
          <p className="text-neutral-500 text-sm">Your reminders will appear here</p>
        </div>
      </div>
    </div>
  )
}

function WorldTab() {
  return (
    <div className="space-y-4">
      <p className="text-neutral-400 text-xs uppercase tracking-wide font-medium">
        World intelligence — relevant to you
      </p>
      <div className="space-y-3">
        {WORLD_CARDS.map((card, i) => (
          <div key={i} className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-4">
            <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 mb-2 ${card.tagClasses}`}>
              {card.tag}
            </span>
            <p className="text-white text-sm font-medium">{card.headline}</p>
            <p className="text-neutral-400 text-xs mt-1 line-clamp-2">{card.summary}</p>
          </div>
        ))}
      </div>
      <p className="text-neutral-600 text-xs italic text-center pt-2">
        World intelligence is personalised as Axis learns more about you.
      </p>
    </div>
  )
}

const LEARN_CHUNKS = [
  {
    category: 'Financial literacy',
    categoryClasses: 'bg-emerald-500/20 text-emerald-400',
    title: 'The one concept 95% of people never learn',
    body: "The rich don't work for money — they own assets that work for them. An asset puts money in your pocket. A liability takes money out. Your house is a liability. A rental property is an asset. Most people spend their lives buying liabilities thinking they're assets.",
  },
  {
    category: 'Psychology',
    categoryClasses: 'bg-blue-500/20 text-blue-400',
    title: 'Why your brain resists important work',
    body: "The brain treats uncertainty as a threat. Starting a difficult task feels dangerous because you don't know if you'll succeed. This is why you clean your desk instead of writing the proposal. The fix: shrink the task until it feels safe. Not 'write the report' — 'write one sentence'. Motion beats meditation every time.",
  },
  {
    category: 'Business',
    categoryClasses: 'bg-amber-500/20 text-amber-400',
    title: 'The only metric that matters early on',
    body: "Revenue. Not users, not signups, not engagement. Revenue means someone valued your product enough to pay for it. Everything else is vanity. One paying customer tells you more than 1000 signups. Talk to your paying customers obsessively. Ignore everyone else until you have 10 people paying.",
  },
  {
    category: 'History',
    categoryClasses: 'bg-rose-500/20 text-rose-400',
    title: 'What the Stoics knew about control',
    body: "Divide everything into two categories: what you control and what you don't. You control your actions, your effort, your response. You don't control outcomes, other people, or luck. Most anxiety comes from trying to control the second category. The Stoics called this the dichotomy of control. It's 2000 years old and still the most useful mental model for a busy day.",
  },
]

function LearnTab() {
  const [chunkIndex, setChunkIndex] = useState(0)
  const chunk = LEARN_CHUNKS[chunkIndex]

  return (
    <div className="space-y-4">
      <p className="text-neutral-400 text-xs uppercase tracking-wide font-medium">
        Today's crucial knowledge
      </p>
      <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-4 space-y-3">
        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide rounded-full px-2 py-0.5 ${chunk.categoryClasses}`}>
          {chunk.category}
        </span>
        <p className="text-white font-medium">{chunk.title}</p>
        <p className="text-neutral-300 text-sm leading-relaxed">{chunk.body}</p>
        <div className="flex items-center justify-between pt-1">
          <button
            onClick={() => setChunkIndex((chunkIndex + 1) % LEARN_CHUNKS.length)}
            className="bg-[#1A1726] text-[#8B5CF6] text-xs font-medium rounded-lg px-3 py-1.5 hover:bg-[#8B5CF6]/10 transition-colors"
          >
            Next lesson &rarr;
          </button>
          <span className="text-neutral-600 text-xs">{chunkIndex + 1}/{LEARN_CHUNKS.length}</span>
        </div>
      </div>
    </div>
  )
}

export default function Brief() {
  const { getToken } = useAuth()
  const [activeTab, setActiveTab] = useState('Today')
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

  const dateStr = new Date().toLocaleDateString('en-AU', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="font-display text-2xl font-extrabold text-white">Brief</h1>
          <p className="text-neutral-400 mt-1">{dateStr}</p>
        </div>

        {/* Pill tabs */}
        <div className="flex gap-2">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 text-sm font-medium rounded-full transition-colors ${
                activeTab === tab
                  ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                  : 'bg-[#1A1726] text-neutral-500 hover:text-neutral-300'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'Today' && (
          <TodayTab
            brief={brief}
            loading={loading}
            error={error}
            fetchBrief={fetchBrief}
            getToken={getToken}
          />
        )}
        {activeTab === 'World' && <WorldTab />}
        {activeTab === 'Learn' && <LearnTab />}
      </div>
    </div>
  )
}
