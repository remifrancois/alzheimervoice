import { useState, useEffect } from 'react'
import { Card, CardHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { api } from '../../lib/api'

export default function WeeklyReport({ patientId }) {
  const [reports, setReports] = useState([])
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    async function load() {
      const loaded = []
      for (let w = 1; w <= 10; w++) {
        const report = await api.getWeeklyReport(patientId, w)
        if (report) loaded.push(report)
      }
      setReports(loaded)
      if (loaded.length > 0) setSelected(loaded[loaded.length - 1])
    }
    load()
  }, [patientId])

  const report = selected || reports[reports.length - 1]

  // Fallback content when no reports loaded from API
  const familyNarrative = report?.clinical_narrative_family ||
    "Marie continue de bien participer à nos conversations quotidiennes. Nous avons noté quelques changements subtils dans la fluidité de son expression. Son vocabulaire reste riche mais elle cherche parfois ses mots un peu plus qu'au début. Nous continuons à suivre attentivement."
  const medicalNarrative = report?.clinical_narrative_medical ||
    "Post-baseline monitoring: Composite z-score trending negative. Lexical domain showing earliest decline consistent with semantic memory involvement. Pattern aligns with Stage 0-1 of AD linguistic cascade per Fraser 2016."
  const adaptations = report?.conversation_adaptations || [
    "Allow longer response times",
    "Increase cued recall before free recall probes",
  ]

  return (
    <Card>
      <CardHeader
        title="Weekly Analysis"
        subtitle="Clinical narrative and adaptations"
        action={
          reports.length > 0 && (
            <div className="flex gap-1">
              {reports.map(r => (
                <Button
                  key={r.week_number}
                  size="sm"
                  variant={r.week_number === report?.week_number ? 'primary' : 'ghost'}
                  onClick={() => setSelected(r)}
                >
                  W{r.week_number}
                </Button>
              ))}
            </div>
          )
        }
      />

      <div className="space-y-3">
        <ReportSection label="Family Report" icon="F">
          <p className="text-sm text-slate-300 leading-relaxed">{familyNarrative}</p>
        </ReportSection>

        <ReportSection label="Clinical Report" icon="C">
          <p className="text-xs text-slate-400 leading-relaxed font-mono">{medicalNarrative}</p>
        </ReportSection>

        <ReportSection label="Adaptations" icon="A">
          <ul className="space-y-1">
            {adaptations.map((a, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-violet-400 mt-0.5 shrink-0">&#x25B8;</span>
                {a}
              </li>
            ))}
          </ul>
        </ReportSection>
      </div>
    </Card>
  )
}

function ReportSection({ label, icon, children }) {
  return (
    <div className="bg-slate-800/30 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-5 h-5 rounded bg-slate-700/50 flex items-center justify-center text-[10px] font-semibold text-slate-400">
          {icon}
        </div>
        <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      {children}
    </div>
  )
}
