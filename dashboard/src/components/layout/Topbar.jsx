import { Icon } from '../ui/Icon'

export default function Topbar({ title, subtitle }) {
  return (
    <header className="h-[var(--topbar-height)] border-b border-slate-800 bg-slate-950/80 backdrop-blur-md flex items-center justify-between px-6 sticky top-0 z-10">
      <div>
        <h1 className="text-sm font-semibold text-white">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-500 hover:border-slate-700 transition-colors w-48">
          <Icon name="search" size={14} />
          <span>Search...</span>
          <kbd className="ml-auto text-[10px] bg-slate-800 px-1.5 py-0.5 rounded">&#8984;K</kbd>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors">
          <Icon name="bell" size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* User avatar */}
        <div className="flex items-center gap-2 pl-3 border-l border-slate-800">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
            R
          </div>
          <div className="hidden sm:block">
            <div className="text-xs font-medium text-slate-200">Dr. Remi</div>
            <div className="text-[10px] text-slate-500">Admin</div>
          </div>
        </div>
      </div>
    </header>
  )
}
