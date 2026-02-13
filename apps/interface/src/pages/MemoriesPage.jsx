import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, Badge, Button, Icon, EmptyState, api, useT } from '@azh/shared-ui'

const CATEGORY_STYLES = {
  family:    { color: 'text-rose-400',    bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    icon: 'users' },
  career:    { color: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    icon: 'building' },
  childhood: { color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   icon: 'key' },
  hobby:     { color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: 'activity' },
  travel:    { color: 'text-cyan-400',    bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    icon: 'grid' },
  military:  { color: 'text-slate-300',   bg: 'bg-slate-500/10',   border: 'border-slate-500/20',   icon: 'shield' },
  health:    { color: 'text-green-400',   bg: 'bg-green-500/10',   border: 'border-green-500/20',   icon: 'activity' },
  daily:     { color: 'text-violet-400',  bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  icon: 'settings' },
  community: { color: 'text-indigo-400',  bg: 'bg-indigo-500/10',  border: 'border-indigo-500/20',  icon: 'users' },
  pet:       { color: 'text-orange-400',  bg: 'bg-orange-500/10',  border: 'border-orange-500/20',  icon: 'activity' },
}

export default function MemoriesPage() {
  const { t } = useT()
  const [patients, setPatients] = useState([])
  const [memories, setMemories] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getPatients().then(data => {
      const valid = data.filter(p => p.first_name)
      setPatients(valid)
      if (valid.length > 0) {
        setSelected(valid[0])
        api.getMemories(valid[0].patient_id).then(setMemories)
      }
    }).finally(() => setLoading(false))
  }, [])

  function switchPatient(patient) {
    if (patient.patient_id === selected?.patient_id) return
    setSelected(patient)
    setMemories([])
    api.getMemories(patient.patient_id).then(setMemories)
  }

  const categories = ['all', ...new Set(memories.map(m => m.category))]
  const filtered = filter === 'all' ? memories : memories.filter(m => m.category === filter)

  const stats = {
    total: memories.length,
    high: memories.filter(m => m.emotional_weight === 'high').length,
    categories: new Set(memories.map(m => m.category)).size,
  }

  const WEIGHT_BADGE = {
    high:   { variant: 'danger',  label: t('memories.coreMemory') },
    medium: { variant: 'warning', label: t('memories.important') },
    low:    { variant: 'default', label: t('memories.routine') },
  }

  return (
    <>
      <Topbar title={t('memories.title')} subtitle={selected ? t('memories.subtitle', { name: selected.first_name }) : t('memories.loading')} />

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

        {/* Stats bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-slate-400">
            <span>{t('memories.stats', { count: stats.total })}</span>
            <span className="text-slate-600">|</span>
            <span className="text-rose-400">{t('memories.coreMemories', { count: stats.high })}</span>
            <span className="text-slate-600">|</span>
            <span>{t('memories.categories', { count: stats.categories })}</span>
          </div>
          <Button variant="primary" size="sm">
            <Icon name="plus" size={14} />
            {t('memories.addMemory')}
          </Button>
        </div>

        {/* Category filter */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all capitalize ${
                filter === cat
                  ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                  : 'text-slate-500 hover:text-slate-300 bg-slate-800/50 border border-transparent'
              }`}
            >
              {cat === 'all' ? t('memories.all') : (t(`memories.${cat}`) || cat)}
            </button>
          ))}
        </div>

        {/* Memories grid */}
        {loading ? (
          <div className="text-sm text-slate-500 py-8 text-center">{t('memories.loading')}</div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="brain"
            title={t('memories.noMemories')}
            description={t('memories.noMemoriesDesc')}
            action={<Button variant="primary" size="sm"><Icon name="plus" size={14} /> {t('memories.addFirstMemory')}</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(memory => (
              <MemoryCard key={memory.id} memory={memory} t={t} weightBadge={WEIGHT_BADGE} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function MemoryCard({ memory, t, weightBadge }) {
  const [expanded, setExpanded] = useState(false)
  const style = CATEGORY_STYLES[memory.category] || CATEGORY_STYLES.daily
  const weight = weightBadge[memory.emotional_weight] || weightBadge.low

  return (
    <Card className="hover:border-slate-700 transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-7 h-7 rounded-lg ${style.bg} ${style.border} border flex items-center justify-center`}>
            <Icon name={style.icon} size={14} className={style.color} />
          </div>
          <div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.color}`}>
              {t(`memories.${memory.category}`) || memory.category}
            </span>
            {memory.year && (
              <span className="text-[10px] text-slate-600 ml-2">{memory.year}</span>
            )}
          </div>
        </div>
        <Badge variant={weight.variant}>{weight.label}</Badge>
      </div>

      <h3 className="text-sm font-semibold text-slate-200 mb-1.5">{memory.title}</h3>

      <p className={`text-xs text-slate-400 leading-relaxed ${expanded ? '' : 'line-clamp-3'}`}>
        {memory.description}
      </p>

      {memory.description.length > 120 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-[10px] text-violet-400 hover:text-violet-300 mt-1"
        >
          {expanded ? t('memories.showLess') : t('memories.readMore')}
        </button>
      )}

      {memory.people?.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-800">
          {memory.people.map((person, i) => (
            <span key={i} className="text-[10px] bg-slate-800/50 text-slate-400 px-1.5 py-0.5 rounded">
              {person}
            </span>
          ))}
        </div>
      )}
    </Card>
  )
}
