import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Sidebar />
      <main className="ml-[var(--sidebar-width)]">
        <Outlet />
      </main>
    </div>
  )
}
