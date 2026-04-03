import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getMe, updateMe, authHeaders } from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Settings() {
  const { getToken, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [contextNotes, setContextNotes] = useState('')
  const [contextSaved, setContextSaved] = useState(false)

  // Check URL for OAuth callback results
  const params = new URLSearchParams(window.location.search)
  const gmailResult = params.get('gmail')
  const spotifyResult = params.get('spotify')
  const calendarResult = params.get('calendar')

  useEffect(() => {
    if (!isLoaded) return
    loadUser()
    if (gmailResult || spotifyResult || calendarResult) {
      // Clean query params so banners don't persist on refresh
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [isLoaded])

  async function loadUser() {
    try {
      const token = await getToken()
      const data = await getMe(token)
      setUser(data)
      setContextNotes(data.context_notes || '')
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function saveContextNotes() {
    try {
      const token = await getToken()
      await updateMe({ context_notes: contextNotes }, token)
      setContextSaved(true)
      setTimeout(() => setContextSaved(false), 2000)
    } catch (e) {
      setError(e.message)
    }
  }

  function connectGmail() {
    window.location.href = `${API_URL}/auth/gmail?clerk_id=${clerkUser.id}`
  }

  function connectSpotify() {
    window.location.href = `${API_URL}/auth/spotify?clerk_id=${clerkUser.id}`
  }

  function connectCalendar() {
    window.location.href = `${API_URL}/auth/calendar?clerk_id=${clerkUser.id}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        Loading...
      </div>
    )
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-neutral-400 mt-1">Manage your connections and preferences</p>
        </div>

        {gmailResult === 'connected' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
            Gmail connected successfully.
          </div>
        )}

        {gmailResult === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            Gmail connection failed. Please try again.
          </div>
        )}

        {spotifyResult === 'connected' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
            Spotify connected successfully.
          </div>
        )}

        {spotifyResult === 'error' && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            Spotify connection failed. Please try again.
          </div>
        )}

        {calendarResult === 'connected' && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 text-green-400 text-sm">
            Google Calendar connected successfully.
          </div>
        )}

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Profile */}
        <section className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Profile</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-neutral-500">Name</span>
              <p className="text-white mt-0.5">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <span className="text-neutral-500">Mode</span>
              <p className="text-white mt-0.5 capitalize">{user?.mode || 'personal'}</p>
            </div>
            <div>
              <span className="text-neutral-500">Timezone</span>
              <p className="text-white mt-0.5">{user?.timezone || '—'}</p>
            </div>
            <div>
              <span className="text-neutral-500">Plan</span>
              <p className="text-white mt-0.5 capitalize">{user?.plan || 'free'}</p>
            </div>
          </div>
        </section>

        {/* Context notes */}
        <section className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-5 space-y-3">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">What Axis should always know</h2>
          <p className="text-neutral-500 text-xs">This context is injected into every Axis conversation. Tell Axis about your role, preferences, current projects, or anything it should always keep in mind.</p>
          <textarea
            value={contextNotes}
            onChange={(e) => setContextNotes(e.target.value)}
            onBlur={saveContextNotes}
            placeholder="Tell Axis about you — your work, projects, goals, the people that matter, and anything it should always keep in mind. The more you share, the more useful Axis becomes."
            rows={4}
            className="w-full bg-[#1A1726] border border-[#2A2540] rounded-lg px-4 py-3 text-sm text-white placeholder-neutral-600 resize-y outline-none focus:border-[#8B5CF6]"
          />
          {contextSaved && (
            <p className="text-green-400 text-xs">Saved.</p>
          )}
        </section>

        {/* Gmail connection */}
        <section className="bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Connections</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A1726] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#ef4444"/>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Gmail</p>
                <p className="text-neutral-500 text-xs">
                  {user?.gmail_connected ? 'Connected — Axis reads your inbox' : 'Not connected'}
                </p>
              </div>
            </div>
            {user?.gmail_connected ? (
              <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-lg">
                Connected
              </span>
            ) : (
              <button
                onClick={connectGmail}
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Connect Gmail
              </button>
            )}
          </div>

          {/* Spotify */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A1726] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424a.623.623 0 01-.857.207c-2.348-1.435-5.304-1.76-8.785-.964a.623.623 0 11-.277-1.215c3.809-.87 7.076-.496 9.712 1.115a.623.623 0 01.207.857zm1.224-2.723a.78.78 0 01-1.072.257c-2.687-1.652-6.785-2.131-9.965-1.166a.78.78 0 01-.453-1.493c3.63-1.102 8.14-.568 11.233 1.33a.78.78 0 01.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71a.935.935 0 11-.543-1.79c3.532-1.072 9.404-.865 13.115 1.338a.935.935 0 01-1.054 1.543z" fill="#1DB954"/>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Spotify</p>
                <p className="text-neutral-500 text-xs">
                  {user?.spotify_connected ? 'Connected — Axis reads your listening' : 'Not connected'}
                </p>
              </div>
            </div>
            {user?.spotify_connected ? (
              <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-lg">
                Connected
              </span>
            ) : (
              <button
                onClick={connectSpotify}
                className="px-4 py-2 bg-[#1DB954] hover:bg-[#1ed760] text-black text-sm font-medium rounded-lg transition-colors"
              >
                Connect Spotify
              </button>
            )}
          </div>

          {/* Google Calendar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#1A1726] flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none">
                  <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z" fill="#4285F4"/>
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">Google Calendar</p>
                <p className="text-neutral-500 text-xs">
                  {user?.calendar_connected ? 'Connected — Axis reads your events' : 'Not connected'}
                </p>
              </div>
            </div>
            {user?.calendar_connected ? (
              <span className="px-3 py-1.5 bg-green-500/10 text-green-400 text-xs font-medium rounded-lg">
                Connected
              </span>
            ) : (
              <button
                onClick={connectCalendar}
                className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors"
              >
                Connect Calendar
              </button>
            )}
          </div>

          {/* Future connections */}
          {['Slack', 'Stripe'].map((name) => (
            <div key={name} className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1A1726] flex items-center justify-center">
                  <div className="w-5 h-5 rounded bg-[#2A2540]" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{name}</p>
                  <p className="text-neutral-500 text-xs">Coming soon</p>
                </div>
              </div>
              <span className="px-3 py-1.5 text-neutral-600 text-xs font-medium">Soon</span>
            </div>
          ))}
        </section>
      </div>
    </div>
  )
}
