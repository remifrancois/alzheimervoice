import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { AlertBadge, Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Icon } from '../components/ui/Icon'
import { api } from '../lib/api'

export default function ReportsPage() {
  const [patients, setPatients] = useState([])
  const [reports, setReports] = useState([])

  useEffect(() => {
    api.getPatients().then(data => {
      const valid = data.filter(p => p.first_name)
      setPatients(valid)
      if (valid.length > 0) {
        loadReports(valid[0].patient_id)
      }
    })
  }, [])

  async function loadReports(patientId) {
    const loaded = []
    for (let w = 1; w <= 10; w++) {
      const r = await api.getWeeklyReport(patientId, w)
      if (r) loaded.push(r)
    }
    setReports(loaded)
  }

  return (
    <>
      <Topbar title="Reports" subtitle="Weekly clinical reports and export" />

      <div className="p-6 space-y-6">
        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-slate-400">
            {reports.length} weekly report{reports.length !== 1 ? 's' : ''} available
          </div>
          <Button variant="default" size="sm">
            <Icon name="file" size={14} />
            Export All (PDF)
          </Button>
        </div>

        {/* Reports list */}
        <div className="space-y-4">
          {reports.length === 0 ? (
            <Card>
              <div className="text-center py-8 text-sm text-slate-500">
                No weekly reports generated yet. Reports are created after 7 monitoring sessions.
              </div>
            </Card>
          ) : (
            reports.map(report => (
              <ReportCard key={report.week_number} report={report} />
            ))
          )}
        </div>
      </div>
    </>
  )
}

function ReportCard({ report }) {
  const [open, setOpen] = useState(false)

  return (
    <Card>
      <div className="flex items-center justify-between cursor-pointer" onClick={() => setOpen(!open)}>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center">
            <span className="text-sm font-bold text-slate-300">W{report.week_number}</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-white">Week {report.week_number} Analysis</span>
              <AlertBadge level={report.alert_level || report.computed_alert || 'green'} />
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {report.sessions_analyzed} sessions analyzed &middot; Composite: {report.composite_score?.toFixed(3)}
              {report.confidence && <> &middot; Confidence: {(report.confidence * 100).toFixed(0)}%</>}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {report.cascade_patterns?.length > 0 && (
            <Badge variant="danger">{report.cascade_patterns.length} patterns</Badge>
          )}
          <svg className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {open && (
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
          {/* Domain scores */}
          {report.domain_scores && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Domain Scores</div>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(report.domain_scores).map(([d, z]) => (
                  <div key={d} className="bg-slate-800/50 rounded-lg px-3 py-2 text-center">
                    <div className="text-[10px] text-slate-500 capitalize">{d}</div>
                    <div className={`text-sm font-semibold font-mono ${z >= -0.5 ? 'text-emerald-400' : z >= -1.0 ? 'text-yellow-400' : z >= -1.5 ? 'text-orange-400' : 'text-red-400'}`}>
                      {z.toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narratives */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {report.clinical_narrative_family && (
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Family Narrative</div>
                <p className="text-sm text-slate-300 leading-relaxed">{report.clinical_narrative_family}</p>
              </div>
            )}
            {report.clinical_narrative_medical && (
              <div className="bg-slate-800/30 rounded-lg p-4">
                <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Clinical Narrative</div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono">{report.clinical_narrative_medical}</p>
              </div>
            )}
          </div>

          {/* Flags */}
          {report.flags?.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Flags</div>
              <div className="space-y-1">
                {report.flags.map((f, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-amber-400/80">
                    <span className="shrink-0 mt-0.5">&#x26A0;</span>
                    {f}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  )
}
