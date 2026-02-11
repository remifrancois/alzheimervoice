import { useState, useEffect } from 'react'
import Topbar from '../components/layout/Topbar'
import { Card, CardHeader } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import SemanticMap from '../components/charts/SemanticMap'
import DifferentialDiagnosis from '../components/charts/DifferentialDiagnosis'
import { DOMAIN_COLORS } from '../lib/constants'
import { api } from '../lib/api'
import { useT } from '../lib/i18n'

export default function AnalysisPage() {
  const { t } = useT()
  const [patients, setPatients] = useState([])
  const [timeline, setTimeline] = useState(null)

  useEffect(() => {
    api.getPatients().then(data => {
      const valid = data.filter(p => p.first_name)
      setPatients(valid)
      if (valid.length > 0) {
        api.getTimeline(valid[0].patient_id).then(setTimeline)
      }
    })
  }, [])

  const monitoring = timeline?.timeline?.filter(s => s.composite !== undefined) || []
  const latest = monitoring[monitoring.length - 1]

  return (
    <>
      <Topbar title={t('analysis.title')} subtitle={t('analysis.subtitle')} />

      <div className="p-6 space-y-6">
        {/* Feature Matrix */}
        <Card>
          <CardHeader title={t('analysis.featureVector')} subtitle={t('analysis.featureVectorDesc')} />
          {latest?.feature_vector ? (
            <FeatureMatrix vector={latest.feature_vector} delta={latest.delta} t={t} />
          ) : (
            <div className="text-sm text-slate-500 py-4">{t('analysis.noDataDesc')}</div>
          )}
        </Card>

        {/* AD Cascade Tracker */}
        <Card>
          <CardHeader title={t('analysis.cascadeTracker')} subtitle={t('analysis.cascadeDesc')} />
          <CascadeTracker domainScores={latest?.domain_scores} t={t} />
        </Card>

        {/* V2 — Deep Analysis */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <DifferentialDiagnosis patientId={patients[0]?.patient_id} />
          <SemanticMap patientId={patients[0]?.patient_id} />
        </div>

        {/* Domain deep dive */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {['lexical', 'syntactic', 'coherence', 'fluency', 'memory'].map(domain => (
            <DomainCard
              key={domain}
              domain={domain}
              label={t(`domains.${domain}`)}
              score={latest?.domain_scores?.[domain]}
              features={latest?.feature_vector}
              delta={latest?.delta}
            />
          ))}
        </div>
      </div>
    </>
  )
}

function FeatureMatrix({ vector, delta, t }) {
  const domains = {
    lexical: ['L1_ttr', 'L2_brunet', 'L3_honore', 'L4_content_density', 'L5_word_frequency'],
    syntactic: ['S1_mlu', 'S2_subordination', 'S3_completeness', 'S4_passive_ratio', 'S5_embedding_depth'],
    coherence: ['C1_idea_density', 'C2_topic_maintenance', 'C3_referential_coherence', 'C4_temporal_sequencing', 'C5_information_units'],
    fluency: ['F1_long_pause_ratio', 'F2_filler_rate', 'F3_false_starts', 'F4_repetition_rate', 'F5_response_latency'],
    memory: ['M1_free_recall', 'M2_cued_recall', 'M3_recognition', 'M4_temporal_precision', 'M5_emotional_engagement'],
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left py-2 px-3 text-slate-500 font-medium">{t('analysis.feature')}</th>
            <th className="text-right py-2 px-3 text-slate-500 font-medium">{t('analysis.rawValue')}</th>
            <th className="text-right py-2 px-3 text-slate-500 font-medium">{t('analysis.zScore')}</th>
            <th className="text-left py-2 px-3 text-slate-500 font-medium w-32">{t('analysis.level')}</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(domains).map(([domain, features]) => (
            features.map((f, i) => {
              const raw = vector[f]
              const z = delta?.[f]
              return (
                <tr key={f} className={`border-b border-slate-800/50 ${i === 0 ? 'border-t border-slate-800' : ''}`}>
                  <td className="py-1.5 px-3">
                    <span className="inline-flex items-center gap-2">
                      {i === 0 && <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: DOMAIN_COLORS[domain] }} />}
                      {i !== 0 && <div className="w-2" />}
                      <span className="text-slate-300 font-mono">{f}</span>
                    </span>
                  </td>
                  <td className="py-1.5 px-3 text-right text-slate-400 font-mono tabular-nums">
                    {raw != null ? raw.toFixed(3) : <span className="text-slate-600">null</span>}
                  </td>
                  <td className="py-1.5 px-3 text-right font-mono tabular-nums">
                    {z != null ? (
                      <span className={z >= -0.5 ? 'text-emerald-400' : z >= -1.0 ? 'text-yellow-400' : z >= -1.5 ? 'text-orange-400' : 'text-red-400'}>
                        {z >= 0 ? '+' : ''}{z.toFixed(2)}
                      </span>
                    ) : <span className="text-slate-600">-</span>}
                  </td>
                  <td className="py-1.5 px-3">
                    {raw != null && <MicroBar value={raw} />}
                  </td>
                </tr>
              )
            })
          ))}
        </tbody>
      </table>
    </div>
  )
}

function MicroBar({ value }) {
  const pct = Math.max(0, Math.min(100, value * 100))
  const color = pct >= 60 ? 'bg-emerald-500' : pct >= 40 ? 'bg-yellow-500' : pct >= 20 ? 'bg-orange-500' : 'bg-red-500'
  return (
    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full rounded-full ${color} opacity-60`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function CascadeTracker({ domainScores, t }) {
  const stages = [
    { stage: 0, nameKey: 'analysis.preSymptomatic', descKey: 'analysis.preSympDesc', check: (d) => d?.fluency < -0.5 && d?.lexical > -0.3 },
    { stage: 1, nameKey: 'analysis.semanticMemory', descKey: 'analysis.semanticDesc', check: (d) => d?.lexical < -0.5 && d?.coherence < -0.5 },
    { stage: 2, nameKey: 'analysis.syntacticSimplification', descKey: 'analysis.syntacticDesc', check: (d) => d?.syntactic < -0.5 && d?.lexical < -0.5 },
    { stage: 3, nameKey: 'analysis.discourseCollapse', descKey: 'analysis.discourseDesc', check: (d) => d?.coherence < -1.0 && d?.fluency < -0.5 },
  ]

  return (
    <div className="flex gap-3">
      {stages.map(s => {
        const active = domainScores ? s.check(domainScores) : false
        return (
          <div key={s.stage} className={`flex-1 rounded-lg border p-4 ${active ? 'bg-red-500/5 border-red-500/30' : 'bg-slate-800/30 border-slate-800'}`}>
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-red-500/20 text-red-400' : 'bg-slate-700 text-slate-500'}`}>
                {s.stage}
              </div>
              <span className={`text-xs font-medium ${active ? 'text-red-300' : 'text-slate-400'}`}>{t(s.nameKey)}</span>
              {active && <Badge variant="danger">{t('analysis.active')}</Badge>}
            </div>
            <p className="text-[10px] text-slate-500 mt-1">{t(s.descKey)}</p>
          </div>
        )
      })}
    </div>
  )
}

function DomainCard({ domain, label, score, features, delta }) {
  const featureKeys = {
    lexical: ['L1_ttr', 'L2_brunet', 'L3_honore', 'L4_content_density', 'L5_word_frequency'],
    syntactic: ['S1_mlu', 'S2_subordination', 'S3_completeness', 'S4_passive_ratio', 'S5_embedding_depth'],
    coherence: ['C1_idea_density', 'C2_topic_maintenance', 'C3_referential_coherence', 'C4_temporal_sequencing', 'C5_information_units'],
    fluency: ['F1_long_pause_ratio', 'F2_filler_rate', 'F3_false_starts', 'F4_repetition_rate', 'F5_response_latency'],
    memory: ['M1_free_recall', 'M2_cued_recall', 'M3_recognition', 'M4_temporal_precision', 'M5_emotional_engagement'],
  }

  return (
    <Card>
      <div className="flex items-center gap-2 mb-3">
        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: DOMAIN_COLORS[domain] }} />
        <span className="text-sm font-semibold text-slate-200">{label}</span>
        {score != null && (
          <span className={`ml-auto text-xs font-mono ${score >= -0.5 ? 'text-emerald-400' : score >= -1.0 ? 'text-yellow-400' : score >= -1.5 ? 'text-orange-400' : 'text-red-400'}`}>
            z = {score.toFixed(2)}
          </span>
        )}
      </div>
      <div className="space-y-1.5">
        {featureKeys[domain]?.map(f => (
          <div key={f} className="flex items-center gap-2 text-[11px]">
            <span className="text-slate-500 font-mono w-28 shrink-0">{f}</span>
            <div className="flex-1"><MicroBar value={features?.[f] ?? 0.5} /></div>
            <span className="text-slate-400 font-mono w-10 text-right tabular-nums">
              {features?.[f] != null ? features[f].toFixed(2) : '-'}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
