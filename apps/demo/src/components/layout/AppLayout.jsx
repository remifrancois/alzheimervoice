import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'

function DemoBanner() {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-violet-600/90 backdrop-blur-sm text-white text-center py-1 text-[11px] font-medium tracking-wide">
      Demo mode — Hackathon Anthropic / Claude Opus 4.6
      <span className="mx-2 text-violet-300/60">|</span>
      <a
        href="https://github.com/remifrancois/cognitivevoicefingerprint"
        target="_blank"
        rel="noopener noreferrer"
        className="underline underline-offset-2 hover:text-violet-200 transition-colors"
      >
        Cognitive Voice Fingerprint (CVF) V5 Engine on GitHub
      </a>
    </div>
  )
}

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <DemoBanner />
      <div className="pt-[26px] flex flex-1">
        <Sidebar />
        <div className="ml-[var(--sidebar-width)] flex flex-col flex-1">
          <main className="flex-1">
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
    </div>
  )
}
