import { useState, useEffect } from 'react'
import { Card, CardHeader } from '../ui/Card'
import { Badge } from '../ui/Badge'
import { api } from '../../lib/api'

const HEALTH_COLORS = {
  healthy: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-400', dot: 'bg-emerald-400' },
  weakening: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  fragmenting: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  early_fragmentation: { bg: 'bg-yellow-500/10', border: 'border-yellow-500/30', text: 'text-yellow-400', dot: 'bg-yellow-400' },
  moderate_fragmentation: { bg: 'bg-orange-500/10', border: 'border-orange-500/30', text: 'text-orange-400', dot: 'bg-orange-400' },
  severe_fragmentation: { bg: 'bg-red-500/10', border: 'border-red-500/30', text: 'text-red-400', dot: 'bg-red-400' },
}

export default function SemanticMap({ patientId }) {
  const [data, setData] = useState(null)

  useEffect(() => {
    if (patientId) {
      api.getSemanticMap(patientId).then(setData).catch(() => {})
    }
  }, [patientId])

  if (!data) {
    return (
      <Card>
        <CardHeader title="Cognitive Archaeology" subtitle="Semantic network map from conversation history" />
        <div className="text-sm text-slate-500 py-4">
          Run a deep analysis to generate the semantic map.
        </div>
      </Card>
    )
  }

  const networkHealth = data.network_health || {}
  const healthStyle = HEALTH_COLORS[networkHealth.overall] || HEALTH_COLORS.healthy

  return (
    <Card>
      <CardHeader
        title="Cognitive Archaeology"
        subtitle="Semantic network health from conversational history"
      />

      {/* Network health overview */}
      <div className={`rounded-lg border ${healthStyle.border} ${healthStyle.bg} p-4 mb-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className={`w-2.5 h-2.5 rounded-full ${healthStyle.dot}`} />
            <span className={`text-sm font-semibold ${healthStyle.text} capitalize`}>
              {(networkHealth.overall || 'unknown').replace(/_/g, ' ')}
            </span>
          </div>
          <Badge variant={networkHealth.overall === 'healthy' ? 'success' : 'warning'}>
            Network Health
          </Badge>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <NetworkStat label="Active Clusters" value={networkHealth.total_clusters || data.semantic_clusters?.length || 0} />
          <NetworkStat label="Weakening" value={networkHealth.weakening_bridges || 0} warn={networkHealth.weakening_bridges > 0} />
          <NetworkStat label="Isolated Nodes" value={networkHealth.isolated_nodes || 0} warn={networkHealth.isolated_nodes > 2} />
          <NetworkStat label="Active" value={networkHealth.active_clusters || 0} />
        </div>
      </div>

      {/* Semantic clusters */}
      {data.semantic_clusters?.length > 0 && (
        <div className="space-y-2 mb-4">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider">Topic Clusters</div>
          <div className="grid grid-cols-2 gap-2">
            {data.semantic_clusters.slice(0, 6).map((cluster, i) => (
              <ClusterCard key={i} cluster={cluster} />
            ))}
          </div>
        </div>
      )}

      {/* Repetition patterns */}
      {data.repetition_patterns?.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Repetition Patterns</div>
          {data.repetition_patterns.slice(0, 3).map((pattern, i) => (
            <div key={i} className="flex items-center gap-2 text-[11px] py-1">
              <div className={`w-1.5 h-1.5 rounded-full ${
                pattern.concern_level === 'high' ? 'bg-red-400' :
                pattern.concern_level === 'moderate' ? 'bg-orange-400' :
                pattern.concern_level === 'low' ? 'bg-yellow-400' : 'bg-slate-600'
              }`} />
              <span className="text-slate-400 flex-1">{pattern.story}</span>
              <span className="text-slate-600">{pattern.times_told}x</span>
              <Badge variant={pattern.type === 'verbatim' ? 'danger' : 'default'} className="text-[9px]">
                {pattern.type}
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Temporal anchoring */}
      {data.temporal_anchoring && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Temporal Precision</span>
            <span className={data.temporal_anchoring.precision_trend === 'declining' ? 'text-orange-400' : 'text-emerald-400'}>
              {data.temporal_anchoring.precision_trend || 'stable'}
            </span>
          </div>
          {data.temporal_anchoring.temporal_vagueness_instances > 0 && (
            <div className="text-[10px] text-slate-600 mt-1">
              {data.temporal_anchoring.temporal_vagueness_instances} temporal vagueness instances detected
            </div>
          )}
        </div>
      )}

      {/* Lexical evolution */}
      {data.lexical_evolution && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Lexical Evolution</div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="Generic Substitutions" value={data.lexical_evolution.generic_substitutions || 0} />
            <MiniStat label="Proper Noun Failures" value={data.lexical_evolution.proper_noun_failures || 0} />
            <MiniStat label="Circumlocution" value={data.lexical_evolution.circumlocution_instances || 0} />
          </div>
        </div>
      )}

      {/* Clinical summary */}
      {data.clinical_summary && (
        <div className="mt-3 pt-3 border-t border-slate-800">
          <p className="text-[11px] text-slate-400 italic">{data.clinical_summary}</p>
        </div>
      )}
    </Card>
  )
}

function NetworkStat({ label, value, warn }) {
  return (
    <div className="text-center">
      <div className={`text-lg font-bold ${warn ? 'text-orange-400' : 'text-slate-200'}`}>{value}</div>
      <div className="text-[9px] text-slate-500">{label}</div>
    </div>
  )
}

function ClusterCard({ cluster }) {
  const healthStyle = HEALTH_COLORS[cluster.cluster_health] || HEALTH_COLORS.healthy
  return (
    <div className={`rounded-lg border ${healthStyle.border} p-2.5`}>
      <div className="flex items-center gap-1.5 mb-1.5">
        <div className={`w-1.5 h-1.5 rounded-full ${healthStyle.dot}`} />
        <span className="text-[11px] font-medium text-slate-300 capitalize">{cluster.name}</span>
        <span className="text-[9px] text-slate-600 ml-auto">{cluster.nodes?.length || 0} nodes</span>
      </div>
      {cluster.nodes?.slice(0, 3).map((node, j) => (
        <div key={j} className="text-[9px] text-slate-500 pl-3 truncate">
          {node.label} ({node.mention_count}x, {node.trend})
        </div>
      ))}
    </div>
  )
}

function MiniStat({ label, value }) {
  return (
    <div className="text-center">
      <div className={`text-sm font-mono font-bold ${value > 3 ? 'text-orange-400' : 'text-slate-300'}`}>{value}</div>
      <div className="text-[9px] text-slate-500">{label}</div>
    </div>
  )
}
