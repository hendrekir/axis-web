import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { registerPushSubscription } from './lib/pushSubscription'
import Onboarding from './components/Onboarding'
import ModeSwitcher from './components/ModeSwitcher'
import Thread from './components/Thread'
import BrainDump from './components/BrainDump'
import Signal from './components/Signal'
import Skills from './components/Skills'
import Brief from './components/Brief'
import Settings from './components/Settings'
import Apprentice from './components/Apprentice'
import Situation from './components/Situation'

function PushRegistrar() {
  const { getToken, isLoaded } = useAuth()
  useEffect(() => {
    if (!isLoaded) return
    getToken().then(token => registerPushSubscription(token))
  }, [isLoaded])
  return null
}

function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-[#8B5CF6]/15 text-[#8B5CF6]' : 'text-neutral-400 hover:text-white'
    }`

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-[#1E1A2E]">
      <div className="flex items-center gap-2">
        <span className="font-display text-lg text-white tracking-tight">AXIS</span>
        <span className="font-mono text-[10px] text-neutral-500 ml-1">v1.0</span>
      </div>
      <div className="flex items-center gap-1">
        <NavLink to="/situation" className={linkClass}>Situation</NavLink>
        <NavLink to="/thread" className={linkClass}>Thread</NavLink>
        <NavLink to="/brain-dump" className={linkClass}>Brain Dump</NavLink>
        <NavLink to="/signal" className={linkClass}>Signal</NavLink>
        <NavLink to="/skills" className={linkClass}>Skills</NavLink>
        <NavLink to="/brief" className={linkClass}>Brief</NavLink>
        <NavLink to="/apprentice" className={linkClass}>Apprentice</NavLink>
        <NavLink to="/settings" className={linkClass}>Settings</NavLink>
      </div>
      <div className="flex items-center gap-3">
        <SignedIn>
          <PushRegistrar />
          <ModeSwitcher />
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-medium rounded-lg transition-colors">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  )
}

function OnboardingGate() {
  const [showOnboarding, setShowOnboarding] = useState(
    !localStorage.getItem('onboarding_complete')
  )
  if (!showOnboarding) return null
  return <Onboarding onComplete={() => setShowOnboarding(false)} />
}

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-[#0C0A15]">
      <Nav />
      <SignedIn><OnboardingGate /></SignedIn>
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/situation" replace />} />
          <Route path="/situation" element={<Situation />} />
          <Route path="/thread" element={<Thread />} />
          <Route path="/brain-dump" element={<BrainDump />} />
          <Route path="/signal" element={<Signal />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/brief" element={<Brief />} />
          <Route path="/apprentice" element={<Apprentice />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}
