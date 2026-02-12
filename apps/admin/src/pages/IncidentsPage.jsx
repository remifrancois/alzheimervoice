import { useState } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '@azh/shared-ui'
import { Button } from '@azh/shared-ui'
import { Badge } from '@azh/shared-ui'
import { Stat, StatGrid } from '@azh/shared-ui'

const SLA_CONFIG = {
  RED: { label: 'RED — Critical', response: '1 hour', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/30' },
  ORANGE: { label: 'ORANGE — Significant', response: '4 hours', color: 'text-orange-400', bg: 'bg-orange-500/10', border: 'border-orange-500/30' },
  YELLOW: { label: 'YELLOW — Notable', response: '24 hours', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
  SYSTEM: { label: 'SYSTEM — Infrastructure', response: '30 minutes', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
}

const MOCK_INCIDENTS = [
  {
    id: 'inc-001',
    title: 'RED Alert — Marie Dubois composite z-score -1.82',
    severity: 'RED',
    status: 'escalated',
    created: '2026-02-10T09:00:00Z',
    acknowledged: '2026-02-10T09:45:00Z',
    patient: 'Marie Dubois',
    org: 'CHU Bordeaux',
    escalation: [
      { role: 'Assigned Clinician', person: 'Dr. Remi Francois', notified: '09:00', acknowledged: '09:45', method: 'SMS + Email' },
      { role: 'Department Head', person: 'Prof. Marc Leroy', notified: '10:00', acknowledged: '10:15', method: 'SMS' },
    ],
    timeline: [
      { time: '09:00', event: 'RED alert triggered by CVF engine', type: 'system' },
      { time: '09:00', event: 'SMS + email sent to Dr. Remi Francois', type: 'notification' },
      { time: '09:45', event: 'Alert acknowledged by Dr. Remi Francois', type: 'ack' },
      { time: '10:00', event: 'Auto-escalated to Department Head (SLA: 1h)', type: 'escalation' },
      { time: '10:15', event: 'Acknowledged by Prof. Marc Leroy', type: 'ack' },
      { time: '11:30', event: 'Clinical review scheduled for 2026-02-11', type: 'action' },
    ],
    rca: null,
  },
  {
    id: 'inc-002',
    title: 'ORANGE Alert — Jean Moreau coherence decline 3 consecutive sessions',
    severity: 'ORANGE',
    status: 'acknowledged',
    created: '2026-02-09T14:30:00Z',
    acknowledged: '2026-02-09T16:20:00Z',
    patient: 'Jean Moreau',
    org: 'Clinique Montpellier',
    escalation: [
      { role: 'Assigned Clinician', person: 'Dr. Sophie Martin', notified: '14:30', acknowledged: '16:20', method: 'Email' },
    ],
    timeline: [
      { time: '14:30', event: 'ORANGE alert triggered — coherence domain z-score -1.4 for 3 sessions', type: 'system' },
      { time: '14:30', event: 'Email sent to Dr. Sophie Martin', type: 'notification' },
      { time: '16:20', event: 'Alert acknowledged by Dr. Sophie Martin', type: 'ack' },
      { time: '17:00', event: 'Note added: "Will review in weekly analysis, family notified"', type: 'action' },
    ],
    rca: null,
  },
  {
    id: 'inc-003',
    title: 'SYSTEM — Claude API latency spike (p99 > 30s)',
    severity: 'SYSTEM',
    status: 'resolved',
    created: '2026-02-08T03:15:00Z',
    acknowledged: '2026-02-08T03:22:00Z',
    patient: null,
    org: 'Platform',
    escalation: [
      { role: 'On-Call Engineer', person: 'System (auto-resolved)', notified: '03:15', acknowledged: '03:22', method: 'PagerDuty' },
    ],
    timeline: [
      { time: '03:15', event: 'API latency alert triggered — p99 response time 34s', type: 'system' },
      { time: '03:22', event: 'Auto-acknowledged — monitoring confirmed transient', type: 'ack' },
      { time: '03:45', event: 'Latency returned to normal (p99 < 5s)', type: 'action' },
      { time: '04:00', event: 'Incident auto-resolved', type: 'resolved' },
    ],
    rca: 'Anthropic API transient latency spike during model deployment. No patient impact — analyses queued and completed within 30m.',
  },
  {
    id: 'inc-004',
    title: 'YELLOW Alert — Lucette Bernard memory domain drift',
    severity: 'YELLOW',
    status: 'open',
    created: '2026-02-11T08:00:00Z',
    acknowledged: null,
    patient: 'Lucette Bernard',
    org: 'EHPAD Les Mimosas',
    escalation: [
      { role: 'Assigned Clinician', person: 'Dr. Sophie Martin', notified: '08:00', acknowledged: null, method: 'Email' },
    ],
    timeline: [
      { time: '08:00', event: 'YELLOW alert triggered — memory domain z-score -0.9', type: 'system' },
      { time: '08:00', event: 'Email sent to Dr. Sophie Martin', type: 'notification' },
    ],
    rca: null,
  },
  {
    id: 'inc-005',
    title: 'Security — Failed login attempts from unknown IP',
    severity: 'SYSTEM',
    status: 'resolved',
    created: '2026-02-10T17:05:00Z',
    acknowledged: '2026-02-10T17:10:00Z',
    patient: null,
    org: 'Platform',
    escalation: [
      { role: 'Security Team', person: 'Auto-handled', notified: '17:05', acknowledged: '17:10', method: 'Auto' },
    ],
    timeline: [
      { time: '17:05', event: '3 failed login attempts from IP 45.33.32.156', type: 'system' },
      { time: '17:05', event: 'Account auto-locked after 3 failures', type: 'action' },
      { time: '17:10', event: 'IP added to temporary blocklist (24h)', type: 'action' },
      { time: '17:10', event: 'Incident auto-resolved — no breach detected', type: 'resolved' },
    ],
    rca: 'Brute-force attempt from external IP. Auto-lockout triggered. No credentials compromised.',
  },
]

const STATUS_VARIANTS = { open: 'danger', acknowledged: 'warning', escalated: 'warning', resolved: 'success' }

export default function IncidentsPage() {
  const [expanded, setExpanded] = useState(null)
  const [filter, setFilter] = useState('all')

  const filtered = filter === 'all' ? MOCK_INCIDENTS : MOCK_INCIDENTS.filter(i => i.severity === filter)
  const openCount = MOCK_INCIDENTS.filter(i => i.status === 'open').length
  const escalatedCount = MOCK_INCIDENTS.filter(i => i.status === 'escalated').length
  const resolvedCount = MOCK_INCIDENTS.filter(i => i.status === 'resolved').length

  return (
    <>
      <Topbar title="Incidents & Escalation" subtitle="Clinical alert management, SLA tracking, and escalation chains" />

      <div className="p-6 space-y-6">
        <StatGrid cols={4}>
          <Stat label="Total Incidents" value={MOCK_INCIDENTS.length} />
          <Stat label="Open" value={openCount} />
          <Stat label="Escalated" value={escalatedCount} />
          <Stat label="Resolved" value={resolvedCount} />
        </StatGrid>

        {/* SLA Configuration */}
        <Card>
          <CardHeader title="SLA Response Targets" subtitle="Maximum time to acknowledge alerts by severity level" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(SLA_CONFIG).map(([key, sla]) => (
              <div key={key} className={`rounded-lg border ${sla.border} ${sla.bg} p-4`}>
                <div className={`text-xs font-medium ${sla.color}`}>{sla.label}</div>
                <div className="text-lg font-bold text-white mt-1">{sla.response}</div>
                <div className="text-[10px] text-slate-500 mt-1">Max response time</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Filter */}
        <div className="flex gap-1">
          {['all', 'RED', 'ORANGE', 'YELLOW', 'SYSTEM'].map(f => (
            <Button key={f} size="sm" variant={filter === f ? 'primary' : 'ghost'} onClick={() => setFilter(f)}>
              {f === 'all' ? 'All' : f}
            </Button>
          ))}
        </div>

        {/* Incidents List */}
        <div className="space-y-3">
          {filtered.map(inc => {
            const sla = SLA_CONFIG[inc.severity]
            const isExpanded = expanded === inc.id
            return (
              <Card key={inc.id}>
                <div className="flex items-start justify-between gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : inc.id)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs font-bold ${sla.color}`}>{inc.severity}</span>
                      <Badge variant={STATUS_VARIANTS[inc.status]}>{inc.status}</Badge>
                      <code className="text-[10px] text-slate-600 font-mono">{inc.id}</code>
                    </div>
                    <div className="text-sm text-white font-medium">{inc.title}</div>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-slate-500">
                      <span>{new Date(inc.created).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                      {inc.org && <span>{inc.org}</span>}
                      {inc.patient && <span>Patient: {inc.patient}</span>}
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs shrink-0">{isExpanded ? '▲' : '▼'}</span>
                </div>

                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-slate-800/50 pt-4">
                    {/* Escalation Chain */}
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2">Escalation Chain</div>
                      <div className="space-y-2">
                        {inc.escalation.map((esc, i) => (
                          <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-slate-800/20 border border-slate-800/50">
                            <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-[10px] text-white font-bold">{i + 1}</div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs text-slate-300">{esc.role}: <strong>{esc.person}</strong></div>
                              <div className="text-[10px] text-slate-500">Notified: {esc.notified} — Acknowledged: {esc.acknowledged || 'Pending'} — Via: {esc.method}</div>
                            </div>
                            <Badge variant={esc.acknowledged ? 'success' : 'danger'}>{esc.acknowledged ? 'Ack' : 'Pending'}</Badge>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Timeline */}
                    <div>
                      <div className="text-xs font-medium text-slate-400 mb-2">Incident Timeline</div>
                      <div className="space-y-1">
                        {inc.timeline.map((evt, i) => (
                          <div key={i} className="flex items-start gap-3 py-1">
                            <code className="text-[10px] text-slate-600 font-mono shrink-0 w-12">{evt.time}</code>
                            <div className={`w-1.5 h-1.5 rounded-full mt-1 shrink-0 ${
                              evt.type === 'system' ? 'bg-blue-400' :
                              evt.type === 'notification' ? 'bg-violet-400' :
                              evt.type === 'ack' ? 'bg-emerald-400' :
                              evt.type === 'escalation' ? 'bg-amber-400' :
                              evt.type === 'resolved' ? 'bg-emerald-400' :
                              'bg-slate-400'
                            }`} />
                            <span className="text-xs text-slate-400">{evt.event}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* RCA */}
                    {inc.rca && (
                      <div className="p-3 bg-slate-800/20 border border-slate-800 rounded-lg">
                        <div className="text-xs font-medium text-slate-400 mb-1">Root Cause Analysis</div>
                        <div className="text-xs text-slate-300">{inc.rca}</div>
                      </div>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      </div>
    </>
  )
}
