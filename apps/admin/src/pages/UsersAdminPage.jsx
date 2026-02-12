import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { Button } from '@azh/shared-ui'
import { Badge } from '@azh/shared-ui'
import { Icon } from '@azh/shared-ui'
import { Stat, StatGrid } from '@azh/shared-ui'
import { useAuth, ROLES } from '@azh/shared-ui'

const MOCK_USERS = [
  { id: 'u1', name: 'Super Admin', email: 'admin@memovoice.ai', role: 'superadmin', status: 'active', lastLogin: '2026-02-11T08:30:00Z', sessions: 42 },
  { id: 'u2', name: 'Dr. Remi Francois', email: 'remi@memovoice.ai', role: 'clinician', status: 'active', lastLogin: '2026-02-11T09:15:00Z', sessions: 156 },
  { id: 'u3', name: 'Dr. Sophie Martin', email: 'sophie@memovoice.ai', role: 'clinician', status: 'active', lastLogin: '2026-02-10T14:20:00Z', sessions: 89 },
  { id: 'u4', name: 'Pierre Dupont', email: 'pierre@famille.fr', role: 'family', status: 'active', lastLogin: '2026-02-11T07:00:00Z', sessions: 30 },
  { id: 'u5', name: 'Marie-Claire Petit', email: 'mc@famille.fr', role: 'family', status: 'invited', lastLogin: null, sessions: 0 },
  { id: 'u6', name: 'Jean Administrateur', email: 'jean@memovoice.ai', role: 'admin', status: 'active', lastLogin: '2026-02-09T11:00:00Z', sessions: 12 },
  { id: 'u7', name: 'Dr. Ahmed Benali', email: 'ahmed@hospital.fr', role: 'clinician', status: 'suspended', lastLogin: '2026-01-15T10:00:00Z', sessions: 5 },
]

export default function UsersAdminPage() {
  const { hasPermission } = useAuth()
  const [filter, setFilter] = useState('all')
  const [showModal, setShowModal] = useState(false)

  const filtered = filter === 'all' ? MOCK_USERS : MOCK_USERS.filter(u => u.role === filter)
  const activeCount = MOCK_USERS.filter(u => u.status === 'active').length
  const invitedCount = MOCK_USERS.filter(u => u.status === 'invited').length
  const suspendedCount = MOCK_USERS.filter(u => u.status === 'suspended').length

  return (
    <>
      <Topbar title="User Management" subtitle="Manage platform users and permissions" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Total Users" value={MOCK_USERS.length} />
          <Stat label="Active" value={activeCount} />
          <Stat label="Pending Invites" value={invitedCount} />
          <Stat label="Suspended" value={suspendedCount} />
        </StatGrid>

        <Card>
          <div className="flex items-center justify-between mb-4">
            <div className="flex gap-1">
              {['all', 'superadmin', 'admin', 'clinician', 'family'].map(f => (
                <Button key={f} size="sm" variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>
                  {f === 'all' ? 'All' : ROLES[f]?.label || f}
                </Button>
              ))}
            </div>
            {hasPermission('admin.users.create') && (
              <Button variant="primary" size="sm" onClick={() => setShowModal(true)}>
                <Icon name="plus" size={14} /> Invite User
              </Button>
            )}
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                  <th className="text-left py-2.5 px-4">User</th>
                  <th className="text-left py-2.5 px-4">Role</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                  <th className="text-left py-2.5 px-4">Last Login</th>
                  <th className="text-right py-2.5 px-4">Sessions</th>
                  <th className="text-right py-2.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <UserRow key={user.id} user={user} canDelete={hasPermission('admin.users.delete')} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-amber-400 text-sm shrink-0 mt-0.5">&#x26A0;</span>
              <div className="text-xs text-amber-300/80">
                <strong>Data Isolation Policy:</strong> Admin and Super Admin roles <em>cannot</em> access patient clinical data, CVF vectors, session transcripts, or family memories. This data is exclusively accessible to the patient's family members and assigned clinicians.
              </div>
            </div>
          </div>
        </Card>

        {showModal && <InviteModal onClose={() => setShowModal(false)} />}
      </div>
    </>
  )
}

function UserRow({ user, canDelete }) {
  const role = ROLES[user.role]
  const statusColors = {
    active: 'bg-emerald-400',
    invited: 'bg-amber-400',
    suspended: 'bg-red-400',
  }

  return (
    <tr className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-[10px] text-white font-semibold shrink-0">
            {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
          </div>
          <div className="min-w-0">
            <div className="text-sm text-slate-200 truncate">{user.name}</div>
            <div className="text-[10px] text-slate-500">{user.email}</div>
          </div>
        </div>
      </td>
      <td className="py-3 px-4">
        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium border ${role?.bg} ${role?.color} ${role?.border}`}>
          {role?.label}
        </span>
      </td>
      <td className="py-3 px-4">
        <div className="flex items-center gap-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${statusColors[user.status]}`} />
          <span className="text-xs text-slate-400 capitalize">{user.status}</span>
        </div>
      </td>
      <td className="py-3 px-4 text-xs text-slate-500">
        {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Never'}
      </td>
      <td className="py-3 px-4 text-xs text-slate-400 text-right tabular-nums">{user.sessions}</td>
      <td className="py-3 px-4 text-right">
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="sm">Edit</Button>
          {user.status === 'active' && <Button variant="ghost" size="sm">Suspend</Button>}
          {user.status === 'suspended' && <Button variant="ghost" size="sm">Reactivate</Button>}
          {canDelete && <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-300">Delete</Button>}
        </div>
      </td>
    </tr>
  )
}

function InviteModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <h3 className="text-lg font-semibold text-white mb-1">Invite User</h3>
        <p className="text-xs text-slate-500 mb-4">Send an invitation to join the MemoVoice platform.</p>

        <div className="space-y-3">
          <Field label="Email" type="email" placeholder="user@example.com" />
          <Field label="Full Name" type="text" placeholder="Dr. Jean Dupont" />
          <div>
            <label className="text-xs text-slate-400 mb-1 block">Role</label>
            <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-500/50">
              <option value="clinician">Clinician</option>
              <option value="family">Family Member</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-6">
          <Button variant="default" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={onClose}>Send Invite</Button>
        </div>
      </div>
    </div>
  )
}

function Field({ label, type, placeholder }) {
  return (
    <div>
      <label className="text-xs text-slate-400 mb-1 block">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
      />
    </div>
  )
}
