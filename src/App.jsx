import { Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { SignedIn, SignedOut, SignInButton, UserButton } from '@clerk/clerk-react'
import Thread from './components/Thread'
import BrainDump from './components/BrainDump'
import Signal from './components/Signal'

function Nav() {
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-white/10 text-white' : 'text-neutral-400 hover:text-white'
    }`

  return (
    <nav className="flex items-center justify-between px-4 py-3 border-b border-neutral-800">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white tracking-tight">AXIS</span>
        <span className="text-xs text-neutral-500 ml-1">v1.0</span>
      </div>
      <div className="flex items-center gap-1">
        <NavLink to="/thread" className={linkClass}>Thread</NavLink>
        <NavLink to="/brain-dump" className={linkClass}>Brain Dump</NavLink>
        <NavLink to="/signal" className={linkClass}>Signal</NavLink>
      </div>
      <div className="flex items-center gap-3">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
        </SignedIn>
        <SignedOut>
          <SignInButton mode="modal">
            <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors">
              Sign in
            </button>
          </SignInButton>
        </SignedOut>
      </div>
    </nav>
  )
}

export default function App() {
  return (
    <div className="h-screen flex flex-col bg-neutral-950">
      <Nav />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/brain-dump" replace />} />
          <Route path="/thread" element={<Thread />} />
          <Route path="/brain-dump" element={<BrainDump />} />
          <Route path="/signal" element={<Signal />} />
        </Routes>
      </main>
    </div>
  )
}
