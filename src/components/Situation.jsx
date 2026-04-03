import { useState, useEffect, useRef } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getMe, getSignal, updateTask, getUpcomingEvents, touchStreak, getInsights, getBrief } from '../api'

function timeGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function formatTime() {
  return new Date().toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
}

function formatCountdown(eventTime) {
  const diff = new Date(eventTime) - new Date()
  if (diff <= 0) return 'Now'
  const mins = Math.floor(diff / 60000)
  if (mins < 60) return `in ${mins}m`
  const hrs = Math.floor(mins / 60)
  const rem = mins % 60
  return rem > 0 ? `in ${hrs}h ${rem}m` : `in ${hrs}h`
}

function SwipeableSignalCard({ signal, onDone, onDismiss, completing }) {
  const ref = useRef(null)
  const startX = useRef(0)
  const currentX = useRef(0)
  const [offset, setOffset] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  function onTouchStart(e) { startX.current = e.touches[0].clientX }
  function onTouchMove(e) {
    currentX.current = e.touches[0].clientX
    const dx = currentX.current - startX.current
    if (dx < 0) setOffset(dx)
  }
  function onTouchEnd() {
    if (offset < -100) {
      setDismissed(true)
      setTimeout(() => onDismiss(signal.id), 300)
    } else {
      setOffset(0)
    }
  }

  return (
    <div
      ref={ref}
      className={`bg-[#110F1C] border border-red-500/30 rounded-xl p-4 space-y-3 transition-all duration-300 ${dismissed ? 'opacity-0 -translate-x-full' : ''}`}
      style={{ transform: dismissed ? undefined : `translateX(${offset}px)` }}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-full">
              Urgent
            </span>
            {signal.category && (
              <span className="text-neutral-600 text-xs">{signal.category}</span>
            )}
          </div>
          <p className="text-white text-sm font-medium">{signal.title}</p>
          {signal.why && <p className="text-neutral-500 text-xs mt-1">{signal.why}</p>}
        </div>
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => onDone(signal.id)}
          disabled={completing === signal.id}
          className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
        >
          Done
        </button>
        <button
          onClick={() => onDismiss(signal.id)}
          disabled={completing === signal.id}
          className="px-3 py-1.5 bg-[#1A1726] hover:bg-[#2A2540] text-neutral-400 text-xs font-medium rounded-lg transition-colors"
        >
          Dismiss
        </button>
      </div>
    </div>
  )
}

export default function Situation() {
  const { getToken, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()
  const [name, setName] = useState('')
  const [signals, setSignals] = useState([])
  const [mits, setMits] = useState([])
  const [nextEvent, setNextEvent] = useState(null)
  const [streak, setStreak] = useState(0)
  const [insights, setInsights] = useState([])
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)
  const [celebratedId, setCelebratedId] = useState(null)
  const [briefSheet, setBriefSheet] = useState(null)
  const [briefLoading, setBriefLoading] = useState(false)

  const allMitsDone = mits.length > 0 && mits.every(m => m.done)

  useEffect(() => {
    if (!isLoaded) return
    loadAll()
  }, [isLoaded])

  async function loadAll() {
    try {
      const token = await getToken()
      const [me, signalData] = await Promise.all([
        getMe(token),
        getSignal(token),
      ])

      setName(me.name || clerkUser?.firstName || '')
      setStreak(me.current_streak || 0)
      touchStreak(token).then(s => { if (s.current_streak) setStreak(s.current_streak) }).catch(() => {})

      const tasks = signalData.signal || []
      setSignals(tasks.filter(t => t.is_urgent))
      setMits(tasks.slice(0, 3))

      try {
        const cal = await getUpcomingEvents(token, 12)
        if (cal.events?.length > 0) setNextEvent(cal.events[0])
      } catch {}

      try {
        const ins = await getInsights(token)
        setInsights(ins.insights || [])
      } catch {}
    } catch (err) {
      console.error('[Situation] load failed:', err)
    } finally {
      setLoading(false)
    }
  }

  async function completeMit(taskId) {
    setCompleting(taskId)
    try {
      const token = await getToken()
      await updateTask(taskId, { is_done: true }, token)
      setCelebratedId(taskId)
      setTimeout(() => {
        setMits(prev => prev.map(m => m.id === taskId ? { ...m, done: true } : m))
        setCelebratedId(null)
      }, 400)
    } catch (err) {
      console.error('[Situation] complete failed:', err)
    } finally {
      setCompleting(null)
    }
  }

  function dismissSignal(signalId) {
    setSignals(prev => prev.filter(s => s.id !== signalId))
    // Fire and forget
    getToken().then(token => updateTask(signalId, { is_done: true }, token)).catch(() => {})
  }

  async function openBrief() {
    setBriefLoading(true)
    try {
      const token = await getToken()
      const data = await getBrief(token)
      let cleaned = (data.brief || '').replace(/```json\s*/g, '').replace(/```\s*/g, '').trim()
      let messages
      try {
        const parsed = JSON.parse(cleaned)
        messages = Array.isArray(parsed) ? parsed : [cleaned]
      } catch {
        messages = cleaned.split('\n\n').filter(Boolean)
      }
      setBriefSheet(messages)
    } catch {
      setBriefSheet(['Could not generate brief.'])
    } finally {
      setBriefLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto bg-[#0C0A15]">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">

        {/* Greeting */}
        <div>
          <h1 className="font-display text-3xl font-extrabold text-white">
            {timeGreeting()}{name ? `, ${name}` : ''}.
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-neutral-400 text-sm">{formatTime()}</span>
          </div>
        </div>

        {/* Streak */}
        {streak > 0 && (
          <div className="flex items-center gap-1.5">
            <span className="text-orange-400 text-sm">&#x1F525;</span>
            <span className="font-mono text-sm text-[#8B5CF6] font-medium">
              {streak} day streak
            </span>
          </div>
        )}

        {/* NOW Signals — swipeable */}
        {signals.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">Now Signals</h2>
            {signals.map(s => (
              <SwipeableSignalCard
                key={s.id}
                signal={s}
                onDone={completeMit}
                onDismiss={dismissSignal}
                completing={completing}
              />
            ))}
          </section>
        )}

        {/* Focus — MITs with celebration */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest">Today's Focus</h2>

          {allMitsDone && (
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm font-medium text-center">
              You did it. You can relax.
            </div>
          )}

          {mits.length > 0 ? (
            <div className="space-y-2">
              {mits.map(m => (
                <div
                  key={m.id}
                  className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl px-4 py-3 flex items-center gap-3"
                >
                  <button
                    onClick={() => !m.done && completeMit(m.id)}
                    disabled={m.done || completing === m.id}
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 ${
                      m.done
                        ? 'bg-[#8B5CF6] border-[#8B5CF6] scale-100'
                        : celebratedId === m.id
                        ? 'bg-[#8B5CF6] border-[#8B5CF6] scale-125'
                        : 'border-neutral-600 hover:border-[#8B5CF6] scale-100'
                    }`}
                  >
                    {(m.done || celebratedId === m.id) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium transition-all duration-300 ${m.done ? 'text-neutral-600 line-through' : 'text-white'}`}>
                      {m.title}
                    </p>
                    {m.why && !m.done && (
                      <p className="text-[#8B5CF6]/60 text-xs mt-0.5 truncate">{m.why}</p>
                    )}
                  </div>
                  {m.is_urgent && !m.done && (
                    <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold rounded-full">
                      Urgent
                    </span>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-6 text-center">
              <p className="text-neutral-500 text-sm">Your focus for today will appear here. Tell Axis what's on your mind.</p>
            </div>
          )}
        </section>

        {/* Next Event + Get Brief */}
        {nextEvent && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Next Event</h2>
            <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-medium">{nextEvent.summary || nextEvent.title}</p>
                  {(nextEvent.start || nextEvent.start_dt) && (
                    <p className="text-neutral-500 text-xs mt-0.5">
                      {new Date(nextEvent.start || nextEvent.start_dt).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}
                    </p>
                  )}
                </div>
                <span className="text-[#8B5CF6] text-sm font-medium">
                  {(nextEvent.start || nextEvent.start_dt) ? formatCountdown(nextEvent.start || nextEvent.start_dt) : ''}
                </span>
              </div>
              <button
                onClick={openBrief}
                disabled={briefLoading}
                className="mt-3 px-3 py-1.5 bg-[#1A1726] hover:bg-[#2A2540] disabled:opacity-40 text-[#8B5CF6] text-xs font-medium rounded-lg transition-colors"
              >
                {briefLoading ? 'Loading...' : 'Get brief'}
              </button>
            </div>
          </section>
        )}

        {/* Insights */}
        {insights.length > 0 && (
          <section className="space-y-2">
            <h2 className="text-xs font-semibold text-neutral-500 uppercase tracking-widest">Insights</h2>
            {insights.map((ins, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6] mt-1.5 shrink-0" />
                <p className="text-[#8B5CF6]/70 text-xs leading-relaxed">{ins}</p>
              </div>
            ))}
          </section>
        )}
      </div>

      {/* Brief sheet */}
      {briefSheet && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setBriefSheet(null)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-lg bg-[#110F1C] border-t border-[#1E1A2E] rounded-t-2xl p-5 space-y-3 animate-slide-up max-h-[70vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto" />
            <h3 className="text-white text-sm font-semibold">Pre-meeting Brief</h3>
            {briefSheet.map((msg, i) => (
              <p key={i} className="text-neutral-300 text-sm leading-relaxed">{msg}</p>
            ))}
            <button
              onClick={() => setBriefSheet(null)}
              className="w-full py-2 text-neutral-500 text-sm hover:text-neutral-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
    </div>
  )
}
