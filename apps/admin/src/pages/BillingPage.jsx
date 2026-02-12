import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { Button } from '@azh/shared-ui'
import { Badge } from '@azh/shared-ui'
import { Stat, StatGrid } from '@azh/shared-ui'

const MRR_HISTORY = [
  { month: 'Sep', value: 4200 },
  { month: 'Oct', value: 6800 },
  { month: 'Nov', value: 9400 },
  { month: 'Dec', value: 11200 },
  { month: 'Jan', value: 13800 },
  { month: 'Feb', value: 15090 },
]

const MOCK_INVOICES = [
  { id: 'inv-001', org: 'CHU Bordeaux', amount: 8500, status: 'paid', date: '2026-02-01', due: '2026-02-15', plan: 'Enterprise', method: 'Wire Transfer' },
  { id: 'inv-002', org: 'Clinique Montpellier', amount: 2400, status: 'paid', date: '2026-02-01', due: '2026-02-15', plan: 'Professional', method: 'Credit Card' },
  { id: 'inv-003', org: 'EHPAD Les Mimosas', amount: 990, status: 'paid', date: '2026-02-01', due: '2026-02-15', plan: 'Standard', method: 'Credit Card' },
  { id: 'inv-004', org: 'London Memory Clinic', amount: 3200, status: 'pending', date: '2026-02-01', due: '2026-02-15', plan: 'Professional', method: 'Credit Card' },
  { id: 'inv-005', org: 'CHU Bordeaux', amount: 8500, status: 'paid', date: '2026-01-01', due: '2026-01-15', plan: 'Enterprise', method: 'Wire Transfer' },
  { id: 'inv-006', org: 'EHPAD Soleil d\'Or', amount: 990, status: 'overdue', date: '2026-01-01', due: '2026-01-15', plan: 'Standard', method: 'Credit Card' },
  { id: 'inv-007', org: 'Clinique Montpellier', amount: 2400, status: 'paid', date: '2026-01-01', due: '2026-01-15', plan: 'Professional', method: 'Credit Card' },
]

const USAGE_METRICS = [
  { org: 'CHU Bordeaux', sessions: 1240, patients: 312, apiCalls: 8450, storage: '2.4 GB', aiTokens: '4.2M' },
  { org: 'Clinique Montpellier', sessions: 430, patients: 87, apiCalls: 2890, storage: '890 MB', aiTokens: '1.4M' },
  { org: 'London Memory Clinic', sessions: 680, patients: 134, apiCalls: 4200, storage: '1.6 GB', aiTokens: '2.1M' },
  { org: 'EHPAD Les Mimosas', sessions: 210, patients: 45, apiCalls: 1340, storage: '420 MB', aiTokens: '680K' },
  { org: 'Hôpital Saint-Louis', sessions: 45, patients: 18, apiCalls: 320, storage: '85 MB', aiTokens: '120K' },
]

const AI_COSTS = [
  { type: 'CVF Feature Extraction', model: 'claude-opus-4-6', tokens: '2.8M', cost: 842, perSession: 0.68, routing: 'Always Opus (accuracy critical)' },
  { type: 'Weekly Clinical Report', model: 'claude-opus-4-6', tokens: '1.1M', cost: 330, perSession: 4.71, routing: 'Opus with 10K thinking budget' },
  { type: 'Differential Diagnosis', model: 'claude-opus-4-6', tokens: '620K', cost: 186, perSession: 12.40, routing: 'Opus — deep analysis layer' },
  { type: 'Family Narrative', model: 'claude-sonnet-4-5-20250929', tokens: '340K', cost: 34, perSession: 0.49, routing: 'Sonnet for cost efficiency' },
  { type: 'Alert Classification', model: 'claude-haiku-4-5-20251001', tokens: '180K', cost: 5, perSession: 0.04, routing: 'Haiku for speed + low cost' },
  { type: 'Memory Recall Scoring', model: 'claude-sonnet-4-5-20250929', tokens: '220K', cost: 22, perSession: 0.31, routing: 'Sonnet — balance accuracy/cost' },
]

const INVOICE_VARIANTS = { paid: 'success', pending: 'warning', overdue: 'danger' }

export default function BillingPage() {
  const [tab, setTab] = useState('revenue')
  const currentMrr = MRR_HISTORY[MRR_HISTORY.length - 1].value
  const arr = currentMrr * 12
  const totalAiCost = AI_COSTS.reduce((s, c) => s + c.cost, 0)
  const pendingAmount = MOCK_INVOICES.filter(i => i.status === 'pending' || i.status === 'overdue').reduce((s, i) => s + i.amount, 0)
  const maxMrr = Math.max(...MRR_HISTORY.map(m => m.value))

  return (
    <>
      <Topbar title="Billing & Revenue" subtitle="Financial overview, invoicing, usage tracking, and AI cost allocation" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="MRR" value={`€${currentMrr.toLocaleString()}`} />
          <Stat label="ARR" value={`€${arr.toLocaleString()}`} />
          <Stat label="AI Cost (MTD)" value={`€${totalAiCost.toLocaleString()}`} />
          <Stat label="Outstanding" value={`€${pendingAmount.toLocaleString()}`} />
        </StatGrid>

        {/* Tabs */}
        <div className="flex gap-1">
          {[
            { key: 'revenue', label: 'Revenue' },
            { key: 'invoices', label: 'Invoices' },
            { key: 'usage', label: 'Usage Metrics' },
            { key: 'ai-costs', label: 'AI Cost Breakdown' },
          ].map(t => (
            <Button key={t.key} size="sm" variant={tab === t.key ? 'primary' : 'ghost'} onClick={() => setTab(t.key)}>
              {t.label}
            </Button>
          ))}
        </div>

        {/* Revenue Tab */}
        {tab === 'revenue' && (
          <Card>
            <CardHeader title="MRR Growth" subtitle="Monthly recurring revenue trend over the last 6 months" />
            <div className="flex items-end gap-3 h-40 px-2">
              {MRR_HISTORY.map(m => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[10px] text-slate-400 tabular-nums">€{m.value.toLocaleString()}</span>
                  <div className="w-full bg-violet-500/80 rounded-t" style={{ height: `${(m.value / maxMrr) * 100}%` }} />
                  <span className="text-[10px] text-slate-500">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4">
                <div className="text-xs text-slate-400">Churn Rate</div>
                <div className="text-lg font-semibold text-white mt-1">2.1%</div>
                <div className="text-[10px] text-emerald-400">-0.3% vs last month</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4">
                <div className="text-xs text-slate-400">LTV</div>
                <div className="text-lg font-semibold text-white mt-1">€18,400</div>
                <div className="text-[10px] text-slate-500">Avg customer lifetime value</div>
              </div>
              <div className="rounded-lg border border-slate-800 bg-slate-800/20 p-4">
                <div className="text-xs text-slate-400">Net Revenue Retention</div>
                <div className="text-lg font-semibold text-white mt-1">118%</div>
                <div className="text-[10px] text-emerald-400">Expansion revenue strong</div>
              </div>
            </div>
          </Card>
        )}

        {/* Invoices Tab */}
        {tab === 'invoices' && (
          <Card>
            <CardHeader title="Invoice History" subtitle="Per-organization invoices and payment status" action={
              <Button variant="default" size="sm">Export All</Button>
            } />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Invoice</th>
                    <th className="text-left py-2.5 px-4">Organization</th>
                    <th className="text-left py-2.5 px-4">Plan</th>
                    <th className="text-right py-2.5 px-4">Amount</th>
                    <th className="text-left py-2.5 px-4">Date</th>
                    <th className="text-left py-2.5 px-4">Payment</th>
                    <th className="text-left py-2.5 px-4">Status</th>
                    <th className="text-right py-2.5 px-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INVOICES.map(inv => (
                    <tr key={inv.id} className={`border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors ${inv.status === 'overdue' ? 'bg-red-500/5' : ''}`}>
                      <td className="py-2.5 px-4">
                        <code className="text-[10px] text-violet-400 font-mono">{inv.id}</code>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-300">{inv.org}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{inv.plan}</td>
                      <td className="py-2.5 px-4 text-sm text-white text-right tabular-nums font-medium">€{inv.amount.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{inv.date}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-500">{inv.method}</td>
                      <td className="py-2.5 px-4"><Badge variant={INVOICE_VARIANTS[inv.status]}>{inv.status}</Badge></td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm">PDF</Button>
                          {inv.status === 'overdue' && <Button variant="ghost" size="sm" className="text-red-400">Send Reminder</Button>}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {MOCK_INVOICES.some(i => i.status === 'overdue') && (
              <div className="mt-3 p-3 bg-red-500/5 border border-red-500/20 rounded-lg">
                <div className="text-xs text-red-300/80">
                  <strong>Dunning Alert:</strong> {MOCK_INVOICES.filter(i => i.status === 'overdue').length} invoice(s) overdue. Grace period expires in 15 days — account suspension will be triggered automatically.
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Usage Metrics Tab */}
        {tab === 'usage' && (
          <Card>
            <CardHeader title="Usage by Organization" subtitle="Session counts, API calls, storage, and AI token consumption per org" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Organization</th>
                    <th className="text-right py-2.5 px-4">Sessions</th>
                    <th className="text-right py-2.5 px-4">Patients</th>
                    <th className="text-right py-2.5 px-4">API Calls</th>
                    <th className="text-right py-2.5 px-4">Storage</th>
                    <th className="text-right py-2.5 px-4">AI Tokens</th>
                  </tr>
                </thead>
                <tbody>
                  {USAGE_METRICS.map(u => (
                    <tr key={u.org} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4 text-sm text-slate-300">{u.org}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-400 text-right tabular-nums">{u.sessions.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-400 text-right tabular-nums">{u.patients}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-400 text-right tabular-nums">{u.apiCalls.toLocaleString()}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-400 text-right">{u.storage}</td>
                      <td className="py-2.5 px-4 text-xs text-violet-400 text-right">{u.aiTokens}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* AI Cost Breakdown Tab */}
        {tab === 'ai-costs' && (
          <Card>
            <CardHeader title="AI Cost Allocation" subtitle="Claude API token costs broken down by analysis type, model, and routing strategy" />
            <div className="border border-slate-800 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-800/50 text-xs text-slate-500 font-medium">
                    <th className="text-left py-2.5 px-4">Analysis Type</th>
                    <th className="text-left py-2.5 px-4">Model</th>
                    <th className="text-right py-2.5 px-4">Tokens (MTD)</th>
                    <th className="text-right py-2.5 px-4">Cost (MTD)</th>
                    <th className="text-right py-2.5 px-4">Per Session</th>
                    <th className="text-left py-2.5 px-4">Routing Strategy</th>
                  </tr>
                </thead>
                <tbody>
                  {AI_COSTS.map(c => (
                    <tr key={c.type} className="border-t border-slate-800/50 hover:bg-slate-800/20 transition-colors">
                      <td className="py-2.5 px-4 text-sm text-slate-300">{c.type}</td>
                      <td className="py-2.5 px-4">
                        <code className="text-[10px] text-violet-400 font-mono">{c.model.split('-').slice(0, 2).join('-')}</code>
                      </td>
                      <td className="py-2.5 px-4 text-xs text-slate-400 text-right tabular-nums">{c.tokens}</td>
                      <td className="py-2.5 px-4 text-sm text-white text-right tabular-nums font-medium">€{c.cost}</td>
                      <td className="py-2.5 px-4 text-xs text-slate-400 text-right tabular-nums">€{c.perSession.toFixed(2)}</td>
                      <td className="py-2.5 px-4 text-[10px] text-slate-500">{c.routing}</td>
                    </tr>
                  ))}
                  <tr className="border-t-2 border-slate-700 bg-slate-800/30">
                    <td className="py-2.5 px-4 text-sm text-white font-medium">Total</td>
                    <td className="py-2.5 px-4" />
                    <td className="py-2.5 px-4 text-xs text-slate-300 text-right tabular-nums font-medium">5.26M</td>
                    <td className="py-2.5 px-4 text-sm text-white text-right tabular-nums font-bold">€{totalAiCost.toLocaleString()}</td>
                    <td className="py-2.5 px-4" />
                    <td className="py-2.5 px-4" />
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-3 p-3 bg-violet-500/5 border border-violet-500/20 rounded-lg">
              <div className="text-xs text-violet-300/80">
                <strong>Cost Optimization:</strong> AI costs represent {((totalAiCost / currentMrr) * 100).toFixed(1)}% of MRR. Haiku routing for alert classification saves ~€180/month vs Opus. Consider expanding Sonnet usage for family narratives.
              </div>
            </div>
          </Card>
        )}
      </div>
    </>
  )
}
