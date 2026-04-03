import { useState } from 'react'
import { useAuth } from '@clerk/clerk-react'

const DOMAINS = [
  { name: 'Work',          emoji: '⚡', status: '3 active signals',  active: true },
  { name: 'Money',         emoji: '💰', status: 'Not tracking',      active: false },
  { name: 'Relationships', emoji: '🤝', status: 'Not tracking',      active: false },
  { name: 'Health',        emoji: '🧬', status: 'Not tracking',      active: false },
  { name: 'Knowledge',     emoji: '📚', status: '2 notes saved',     active: true },
  { name: 'Growth',        emoji: '🌱', status: 'Not tracking',      active: false },
  { name: 'Ideas',         emoji: '💡', status: '1 capture',         active: true },
]

const SKILL_TREE = [
  {
    section: 'Work & Business',
    unlocked: ['Builder', 'Founder', 'Client handler'],
    locked: ['Closer x3', 'Scale'],
  },
  {
    section: 'Knowledge',
    unlocked: ['Curious', 'Builder', 'Learner'],
    locked: ['Researcher', 'Author'],
  },
  {
    section: 'Money',
    unlocked: ['Earner'],
    locked: ['Saver', 'Investor', 'Wealth builder'],
  },
]

const TIERS = ['Spark', 'Ember', 'Forge', 'Legend']

function DomainCard({ domain }) {
  const inactive = !domain.active
  return (
    <div
      className={`bg-[#110F1C] border border-[rgba(139,92,246,0.12)] rounded-xl p-5 flex flex-col gap-2 ${
        inactive ? 'opacity-50' : ''
      }`}
    >
      <span className="text-2xl">{domain.emoji}</span>
      <span className="text-white font-medium text-sm">{domain.name}</span>
      <span className="text-neutral-500 text-xs">{domain.status}</span>
      {inactive && (
        <span className="text-red-400/60 text-[10px]">gap</span>
      )}
    </div>
  )
}

function SkillPill({ name, unlocked }) {
  return (
    <span
      className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
        unlocked
          ? 'border border-green-500/30 text-green-400 bg-green-500/10'
          : 'border border-neutral-700 text-neutral-600 bg-[#1A1726]'
      }`}
    >
      {name}
    </span>
  )
}

function MapView() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {DOMAINS.map((domain) => (
        <div
          key={domain.name}
          className={domain.name === 'Ideas' ? 'col-span-2 max-w-[calc(50%-6px)] mx-auto w-full' : ''}
        >
          <DomainCard domain={domain} />
        </div>
      ))}
    </div>
  )
}

function SkillTreeView() {
  return (
    <div className="flex flex-col gap-6">
      {/* Tier strip */}
      <div className="flex gap-2">
        {TIERS.map((tier) => (
          <span
            key={tier}
            className="px-3 py-1 rounded-full text-xs font-medium bg-[#1A1726] text-neutral-500"
          >
            {tier}
          </span>
        ))}
      </div>

      {/* Sections */}
      {SKILL_TREE.map((group) => (
        <div key={group.section} className="flex flex-col gap-3">
          <h3 className="text-xs font-semibold text-neutral-400 uppercase tracking-widest">
            {group.section}
          </h3>
          <div className="flex flex-wrap gap-2">
            {group.unlocked.map((name) => (
              <SkillPill key={name} name={name} unlocked />
            ))}
            {group.locked.map((name) => (
              <SkillPill key={name} name={name} unlocked={false} />
            ))}
          </div>
        </div>
      ))}

      {/* Footer note */}
      <p className="text-neutral-600 text-xs italic text-center mt-4">
        Axis verifies achievements from your real activity. You can't inflate your rank.
      </p>
    </div>
  )
}

export default function Mind() {
  const { getToken } = useAuth()
  const [view, setView] = useState('map')

  return (
    <div className="min-h-screen bg-[#0C0A15] px-5 pt-14 pb-28">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-2xl font-extrabold text-white" style={{ fontFamily: 'Syne, sans-serif' }}>
          Mind
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setView('map')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              view === 'map'
                ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                : 'bg-[#1A1726] text-neutral-500'
            }`}
          >
            Map
          </button>
          <button
            onClick={() => setView('tree')}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
              view === 'tree'
                ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]'
                : 'bg-[#1A1726] text-neutral-500'
            }`}
          >
            Skill Tree
          </button>
        </div>
      </div>

      {/* Content */}
      {view === 'map' ? <MapView /> : <SkillTreeView />}
    </div>
  )
}
