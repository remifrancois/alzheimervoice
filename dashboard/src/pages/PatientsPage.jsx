import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Topbar from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { AlertBadge, Badge } from '../components/ui/Badge'
import { Icon } from '../components/ui/Icon'
import { EmptyState } from '../components/ui/EmptyState'
import { api } from '../lib/api'

export default function PatientsPage() {
  const [patients, setPatients] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    api.getPatients()
      .then(data => setPatients(data.filter(p => p.first_name)))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <Topbar title="Patients" subtitle="Manage patient profiles and monitoring" />

      <div className="p-6 space-y-6">
        {/* Actions bar */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {patients.length} patient{patients.length !== 1 ? 's' : ''} registered
          </div>
          <Button variant="primary" size="sm">
            <Icon name="plus" size={14} />
            Add Patient
          </Button>
        </div>

        {loading ? (
          <div className="text-slate-500">Loading...</div>
        ) : patients.length === 0 ? (
          <EmptyState
            icon="users"
            title="No patients yet"
            description="Add your first patient to start cognitive monitoring."
            action={<Button variant="primary" size="sm"><Icon name="plus" size={14} /> Add Patient</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {patients.map(patient => (
              <PatientCard key={patient.patient_id} patient={patient} onClick={() => navigate('/')} />
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function PatientCard({ patient, onClick }) {
  return (
    <Card className="hover:border-slate-700 transition-colors cursor-pointer" onClick={onClick}>
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-blue-500 flex items-center justify-center text-white font-semibold shrink-0">
          {patient.first_name?.[0] || '?'}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-white truncate">{patient.first_name}</span>
            <AlertBadge level={patient.alert_level || 'green'} />
          </div>
          <div className="text-xs text-slate-500 mt-0.5">
            {patient.language === 'fr' ? 'Francophone' : 'English'}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mt-4">
        <MiniStat label="Sessions" value={patient.baseline_sessions || 0} />
        <MiniStat label="Baseline" value={patient.baseline_established ? 'Yes' : 'No'} />
        <MiniStat label="Since" value={new Date(patient.created_at).toLocaleDateString('fr-FR', { month: 'short', year: '2-digit' })} />
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-slate-800">
        <Badge variant={patient.baseline_established ? 'success' : 'warning'}>
          {patient.baseline_established ? 'Monitoring' : 'Calibrating'}
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
