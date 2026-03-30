import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getSkills, updateSkill, runSkill, chatWithSkill } from '../api'

const MODEL_COLORS = {
  claude: 'bg-orange-500/20 text-orange-400',
  perplexity: 'bg-blue-500/20 text-blue-400',
  grok: 'bg-pink-500/20 text-pink-400',
  gemini_flash: 'bg-emerald-500/20 text-emerald-400',
  gemini_pro: 'bg-emerald-500/20 text-emerald-400',
}

const SKILL_COLORS = {
  email: 'bg-red-500/20 text-red-400',
  calendar: 'bg-blue-500/20 text-blue-400',
  finance: 'bg-green-500/20 text-green-400',
  site: 'bg-amber-500/20 text-amber-400',
  study: 'bg-purple-500/20 text-purple-400',
  team: 'bg-cyan-500/20 text-cyan-400',
  research: 'bg-indigo-500/20 text-indigo-400',
  entertainment: 'bg-pink-500/20 text-pink-400',
}

function getSkillColor(name) {
  const key = name.toLowerCase()
  return SKILL_COLORS[key] || 'bg-neutral-500/20 text-neutral-400'
}

export default function Skills() {
  const { getToken, isLoaded } = useAuth()
  const [skills, setSkills] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [running, setRunning] = useState(null)

  // Chat state
  const [activeSkill, setActiveSkill] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    loadSkills()
  }, [isLoaded])

  async function loadSkills() {
    try {
      const token = await getToken()
      const data = await getSkills(token)
      setSkills(data.skills || [])
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  async function toggleActive(skill) {
    setToggling(skill.id)
    try {
      const token = await getToken()
      await updateSkill(skill.id, { is_active: !skill.is_active }, token)
      setSkills(prev =>
        prev.map(s => s.id === skill.id ? { ...s, is_active: !s.is_active } : s)
      )
    } catch (e) {
      setError(e.message)
    } finally {
      setToggling(null)
    }
  }

  async function handleRun(skill) {
    setRunning(skill.id)
    try {
      const token = await getToken()
      await runSkill(skill.id, 'Run now', token)
    } catch (e) {
      setError(e.message)
    } finally {
      setRunning(null)
    }
  }

  function openChat(skill) {
    setActiveSkill(skill)
    setMessages([{
      role: 'assistant',
      content: `${skill.name} skill active. What do you need?`,
    }])
  }

  async function send(e) {
    e.preventDefault()
    if (!input.trim() || chatLoading) return

    const text = input
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: text }])
    setChatLoading(true)

    try {
      const token = await getToken()
      const data = await chatWithSkill(activeSkill.id, text, token)
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Error: ${err.message}` }])
    } finally {
      setChatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-neutral-400">
        Loading...
      </div>
    )
  }

  // Skill conversation view
  if (activeSkill) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-800">
          <button
            onClick={() => { setActiveSkill(null); setMessages([]) }}
            className="text-neutral-400 hover:text-white text-sm transition-colors"
          >
            &larr; Skills
          </button>
          <span className={`w-8 h-8 rounded-lg ${getSkillColor(activeSkill.name)} flex items-center justify-center text-sm font-bold`}>
            {activeSkill.name[0]}
          </span>
          <span className="text-white font-medium">{activeSkill.name}</span>
          <span className={`ml-2 px-2 py-0.5 rounded text-[10px] font-medium ${MODEL_COLORS[activeSkill.reasoning_model] || 'bg-neutral-700 text-neutral-300'}`}>
            {activeSkill.reasoning_model}
          </span>
        </div>

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
          {chatLoading && (
            <div className="flex justify-start">
              <div className="bg-neutral-800 text-neutral-400 px-4 py-2.5 rounded-xl text-sm">
                Thinking...
              </div>
            </div>
          )}
        </div>

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
              disabled={!input.trim() || chatLoading}
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
          <p className="text-neutral-400 mt-1">Tap a skill to chat. Toggle to activate for dispatch.</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {skills.map(skill => (
            <div
              key={skill.id}
              className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 group"
            >
              {/* Header row: icon + name + toggle */}
              <div className="flex items-center justify-between mb-2">
                <div
                  className="flex items-center gap-3 cursor-pointer"
                  onClick={() => openChat(skill)}
                >
                  <span className={`w-10 h-10 rounded-lg ${getSkillColor(skill.name)} flex items-center justify-center text-lg font-bold`}>
                    {skill.name[0]}
                  </span>
                  <div>
                    <span className="text-white font-medium group-hover:text-blue-400 transition-colors block text-sm">
                      {skill.name}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${MODEL_COLORS[skill.reasoning_model] || 'bg-neutral-700 text-neutral-300'}`}>
                      {skill.reasoning_model}
                    </span>
                  </div>
                </div>

                {/* Active toggle */}
                <button
                  onClick={() => toggleActive(skill)}
                  disabled={toggling === skill.id}
                  className={`w-10 h-6 rounded-full transition-colors relative ${
                    skill.is_active ? 'bg-green-600' : 'bg-neutral-700'
                  }`}
                >
                  <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    skill.is_active ? 'left-5' : 'left-1'
                  }`} />
                </button>
              </div>

              {/* Description */}
              <p className="text-neutral-500 text-xs leading-relaxed mb-3">
                {skill.description || 'No description'}
              </p>

              {/* Data source pills */}
              {skill.data_sources && skill.data_sources.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {skill.data_sources.map(src => (
                    <span key={src} className="px-2 py-0.5 bg-neutral-800 text-neutral-400 text-[10px] rounded-full">
                      {src}
                    </span>
                  ))}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => openChat(skill)}
                  className="flex-1 px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium rounded-lg transition-colors"
                >
                  Chat
                </button>
                {skill.trigger_type === 'manual' && (
                  <button
                    onClick={() => handleRun(skill)}
                    disabled={running === skill.id}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-medium rounded-lg transition-colors"
                  >
                    {running === skill.id ? 'Running...' : 'Run'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
