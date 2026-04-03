import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { quickCapture } from '../api'
import MicButton from './MicButton'

export default function QuickCapture() {
  const { getToken } = useAuth()
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState(null)

  async function handleSubmit(e) {
    e.preventDefault()
    if (!text.trim() || loading) return
    setLoading(true)
    try {
      const token = await getToken()
      const data = await quickCapture(text, token)
      setText('')
      setOpen(false)
      setToast(data.confirmation_message)
      setTimeout(() => setToast(null), 3000)
    } catch (err) {
      console.error('[QuickCapture] failed:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Toast */}
      {toast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] px-4 py-2 bg-[#8B5CF6] text-white text-sm font-medium rounded-xl shadow-lg animate-fade-in">
          {toast}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-6 right-6 z-40 w-13 h-13 rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-lg shadow-[#8B5CF6]/25 flex items-center justify-center transition-transform hover:scale-105"
        style={{ width: 52, height: 52 }}
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* Modal backdrop + sheet */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-black/60" />
          <div
            className="relative w-full max-w-lg bg-[#110F1C] border-t border-[#1E1A2E] rounded-t-2xl p-5 space-y-4 animate-slide-up"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-10 h-1 bg-neutral-700 rounded-full mx-auto" />

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <textarea
                  value={text}
                  onChange={e => setText(e.target.value)}
                  placeholder="Capture anything — thought, task, meeting, note..."
                  rows={4}
                  autoFocus
                  className="w-full bg-[#0C0A15] border border-[#2A2540] rounded-xl px-4 py-3 pr-12 text-sm text-white placeholder-neutral-500 resize-none outline-none focus:border-[#8B5CF6] transition-colors"
                />
                <MicButton
                  onResult={transcript => setText(prev => prev ? prev + ' ' + transcript : transcript)}
                  className="absolute top-3 right-3 p-1.5 rounded-lg"
                />
              </div>
              <button
                type="submit"
                disabled={!text.trim() || loading}
                className="w-full py-3 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-30 text-white font-medium rounded-xl transition-colors"
              >
                {loading ? 'Sending...' : 'Send to Axis'}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        @keyframes fade-in {
          from { opacity: 0; transform: translate(-50%, -8px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .animate-fade-in { animation: fade-in 0.2s ease-out; }
      `}</style>
    </>
  )
}
