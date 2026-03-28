import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { postThread, getThreadHistory } from '../api'

function AxisAvatar() {
  return (
    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
      A
    </div>
  )
}

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {!isUser && <AxisAvatar />}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-blue-600 text-white rounded-br-md'
            : 'bg-neutral-800 text-neutral-200 rounded-bl-md'
        }`}
      >
        {msg.content}
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
          <Message key={msg.id || i} msg={msg} />
        ))}
        {loading && (
          <div className="flex gap-3">
            <AxisAvatar />
            <div className="bg-neutral-800 px-4 py-3 rounded-2xl rounded-bl-md">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce" />
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-neutral-500 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={send} className="px-4 pb-4">
        <div className="flex gap-2 bg-neutral-900 border border-neutral-700 rounded-xl p-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Message Axis..."
            className="flex-1 bg-transparent text-white text-sm px-3 py-2 outline-none placeholder-neutral-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  )
}
