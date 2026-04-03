import { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import {
  getSignal,
  updateTask,
  getUpcomingEvents,
  parseSchedule,
  confirmSchedule,
  getMe,
  updateMe,
  getSkills,
  updateSkill,
} from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const CATEGORY_COLORS = {
  work: 'bg-blue-500/20 text-blue-400',
  health: 'bg-green-500/20 text-green-400',
  home: 'bg-yellow-500/20 text-yellow-400',
  money: 'bg-emerald-500/20 text-emerald-400',
  family: 'bg-pink-500/20 text-pink-400',
  admin: 'bg-neutral-500/20 text-neutral-400',
  personal: 'bg-purple-500/20 text-purple-400',
}

const SIGNAL_TABS = ['Now', 'Today', 'When you can']

function formatEventTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
}

export default function Sidebar({ isOpen, onClose }) {
  const { getToken, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()

  const [tasks, setTasks] = useState([])
  const [events, setEvents] = useState([])
  const [user, setUser] = useState(null)
  const [skills, setSkills] = useState([])
  const [contextNotes, setContextNotes] = useState('')
  const [contextSaved, setContextSaved] = useState(false)

  const [activeTab, setActiveTab] = useState(0)
  const [scheduleInput, setScheduleInput] = useState('')
  const [showScheduleInput, setShowScheduleInput] = useState(false)
  const [scheduleParsing, setScheduleParsing] = useState(false)
  const [pendingEvent, setPendingEvent] = useState(null)

  const [loaded, setLoaded] = useState(false)
  const scheduleInputRef = useRef(null)

  const loadAll = useCallback(async () => {
    if (!isLoaded) return
    try {
      const token = await getToken()
      const [signalData, eventsData, userData, skillsData] = await Promise.allSettled([
        getSignal(token),
        getUpcomingEvents(token),
        getMe(token),
        getSkills(token),
      ])

      if (signalData.status === 'fulfilled') setTasks(signalData.value.signal || [])
      if (eventsData.status === 'fulfilled') setEvents(eventsData.value.events || eventsData.value || [])
      if (userData.status === 'fulfilled') {
        setUser(userData.value)
        setContextNotes(userData.value.context_notes || '')
      }
      if (skillsData.status === 'fulfilled') setSkills(skillsData.value.skills || skillsData.value || [])
    } catch (_) {
      // silent
    } finally {
      setLoaded(true)
    }
  }, [isLoaded, getToken])

  useEffect(() => {
    if (isOpen && !loaded) loadAll()
  }, [isOpen, loaded, loadAll])

  // Refresh data when sidebar opens
  useEffect(() => {
    if (isOpen && isLoaded) loadAll()
  }, [isOpen]) // eslint-disable-line react-hooks/exhaustive-deps

  // Focus schedule input when shown
  useEffect(() => {
    if (showScheduleInput && scheduleInputRef.current) {
      scheduleInputRef.current.focus()
    }
  }, [showScheduleInput])

  async function markDone(taskId) {
    try {
      const token = await getToken()
      await updateTask(taskId, { is_done: true }, token)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (_) {}
  }

  async function handleScheduleSubmit(e) {
    e.preventDefault()
    if (!scheduleInput.trim()) return
    setScheduleParsing(true)
    try {
      const token = await getToken()
      const parsed = await parseSchedule(scheduleInput, token)
      setPendingEvent(parsed)
    } catch (_) {
      // parse failed
    } finally {
      setScheduleParsing(false)
    }
  }

  async function handleConfirmEvent() {
    if (!pendingEvent) return
    try {
      const token = await getToken()
      await confirmSchedule(pendingEvent, token)
      setPendingEvent(null)
      setScheduleInput('')
      setShowScheduleInput(false)
      // Refresh events
      const eventsData = await getUpcomingEvents(token)
      setEvents(eventsData.events || eventsData || [])
    } catch (_) {}
  }

  async function saveContextNotes() {
    try {
      const token = await getToken()
      await updateMe({ context_notes: contextNotes }, token)
      setContextSaved(true)
      setTimeout(() => setContextSaved(false), 2000)
    } catch (_) {}
  }

  async function handleToggleSkill(skill) {
    const newActive = !skill.is_active
    try {
      const token = await getToken()
      await updateSkill(skill.id, { is_active: newActive }, token)
      setSkills((prev) =>
        prev.map((s) => (s.id === skill.id ? { ...s, is_active: newActive } : s))
      )
    } catch (_) {}
  }

  function connectGmail() {
    window.location.href = `${API_URL}/auth/gmail?clerk_id=${clerkUser?.id}`
  }
  function connectCalendar() {
    window.location.href = `${API_URL}/auth/calendar?clerk_id=${clerkUser?.id}`
  }
  function connectSpotify() {
    window.location.href = `${API_URL}/auth/spotify?clerk_id=${clerkUser?.id}`
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 right-0 z-50 h-full w-[280px] md:w-[320px] bg-[#110F1C] border-l border-[#1E1A2E] transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Close button */}
        <div className="flex items-center justify-end px-4 pt-4 pb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#1A1726] text-neutral-400 hover:text-white transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Scrollable content */}
        <div className="h-[calc(100%-56px)] overflow-y-auto px-4 pb-8 space-y-6">

          {/* ── SIGNALS ── */}
          <section>
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider">Signals</h2>
              {tasks.length > 0 && (
                <span className="px-1.5 py-0.5 bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold rounded-full min-w-[18px] text-center">
                  {tasks.length}
                </span>
              )}
            </div>

            {/* Sub-tabs */}
            <div className="flex gap-3 mb-3">
              {SIGNAL_TABS.map((tab, i) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(i)}
                  className={`text-xs font-medium pb-1 transition-colors ${
                    activeTab === i
                      ? 'text-white border-b border-[#8B5CF6]'
                      : 'text-neutral-500 hover:text-neutral-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {tasks.length === 0 ? (
              <p className="text-neutral-500 text-xs italic">Nothing urgent. Axis is watching.</p>
            ) : (
              <div className="space-y-2">
                {tasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-[#1A1726] rounded-lg px-3 py-2.5 flex items-center justify-between gap-2"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{task.title}</p>
                      <span
                        className={`inline-block mt-1 px-1.5 py-0.5 text-[10px] rounded-full ${
                          CATEGORY_COLORS[task.category] || 'bg-neutral-500/20 text-neutral-400'
                        }`}
                      >
                        {task.category}
                      </span>
                    </div>
                    <button
                      onClick={() => markDone(task.id)}
                      className="shrink-0 w-7 h-7 rounded-full border border-[#2A2540] hover:border-green-500 hover:bg-green-500/10 transition-colors flex items-center justify-center text-neutral-500 hover:text-green-400 text-xs"
                    >
                      ✓
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <hr className="border-[#1E1A2E]" />

          {/* ── SCHEDULE ── */}
          <section>
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">Schedule</h2>

            {events.length === 0 ? (
              <p className="text-neutral-500 text-xs italic">No upcoming events.</p>
            ) : (
              <div className="space-y-2">
                {events.map((event, i) => (
                  <div key={event.id || i} className="bg-[#1A1726] rounded-lg px-3 py-2.5">
                    <div className="flex items-start gap-2">
                      <span className="text-[#8B5CF6] text-xs font-medium whitespace-nowrap mt-0.5">
                        {formatEventTime(event.start || event.start_time)}
                      </span>
                      <div className="min-w-0">
                        <p className="text-white text-sm font-medium truncate">{event.title || event.summary}</p>
                        {event.location && (
                          <p className="text-neutral-500 text-xs truncate mt-0.5">{event.location}</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Pending event confirmation */}
            {pendingEvent && (
              <div className="mt-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg px-3 py-2.5">
                <p className="text-white text-sm font-medium">{pendingEvent.title || pendingEvent.summary}</p>
                <p className="text-neutral-400 text-xs mt-0.5">
                  {pendingEvent.start && formatEventTime(pendingEvent.start)}
                  {pendingEvent.location && ` — ${pendingEvent.location}`}
                </p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={handleConfirmEvent}
                    className="px-3 py-1 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => { setPendingEvent(null); setScheduleInput('') }}
                    className="px-3 py-1 text-neutral-400 hover:text-white text-xs transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Add to schedule */}
            {showScheduleInput ? (
              <form onSubmit={handleScheduleSubmit} className="mt-2">
                <input
                  ref={scheduleInputRef}
                  type="text"
                  value={scheduleInput}
                  onChange={(e) => setScheduleInput(e.target.value)}
                  placeholder="e.g. Dentist Tuesday 3pm"
                  disabled={scheduleParsing}
                  className="w-full bg-[#1A1726] border border-[#2A2540] rounded-lg px-3 py-2 text-sm text-white placeholder-neutral-600 outline-none focus:border-[#8B5CF6] disabled:opacity-50"
                />
                {scheduleParsing && (
                  <p className="text-neutral-500 text-xs mt-1">Parsing...</p>
                )}
              </form>
            ) : (
              <button
                onClick={() => setShowScheduleInput(true)}
                className="mt-2 text-[#8B5CF6] hover:text-[#A78BFA] text-xs font-medium transition-colors"
              >
                + Add to schedule
              </button>
            )}
          </section>

          <hr className="border-[#1E1A2E]" />

          {/* ── CONNECTIONS ── */}
          <section>
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">Connections</h2>
            <div className="space-y-2">
              {/* Gmail */}
              <div className="flex items-center justify-between bg-[#1A1726] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                    <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#ef4444"/>
                  </svg>
                  <span className="text-white text-sm">Gmail</span>
                </div>
                {user?.gmail_connected ? (
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                ) : (
                  <button onClick={connectGmail} className="text-[#8B5CF6] hover:text-[#A78BFA] text-xs font-medium transition-colors">
                    Connect
                  </button>
                )}
              </div>

              {/* Calendar */}
              <div className="flex items-center justify-between bg-[#1A1726] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#4285F4"/>
                  </svg>
                  <span className="text-white text-sm">Calendar</span>
                </div>
                {user?.calendar_connected ? (
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                ) : (
                  <button onClick={connectCalendar} className="text-[#8B5CF6] hover:text-[#A78BFA] text-xs font-medium transition-colors">
                    Connect
                  </button>
                )}
              </div>

              {/* Spotify */}
              <div className="flex items-center justify-between bg-[#1A1726] rounded-lg px-3 py-2.5">
                <div className="flex items-center gap-2.5">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="none">
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.723a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.453-1.493c3.63-1.102 8.14-.568 11.233 1.33a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-1.054 1.543z" fill="#1DB954"/>
                  </svg>
                  <span className="text-white text-sm">Spotify</span>
                </div>
                {user?.spotify_connected ? (
                  <span className="text-green-400 text-xs font-medium">Connected</span>
                ) : (
                  <button onClick={connectSpotify} className="text-[#8B5CF6] hover:text-[#A78BFA] text-xs font-medium transition-colors">
                    Connect
                  </button>
                )}
              </div>
            </div>
          </section>

          <hr className="border-[#1E1A2E]" />

          {/* ── CAPABILITIES ── */}
          <section>
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">Capabilities</h2>
            {skills.length === 0 ? (
              <p className="text-neutral-500 text-xs italic">No capabilities configured.</p>
            ) : (
              <div className="space-y-2">
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between bg-[#1A1726] rounded-lg px-3 py-2.5"
                  >
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{skill.name}</p>
                      {skill.model && (
                        <span className="inline-block mt-0.5 px-1.5 py-0.5 bg-[#8B5CF6]/15 text-[#8B5CF6] text-[10px] rounded-full">
                          {skill.model}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => handleToggleSkill(skill)}
                      className={`relative w-9 h-5 rounded-full transition-colors ${
                        skill.is_active ? 'bg-[#8B5CF6]' : 'bg-[#2A2540]'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                          skill.is_active ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <hr className="border-[#1E1A2E]" />

          {/* ── SETTINGS ── */}
          <section>
            <h2 className="text-xs font-semibold text-neutral-300 uppercase tracking-wider mb-3">Settings</h2>

            {/* Profile info */}
            {user && (
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Name</span>
                  <p className="text-white text-sm mt-0.5 truncate">{user.name || 'Not set'}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Mode</span>
                  <p className="text-white text-sm mt-0.5 capitalize">{user.mode || 'personal'}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Timezone</span>
                  <p className="text-white text-sm mt-0.5 truncate">{user.timezone || '—'}</p>
                </div>
                <div>
                  <span className="text-neutral-500 text-[10px] uppercase tracking-wider">Plan</span>
                  <p className="text-white text-sm mt-0.5 capitalize">{user.plan || 'free'}</p>
                </div>
              </div>
            )}

            {/* Context notes */}
            <textarea
              value={contextNotes}
              onChange={(e) => setContextNotes(e.target.value)}
              onBlur={saveContextNotes}
              placeholder="Tell Axis about you — your work, projects, goals, the people that matter, and anything it should always keep in mind. The more you share, the more useful Axis becomes."
              rows={3}
              className="w-full bg-[#1A1726] border border-[#2A2540] rounded-lg px-3 py-2.5 text-sm text-white placeholder-neutral-600 resize-y outline-none focus:border-[#8B5CF6]"
            />
            {contextSaved && (
              <p className="text-green-400 text-xs mt-1">Saved.</p>
            )}
          </section>
        </div>
      </div>
    </>
  )
}
