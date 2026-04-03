import { useState } from 'react'
import { useAuth, useUser } from '@clerk/clerk-react'
import { updateMe, runDispatch, getSignal } from '../api'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export default function Onboarding({ onComplete }) {
  const { getToken } = useAuth()
  const { user: clerkUser } = useUser()
  const [step, setStep] = useState(0)
  const [context, setContext] = useState('')
  const [firstSignal, setFirstSignal] = useState(null)
  const [loading, setLoading] = useState(false)

  function next() { setStep(s => s + 1) }

  function connectGmail() {
    window.location.href = `${API_URL}/auth/gmail?clerk_id=${clerkUser.id}`
  }

  async function saveContextAndDispatch() {
    setLoading(true)
    try {
      const token = await getToken()
      const updates = {}
      if (context.trim()) updates.context_notes = context
      // Auto-detect timezone from browser
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      if (tz) updates.timezone = tz
      if (Object.keys(updates).length > 0) {
        await updateMe(updates, token)
      }
      // Run dispatch to generate first signal
      await runDispatch(token)
      const signal = await getSignal(token)
      if (signal.signal?.length > 0) {
        setFirstSignal(signal.signal[0])
      }
      setStep(4)
    } catch (err) {
      console.error('[Onboarding] dispatch failed:', err)
      setStep(4)
    } finally {
      setLoading(false)
    }
  }

  function finish() {
    localStorage.setItem('onboarding_complete', 'true')
    onComplete()
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#0C0A15] flex items-center justify-center">
      <div className="w-full max-w-md px-6">

        {/* Screen 1 — Brand */}
        {step === 0 && (
          <div className="text-center space-y-8">
            <div className="space-y-4">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-[#8B5CF6]/20 flex items-center justify-center">
                <span className="text-[#8B5CF6] text-2xl font-display font-extrabold">A</span>
              </div>
              <h1 className="font-display text-3xl font-extrabold text-white">AXIS</h1>
              <p className="text-neutral-400 text-lg">Extend the mind.</p>
            </div>
            <button
              onClick={next}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors"
            >
              Get started
            </button>
          </div>
        )}

        {/* Screen 2 — Privacy */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-white">Your data, your rules</h2>
              <p className="text-neutral-400 text-sm mt-2">Here's how Axis works with your information.</p>
            </div>

            <div className="space-y-4">
              <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-4">
                <h3 className="text-white text-sm font-semibold mb-2">What Axis reads</h3>
                <ul className="text-neutral-400 text-sm space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-[#8B5CF6]">&#8226;</span> Gmail inbox (with your permission)</li>
                  <li className="flex items-start gap-2"><span className="text-[#8B5CF6]">&#8226;</span> Google Calendar events</li>
                  <li className="flex items-start gap-2"><span className="text-[#8B5CF6]">&#8226;</span> Your captures and conversations</li>
                  <li className="flex items-start gap-2"><span className="text-[#8B5CF6]">&#8226;</span> Context notes you provide</li>
                </ul>
              </div>

              <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-4">
                <h3 className="text-white text-sm font-semibold mb-2">What Axis never does</h3>
                <ul className="text-neutral-400 text-sm space-y-1.5">
                  <li className="flex items-start gap-2"><span className="text-red-400">&#10005;</span> Send emails without your approval</li>
                  <li className="flex items-start gap-2"><span className="text-red-400">&#10005;</span> Share your data with third parties</li>
                  <li className="flex items-start gap-2"><span className="text-red-400">&#10005;</span> Train AI models on your personal data</li>
                  <li className="flex items-start gap-2"><span className="text-red-400">&#10005;</span> Store credentials on your device</li>
                </ul>
              </div>
            </div>

            <button
              onClick={next}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors"
            >
              I understand
            </button>
          </div>
        )}

        {/* Screen 3 — Connect Gmail */}
        {step === 2 && (
          <div className="space-y-8 text-center">
            <div>
              <div className="w-14 h-14 mx-auto rounded-xl bg-[#110F1C] flex items-center justify-center mb-4">
                <svg viewBox="0 0 24 24" className="w-7 h-7" fill="none">
                  <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#ef4444"/>
                </svg>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">Connect Gmail</h2>
              <p className="text-neutral-400 text-sm mt-2">
                Axis reads your inbox to surface what matters and draft replies in your voice.
              </p>
            </div>

            <button
              onClick={connectGmail}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors"
            >
              Connect Gmail
            </button>
            <button
              onClick={next}
              className="w-full py-2 text-neutral-500 hover:text-neutral-300 text-sm transition-colors"
            >
              Connect later
            </button>
          </div>
        )}

        {/* Screen 4 — Context notes */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="font-display text-2xl font-bold text-white">Tell Axis about you</h2>
              <p className="text-neutral-400 text-sm mt-2">
                This context is injected into every Axis conversation. The more you share, the smarter Axis gets from day one.
              </p>
            </div>

            <textarea
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Tell Axis about you — your work, projects, goals, the people that matter, and anything it should always keep in mind. The more you share, the more useful Axis becomes."
              rows={6}
              className="w-full bg-[#110F1C] border border-[#2A2540] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-600 resize-none outline-none focus:border-[#8B5CF6] transition-colors"
            />

            <button
              onClick={saveContextAndDispatch}
              disabled={loading}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white font-medium rounded-xl transition-colors"
            >
              {loading ? 'Axis is thinking...' : 'Continue'}
            </button>
          </div>
        )}

        {/* Screen 5 — Ready state with first signal */}
        {step === 4 && (
          <div className="space-y-8 text-center">
            <div>
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-green-400 text-sm font-medium">Axis is active</span>
              </div>
              <h2 className="font-display text-2xl font-bold text-white">You're ready</h2>
              <p className="text-neutral-400 text-sm mt-2">
                Axis is watching your data and will surface what matters.
              </p>
            </div>

            {firstSignal && (
              <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-4 text-left">
                <p className="text-[#8B5CF6] text-[10px] font-bold uppercase tracking-widest mb-1">Your first signal</p>
                <p className="text-white text-sm font-medium">{firstSignal.title}</p>
                {firstSignal.why && (
                  <p className="text-neutral-500 text-xs mt-1">{firstSignal.why}</p>
                )}
              </div>
            )}

            <button
              onClick={finish}
              className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-medium rounded-xl transition-colors"
            >
              Enter Axis
            </button>
          </div>
        )}

        {/* Step indicator */}
        <div className="flex justify-center gap-1.5 mt-8">
          {[0, 1, 2, 3, 4].map(i => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                i === step ? 'bg-[#8B5CF6]' : 'bg-neutral-700'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
