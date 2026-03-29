import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { chatWithSkill, authHeaders } from '../api'

const SKILLS = [
  { id: 'email', name: 'Email', desc: 'Rank inbox, draft replies in your voice', color: 'bg-red-500/20 text-red-400', icon: 'M' },
  { id: 'calendar', name: 'Calendar', desc: 'Meeting prep, conflicts, travel time', color: 'bg-blue-500/20 text-blue-400', icon: 'C' },
  { id: 'finance', name: 'Finance', desc: 'Invoice alerts, cash flow tracking', color: 'bg-green-500/20 text-green-400', icon: '$' },
  { id: 'site', name: 'Site', desc: 'Builder mode — site context, suppliers', color: 'bg-amber-500/20 text-amber-400', icon: 'S' },
  { id: 'study', name: 'Study', desc: 'Research, reading lists, learning goals', color: 'bg-purple-500/20 text-purple-400', icon: 'B' },
  { id: 'team', name: 'Team', desc: 'Signals, delegation, shared tasks', color: 'bg-cyan-500/20 text-cyan-400', icon: 'T' },
]

export default function Skills() {
  const { getToken } = useAuth()
  const [activeSkill, setActiveSkill] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function openSkill(skill) {
    setActiveSkill(skill)
    setMessages([{
      role: 'assistant',
      content: `${skill.name} skill active. What do you need?`,
    }])
  }

  async function send(e) {
    e.preventDefault()
    if (!input.trim() || loading) return

    const text = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setLoading(true)

    try {
      const token = await getToken()
      const data = await chatWithSkill(activeSkill.id, text, token)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setLoading(false)
    }
  }

  // Skill conversation view
  if (activeSkill) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <button
            onClick={() => { setActiveSkill(null); setMessages([]) }}
            className="text-neutral-400 hover:text-white text-sm transition-colors"
          >
            &larr; Skills
          </button>
          <span className={`w-8 h-8 rounded-lg ${activeSkill.color} flex items-center justify-center text-sm font-bold`}>
            {activeSkill.icon}
          </span>
          <span className="text-white font-medium">{activeSkill.name}</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2.5 rounded-xl text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-neutral-800 text-neutral-200'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-neutral-800 text-neutral-400 px-4 py-2.5 rounded-xl text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <form onSubmit={send} className="px-4 py-3 border-t border-neutral-800">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Ask ${activeSkill.name}...`}
              className="flex-1 bg-neutral-900 border border-neutral-700 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-500 outline-none focus:border-neutral-600"
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-sm font-medium rounded-xl transition-colors"
            >
              Send
            </button>
          </div>
        </form>
      </div>
    )
  }

  // Skill grid
  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Skills</h1>
          <p className="text-neutral-400 mt-1">Tap a skill to start a conversation</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {SKILLS.map(skill => (
            <button
              key={skill.id}
              onClick={() => openSkill(skill)}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 text-left hover:border-neutral-700 transition-colors group"
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`w-10 h-10 rounded-lg ${skill.color} flex items-center justify-center text-lg font-bold`}>
                  {skill.icon}
                </span>
                <span className="text-white font-medium group-hover:text-blue-400 transition-colors">
                  {skill.name}
                </span>
              </div>
              <p className="text-neutral-500 text-xs leading-relaxed">{skill.desc}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
