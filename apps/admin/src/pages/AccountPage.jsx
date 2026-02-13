import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { useAuth } from '@azh/shared-ui'

export default function AccountPage() {
  const { currentUser } = useAuth()

  return (
    <>
      <Topbar title="Account" subtitle="Your admin account settings" />
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader title="Profile" subtitle="Your admin account details" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
              <div className="text-xs text-slate-400 mb-1">Name</div>
              <div className="text-sm text-white">{currentUser?.name || '—'}</div>
            </div>
            <div className="rounded-lg border border-slate-800 p-4 bg-slate-800/20">
              <div className="text-xs text-slate-400 mb-1">Role</div>
              <div className="text-sm text-white">{currentUser?.role || '—'}</div>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
