import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { Button } from '@azh/shared-ui'
import { Badge } from '@azh/shared-ui'
import { Stat, StatGrid } from '@azh/shared-ui'

const MOCK_CLINICIANS = [
  { id: 'clin-1', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', specialty: 'Neuropsychology', license: 'FR-NPS-2018-4421', licenseExpiry: '2027-06-15', status: 'active', patients: 8, avgResponseTime: '2.4h', reportReviewRate: 98, credentialVerified: true },
  { id: 'clin-2', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', specialty: 'Geriatric Psychiatry', license: 'FR-GPS-2016-3318', licenseExpiry: '2026-12-01', status: 'active', patients: 6, avgResponseTime: '3.1h', reportReviewRate: 95, credentialVerified: true },
  { id: 'clin-3', name: 'Dr. Ahmed Benali', email: 'ahmed@hospital.fr', specialty: 'Neurology', license: 'FR-NEU-2020-5567', licenseExpiry: '2027-03-22', status: 'suspended', patients: 0, avgResponseTime: '—', reportReviewRate: 72, credentialVerified: true },
  { id: 'clin-4', name: 'Dr. Emily Watson', email: 'emily@london-mc.uk', specialty: 'Clinical Psychology', license: 'UK-CPS-2019-8834', licenseExpiry: '2026-09-30', status: 'active', patients: 5, avgResponseTime: '1.8h', reportReviewRate: 100, credentialVerified: false },
]

const MOCK_ASSIGNMENTS = [
  { patient: 'Marie Dubois', patientId: 'p-marie-4f2a', clinician: 'Dr. Remi Francois', org: 'CHU Bordeaux', since: '2025-08-01', lastReview: '2026-02-10', status: 'active', outcome: 'declining' },
  { patient: 'Jean Moreau', patientId: 'p-jean-9b1c', clinician: 'Dr. Sophie Martin', org: 'Clinique Montpellier', since: '2025-09-15', lastReview: '2026-02-08', status: 'active', outcome: 'stable' },
  { patient: 'Helen Chambers', patientId: 'p-helen-6c2e', clinician: 'Dr. Emily Watson', org: 'London Memory Clinic', since: '2025-11-01', lastReview: '2026-02-09', status: 'active', outcome: 'stable' },
  { patient: 'Pierre Laurent', patientId: 'p-pierre-3a7d', clinician: 'Dr. Remi Francois', org: 'CHU Bordeaux', since: '2025-10-20', lastReview: '2026-02-07', status: 'active', outcome: 'improving' },
  { patient: 'Robert Williams', patientId: 'p-robert-8d4f', clinician: 'Dr. Emily Watson', org: 'London Memory Clinic', since: '2025-12-01', lastReview: '2026-02-10', status: 'active', outcome: 'stable' },
  { patient: 'Lucette Bernard', patientId: 'p-lucette-1e5b', clinician: 'Dr. Sophie Martin', org: 'EHPAD Les Mimosas', since: '2026-01-10', lastReview: '2026-02-05', status: 'active', outcome: 'declining' },
]

const OUTCOME_VARIANTS = { stable: 'success', declining: 'danger', improving: 'brand' }

const QUALITY_METRICS = [
  { metric: 'Avg Alert Response Time', target: '< 4h', actual: '2.4h', status: 'met' },
  { metric: 'Report Review Rate', target: '> 95%', actual: '91.3%', status: 'warning' },
  { metric: 'Weekly Report Turnaround', target: '< 48h', actual: '32h', status: 'met' },
  { metric: 'RED Alert Acknowledgment', target: '< 1h', actual: '0.8h', status: 'met' },
  { metric: 'ORANGE Alert Acknowledgment', target: '< 4h', actual: '3.2h', status: 'met' },
  { metric: 'Patient Re-assessment Rate', target: '100% / quarter', actual: '94%', status: 'warning' },
  { metric: 'Inter-rater Reliability', target: '> 0.85 kappa', actual: '0.91', status: 'met' },
  { metric: 'Family Communication Rate', target: '> 90%', actual: '96%', status: 'met' },
]

export default function ClinicalPage() {
  const [tab, setTab] = useState('clinicians')
  const totalPatients = MOCK_ASSIGNMENTS.filter(a => a.status === 'active').length
  const avgResponse = '2.4h'
  const credentialAlerts = MOCK_CLINICIANS.filter(c => !c.credentialVerified || new Date(c.licenseExpiry) < new Date('2026-12-31')).length

  return (
    <>
      <Topbar title="Clinical Governance" subtitle="Clinician credentialing, patient assignments, and quality metrics" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Active Clinicians" value={MOCK_CLINICIANS.filter(c => c.status === 'active').length} />
          <Stat label="Assigned Patients" value={totalPatients} />
          <Stat label="Avg Response Time" value={avgResponse} />
          <Stat label="Credential Alerts" value={credentialAlerts} />
        </StatGrid>

        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { key: 'clinicians', label: 'Clinicians' },
            { key: 'assignments', label: 'Patient Assignments' },
            { key: 'quality', label: 'Quality Metrics' },
          ].map(t => (
            <Button key={t.key} size="sm" variant={tab === t.key ? 'primary' : 'ghost'} onClick={() => setTab(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>

        {/* Clinicians Tab */}
        {tab === 'clinicians' && (
          <Card>
            <CardHeader title="Clinician Registry" subtitle="License verification, specialization tracking, and credential status" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Clinician</th>
                    <th className="text-left py-2.5 px-4">Specialty</th>
                    <th className="text-left py-2.5 px-4">License</th>
                    <th className="text-left py-2.5 px-4">Expiry</th>
                    <th className="text-left py-2.5 px-4">Verified</th>
                    <th className="text-right py-2.5 px-4">Patients</th>
                    <th className="text-left py-2.5 px-4">Status</th>
                    <th className="text-right py-2.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_CLINICIANS.map(c => {
                    const expiresWithinYear = new Date(c.licenseExpiry) < new Date('2026-12-31')
                    return (
                      <tr key={c.id} className={`border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors ${c.status === 'suspended' ? 'opacity-60' : ''}`}>
                        <td className="py-2.5 px-4">
                          <div className="text-sm text-slate-300">{c.name}</div>
                          <div className="text-[10px] text-slate-600">{c.email}</div>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-400">{c.specialty}</td>
                        <td className="py-2.5 px-4">
                          <code className="text-[10px] text-violet-400 font-mono">{c.license}</code>
                        </td>
                        <td className="py-2.5 px-4">
                          <span className={`text-xs ${expiresWithinYear ? 'text-amber-400' : 'text-slate-500'}`}>{c.licenseExpiry}</span>
                        </td>
                        <td className="py-2.5 px-4">
                          <Badge variant={c.credentialVerified ? 'success' : 'warning'}>
                            {c.credentialVerified ? 'Verified' : 'Pending'}
                          </Badge>
                        </td>
                        <td className="py-2.5 px-4 text-xs text-slate-400 text-right tabular-nums">{c.patients}</td>
                        <td className="py-2.5 px-4">
                          <Badge variant={c.status === 'active' ? 'success' : 'danger'}>{c.status}</Badge>
                        </td>
                        <td className="py-2.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm">View</Button>
                            {!c.credentialVerified && <Button variant="ghost" size="sm" className="text-amber-400">Verify</Button>}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {MOCK_CLINICIANS.some(c => !c.credentialVerified) && (
              <div className="mt-3 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
                <div className="text-xs text-amber-300/80">
                  <strong>Action Required:</strong> {MOCK_CLINICIANS.filter(c => !c.credentialVerified).length} clinician(s) have unverified credentials. Credential verification is required before they can access patient data in production.
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Assignments Tab */}
        {tab === 'assignments' && (
          <Card>
            <CardHeader title="Patient-Clinician Assignment Matrix" subtitle="Which clinician is responsible for which patients" action={
              <Button variant="primary" size="sm">New Assignment</Button>
            } />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Patient</th>
                    <th className="text-left py-2.5 px-4">Clinician</th>
                    <th className="text-left py-2.5 px-4">Organization</th>
                    <th className="text-left py-2.5 px-4">Since</th>
                    <th className="text-left py-2.5 px-4">Last Review</th>
                    <th className="text-left py-2.5 px-4">Outcome</th>
                    <th className="text-right py-2.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_ASSIGNMENTS.map(a => (
                    <tr key={a.patientId} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4">
                        <div className="text-xs text-slate-300">{a.patient}</div>
                        <code className="text-[10px] text-slate-600 font-mono">{a.patientId}</code>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-300">{a.clinician}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{a.org}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{a.since}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{a.lastReview}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={OUTCOME_VARIANTS[a.outcome]}>{a.outcome}</Badge>
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">Reassign</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Quality Metrics Tab */}
        {tab === 'quality' && (
          <Card>
            <CardHeader title="Clinical Quality Metrics" subtitle="SLA compliance, response times, and quality indicators" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Metric</th>
                    <th className="text-left py-2.5 px-4">Target</th>
                    <th className="text-left py-2.5 px-4">Actual</th>
                    <th className="text-left py-2.5 px-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {QUALITY_METRICS.map(q => (
                    <tr key={q.metric} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4 text-sm text-slate-300">{q.metric}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{q.target}</td>
                      <td className="py-2.5 px-4 text-sm text-white font-medium tabular-nums">{q.actual}</td>
                      <td className="py-2.5 px-4">
                        <Badge variant={q.status === 'met' ? 'success' : 'warning'}>
                          {q.status === 'met' ? 'SLA Met' : 'Below Target'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
                <div className="text-xs font-medium text-emerald-400 mb-1">Overall Quality Score</div>
                <div className="text-2xl font-bold text-white">{QUALITY_METRICS.filter(q => q.status === 'met').length}/{QUALITY_METRICS.length}</div>
                <div className="text-[10px] text-slate-500 mt-1">SLA targets met this period</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4">
                <div className="text-xs font-medium text-slate-400 mb-1">Next Peer Review</div>
                <div className="text-sm text-white">Scheduled: 2026-02-15</div>
                <div className="text-[10px] text-slate-500 mt-1">Random audit of 5 clinician interpretations for inter-rater reliability</div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
