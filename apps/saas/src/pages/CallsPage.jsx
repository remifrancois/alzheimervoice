import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, Badge, Icon, EmptyState, api, useT } from '@azh/shared-ui'

const CATEGORY_COLORS = {
  family: 'text-rose-400', career: 'text-blue-400', childhood: 'text-amber-400',
  hobby: 'text-emerald-400', travel: 'text-cyan-400', military: 'text-slate-300',
  health: 'text-green-400', daily: 'text-violet-400', community: 'text-indigo-400',
  pet: 'text-orange-400',
}

export default function CallsPage() {
  const { t } = useT()
  const [patients, setPatients] = useState([])
  const [calls, setCalls] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState('list')

  useEffect(() => {
    api.getPatients().then(data => {
      const valid = data.filter(p => p.first_name)
      setPatients(valid)
      if (valid.length > 0) {
        setSelected(valid[0])
        api.getCalls(valid[0].patient_id).then(setCalls)
      }
    }).finally(() => setLoading(false))
  }, [])

  function switchPatient(patient) {
    if (patient.patient_id === selected?.patient_id) return
    setSelected(patient)
    setCalls([])
    api.getCalls(patient.patient_id).then(setCalls)
  }

  const today = calls.filter(c => c.status === 'today')
  const upcoming = calls.filter(c => c.status === 'upcoming')
  const scheduled = calls.filter(c => c.status === 'scheduled')

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  return (
    <>
      <Topbar title={t('calls.title')} subtitle={selected ? t('calls.subtitle', { name: selected.first_name }) : t('calls.loading')} />

      <div className="p-6 space-y-6">
        {/* Patient switcher */}
        {patients.length > 1 && (
          <div className="flex items-center gap-1.5">
            {patients.map(p => (
              <button
                key={p.patient_id}
                onClick={() => switchPatient(p)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  p.patient_id === selected?.patient_id
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50 border border-transparent'
                }`}
              >
                {p.first_name}
              </button>
            ))}
          </div>
        )}

        {/* Schedule info + view toggle */}
        <div className="flex items-center justify-between">
          {selected && (
            <div className="flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Icon name="phone" size={14} className="text-violet-400" />
                <span>{t('calls.dailyCallAt')} <strong className="text-white">{selected.call_schedule?.time}</strong></span>
              </div>
              <span className="text-slate-600">|</span>
              <span>{t('calls.callsScheduled', { count: calls.length })}</span>
            </div>
          )}
          <div className="flex items-center gap-1 bg-slate-800/50 rounded-lg p-0.5">
            <button
              onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === 'list' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon name="list" size={14} />
              {t('calls.listView')}
            </button>
            <button
              onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                view === 'calendar' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon name="calendar" size={14} />
              {t('calls.calendarView')}
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-slate-500 py-8 text-center">{t('calls.loading')}</div>
        ) : calls.length === 0 ? (
          <EmptyState
            icon="phone"
            title={t('calls.noCalls')}
            description={t('calls.noCallsDesc')}
          />
        ) : view === 'calendar' ? (
          <CalendarView calls={calls} t={t} />
        ) : (
          <div className="space-y-6">
            {/* Today */}
            {today.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <h3 className="text-sm font-semibold text-emerald-400">{t('calls.today')}</h3>
                </div>
                <div className="space-y-3">
                  {today.map(call => (
                    <CallCard key={call.id} call={call} dayNames={dayNames} isToday t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Next 2 days */}
            {upcoming.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">{t('calls.next2Days')}</h3>
                <div className="space-y-3">
                  {upcoming.map(call => (
                    <CallCard key={call.id} call={call} dayNames={dayNames} t={t} />
                  ))}
                </div>
              </div>
            )}

            {/* Rest of the week+ */}
            {scheduled.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-500 mb-3">{t('calls.thisWeekNext')}</h3>
                <div className="space-y-2">
                  {scheduled.map(call => (
                    <CallCardCompact key={call.id} call={call} dayNames={dayNames} t={t} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}

// ─── Calendar View ───────────────────────────────────────────────────

function CalendarView({ calls, t }) {
  const [currentMonth, setCurrentMonth] = useState(() => new Date())

  const year = currentMonth.getFullYear()
  const month = currentMonth.getMonth()
  const firstDayOfMonth = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const monthName = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })

  // Map calls to date strings
  const callsByDate = {}
  calls.forEach(c => {
    if (!callsByDate[c.date]) callsByDate[c.date] = []
    callsByDate[c.date].push(c)
  })

  const todayStr = new Date().toISOString().split('T')[0]

  // Build calendar cells
  const cells = []
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    cells.push({ day: d, date: dateStr, calls: callsByDate[dateStr] || [] })
  }

  const GOAL_COLORS = {
    free_recall: 'bg-violet-500',
    cued_recall: 'bg-blue-500',
    emotional_engagement: 'bg-rose-500',
  }

  return (
    <Card>
      {/* Month navigation */}
      <div className="flex items-center justify-between mb-5">
        <button
          onClick={() => setCurrentMonth(new Date(year, month - 1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h3 className="text-sm font-semibold text-white capitalize">{monthName}</h3>
        <button
          onClick={() => setCurrentMonth(new Date(year, month + 1))}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
          <div key={d} className="text-center text-[10px] font-medium text-slate-500 py-1.5">{d}</div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={`empty-${i}`} className="h-20" />

          const isToday = cell.date === todayStr
          const hasCalls = cell.calls.length > 0

          return (
            <div
              key={cell.date}
              className={`h-20 rounded-lg border p-1.5 transition-colors ${
                isToday
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : hasCalls
                    ? 'border-slate-700 bg-slate-800/20 hover:bg-slate-800/40'
                    : 'border-slate-800/50 bg-slate-900/20'
              }`}
            >
              <div className={`text-[11px] font-medium mb-1 ${
                isToday ? 'text-emerald-400' : hasCalls ? 'text-slate-300' : 'text-slate-600'
              }`}>
                {cell.day}
                {isToday && <span className="ml-1 text-[9px] text-emerald-500 font-normal">{t('calls.today')}</span>}
              </div>
              {cell.calls.map(c => {
                const catColor = CATEGORY_COLORS[c.planned_category] || 'text-slate-400'
                const goalColor = GOAL_COLORS[c.conversation_goal] || 'bg-slate-500'
                return (
                  <div key={c.id} className="flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${goalColor}`} />
                    <span className="text-[9px] text-slate-400 truncate">{c.time}</span>
                    <span className={`text-[9px] truncate ${catColor}`}>{c.planned_topic}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-3 border-t border-slate-800">
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" /><span className="text-[10px] text-slate-500">{t('calls.freeRecall')}</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500" /><span className="text-[10px] text-slate-500">{t('calls.cuedRecall')}</span></span>
        <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" /><span className="text-[10px] text-slate-500">{t('calls.emotionalEngagement')}</span></span>
      </div>
    </Card>
  )
}

// ─── Call Card ────────────────────────────────────────────────────────

function CallCard({ call, dayNames, isToday, t }) {
  const GOAL_LABELS = {
    free_recall: { label: t('calls.freeRecall'), desc: t('calls.freeRecallDesc'), color: 'text-violet-400', bg: 'bg-violet-500/10' },
    cued_recall: { label: t('calls.cuedRecall'), desc: t('calls.cuedRecallDesc'), color: 'text-blue-400', bg: 'bg-blue-500/10' },
    emotional_engagement: { label: t('calls.emotionalEngagement'), desc: t('calls.emotionalEngagementDesc'), color: 'text-rose-400', bg: 'bg-rose-500/10' },
  }

  const goal = GOAL_LABELS[call.conversation_goal] || GOAL_LABELS.free_recall
  const catColor = CATEGORY_COLORS[call.planned_category] || 'text-slate-400'
  const callDate = new Date(call.date + 'T00:00:00')
  const dayName = dayNames[callDate.getDay()]

  return (
    <Card className={isToday ? 'border-emerald-500/30 bg-emerald-500/5' : ''}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-lg ${isToday ? 'bg-emerald-500/20' : 'bg-slate-800'} flex items-center justify-center`}>
            <Icon name="phone" size={18} className={isToday ? 'text-emerald-400' : 'text-slate-400'} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">{dayName}</span>
              <span className="text-xs text-slate-500">{call.date}</span>
              <span className="text-xs text-slate-500">{t('calls.at')} {call.time}</span>
              {isToday && <Badge variant="success">{t('calls.today')}</Badge>}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs capitalize ${catColor}`}>{call.planned_category}</span>
              <span className="text-slate-700">&#x2022;</span>
              <span className="text-xs text-slate-300">{call.planned_topic}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-slate-800">
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${goal.bg}`}>
          <span className={`text-[10px] font-semibold ${goal.color}`}>{goal.label}</span>
        </div>
        <span className="text-[10px] text-slate-500">{goal.desc}</span>
      </div>

      {call.notes && (
        <div className="mt-3 bg-slate-800/30 rounded-lg p-3">
          <p className="text-xs text-slate-400 leading-relaxed">{call.notes}</p>
        </div>
      )}
    </Card>
  )
}

// ─── Compact Card ────────────────────────────────────────────────────

function CallCardCompact({ call, dayNames, t }) {
  const GOAL_LABELS = {
    free_recall: { label: t('calls.freeRecall'), color: 'text-violet-400' },
    cued_recall: { label: t('calls.cuedRecall'), color: 'text-blue-400' },
    emotional_engagement: { label: t('calls.emotionalEngagement'), color: 'text-rose-400' },
  }

  const catColor = CATEGORY_COLORS[call.planned_category] || 'text-slate-400'
  const goal = GOAL_LABELS[call.conversation_goal] || GOAL_LABELS.free_recall
  const callDate = new Date(call.date + 'T00:00:00')
  const dayName = dayNames[callDate.getDay()]?.slice(0, 3)

  return (
    <div className="flex items-center gap-3 px-4 py-2.5 rounded-lg bg-slate-800/20 hover:bg-slate-800/40 transition-colors">
      <div className="w-8 text-center">
        <div className="text-[10px] text-slate-500">{dayName}</div>
        <div className="text-sm font-semibold text-slate-300">{call.date.split('-')[2]}</div>
      </div>
      <div className="w-px h-6 bg-slate-800" />
      <span className="text-xs text-slate-500 w-12">{call.time}</span>
      <span className={`text-xs capitalize w-16 ${catColor}`}>{call.planned_category}</span>
      <span className="text-xs text-slate-300 flex-1 truncate">{call.planned_topic}</span>
      <span className={`text-[10px] ${goal.color}`}>{goal.label}</span>
    </div>
  )
}
