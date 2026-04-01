import { useState, useEffect } from 'react'
import { useAuth } from '@clerk/clerk-react'
import { getSignal, updateTask } from '../api'

const CATEGORY_COLORS = {
  work: 'border-blue-500/30',
  health: 'border-green-500/30',
  home: 'border-yellow-500/30',
  money: 'border-emerald-500/30',
  family: 'border-pink-500/30',
  admin: 'border-neutral-500/30',
  personal: 'border-purple-500/30',
}

export default function Signal() {
  const { getToken } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSignal()
  }, [])

  async function loadSignal() {
    try {
      const token = await getToken()
      const data = await getSignal(token)
      setTasks(data.signal)
    } catch (e) {
      // Not signed in or no tasks
    } finally {
      setLoading(false)
    }
  }

  async function markDone(taskId) {
    try {
      const token = await getToken()
      await updateTask(taskId, { is_done: true }, token)
      setTasks((prev) => prev.filter((t) => t.id !== taskId))
    } catch (e) {
      // handle error
    }
  }

  const hero = tasks[0]
  const queue = tasks.slice(1)

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white">Signal</h1>
          <p className="text-neutral-400 text-sm mt-2">
            Your top priorities right now.
          </p>
        </div>

        {loading ? (
          <p className="text-neutral-500 text-center">Loading...</p>
        ) : tasks.length === 0 ? (
          <div className="text-center text-neutral-500 mt-12">
            <p className="text-lg">No active tasks</p>
            <p className="text-sm mt-1">Use Brain Dump to add some.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Hero task */}
            {hero && (
              <div className={`bg-[#110F1C] border-l-4 ${CATEGORY_COLORS[hero.category] || 'border-neutral-500/30'} rounded-xl p-6`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs text-neutral-500 uppercase tracking-wider">Next action</span>
                    <h2 className="text-white text-lg font-semibold mt-1">{hero.title}</h2>
                    {hero.why && <p className="text-neutral-400 text-sm mt-2">{hero.why}</p>}
                  </div>
                  <button
                    onClick={() => markDone(hero.id)}
                    className="shrink-0 w-10 h-10 rounded-full border-2 border-neutral-600 hover:border-green-500 hover:bg-green-500/10 transition-colors flex items-center justify-center"
                  >
                    <span className="text-neutral-400 hover:text-green-400">✓</span>
                  </button>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <span className="px-2 py-0.5 bg-[#1A1726] text-neutral-400 text-xs rounded-full">{hero.category}</span>
                  {hero.is_urgent && <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">URGENT</span>}
                </div>
              </div>
            )}

            {/* Queue */}
            {queue.map((task) => (
              <div key={task.id} className="bg-[#110F1C]/50 border border-[#1E1A2E] rounded-xl p-4 flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-white text-sm font-medium">{task.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-neutral-500 text-xs">{task.category}</span>
                    {task.is_urgent && <span className="text-red-400 text-xs">urgent</span>}
                  </div>
                </div>
                <button
                  onClick={() => markDone(task.id)}
                  className="shrink-0 w-8 h-8 rounded-full border border-[#2A2540] hover:border-green-500 hover:bg-green-500/10 transition-colors flex items-center justify-center text-neutral-500 hover:text-green-400 text-sm"
                >
                  ✓
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
