import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getMe, getSignal, updateTask, getUpcomingEvents } from '../api'

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

export default function Situation() {
  const { getToken, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()
  const [name, setName] = useState('')
  const [signals, setSignals] = useState([])
  const [mits, setMits] = useState([])
  const [nextEvent, setNextEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting] = useState(null)

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

      const tasks = signalData.signal || []
      // NOW signals: urgent tasks
      setSignals(tasks.filter(t => t.is_urgent))
      // MITs: top 3 non-done tasks
      setMits(tasks.slice(0, 3))

      // Calendar — may fail if not connected
      try {
        const cal = await getUpcomingEvents(token, 12)
        if (cal.events?.length > 0) {
          setNextEvent(cal.events[0])
        }
      } catch {
        // Calendar not connected — that's fine
      }
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
      setMits(prev => prev.map(m => m.id === taskId ? { ...m, done: true } : m))
    } catch (err) {
      console.error('[Situation] complete failed:', err)
    } finally {
      setCompleting(null)
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
            {timeGreeting()}, {name || 'there'}.
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-neutral-400 text-sm">{formatTime()}</span>
            <span className="flex items-center gap-1.5 text-sm text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Axis active
            </span>
          </div>
        </div>

        {/* NOW Signals */}
        {signals.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-red-400 uppercase tracking-widest">Now Signals</h2>
            {signals.map(s => (
              <div key={s.id} className="bg-[#110F1C] border border-red-500/30 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-[10px] font-bold uppercase rounded-full">
                        Urgent
                      </span>
                      {s.category && (
                        <span className="text-neutral-600 text-xs">{s.category}</span>
                      )}
                    </div>
                    <p className="text-white text-sm font-medium">{s.title}</p>
                    {s.why && <p className="text-neutral-500 text-xs mt-1">{s.why}</p>}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => completeMit(s.id)}
                    disabled={completing === s.id}
                    className="px-3 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Done
                  </button>
                  <button
                    onClick={() => completeMit(s.id)}
                    disabled={completing === s.id}
                    className="px-3 py-1.5 bg-[#1A1726] hover:bg-[#2A2540] text-neutral-400 text-xs font-medium rounded-lg transition-colors"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Focus — MITs */}
        <section className="space-y-3">
          <h2 className="text-xs font-semibold text-[#8B5CF6] uppercase tracking-widest">Today's Focus</h2>
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
                    className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${
                      m.done
                        ? 'bg-[#8B5CF6] border-[#8B5CF6]'
                        : 'border-neutral-600 hover:border-[#8B5CF6]'
                    }`}
                  >
                    {m.done && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-medium ${m.done ? 'text-neutral-600 line-through' : 'text-white'}`}>
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
              <p className="text-neutral-500 text-sm">No tasks yet. Use Brain Dump to add some.</p>
            </div>
          )}
        </section>

        {/* Next Event */}
        {nextEvent && (
          <section className="space-y-3">
            <h2 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">Next Event</h2>
            <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl px-4 py-3 flex items-center justify-between">
              <div>
                <p className="text-white text-sm font-medium">{nextEvent.summary || nextEvent.title}</p>
                {nextEvent.start && (
                  <p className="text-neutral-500 text-xs mt-0.5">
                    {new Date(nextEvent.start).toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })}
                  </p>
                )}
              </div>
              <span className="text-[#8B5CF6] text-sm font-medium">
                {nextEvent.start ? formatCountdown(nextEvent.start) : ''}
              </span>
            </div>
          </section>
        )}

        {/* Footer */}
        <div className="text-center pt-4">
          <p className="text-neutral-700 text-xs">
            Axis is watching &middot; dispatch runs every 15min
          </p>
        </div>
      </div>
    </div>
  )
}
