import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { postThread, getThreadHistory, authHeaders } from '../api'
import MicButton from './MicButton'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

function AxisAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-[#8B5CF6] flex items-center justify-center text-white text-xs font-bold shrink-0">
      A
    </div>
  )
}

function isDraftMessage(msg) {
  if (msg.role !== 'assistant') return false
  return (
    msg.message_type === 'email_draft' ||
    (msg.content && msg.content.includes('Draft reply ready:'))
  )
}

function parseDraft(content) {
  // Extract to, subject, and draft body from the message
  const lines = content.split('\n')
  let to = '', subject = '', body = ''
  let inDraft = false

  for (const line of lines) {
    if (line.startsWith('Draft reply ready:')) {
      inDraft = true
      continue
    }
    if (!inDraft) {
      // Try to extract subject from bold header like **Subject: ...**
      const subjectMatch = line.match(/\*\*(.+?)\*\*/)
      if (subjectMatch) subject = subjectMatch[1]
      // Try to extract "From:" to determine who we're replying to
      const fromMatch = line.match(/From:\s*(.+)/i)
      if (fromMatch) to = fromMatch[1].trim()
      continue
    }
    body += line + '\n'
  }

  return { to: to.trim(), subject: subject.trim(), body: body.trim() }
}

function SpeakerButton({ text, getToken }) {
  const [playing, setPlaying] = useState(false)

  async function speak() {
    if (playing) return
    setPlaying(true)
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) { setPlaying(false); return }
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const audio = new Audio(url)
      audio.onended = () => { setPlaying(false); URL.revokeObjectURL(url) }
      audio.onerror = () => { setPlaying(false); URL.revokeObjectURL(url) }
      audio.play()
    } catch {
      setPlaying(false)
    }
  }

  return (
    <button
      onClick={speak}
      className="shrink-0 w-6 h-6 flex items-center justify-center rounded-full transition-colors relative"
      title="Listen"
    >
      {playing && (
        <span className="absolute inset-0 rounded-full border-2 border-[#8B5CF6] animate-pulse" />
      )}
      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5" fill="#8B5CF6">
        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
      </svg>
    </button>
  )
}

function Message({ msg, getToken }) {
  const [sendState, setSendState] = useState(null) // null | 'sending' | 'sent' | 'error'
  const isUser = msg.role === 'user'
  const hasDraft = isDraftMessage(msg)

  async function sendDraft() {
    const { to, subject, body } = parseDraft(msg.content)
    if (!to || !body) {
      setSendState('error')
      return
    }
    setSendState('sending')
    try {
      const token = await getToken()
      const res = await fetch(`${API_URL}/gmail/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ to, subject: subject || 'Re:', body }),
      })
      if (!res.ok) throw new Error('Send failed')
      setSendState('sent')
    } catch {
      setSendState('error')
    }
  }

  function dismissDraft() {
    setSendState('dismissed')
  }

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && <AxisAvatar />}
      <div className="max-w-[75%]">
        <div className="relative group">
          <div
            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
              isUser
                ? 'bg-[#8B5CF6] text-white rounded-br-md'
                : 'bg-[#110F1C] text-neutral-200 rounded-bl-md'
            }`}
          >
            {msg.content}
          </div>
          {!isUser && (
            <div className="absolute -right-8 top-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <SpeakerButton text={msg.content} getToken={getToken} />
            </div>
          )}
        </div>
        {hasDraft && sendState !== 'dismissed' && (
          <div className="flex gap-2 mt-2 ml-1">
            {sendState === 'sent' ? (
              <span className="text-green-400 text-xs font-medium">Sent</span>
            ) : sendState === 'sending' ? (
              <span className="text-neutral-400 text-xs">Sending...</span>
            ) : sendState === 'error' ? (
              <span className="text-red-400 text-xs">Failed to send. Check draft details.</span>
            ) : (
              <>
                <button
                  onClick={sendDraft}
                  className="px-3 py-1 bg-green-600 hover:bg-green-500 text-white text-xs font-medium rounded-lg transition-colors"
                >
                  Send
                </button>
                <button
                  onClick={() => {/* TODO: edit mode */}}
                  className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={dismissDraft}
                  className="px-3 py-1 bg-neutral-700 hover:bg-neutral-600 text-neutral-400 text-xs font-medium rounded-lg transition-colors"
                >
                  Dismiss
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default function Thread() {
  const { getToken } = useAuth()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef(null)

  useEffect(() => {
    loadHistory()
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages])

  async function loadHistory() {
    try {
      const token = await getToken()
      const data = await getThreadHistory(token)
      setMessages(data)
    } catch (e) {
      // Not signed in or no history yet
    }
  }

  async function send(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const userMsg = { role: 'user', content: input.trim(), id: Date.now() }
    setMessages((prev) => [...prev, userMsg])
    setInput('')
    setLoading(true)

    try {
      const token = await getToken()
      const data = await postThread(userMsg.content, token)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.response.content,
          id: data.response.id,
          message_type: data.response.message_type,
        },
      ])
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `Error: ${e.message}`, id: Date.now() + 1 },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto">
      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-neutral-500 mt-20">
            <p className="text-lg font-medium">Talk to Axis</p>
            <p className="text-sm mt-1">Your ambient AI agent. Ask anything.</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <Message key={msg.id || i} msg={msg} getToken={getToken} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <AxisAvatar />
            <div className="bg-[#110F1C] px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#8B5CF6] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-4 pb-4">
        <div className="flex gap-2 bg-[#110F1C] border border-[#1E1A2E] rounded-xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Axis..."
            className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none placeholder-neutral-500"
          />
          <MicButton
            onResult={(text) => setInput((prev) => prev ? prev + ' ' + text : text)}
            className="px-2 py-2 rounded-lg"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] disabled:opacity-30 disabled:hover:bg-[#8B5CF6] text-white text-sm font-medium rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
