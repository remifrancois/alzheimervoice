import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, Badge, Button, Icon, EmptyState, api, useT, sanitizeText, sanitizeName, createRateLimiter } from '@azh/shared-ui'

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

const CATEGORIES = ['family', 'career', 'childhood', 'hobby', 'travel', 'military', 'health', 'daily', 'community', 'pet']

export default function MemoriesPage() {
  const { t } = useT()
  const [patients, setPatients] = useState([])
  const [memories, setMemories] = useState([])
  const [selected, setSelected] = useState(null)
  const [filter, setFilter] = useState('all')
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

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
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
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
            action={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}><Icon name="plus" size={14} /> {t('memories.addFirstMemory')}</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map(memory => (
              <MemoryCard key={memory.id} memory={memory} t={t} weightBadge={WEIGHT_BADGE} />
            ))}
          </div>
        )}
      </div>

      {showModal && <AddMemoryModal onClose={() => setShowModal(false)} t={t} patientName={selected?.first_name} />}
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

const memoryFormLimiter = createRateLimiter(5, 60000)

function AddMemoryModal({ onClose, t, patientName }) {
  const [form, setForm] = useState({
    title: '', description: '', category: 'family', year: '', emotionalWeight: 'medium', people: '',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!memoryFormLimiter.check()) {
      setError(t('validation.rateLimited') || 'Too many attempts. Please wait a moment.')
      return
    }

    const title = sanitizeText(form.title, 200)
    const description = sanitizeText(form.description, 2000)
    const people = form.people.split(',').map(p => sanitizeName(p)).filter(Boolean).join(', ')
    const year = Number(form.year)

    if (!title) {
      setError(t('validation.titleRequired') || 'A valid title is required.')
      return
    }
    if (!description) {
      setError(t('validation.descRequired') || 'A valid description is required.')
      return
    }
    if (form.year && (year < 1920 || year > 2026)) {
      setError(t('validation.yearRange') || 'Year must be between 1920 and 2026.')
      return
    }

    setForm({ ...form, title, description, people })
    setSubmitted(true)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 sticky top-0 bg-slate-900 z-10">
          <div>
            <h2 className="text-lg font-bold text-white">{t('addMemory.title')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('addMemory.subtitle', { name: patientName || '' })}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">
            <Icon name="x" size={20} />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-3">
              <Icon name="check-circle" size={24} className="text-emerald-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-1">{t('addMemory.success')}</h3>
            <p className="text-sm text-slate-400 mb-4">{t('addMemory.successDesc')}</p>
            <Button variant="primary" size="sm" onClick={onClose}>{t('addMemory.close')}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <Field label={t('addMemory.memoryTitle')} required>
              <input value={form.title} onChange={set('title')} required className="input-field" placeholder={t('addMemory.titlePlaceholder')} />
            </Field>

            <Field label={t('addMemory.description')} required>
              <textarea value={form.description} onChange={set('description')} required rows={3} className="input-field resize-none" placeholder={t('addMemory.descPlaceholder')} />
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label={t('addMemory.category')}>
                <select value={form.category} onChange={set('category')} className="input-field">
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{t(`memories.${cat}`) || cat}</option>
                  ))}
                </select>
              </Field>
              <Field label={t('addMemory.year')}>
                <input type="number" value={form.year} onChange={set('year')} min="1920" max="2026" className="input-field" placeholder="1985" />
              </Field>
            </div>

            <Field label={t('addMemory.emotionalWeight')}>
              <div className="flex gap-2">
                {['high', 'medium', 'low'].map(w => (
                  <button
                    key={w}
                    type="button"
                    onClick={() => setForm({ ...form, emotionalWeight: w })}
                    className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition-all ${
                      form.emotionalWeight === w
                        ? w === 'high' ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                          : w === 'medium' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          : 'bg-slate-700/50 text-slate-300 border-slate-600'
                        : 'bg-slate-800/30 text-slate-500 border-slate-700/50 hover:text-slate-300'
                    }`}
                  >
                    {w === 'high' ? t('memories.coreMemory') : w === 'medium' ? t('memories.important') : t('memories.routine')}
                  </button>
                ))}
              </div>
            </Field>

            <Field label={t('addMemory.people')}>
              <input value={form.people} onChange={set('people')} className="input-field" placeholder={t('addMemory.peoplePlaceholder')} />
            </Field>

            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400">
                <Icon name="heart" size={12} className="inline mr-1 text-rose-400" />
                {t('addMemory.hint')}
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                <p className="text-xs text-rose-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>{t('addMemory.cancel')}</Button>
              <Button variant="primary" size="sm" type="submit">
                <Icon name="plus" size={14} />
                {t('addMemory.submit')}
              </Button>
            </div>
          </form>
        )}
      </div>

      <style>{`
        .input-field {
          width: 100%;
          background: rgb(15 23 42 / 0.5);
          border: 1px solid rgb(51 65 85);
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.8125rem;
          color: white;
          outline: none;
          transition: border-color 0.15s;
        }
        .input-field:focus {
          border-color: rgb(139 92 246);
        }
        .input-field::placeholder {
          color: rgb(71 85 105);
        }
      `}</style>
    </div>
  )
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-slate-300">
        {label}{required && <span className="text-rose-400 ml-0.5">*</span>}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  )
}
