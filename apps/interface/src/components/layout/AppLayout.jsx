import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Footer from './Footer'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Sidebar />
      <div className="ml-[var(--sidebar-width)] flex flex-col flex-1">
        <main className="flex-1">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  )
}
