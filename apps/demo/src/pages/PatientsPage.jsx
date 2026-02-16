import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import { Card, Button, AlertBadge, Badge, Icon, EmptyState, api, useT, sanitizeName, sanitizePhone, createRateLimiter } from '@azh/shared-ui'

export default function PatientsPage() {
  const { t, lang } = useT()
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    api.getPatients()
      .then(data => setPatients(data.filter(p => p.first_name)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar title={t('patients.title')} subtitle={t('patients.subtitle')} />

      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {t('patients.registered', { count: patients.length })}
          </div>
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
            <Icon name="plus" size={14} />
            {t('patients.addPatient')}
          </Button>
        </div>

        {loading ? (
          <div className="text-slate-500">{t('dashboard.loading')}</div>
        ) : patients.length === 0 ? (
          <EmptyState
            icon="users"
            title={t('patients.noPatients')}
            description={t('patients.noPatientsDesc')}
            action={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}><Icon name="plus" size={14} /> {t('patients.addPatient')}</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map(patient => (
              <PatientCard key={patient.patient_id} patient={patient} onClick={() => navigate('/')} t={t} lang={lang} />
            ))}
          </div>
        )}
      </div>

      {showModal && <AddFamilyMemberModal onClose={() => setShowModal(false)} t={t} />}
    </>
  )
}

function PatientCard({ patient, onClick, t, lang }) {
  const dateFmt = new Intl.DateTimeFormat(lang, { month: 'short', year: '2-digit' })

  return (
    <Card className="hover:border-slate-700 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white font-semibold shrink-0">
          {patient.first_name?.[0] || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">{patient.first_name}{patient.last_name ? ` ${patient.last_name}` : ''}</span>
            <AlertBadge level={patient.alert_level || 'green'} />
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {patient.age ? `${patient.age} ${t('patients.yearsOld')} · ` : ''}{patient.language === 'fr' ? t('dashboard.francophone') : t('dashboard.english')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <MiniStat label={t('patients.sessionsLabel')} value={patient.baseline_sessions || 0} />
        <MiniStat label={t('patients.baselineLabel')} value={patient.baseline_established ? t('patients.yes') : t('patients.no')} />
        <MiniStat label={t('patients.sinceLabel')} value={dateFmt.format(new Date(patient.created_at))} />
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
        <Badge variant={patient.baseline_established ? 'success' : 'warning'}>
          {patient.baseline_established ? t('patients.monitoringStatus') : t('patients.calibratingStatus')}
        </Badge>
        {patient.call_schedule && (
          <Badge>
            <Icon name="phone" size={10} className="mr-1" />
            {patient.call_schedule.time}
          </Badge>
        )}
      </div>
    </Card>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="text-sm font-semibold text-slate-200">{value}</div>
    </div>
  )
}

const patientFormLimiter = createRateLimiter(5, 60000)

function AddFamilyMemberModal({ onClose, t }) {
  const [form, setForm] = useState({
    firstName: '', lastName: '', age: '', language: 'en', phone: '', callTime: '09:00',
  })
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!patientFormLimiter.check()) {
      setError(t('validation.rateLimited') || 'Too many attempts. Please wait a moment.')
      return
    }

    const firstName = sanitizeName(form.firstName)
    const lastName = sanitizeName(form.lastName)
    const phone = sanitizePhone(form.phone)
    const age = Number(form.age)

    if (!firstName || !lastName) {
      setError(t('validation.nameRequired') || 'Valid first and last name are required.')
      return
    }
    if (form.age && (age < 50 || age > 110)) {
      setError(t('validation.ageRange') || 'Age must be between 50 and 110.')
      return
    }

    setForm({ ...form, firstName, lastName, phone })
    setSubmitted(true)
  }

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div>
            <h2 className="text-lg font-bold text-white">{t('addMember.title')}</h2>
            <p className="text-xs text-slate-400 mt-0.5">{t('addMember.subtitle')}</p>
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
            <h3 className="text-base font-semibold text-white mb-1">{t('addMember.success')}</h3>
            <p className="text-sm text-slate-400 mb-4">{t('addMember.successDesc', { name: form.firstName })}</p>
            <Button variant="primary" size="sm" onClick={onClose}>{t('addMember.close')}</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('addMember.firstName')} required>
                <input value={form.firstName} onChange={set('firstName')} required className="input-field" placeholder="Dorothy" />
              </Field>
              <Field label={t('addMember.lastName')} required>
                <input value={form.lastName} onChange={set('lastName')} required className="input-field" placeholder="Mitchell" />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t('addMember.age')}>
                <input type="number" value={form.age} onChange={set('age')} min="50" max="110" className="input-field" placeholder="72" />
              </Field>
              <Field label={t('addMember.language')}>
                <select value={form.language} onChange={set('language')} className="input-field">
                  <option value="en">{t('dashboard.english')}</option>
                  <option value="fr">{t('dashboard.francophone')}</option>
                </select>
              </Field>
            </div>
            <Field label={t('addMember.phone')}>
              <input type="tel" value={form.phone} onChange={set('phone')} className="input-field" placeholder="+1 617 555 0142" />
            </Field>
            <Field label={t('addMember.callTime')}>
              <input type="time" value={form.callTime} onChange={set('callTime')} className="input-field" />
            </Field>

            <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
              <p className="text-xs text-slate-400">
                <Icon name="brain" size={12} className="inline mr-1 text-violet-400" />
                {t('addMember.hint')}
              </p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/30 rounded-lg p-3">
                <p className="text-xs text-rose-400">{error}</p>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={onClose}>{t('addMember.cancel')}</Button>
              <Button variant="primary" size="sm" type="submit">
                <Icon name="plus" size={14} />
                {t('addMember.submit')}
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
