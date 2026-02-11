import Topbar from '../../components/layout/Topbar'
import { Card, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { Stat, StatGrid } from '../../components/ui/Stat'

const PLANS = [
  { id: 'free', name: 'Free', price: '0', patients: 1, sessions: 50, features: ['1 patient', '50 sessions/month', 'Basic CVF analysis', 'Email support'] },
  { id: 'pro', name: 'Pro', price: '49', patients: 10, sessions: 500, features: ['10 patients', '500 sessions/month', 'Full CVF + cascade detection', 'Weekly reports', 'Priority support'], popular: true },
  { id: 'clinical', name: 'Clinical', price: '199', patients: 50, sessions: 5000, features: ['50 patients', '5,000 sessions/month', 'Extended Thinking analysis', 'Custom thresholds', 'API access', 'Dedicated support'] },
  { id: 'enterprise', name: 'Enterprise', price: 'Custom', patients: -1, sessions: -1, features: ['Unlimited patients', 'Unlimited sessions', 'On-premise deployment', 'HIPAA BAA', 'Custom integrations', 'SLA guarantee'] },
]

const MOCK_SUBSCRIPTIONS = [
  { org: 'Clinique du Parc', plan: 'clinical', status: 'active', patients: 23, mrr: 199, nextBilling: '2026-03-01', since: '2025-10-15' },
  { org: 'Maison de Retraite Soleil', plan: 'pro', status: 'active', patients: 8, mrr: 49, nextBilling: '2026-03-01', since: '2025-12-01' },
  { org: 'Dr. Benali (solo)', plan: 'free', status: 'active', patients: 1, mrr: 0, nextBilling: null, since: '2026-01-20' },
  { org: 'EHPAD Les Oliviers', plan: 'clinical', status: 'trial', patients: 12, mrr: 0, nextBilling: '2026-02-28', since: '2026-02-01' },
]

export default function SubscriptionsPage() {
  const totalMRR = MOCK_SUBSCRIPTIONS.reduce((s, sub) => s + sub.mrr, 0)
  const totalPatients = MOCK_SUBSCRIPTIONS.reduce((s, sub) => s + sub.patients, 0)

  return (
    <>
      <Topbar title="Subscriptions" subtitle="Plan management and billing" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Monthly Recurring Revenue" value={`$${totalMRR}`} unit="MRR" />
          <Stat label="Active Subscriptions" value={MOCK_SUBSCRIPTIONS.filter(s => s.status === 'active').length} />
          <Stat label="Trial Accounts" value={MOCK_SUBSCRIPTIONS.filter(s => s.status === 'trial').length} />
          <Stat label="Total Patients Monitored" value={totalPatients} />
        </StatGrid>

        {/* Plans */}
        <Card>
          <CardHeader title="Available Plans" subtitle="Pricing tiers for organizations" />
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {PLANS.map(plan => (
              <div key={plan.id} className={`rounded-lg border p-4 relative ${plan.popular ? 'border-violet-500/50 bg-violet-500/5' : 'border-slate-800 bg-slate-800/20'}`}>
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <Badge variant="brand">Most Popular</Badge>
                  </div>
                )}
                <div className="text-sm font-semibold text-white">{plan.name}</div>
                <div className="flex items-baseline gap-1 mt-2">
                  {plan.price === 'Custom' ? (
                    <span className="text-lg font-bold text-slate-300">Custom</span>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-white">${plan.price}</span>
                      <span className="text-xs text-slate-500">/month</span>
                    </>
                  )}
                </div>
                <ul className="mt-3 space-y-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-1.5 text-xs text-slate-400">
                      <span className="text-emerald-400 shrink-0">&#10003;</span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Card>

        {/* Active subscriptions */}
        <Card>
          <CardHeader title="Active Subscriptions" subtitle="Current organization accounts" />
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                  <th className="text-left py-2.5 px-4">Organization</th>
                  <th className="text-left py-2.5 px-4">Plan</th>
                  <th className="text-left py-2.5 px-4">Status</th>
                  <th className="text-right py-2.5 px-4">Patients</th>
                  <th className="text-right py-2.5 px-4">MRR</th>
                  <th className="text-left py-2.5 px-4">Next Billing</th>
                  <th className="text-right py-2.5 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {MOCK_SUBSCRIPTIONS.map(sub => {
                  const statusStyles = { active: 'success', trial: 'warning', cancelled: 'danger' }
                  return (
                    <tr key={sub.org} className="border-t border-slate-800/50">
                      <td className="py-3 px-4 text-slate-200">{sub.org}</td>
                      <td className="py-3 px-4"><Badge variant="brand">{sub.plan}</Badge></td>
                      <td className="py-3 px-4"><Badge variant={statusStyles[sub.status]}>{sub.status}</Badge></td>
                      <td className="py-3 px-4 text-right text-slate-400 tabular-nums">{sub.patients}</td>
                      <td className="py-3 px-4 text-right text-slate-400 tabular-nums">${sub.mrr}</td>
                      <td className="py-3 px-4 text-xs text-slate-500">{sub.nextBilling || '-'}</td>
                      <td className="py-3 px-4 text-right"><Button variant="ghost" size="sm">Manage</Button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </>
  )
}
