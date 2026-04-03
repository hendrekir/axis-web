import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { confirmSchedule } from '../api'

export default function ScheduleConfirmCard({ intent, onConfirmed }) {
  const { getToken } = useAuth()
  const [state, setState] = useState('pending') // pending | confirming | confirmed | cancelled

  async function handleConfirm() {
    setState('confirming')
    try {
      const token = await getToken()
      const result = await confirmSchedule({
        person: intent.person,
        datetime_str: intent.datetime_str,
        subject: intent.subject,
        duration_minutes: intent.duration_minutes,
      }, token)
      setState('confirmed')
      if (onConfirmed) onConfirmed(result.confirmation_message)
    } catch (err) {
      console.error('[Schedule] confirm failed:', err)
      setState('pending')
    }
  }

  if (state === 'confirmed') {
    return (
      <div className="bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3 text-green-400 text-sm">
        Added to calendar.
      </div>
    )
  }

  if (state === 'cancelled') return null

  const dt = intent.datetime_str ? new Date(intent.datetime_str) : null
  const formatted = dt
    ? dt.toLocaleDateString('en-AU', { weekday: 'short', month: 'short', day: 'numeric' }) +
      ' at ' +
      dt.toLocaleTimeString('en-AU', { hour: 'numeric', minute: '2-digit', hour12: true })
    : ''

  return (
    <div className="bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-4 space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-4 h-4 text-[#8B5CF6]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-[#8B5CF6] text-xs font-semibold uppercase tracking-wider">Calendar Event</span>
      </div>

      <div className="space-y-1.5 text-sm">
        <p className="text-white font-medium">{intent.subject}</p>
        {intent.person && (
          <p className="text-neutral-400">With {intent.person}</p>
        )}
        <p className="text-neutral-400">{formatted}</p>
        <p className="text-neutral-500 text-xs">{intent.duration_minutes} min</p>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleConfirm}
          disabled={state === 'confirming'}
          className="px-4 py-1.5 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
        >
          {state === 'confirming' ? 'Adding...' : 'Confirm'}
        </button>
        <button
          onClick={() => setState('cancelled')}
          className="px-4 py-1.5 bg-[#1A1726] hover:bg-[#2A2540] text-neutral-400 text-xs font-medium rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
