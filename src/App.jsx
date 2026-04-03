import { useState } from 'react'
import { Routes, Route, Navigate, NavLink, useLocation } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton, useAuth } from '@clerk/clerk-react'
import { useEffect } from 'react'
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
import QuickCapture from './components/QuickCapture'
import Sidebar from './components/Sidebar'

function PushRegistrar() {
  const { getToken, isLoaded } = useAuth()
  useEffect(() => {
    if (!isLoaded) return
    getToken().then(token => registerPushSubscription(token))
  }, [isLoaded])
  return null
}

function Header({ onOpenSidebar }) {
  return (
    <header className="flex items-center justify-between px-4 py-3 border-b border-[#1E1A2E] bg-[#0C0A15]">
      <button
        onClick={onOpenSidebar}
        className="p-2 -ml-2 text-neutral-400 hover:text-white transition-colors"
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      <div className="flex items-center gap-2">
        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
        <span className="font-display text-lg text-white tracking-tight">AXIS</span>
      </div>

      <div className="flex items-center">
        <SignedIn>
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
    </header>
  )
}

function BottomTabs() {
  const location = useLocation()

  const tabs = [
    {
      to: '/situation',
      label: 'Situation',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      ),
    },
    {
      to: '/axis',
      label: 'Axis',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      ),
    },
    {
      to: '/mind',
      label: 'Mind',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
    },
    {
      to: '/brief',
      label: 'Brief',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V9a2 2 0 012-2h2a2 2 0 012 2v9a2 2 0 01-2 2h-2z" />
          <line x1="7" y1="8" x2="13" y2="8" />
          <line x1="7" y1="12" x2="11" y2="12" />
        </svg>
      ),
    },
  ]

  return (
    <nav className="flex items-center justify-around px-2 py-2 border-t border-[#1E1A2E] bg-[#0C0A15]">
      {tabs.map(tab => {
        const isActive = location.pathname === tab.to
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              isActive ? 'text-[#8B5CF6]' : 'text-neutral-500'
            }`}
          >
            {tab.icon}
            <span className="text-[11px] font-medium">{tab.label}</span>
          </NavLink>
        )
      })}
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
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="h-screen flex flex-col bg-[#0C0A15]">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <SignedIn>
        <PushRegistrar />
        <OnboardingGate />
        <QuickCapture />
      </SignedIn>

      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/situation" replace />} />
          <Route path="/situation" element={<Situation />} />
          <Route path="/axis" element={<Thread />} />
          <Route path="/mind" element={<BrainDump />} />
          <Route path="/brief" element={<Brief />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/signal" element={<Signal />} />
          <Route path="/skills" element={<Skills />} />
          <Route path="/apprentice" element={<Apprentice />} />
          <Route path="/thread" element={<Navigate to="/axis" replace />} />
          <Route path="/brain-dump" element={<Navigate to="/mind" replace />} />
        </Routes>
      </main>

      <BottomTabs />
    </div>
  )
}
