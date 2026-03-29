import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { getMe, getGmailAuthUrl, authHeaders } from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Settings() {
  const { getToken, isLoaded } = useAuth()
  const { user: clerkUser } = useUser()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Check URL for gmail callback result
  const params = new URLSearchParams(window.location.search)
  const gmailResult = params.get('gmail')

  useEffect(() => {
    if (!isLoaded) return
    loadUser()
    if (gmailResult) {
      // Clean query param so banner doesn't persist on refresh
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [isLoaded])

  async function loadUser() {
    try {
      const token = await getToken()
      const data = await getMe(token)
      setUser(data)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function connectGmail() {
    window.location.href = `${API_URL}/auth/gmail?clerk_id=${clerkUser.id}`
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

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Profile */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-3">
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

        {/* Gmail connection */}
        <section className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-neutral-300 uppercase tracking-wider">Connections</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
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
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
              >
                Connect Gmail
              </button>
            )}
          </div>

          {/* Future connections */}
          {['Google Calendar', 'Slack', 'Stripe'].map((name) => (
            <div key={name} className="flex items-center justify-between opacity-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center">
                  <div className="w-5 h-5 rounded bg-neutral-700" />
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
