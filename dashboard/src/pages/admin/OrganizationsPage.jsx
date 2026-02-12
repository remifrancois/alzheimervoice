import { useState } from 'react'
import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Icon } from '../../components/ui/Icon'
import { Stat, StatGrid } from '../../components/ui/Stat'
import { useAuth } from '../../lib/auth'

const MOCK_ORGS = [
  { id: 'org-1', name: 'CHU Bordeaux', type: 'Hospital', parent: null, status: 'active', seats: 45, usedSeats: 38, patients: 312, plan: 'Enterprise', mrr: 8500, region: 'Nouvelle-Aquitaine' },
  { id: 'org-2', name: 'Neurologie Dept.', type: 'Department', parent: 'CHU Bordeaux', status: 'active', seats: 20, usedSeats: 18, patients: 156, plan: 'Enterprise', mrr: 0, region: 'Nouvelle-Aquitaine' },
  { id: 'org-3', name: 'Clinique Montpellier', type: 'Clinic', parent: null, status: 'active', seats: 12, usedSeats: 9, patients: 87, plan: 'Professional', mrr: 2400, region: 'Occitanie' },
  { id: 'org-4', name: 'EHPAD Les Mimosas', type: 'EHPAD', parent: null, status: 'active', seats: 8, usedSeats: 6, patients: 45, plan: 'Standard', mrr: 990, region: 'Provence-Alpes' },
  { id: 'org-5', name: 'London Memory Clinic', type: 'Clinic', parent: null, status: 'active', seats: 15, usedSeats: 11, patients: 134, plan: 'Professional', mrr: 3200, region: 'UK — London' },
  { id: 'org-6', name: 'EHPAD Soleil d\'Or', type: 'EHPAD', parent: null, status: 'suspended', seats: 5, usedSeats: 0, patients: 22, plan: 'Standard', mrr: 0, region: 'Bretagne' },
  { id: 'org-7', name: 'Hôpital Saint-Louis', type: 'Hospital', parent: null, status: 'trial', seats: 10, usedSeats: 3, patients: 18, plan: 'Trial', mrr: 0, region: 'Île-de-France' },
]

const STATUS_VARIANTS = { active: 'success', suspended: 'danger', trial: 'warning' }
const PLAN_VARIANTS = { Enterprise: 'brand', Professional: 'default', Standard: 'default', Trial: 'warning' }

export default function OrganizationsPage() {
  const { hasPermission } = useAuth()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = filter === 'all' ? MOCK_ORGS : MOCK_ORGS.filter(o => o.type === filter)
  const totalPatients = MOCK_ORGS.reduce((s, o) => s + o.patients, 0)
  const totalSeats = MOCK_ORGS.reduce((s, o) => s + o.seats, 0)
  const totalMrr = MOCK_ORGS.reduce((s, o) => s + o.mrr, 0)

  return (
    <>
      <Topbar title="Organizations" subtitle="Multi-tenant management and org hierarchy" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Organizations" value={MOCK_ORGS.length} />
          <Stat label="Total Patients" value={totalPatients} />
          <Stat label="Total Seats" value={totalSeats} />
          <Stat label="Combined MRR" value={`€${totalMrr.toLocaleString()}`} />
        </StatGrid>

        {/* Org Hierarchy */}
        <Card>
          <CardHeader title="Organization Hierarchy" subtitle="Parent/child relationships and tenant structure" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {MOCK_ORGS.filter(o => !o.parent).map(org => (
              <div key={org.id} className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon name="building" size={16} className="text-violet-400" />
                    <span className="text-sm font-medium text-white">{org.name}</span>
                  </div>
                  <Badge variant={STATUS_VARIANTS[org.status]}>{org.status}</Badge>
                </div>
                <div className="text-[10px] text-slate-500">{org.type} — {org.region}</div>
                <div className="flex items-center gap-4 mt-2 text-[10px] text-slate-400">
                  <span>{org.usedSeats}/{org.seats} seats</span>
                  <span>{org.patients} patients</span>
                  <Badge variant={PLAN_VARIANTS[org.plan]} size="sm">{org.plan}</Badge>
                </div>
                {/* Child orgs */}
                {MOCK_ORGS.filter(c => c.parent === org.name).map(child => (
                  <div key={child.id} className="mt-2 ml-4 pl-3 border-l border-slate-700 py-1">
                    <div className="text-xs text-slate-300">{child.name}</div>
                    <div className="text-[10px] text-slate-500">{child.usedSeats}/{child.seats} seats — {child.patients} patients</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </Card>

        {/* Org Table */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {['all', 'Hospital', 'Clinic', 'EHPAD', 'Department'].map(f => (
                <Button key={f} size="sm" variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : f}
                </Button>
              ))}
            </div>
            {hasPermission('admin.organizations.manage') && (
              <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                <Icon name="plus" size={14} /> New Organization
              </Button>
            )}
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                  <th className="text-left py-2.5 px-4">Organization</th>
                  <th className="text-left py-2.5 px-4">Type</th>
                  <th className="text-left py-2.5 px-4">Plan</th>
                  <th className="text-left py-2.5 px-4">Seats</th>
                  <th className="text-right py-2.5 px-4">Patients</th>
                  <th className="text-right py-2.5 px-4">MRR</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                  <th className="text-right py-2.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(org => (
                  <tr key={org.id} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                    <td className="py-3 px-4">
                      <div className="text-sm text-slate-200">{org.name}</div>
                      {org.parent && <div className="text-[10px] text-slate-600">↳ {org.parent}</div>}
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400">{org.type}</td>
                    <td className="py-3 px-4"><Badge variant={PLAN_VARIANTS[org.plan]}>{org.plan}</Badge></td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                          <div className="h-full bg-violet-500 rounded-full" style={{ width: `${(org.usedSeats / org.seats) * 100}%` }} />
                        </div>
                        <span className="text-xs text-slate-400 tabular-nums">{org.usedSeats}/{org.seats}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-xs text-slate-400 text-right tabular-nums">{org.patients}</td>
                    <td className="py-3 px-4 text-xs text-slate-400 text-right tabular-nums">{org.mrr > 0 ? `€${org.mrr}` : '—'}</td>
                    <td className="py-3 px-4"><Badge variant={STATUS_VARIANTS[org.status]}>{org.status}</Badge></td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">Edit</Button>
                        {org.status === 'active' && <Button variant="ghost" size="sm" className="text-red-400">Suspend</Button>}
                        {org.status === 'suspended' && <Button variant="ghost" size="sm">Reactivate</Button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Data Isolation Policy */}
        <Card>
          <CardHeader title="Data Isolation Policy" subtitle="Strict tenant separation ensures patients are only visible within their organization" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { title: 'Patient Data', desc: 'Patient records, CVF vectors, and sessions are scoped to the owning organization. Cross-org access is impossible.', icon: 'users' },
              { title: 'Admin Scope', desc: 'Org-level admins manage only their own org\'s users. Platform superadmins manage all orgs but cannot access patient data.', icon: 'shield' },
              { title: 'Audit Trail', desc: 'All cross-tenant operations are logged. Any escalated access triggers immediate alert to org admin and compliance team.', icon: 'clipboard' },
            ].map(p => (
              <div key={p.title} className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
                <div className="flex items-center gap-2 mb-2">
                  <Icon name={p.icon} size={16} className="text-violet-400" />
                  <span className="text-sm font-medium text-white">{p.title}</span>
                </div>
                <div className="text-[10px] text-slate-500">{p.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {showModal && <CreateOrgModal onClose={() => setShowModal(false)} />}
      </div>
    </>
  )
}

function CreateOrgModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-1">Create Organization</h3>
        <p className="text-xs text-slate-500 mb-4">Add a new tenant to the MemoVoice platform.</p>
        <div className="space-y-3">
          <Field label="Organization Name" type="text" placeholder="CHU Example" />
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Type</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="Hospital">Hospital</option>
              <option value="Clinic">Clinic</option>
              <option value="EHPAD">EHPAD</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Plan</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="Trial">Trial</option>
              <option value="Standard">Standard</option>
              <option value="Professional">Professional</option>
              <option value="Enterprise">Enterprise</option>
            </select>
          </div>
          <Field label="Max Seats" type="number" placeholder="10" />
          <Field label="Region" type="text" placeholder="Ile-de-France" />
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Create</Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input type={type} placeholder={placeholder} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
    </div>
  )
}
