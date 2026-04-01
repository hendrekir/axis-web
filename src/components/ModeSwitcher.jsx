import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getMe, updateMe } from '../api'

const MODES = [
  { id: 'personal', label: 'Personal', icon: '\u{1F464}' },
  { id: 'work',     label: 'Work',     icon: '\u{1F4BC}' },
  { id: 'builder',  label: 'Builder',  icon: '\u26A1' },
  { id: 'student',  label: 'Student',  icon: '\u{1F4DA}' },
  { id: 'founder',  label: 'Founder',  icon: '\u{1F680}' },
]

export default function ModeSwitcher() {
  const { getToken, isLoaded } = useAuth()
  const [mode, setMode] = useState(null)
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!isLoaded) return
    getToken().then(token => getMe(token)).then(data => setMode(data.mode || 'personal'))
  }, [isLoaded])

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function selectMode(newMode) {
    const prev = mode
    setMode(newMode)
    setOpen(false)
    try {
      const token = await getToken()
      await updateMe({ mode: newMode }, token)
    } catch {
      setMode(prev)
    }
  }

  const current = MODES.find(m => m.id === mode) || MODES[0]

  if (!mode) return null

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1A1726] hover:bg-[#2A2540] rounded-full text-sm font-medium text-white transition-colors"
      >
        <span>{current.icon}</span>
        <span>{current.label}</span>
        <svg className={`w-3 h-3 text-neutral-400 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-[#110F1C] border border-[#1E1A2E] rounded-xl shadow-xl py-1 z-50">
          {MODES.map(m => (
            <button
              key={m.id}
              onClick={() => selectMode(m.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                m.id === mode
                  ? 'text-white bg-white/5'
                  : 'text-neutral-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>{m.icon}</span>
              <span>{m.label}</span>
              {m.id === mode && (
                <svg className="w-3.5 h-3.5 ml-auto text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
