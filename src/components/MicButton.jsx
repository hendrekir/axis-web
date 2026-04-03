import { useState, useRef, useEffect } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

// States: idle | listening | processing | error | noise
export default function MicButton({ onResult, className = '' }) {
  const [state, setState] = useState('idle')
  const recogRef = useRef(null)
  const errorTimer = useRef(null)

  useEffect(() => {
    return () => { if (errorTimer.current) clearTimeout(errorTimer.current) }
  }, [])

  if (!SpeechRecognition) return null

  function toggle() {
    if (state === 'listening') {
      recogRef.current?.stop()
      setState('processing')
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-AU'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const result = event.results[0][0]
      const confidence = result.confidence
      const transcript = result.transcript

      if (confidence < 0.5) {
        setState('noise')
        errorTimer.current = setTimeout(() => setState('idle'), 2500)
        return
      }

      setState('processing')
      onResult(transcript)
      setTimeout(() => setState('idle'), 300)
    }

    recognition.onerror = () => {
      setState('error')
      errorTimer.current = setTimeout(() => setState('idle'), 2000)
    }

    recognition.onend = () => {
      if (state === 'listening') setState('idle')
    }

    recogRef.current = recognition
    recognition.start()
    setState('listening')
  }

  return (
    <div className="flex flex-col items-center">
      <button
        type="button"
        onClick={toggle}
        className={`relative flex items-center justify-center transition-all ${className} ${
          state === 'listening' ? 'bg-[#8B5CF6] rounded-lg' :
          state === 'error' ? 'bg-red-500/20 rounded-lg' :
          'bg-[rgba(139,92,246,0.1)] rounded-lg'
        }`}
        title={state === 'listening' ? 'Stop recording' : 'Voice input'}
      >
        {state === 'listening' ? (
          <Waveform />
        ) : state === 'processing' ? (
          <span className="w-5 h-5 flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-[#8B5CF6] animate-pulse" />
          </span>
        ) : (
          <svg
            viewBox="0 0 24 24"
            className={`w-5 h-5 ${state === 'error' ? 'text-red-400' : 'text-neutral-400 hover:text-white'}`}
            fill="currentColor"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        )}
      </button>
      {state === 'error' && (
        <span className="text-red-400 text-[10px] mt-1 whitespace-nowrap">Didn't catch that</span>
      )}
      {state === 'noise' && (
        <span className="text-neutral-400 text-[10px] mt-1 whitespace-nowrap">Too loud — tap to type</span>
      )}
      {state === 'processing' && (
        <span className="text-neutral-500 text-[10px] mt-1 whitespace-nowrap">Thinking...</span>
      )}
    </div>
  )
}

function Waveform() {
  return (
    <div className="flex items-center gap-[3px] h-5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-[3px] rounded-full bg-white"
          style={{
            animation: `waveform 0.6s ease-in-out ${i * 0.15}s infinite alternate`,
          }}
        />
      ))}
      <style>{`
        @keyframes waveform {
          from { height: 6px; }
          to { height: 20px; }
        }
      `}</style>
    </div>
  )
}
