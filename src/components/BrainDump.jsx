import { useState, useEffect } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { postBrainDump, getBrainDumpUsage, createCheckoutSession } from '../api'

const FREE_LIMIT = 3

const CATEGORY_COLORS = {
  work: 'bg-blue-500/20 text-blue-400',
  health: 'bg-green-500/20 text-green-400',
  home: 'bg-yellow-500/20 text-yellow-400',
  money: 'bg-emerald-500/20 text-emerald-400',
  family: 'bg-pink-500/20 text-pink-400',
  admin: 'bg-neutral-500/20 text-neutral-400',
  personal: 'bg-purple-500/20 text-purple-400',
}

function TaskCard({ task }) {
  const colorClass = CATEGORY_COLORS[task.category] || CATEGORY_COLORS.personal
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="text-white text-sm font-medium leading-snug">{task.title}</h3>
        {task.is_urgent && (
          <span className="shrink-0 px-2 py-0.5 bg-red-500/20 text-red-400 text-xs font-medium rounded-full">
            URGENT
          </span>
        )}
      </div>
      <p className="text-neutral-400 text-xs leading-relaxed">{task.why}</p>
      <div className="flex items-center gap-2 mt-1">
        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${colorClass}`}>
          {task.category}
        </span>
        <span className="text-neutral-600 text-xs">#{task.position + 1}</span>
      </div>
    </div>
  )
}

function ProGate({ used, onUpgrade, upgrading }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 text-center space-y-4">
      <div className="w-12 h-12 mx-auto rounded-full bg-blue-600/20 flex items-center justify-center">
        <span className="text-blue-400 text-xl font-bold">A</span>
      </div>
      <div>
        <h2 className="text-white text-lg font-semibold">You've used {used}/{FREE_LIMIT} free brain dumps</h2>
        <p className="text-neutral-400 text-sm mt-2 max-w-md mx-auto">
          Upgrade to Pro for unlimited brain dumps, Gmail integration, all Skills, and your daily brief.
        </p>
      </div>
      <div className="bg-neutral-800/50 rounded-xl p-4 max-w-xs mx-auto">
        <p className="text-white font-semibold">Axis Pro</p>
        <p className="text-2xl font-bold text-white mt-1">$9<span className="text-sm text-neutral-400 font-normal">/mo</span></p>
        <ul className="text-neutral-400 text-xs mt-3 space-y-1.5 text-left">
          <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> Unlimited brain dumps</li>
          <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> Gmail inbox reading + draft replies</li>
          <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> All 6 Skills unlocked</li>
          <li className="flex items-center gap-2"><span className="text-green-400">&#10003;</span> Daily morning brief</li>
        </ul>
      </div>
      <button
        onClick={onUpgrade}
        disabled={upgrading}
        className="w-full max-w-xs mx-auto block py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white font-medium rounded-xl transition-colors"
      >
        {upgrading ? 'Redirecting to checkout...' : 'Upgrade to Pro — $9/mo'}
      </button>
    </div>
  )
}

export default function BrainDump() {
  const { getToken, isSignedIn } = useAuth()
  const [text, setText] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [usage, setUsage] = useState({ used: 0, plan: 'free' })
  const [gated, setGated] = useState(false)
  const [upgrading, setUpgrading] = useState(false)

  useEffect(() => {
    if (isSignedIn) loadUsage()
  }, [isSignedIn])

  async function loadUsage() {
    try {
      const token = await getToken()
      const data = await getBrainDumpUsage(token)
      setUsage(data)
      if (data.plan === 'free' && data.used >= FREE_LIMIT) {
        setGated(true)
      }
    } catch {
      // Not signed in or endpoint not ready — allow usage
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || loading) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const data = await postBrainDump(text)
      setResult(data)

      // Update local usage count
      const newUsed = usage.used + 1
      setUsage(prev => ({ ...prev, used: newUsed }))
      if (usage.plan === 'free' && newUsed >= FREE_LIMIT) {
        setGated(true)
      }
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleUpgrade() {
    setUpgrading(true)
    try {
      const token = await getToken()
      const data = await createCheckoutSession(token)
      window.location.href = data.checkout_url
    } catch (e) {
      setError(e.message)
      setUpgrading(false)
    }
  }

  function reset() {
    setText('')
    setResult(null)
    setError(null)
  }

  const showGate = gated && !result

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Brain Dump</h1>
          <p className="text-neutral-400 text-sm mt-2">
            Dump everything on your mind. Axis will extract and rank your tasks.
          </p>
          {isSignedIn && usage.plan === 'free' && !showGate && (
            <p className="text-neutral-600 text-xs mt-1">
              {FREE_LIMIT - usage.used} free dump{FREE_LIMIT - usage.used !== 1 ? 's' : ''} remaining
            </p>
          )}
        </div>

        {showGate ? (
          <ProGate used={usage.used} onUpgrade={handleUpgrade} upgrading={upgrading} />
        ) : !result ? (
          /* Input form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="I need to finish the deck for Friday, call the electrician, pick up meds, reply to Marcus about the job, and I forgot to book the dentist..."
              rows={6}
              className="w-full bg-neutral-900 border border-neutral-700 rounded-xl p-4 text-white text-sm leading-relaxed placeholder-neutral-500 outline-none focus:border-blue-600 resize-none transition-colors"
            />
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? 'Axis is thinking...' : 'Dump it'}
            </button>
          </form>
        ) : (
          /* Results */
          <div className="space-y-6">
            <div className="grid gap-3">
              {result.tasks.map((task, i) => (
                <TaskCard key={i} task={task} />
              ))}
            </div>

            {result.summary && (
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-4">
                <p className="text-neutral-300 text-sm leading-relaxed">{result.summary}</p>
              </div>
            )}

            <button
              onClick={reset}
              className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white font-medium rounded-xl transition-colors"
            >
              {gated ? 'Back' : 'Dump again'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
