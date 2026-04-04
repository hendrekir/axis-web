import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getJournal, postJournal } from '../api'

const DOMAINS = [
  { name: 'Work',          emoji: '\u26A1', status: '3 active signals',  active: true },
  { name: 'Money',         emoji: '\u{1F4B0}', status: 'Not tracking',      active: false },
  { name: 'Relationships', emoji: '\u{1F91D}', status: 'Not tracking',      active: false },
  { name: 'Health',        emoji: '\u{1F9EC}', status: 'Not tracking',      active: false },
  { name: 'Knowledge',     emoji: '\u{1F4DA}', status: '2 notes saved',     active: true },
  { name: 'Growth',        emoji: '\u{1F331}', status: 'Not tracking',      active: false },
  { name: 'Ideas',         emoji: '\u{1F4A1}', status: '1 capture',         active: true },
]

const SKILL_TREE = [
  { section: 'Work & Business', unlocked: ['Builder', 'Founder', 'Client handler'], locked: ['Closer x3', 'Scale'] },
  { section: 'Knowledge', unlocked: ['Curious', 'Builder', 'Learner'], locked: ['Researcher', 'Author'] },
  { section: 'Money', unlocked: ['Earner'], locked: ['Saver', 'Investor', 'Wealth builder'] },
]

const TIERS = ['Spark', 'Ember', 'Forge', 'Legend']

const JOURNAL_QUESTIONS = {
  1: "What's the one thing that would make this week a win?",
  2: "What are you avoiding right now, and why?",
  3: "Who do you need to reach out to that you've been putting off?",
  4: "What decision are you sitting on that needs to be made?",
  5: "What's one thing you learned or noticed this week?",
  6: "What drained you this week? What energised you?",
  0: "What do you want to be different next week?",
}

function getTodaysQuestion() {
  const day = new Date().getDay()
  return JOURNAL_QUESTIONS[day] || "What's on your mind?"
}

function DomainCard({ domain }) {
  const inactive = !domain.active
  return (
    <div className={`bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-5 flex flex-col gap-2 ${inactive ? 'opacity-50' : ''}`}>
      <span className="text-2xl">{domain.emoji}</span>
      <span className="text-white font-medium text-sm">{domain.name}</span>
      <span className="text-neutral-500 text-xs">{domain.status}</span>
      {inactive && <span className="text-red-400/60 text-[10px]">gap</span>}
    </div>
  )
}

function SkillPill({ name, unlocked }) {
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
      unlocked ? 'border border-green-500/30 text-green-400 bg-green-500/10' : 'border border-neutral-700 text-neutral-600 bg-[#1A1726]'
    }`}>
      {name}
    </span>
  )
}

function MapView() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DOMAINS.map(domain => (
        <DomainCard key={domain.name} domain={domain} />
      ))}
    </div>
  )
}

function SkillTreeView() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex gap-2">
        {TIERS.map(tier => (
          <span key={tier} className="px-3 py-1 rounded-full text-xs font-medium bg-[#1A1726] text-neutral-500">{tier}</span>
        ))}
      </div>
      {SKILL_TREE.map(group => (
        <div key={group.section} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">{group.section}</h3>
          <div className="flex flex-wrap gap-2">
            {group.unlocked.map(name => <SkillPill key={name} name={name} unlocked />)}
            {group.locked.map(name => <SkillPill key={name} name={name} unlocked={false} />)}
          </div>
        </div>
      ))}
      <p className="text-neutral-600 text-xs italic text-center mt-4">
        Axis verifies achievements from your real activity. You can't inflate your rank.
      </p>
    </div>
  )
}

function JournalView() {
  const { getToken } = useAuth()
  const [answer, setAnswer] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [entries, setEntries] = useState([])
  const [entriesLoading, setEntriesLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)

  const question = getTodaysQuestion()

  useEffect(() => {
    loadEntries()
  }, [])

  async function loadEntries() {
    try {
      const token = await getToken()
      const data = await getJournal(token)
      setEntries(data.entries || [])
    } catch {}
    setEntriesLoading(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!answer.trim() || loading) return
    setLoading(true)
    try {
      const token = await getToken()
      await postJournal(question, answer, token)
      setSubmitted(true)
      setAnswer('')
      setTimeout(() => setSubmitted(false), 3000)
      loadEntries()
    } catch (err) {
      console.error('[Journal] submit failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>Journal</h2>
        <p className="text-neutral-500 text-xs mt-1">Private. Every entry makes Axis smarter.</p>
      </div>

      {/* Daily question */}
      <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.25)] rounded-xl p-5 space-y-4">
        <div>
          <span className="text-[#8B5CF6] text-[10px] font-bold uppercase tracking-widest">Today's question from Axis</span>
          <p className="text-white text-sm font-medium mt-2 leading-relaxed">{question}</p>
        </div>

        {submitted ? (
          <div className="py-3 text-center">
            <p className="text-[#8B5CF6] text-sm font-medium">Axis is learning from this.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <textarea
              value={answer}
              onChange={e => setAnswer(e.target.value)}
              placeholder="Write your thoughts..."
              rows={4}
              className="w-full bg-[#0C0A15] border border-[#2A2540] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 resize-none outline-none focus:border-[#8B5CF6] transition-colors"
            />
            <button
              type="submit"
              disabled={!answer.trim() || loading}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-30 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? 'Saving...' : 'Tell Axis'}
            </button>
          </form>
        )}
      </div>

      {/* Past entries */}
      <div className="space-y-3">
        <h3 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Past Entries</h3>
        {entriesLoading ? (
          <p className="text-neutral-600 text-sm">Loading...</p>
        ) : entries.length === 0 ? (
          <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-6 text-center">
            <p className="text-neutral-500 text-sm">No entries yet. Answer today's question to start.</p>
          </div>
        ) : (
          entries.map(entry => (
            <button
              key={entry.id}
              onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
              className="w-full text-left bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl px-4 py-3 space-y-1 transition-colors hover:border-[rgba(139,92,246,0.25)]"
            >
              <div className="flex items-center justify-between">
                <span className="text-neutral-500 text-xs">{new Date(entry.date).toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                <svg className={`w-3 h-3 text-neutral-600 transition-transform ${expandedId === entry.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <p className="text-[#8B5CF6]/70 text-xs">{entry.question}</p>
              {expandedId === entry.id ? (
                <p className="text-neutral-300 text-sm leading-relaxed pt-1">{entry.answer}</p>
              ) : (
                <p className="text-neutral-400 text-xs truncate">{entry.answer.slice(0, 100)}{entry.answer.length > 100 ? '...' : ''}</p>
              )}
            </button>
          ))
        )}
      </div>
    </div>
  )
}

export default function Mind() {
  const [view, setView] = useState('map')

  const tabs = [
    { key: 'map', label: 'Map' },
    { key: 'tree', label: 'Skill Tree' },
    { key: 'journal', label: 'Journal' },
  ]

  return (
    <div className="min-h-screen bg-[#0C0A15] px-5 pt-14 pb-28">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Mind
        </h1>
        <div className="flex gap-2">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => setView(t.key)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                view === t.key ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'bg-[#1A1726] text-neutral-500'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {view === 'map' && <MapView />}
      {view === 'tree' && <SkillTreeView />}
      {view === 'journal' && <JournalView />}
    </div>
  )
}
