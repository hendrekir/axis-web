import { useState, useRef } from 'react'

const SpeechRecognition = typeof window !== 'undefined'
  ? window.SpeechRecognition || window.webkitSpeechRecognition
  : null

export default function MicButton({ onResult, className = '' }) {
  const [listening, setListening] = useState(false)
  const recogRef = useRef(null)

  if (!SpeechRecognition) return null // Browser doesn't support it

  function toggle() {
    if (listening) {
      recogRef.current?.stop()
      setListening(false)
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = 'en-AU'
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onResult(transcript)
      setListening(false)
    }

    recognition.onerror = () => setListening(false)
    recognition.onend = () => setListening(false)

    recogRef.current = recognition
    recognition.start()
    setListening(true)
  }

  return (
    <button
      type="button"
      onClick={toggle}
      className={`relative flex items-center justify-center transition-colors ${className}`}
      title={listening ? 'Stop recording' : 'Voice input'}
    >
      {listening && (
        <span className="absolute inset-0 rounded-lg bg-red-500/20 animate-pulse" />
      )}
      <svg
        viewBox="0 0 24 24"
        className={`w-5 h-5 ${listening ? 'text-red-400' : 'text-neutral-400 hover:text-white'}`}
        fill="currentColor"
      >
        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
      </svg>
    </button>
  )
}
