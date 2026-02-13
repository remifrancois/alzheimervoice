/**
 * Self-contained demo data for 5 family patients.
 * Provides a demoApi object with the same interface as the real api,
 * so all pages work without an API server.
 */

// ─── Seeded random for deterministic data ─────────────────────────────
function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807 + 0) % 2147483647
    return (s - 1) / 2147483646
  }
}

// ─── 5 Family Patient Profiles ────────────────────────────────────────

const PATIENTS = [
  {
    patient_id: 'p1-dorothy-mitchell-00a1',
    first_name: 'Dorothy',
    last_name: 'Mitchell',
    age: 72,
    language: 'en',
    phone_number: '+1 617 555 0142',
    call_schedule: { time: '09:00', timezone: 'America/New_York' },
    created_at: '2025-11-25T10:00:00Z',
    baseline_established: true,
    baseline_sessions: 14,
    alert_level: 'green',
    personality_notes: 'Dorothy loves gardening and talking about her grandchildren. Very warm and talkative. Retired librarian.',
    // Generation params
    _seed: 1001,
    _monitoringSessions: 18,
    _compositeRange: [-0.35, -0.05],
    _drift: 0.0,   // no drift
    _domainProfile: { lexical: 0.0, syntactic: 0.05, coherence: -0.1, fluency: -0.15, memory: -0.2 },
  },
  {
    patient_id: 'p2-robert-henderson-00b2',
    first_name: 'Robert',
    last_name: 'Henderson',
    age: 81,
    language: 'en',
    phone_number: '+1 312 555 0198',
    call_schedule: { time: '10:30', timezone: 'America/Chicago' },
    created_at: '2025-11-10T10:00:00Z',
    baseline_established: true,
    baseline_sessions: 14,
    alert_level: 'yellow',
    personality_notes: 'Robert is a retired high school teacher. Enjoys discussing history and politics. Sometimes repeats anecdotes.',
    _seed: 2002,
    _monitoringSessions: 20,
    _compositeRange: [-0.85, -0.35],
    _drift: -0.02,  // slight weekly drift
    _domainProfile: { lexical: -0.3, syntactic: -0.1, coherence: -0.2, fluency: -0.35, memory: -0.65 },
  },
  {
    patient_id: 'p3-margaret-sullivan-00c3',
    first_name: 'Margaret',
    last_name: 'Sullivan',
    age: 89,
    language: 'en',
    phone_number: '+1 415 555 0167',
    call_schedule: { time: '14:00', timezone: 'America/Los_Angeles' },
    created_at: '2025-10-28T10:00:00Z',
    baseline_established: true,
    baseline_sessions: 14,
    alert_level: 'orange',
    personality_notes: 'Margaret was a school principal. Very articulate baseline but showing progressive changes in word-finding.',
    _seed: 3003,
    _monitoringSessions: 22,
    _compositeRange: [-1.35, -0.55],
    _drift: -0.03,  // moderate drift
    _domainProfile: { lexical: -0.6, syntactic: -0.3, coherence: -0.55, fluency: -0.4, memory: -0.9 },
  },
  {
    patient_id: 'p4-henry-carpenter-00d4',
    first_name: 'Henry',
    last_name: 'Carpenter',
    age: 94,
    language: 'en',
    phone_number: '+1 202 555 0134',
    call_schedule: { time: '11:00', timezone: 'America/New_York' },
    created_at: '2025-10-15T10:00:00Z',
    baseline_established: true,
    baseline_sessions: 14,
    alert_level: 'red',
    personality_notes: 'Henry is a Korean War veteran. Rich autobiographical memory at baseline but significant recent decline across multiple domains.',
    _seed: 4004,
    _monitoringSessions: 25,
    _compositeRange: [-2.0, -0.5],
    _drift: -0.04,  // significant drift
    _domainProfile: { lexical: -0.9, syntactic: -0.6, coherence: -1.0, fluency: -0.7, memory: -1.5 },
  },
  {
    patient_id: 'p5-jean-parker-00e5',
    first_name: 'Jean',
    last_name: 'Parker',
    age: 67,
    language: 'en',
    phone_number: '+1 514 555 0199',
    call_schedule: { time: '15:00', timezone: 'America/New_York' },
    created_at: '2025-10-15T10:00:00Z',
    baseline_established: true,
    baseline_sessions: 14,
    alert_level: 'green',
    personality_notes: 'Jean is recently retired. Enrolled by her daughter. Energetic and positive. Youngest in the cohort.',
    _seed: 5005,
    _monitoringSessions: 15,
    _compositeRange: [-0.25, 0.1],
    _drift: 0.0,
    _domainProfile: { lexical: 0.05, syntactic: 0.1, coherence: 0.0, fluency: -0.05, memory: -0.1 },
  },
]

// ─── Family demo users ────────────────────────────────────────────────

export const FAMILY_DEMO_USERS = [
  { id: 'f1', name: 'Claire Mitchell',     email: 'claire@alzheimervoice.org',   role: 'family', avatar: 'CM', patientId: PATIENTS[0].patient_id },
  { id: 'f2', name: 'Anthony Henderson',   email: 'anthony@alzheimervoice.org',  role: 'family', avatar: 'AH', patientId: PATIENTS[1].patient_id },
  { id: 'f3', name: 'Sophie Sullivan',     email: 'sophie@alzheimervoice.org',   role: 'family', avatar: 'SS', patientId: PATIENTS[2].patient_id },
  { id: 'f4', name: 'Philip Carpenter',    email: 'philip@alzheimervoice.org',   role: 'family', avatar: 'PC', patientId: PATIENTS[3].patient_id },
  { id: 'f5', name: 'Emma Parker',         email: 'emma@alzheimervoice.org',     role: 'family', avatar: 'EP', patientId: PATIENTS[4].patient_id },
]

// ─── CVF Feature definitions ──────────────────────────────────────────

const FEATURES = {
  lexical:   ['L1_ttr', 'L2_brunet', 'L3_honore', 'L4_content_density', 'L5_word_frequency'],
  syntactic: ['S1_mlu', 'S2_subordination', 'S3_completeness', 'S4_passive_ratio', 'S5_embedding_depth'],
  coherence: ['C1_idea_density', 'C2_topic_maintenance', 'C3_referential_coherence', 'C4_temporal_sequencing', 'C5_information_units'],
  fluency:   ['F1_long_pause_ratio', 'F2_filler_rate', 'F3_false_starts', 'F4_repetition_rate', 'F5_response_latency'],
  memory:    ['M1_free_recall', 'M2_cued_recall', 'M3_recognition', 'M4_temporal_precision', 'M5_emotional_engagement'],
}

const ALL_FEATURES = Object.values(FEATURES).flat()

const DOMAIN_WEIGHTS = { lexical: 0.25, syntactic: 0.20, coherence: 0.25, fluency: 0.20, memory: 0.10 }

function getAlertLevel(z) {
  if (z >= -0.5) return 'green'
  if (z >= -1.0) return 'yellow'
  if (z >= -1.5) return 'orange'
  return 'red'
}

// ─── Timeline generation ──────────────────────────────────────────────

function generateTimeline(patient) {
  const rand = seededRandom(patient._seed)
  const timeline = []
  const baseDate = new Date(patient.created_at)

  // Generate baseline sessions (no composite score)
  for (let i = 0; i < patient.baseline_sessions; i++) {
    const ts = new Date(baseDate.getTime() + i * 86400000)
    const featureVector = {}
    ALL_FEATURES.forEach(f => {
      featureVector[f] = 0.45 + rand() * 0.25 // baseline range 0.45-0.70
    })
    timeline.push({
      timestamp: ts.toISOString(),
      feature_vector: featureVector,
      confounders: {},
    })
  }

  // Generate monitoring sessions (with composite scores)
  for (let i = 0; i < patient._monitoringSessions; i++) {
    const dayOffset = patient.baseline_sessions + i * 3 // every ~3 days
    const ts = new Date(baseDate.getTime() + dayOffset * 86400000)
    const weekIdx = i

    // Progressive drift
    const driftFactor = patient._drift * weekIdx

    // Generate feature vector
    const featureVector = {}
    const delta = {}
    ALL_FEATURES.forEach(f => {
      featureVector[f] = Math.max(0.05, Math.min(0.95, 0.55 + (rand() - 0.5) * 0.2))
    })

    // Generate domain scores with drift
    const domainScores = {}
    for (const [domain, baseScore] of Object.entries(patient._domainProfile)) {
      const noise = (rand() - 0.5) * 0.3
      domainScores[domain] = parseFloat((baseScore + driftFactor + noise).toFixed(3))
    }

    // Generate delta (z-scores per feature)
    for (const [domain, features] of Object.entries(FEATURES)) {
      const domainZ = domainScores[domain]
      features.forEach(f => {
        delta[f] = parseFloat((domainZ + (rand() - 0.5) * 0.4).toFixed(3))
      })
    }

    // Compute composite
    let composite = 0
    for (const [domain, weight] of Object.entries(DOMAIN_WEIGHTS)) {
      composite += domainScores[domain] * weight
    }
    composite = parseFloat(composite.toFixed(3))

    const alertLevel = getAlertLevel(composite)

    // Occasional confounders
    const confounders = {}
    if (rand() < 0.15) confounders.fatigue = true
    if (rand() < 0.08) confounders.medication_change = true
    if (rand() < 0.05) confounders.poor_sleep = true

    timeline.push({
      timestamp: ts.toISOString(),
      composite,
      alert_level: alertLevel,
      domain_scores: domainScores,
      feature_vector: featureVector,
      delta,
      confounders,
    })
  }

  return {
    patient_id: patient.patient_id,
    sessions_count: timeline.length,
    baseline_established: patient.baseline_established,
    timeline,
  }
}

// ─── Weekly reports ───────────────────────────────────────────────────

const FAMILY_NARRATIVES = {
  green: [
    "Your loved one continues to have warm and engaging conversations with us. Their vocabulary is rich, they recall recent events well, and their speech flows naturally. Everything looks reassuringly stable this week.",
    "Another wonderful week of conversations. We noticed lively storytelling and clear recall of family events. No areas of concern at this time. Keep encouraging daily conversations!",
    "This week's conversations were full of detail and warmth. Your family member spoke clearly, recalled names and dates accurately, and maintained their train of thought beautifully throughout.",
  ],
  yellow: [
    "Overall, conversations this week were positive. We noticed a few moments where your loved one searched for the right word slightly more than usual, and one conversation had a shorter than typical flow. These small variations are worth monitoring but are not alarming.",
    "Your family member remains engaged and communicative. We observed some subtle changes in how quickly they respond to questions, and occasional pauses that are slightly longer than their personal baseline. We'll continue monitoring closely.",
    "Conversations continue to be meaningful. We've noticed a gentle shift in some speech patterns this week - slightly more repetition of certain phrases and occasional difficulty with specific names. This is something we're tracking carefully.",
  ],
  orange: [
    "This week we observed notable changes that we want to bring to your attention. Your loved one had more difficulty maintaining the thread of conversation, and word-finding pauses were more frequent. We recommend discussing these observations with their healthcare provider.",
    "We've seen a meaningful shift in several areas of conversation this week. Sentence structure has become simpler, and your family member relied more on general words rather than specific ones. Some stories were repeated within the same conversation. A medical consultation would be advisable.",
    "Important changes were observed this week. Your loved one's ability to recall recent events has decreased, and there were moments of confusion about timeframes. The richness of their vocabulary has noticeably reduced. We strongly suggest scheduling a medical appointment.",
  ],
  red: [
    "We want to alert you to significant changes this week. Your loved one showed considerable difficulty with word recall, maintaining conversation topics, and accurately placing events in time. Multiple domains of speech are affected. We urge you to consult with their physician as soon as possible.",
    "This week's conversations revealed substantial changes across multiple areas. Your family member struggled significantly with coherent storytelling, repeated the same stories multiple times without realizing, and showed notable difficulty with names and dates. Immediate medical consultation is recommended.",
  ],
}

const CLINICAL_NARRATIVES = {
  green: [
    "Post-baseline monitoring: All 5 cognitive-linguistic domains within normal variation (composite z = {score}). Feature vector stable across lexical diversity (TTR), syntactic complexity, and coherence metrics. No cascade patterns detected. Continue standard monitoring protocol.",
    "Weekly analysis shows consistent performance across all CVF domains. Z-scores remain within ±0.5 SD of personalized baseline. No temporal sequencing errors. Fluency markers (pause ratio, filler rate) stable. Recommend maintaining current call schedule.",
  ],
  yellow: [
    "Composite z-score trending negative ({score}). Memory domain showing earliest decline with M1_free_recall and M4_temporal_precision below -0.5 SD. Lexical diversity (L1_ttr) at lower boundary of normal. Pattern consistent with Stage 0 pre-symptomatic indicators per Fraser 2016. Recommend increased monitoring frequency.",
    "Notable drift detected in fluency domain (F1_long_pause_ratio, F2_filler_rate). Composite at {score}. Coherence metrics (C2_topic_maintenance) showing downward trend over 3-week window. Not yet clinically significant but warrants close observation. Consider additional baseline calibration sessions.",
  ],
  orange: [
    "Significant deviation from baseline detected (composite z = {score}). Lexical and memory domains most affected. L1_ttr decline of -0.8 SD suggests semantic access difficulty. M1_free_recall at -1.2 SD with increasing reliance on cued recall (M2). AD linguistic cascade Stage 1 (semantic memory) criteria met. Recommend neuropsychological evaluation.",
    "Multi-domain decline pattern observed. Composite z = {score}. Cascade tracker shows Stage 0 and Stage 1 active. Syntactic simplification emerging (S1_mlu declining, S2_subordination reduced). Coherence breakdown in C1_idea_density and C3_referential_coherence. Clinical referral strongly recommended.",
  ],
  red: [
    "Critical alert: Composite z = {score}, crossing -1.5 SD threshold. Multiple cascade stages active (0, 1, 2). Discourse-level collapse emerging (C1_idea_density < -1.5, C2_topic_maintenance < -1.0). Severe memory domain deficit (M1, M2, M4 all < -1.5 SD). Fluency disruption with F1_long_pause_ratio at -1.8 SD. Urgent neurological consultation required.",
    "Severe multi-domain decline. Composite z = {score}. Full cascade progression from Stage 0 to Stage 2 documented over 8-week monitoring window. Lexical: L1_ttr and L4_content_density at critical levels. Repetition rate (F4) elevated 3x from baseline. Temporal precision (M4) severely impaired. Differential: 55% AD, 15% depression co-morbidity. Immediate clinical assessment recommended.",
  ],
}

function generateWeeklyReports(patient, timelineData) {
  const monitoring = timelineData.timeline.filter(s => s.composite !== undefined)
  if (monitoring.length < 3) return []

  const rand = seededRandom(patient._seed + 7777)
  const reports = []
  const weeksCount = Math.min(Math.floor(monitoring.length / 2), 8)

  for (let w = 1; w <= weeksCount; w++) {
    const sessionsInWeek = monitoring.slice((w - 1) * 2, w * 2)
    if (sessionsInWeek.length === 0) continue

    const avgComposite = sessionsInWeek.reduce((s, e) => s + e.composite, 0) / sessionsInWeek.length
    const alertLevel = getAlertLevel(avgComposite)

    const domainScores = {}
    for (const domain of Object.keys(DOMAIN_WEIGHTS)) {
      const vals = sessionsInWeek.filter(s => s.domain_scores?.[domain] != null).map(s => s.domain_scores[domain])
      domainScores[domain] = vals.length > 0 ? parseFloat((vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(3)) : 0
    }

    const cascadePatterns = []
    if (domainScores.fluency < -0.5 && domainScores.lexical > -0.3) cascadePatterns.push('Stage 0: Pre-symptomatic fluency')
    if (domainScores.lexical < -0.5 && domainScores.coherence < -0.5) cascadePatterns.push('Stage 1: Semantic memory')
    if (domainScores.syntactic < -0.5 && domainScores.lexical < -0.5) cascadePatterns.push('Stage 2: Syntactic simplification')
    if (domainScores.coherence < -1.0 && domainScores.fluency < -0.5) cascadePatterns.push('Stage 3: Discourse collapse')

    const familyNarratives = FAMILY_NARRATIVES[alertLevel] || FAMILY_NARRATIVES.green
    const clinicalNarratives = CLINICAL_NARRATIVES[alertLevel] || CLINICAL_NARRATIVES.green
    const idx = Math.floor(rand() * familyNarratives.length)
    const cidx = Math.floor(rand() * clinicalNarratives.length)

    const flags = []
    if (alertLevel === 'orange') flags.push('Cognitive drift detected - medical consultation recommended')
    if (alertLevel === 'red') {
      flags.push('Critical cognitive decline - urgent medical consultation required')
      flags.push('Multiple cascade stages active')
    }
    if (domainScores.memory < -1.0) flags.push('Memory domain significantly below baseline')
    if (domainScores.lexical < -0.8) flags.push('Lexical diversity declining - word-finding difficulty')

    reports.push({
      patient_id: patient.patient_id,
      week_number: w,
      composite_score: parseFloat(avgComposite.toFixed(3)),
      confidence: parseFloat((0.65 + rand() * 0.25).toFixed(2)),
      alert_level: alertLevel,
      domain_scores: domainScores,
      cascade_patterns: cascadePatterns,
      sessions_analyzed: sessionsInWeek.length,
      clinical_narrative_family: familyNarratives[idx % familyNarratives.length],
      clinical_narrative_medical: clinicalNarratives[cidx % clinicalNarratives.length].replace('{score}', avgComposite.toFixed(3)),
      conversation_adaptations: generateAdaptations(alertLevel, rand),
      next_week_focus: alertLevel === 'green' ? 'Continue standard monitoring' : alertLevel === 'yellow' ? 'Increase recall probes' : 'Simplify questions, extend response time',
      flags,
      created_at: new Date(Date.now() - (weeksCount - w) * 7 * 86400000).toISOString(),
    })
  }

  return reports
}

function generateAdaptations(alertLevel, rand) {
  const base = [
    'Continue regular conversational engagement',
    'Encourage storytelling about meaningful memories',
  ]
  if (alertLevel === 'yellow') {
    base.push('Allow slightly longer response times')
    base.push('Increase cued recall prompts before free recall')
  }
  if (alertLevel === 'orange') {
    base.push('Simplify question structure')
    base.push('Use more yes/no confirmations to reduce frustration')
    base.push('Focus on well-established autobiographical memories')
  }
  if (alertLevel === 'red') {
    base.push('Significantly extend response windows')
    base.push('Minimize open-ended questions')
    base.push('Prioritize emotional engagement over factual recall')
    base.push('Consider reducing session frequency if patient shows distress')
  }
  return base
}

// ─── Differential Diagnosis ───────────────────────────────────────────

function generateDifferential(patient) {
  const profiles = {
    green: { alzheimer: 0.08, depression: 0.05, parkinsons: 0.02, normal_aging: 0.72, medication: 0.08, grief: 0.05 },
    yellow: { alzheimer: 0.22, depression: 0.10, parkinsons: 0.03, normal_aging: 0.45, medication: 0.12, grief: 0.08 },
    orange: { alzheimer: 0.42, depression: 0.12, parkinsons: 0.05, normal_aging: 0.22, medication: 0.10, grief: 0.09 },
    red: { alzheimer: 0.58, depression: 0.12, parkinsons: 0.06, normal_aging: 0.10, medication: 0.08, grief: 0.06 },
  }

  const hints = {
    green: [
      'Speech patterns consistent with healthy aging profile',
      'No significant deviation from age-matched normative data',
      'Cognitive-linguistic markers within expected range',
    ],
    yellow: [
      'Subtle lexical access changes may indicate early semantic processing difficulty',
      'Fluency pattern shifts detected but not yet diagnostic',
      'Memory domain showing earliest deviation from personal baseline',
    ],
    orange: [
      'Lexical diversity decline pattern consistent with early AD linguistic signature',
      'Topic maintenance difficulty emerging alongside semantic access issues',
      'Differentiate from depressive pseudo-dementia: fluency preserved more than expected in pure depression',
    ],
    red: [
      'Multi-domain cascade strongly consistent with Alzheimer\'s linguistic profile (Fraser et al., 2016)',
      'Syntactic simplification combined with lexical poverty indicates advancing impairment',
      'Repetition patterns and temporal confusion further support neurodegenerative process',
      'Depression co-morbidity possible - emotional engagement score declining in parallel',
    ],
  }

  const probs = profiles[patient.alert_level] || profiles.green
  const primary = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0]

  return {
    probabilities: probs,
    primary_hypothesis: primary,
    confidence: patient.alert_level === 'green' ? 0.78 : patient.alert_level === 'yellow' ? 0.65 : patient.alert_level === 'orange' ? 0.72 : 0.82,
    reasoning_hints: hints[patient.alert_level] || hints.green,
  }
}

// ─── Cognitive Twin ───────────────────────────────────────────────────

function generateTwin(patient) {
  if (!patient.baseline_established) return null

  const rand = seededRandom(patient._seed + 3333)
  const twinVector = {}
  ALL_FEATURES.forEach(f => {
    twinVector[f] = { expected: parseFloat((0.5 + (rand() - 0.5) * 0.1).toFixed(3)) }
  })

  const divergenceMap = { green: 0.3, yellow: 1.2, orange: 2.1, red: 3.2 }
  const interpretations = { green: 'Within normal range', yellow: 'Mild divergence detected', orange: 'Significant divergence from expected', red: 'Severe divergence - abnormal trajectory' }
  const overall = divergenceMap[patient.alert_level] || 0.3

  const domainDiv = {}
  for (const domain of Object.keys(DOMAIN_WEIGHTS)) {
    domainDiv[domain] = parseFloat((overall + (rand() - 0.5) * 0.6).toFixed(1))
  }

  return {
    twin: { twinVector },
    divergence: {
      overall,
      alert_level: patient.alert_level,
      interpretation: interpretations[patient.alert_level] || 'Unknown',
      domains: domainDiv,
    },
  }
}

// ─── Cohort Matching ──────────────────────────────────────────────────

function generateCohort(patient) {
  if (!patient.baseline_established) return null

  const profiles = {
    green: { normal: 0.70, mci_stable: 0.18, alzheimer: 0.06, depression: 0.04, other_dementia: 0.02 },
    yellow: { normal: 0.38, mci_stable: 0.30, alzheimer: 0.18, depression: 0.08, other_dementia: 0.06 },
    orange: { normal: 0.15, mci_stable: 0.25, alzheimer: 0.38, depression: 0.12, other_dementia: 0.10 },
    red: { normal: 0.05, mci_stable: 0.12, alzheimer: 0.55, depression: 0.15, other_dementia: 0.13 },
  }

  const probs = profiles[patient.alert_level] || profiles.green
  const primary = Object.entries(probs).sort((a, b) => b[1] - a[1])[0][0]

  const rand = seededRandom(patient._seed + 5555)

  const matches = []
  const diagnoses = ['normal', 'mci_stable', 'alzheimer', 'depression', 'other_dementia']
  for (let i = 0; i < 5; i++) {
    matches.push({
      id: `REF-${String(Math.floor(rand() * 900) + 100).padStart(3, '0')}`,
      diagnosis: diagnoses[Math.floor(rand() * diagnoses.length)],
    })
  }

  const predictedTrajectory = []
  let lastComposite = patient._compositeRange[0] + (patient._compositeRange[1] - patient._compositeRange[0]) * 0.7
  for (let i = 0; i < 12; i++) {
    lastComposite += patient._drift * 0.5 + (rand() - 0.5) * 0.15
    predictedTrajectory.push({ predicted_composite: parseFloat(lastComposite.toFixed(3)) })
  }

  return {
    outcome_probabilities: probs,
    primary_prediction: primary,
    confidence: parseFloat((0.6 + rand() * 0.25).toFixed(2)),
    weeks_analyzed: Math.floor(patient._monitoringSessions / 2),
    matches,
    predicted_trajectory: predictedTrajectory,
  }
}

// ─── Semantic Map ─────────────────────────────────────────────────────

function generateSemanticMap(patient) {
  if (!patient.baseline_established) return null

  const healthMap = { green: 'healthy', yellow: 'early_fragmentation', orange: 'moderate_fragmentation', red: 'severe_fragmentation' }

  const clusterTemplates = [
    { name: 'family',    nodes: [{ label: 'daughter', base: 15 }, { label: 'grandchildren', base: 12 }, { label: 'spouse', base: 10 }] },
    { name: 'daily life', nodes: [{ label: 'garden', base: 8 }, { label: 'cooking', base: 7 }, { label: 'neighborhood', base: 6 }] },
    { name: 'past career', nodes: [{ label: 'workplace', base: 5 }, { label: 'colleagues', base: 4 }, { label: 'retirement', base: 3 }] },
    { name: 'health',    nodes: [{ label: 'doctor visits', base: 6 }, { label: 'medication', base: 4 }, { label: 'exercise', base: 3 }] },
    { name: 'culture',   nodes: [{ label: 'music', base: 5 }, { label: 'reading', base: 4 }, { label: 'television', base: 6 }] },
  ]

  const trendMap = { green: 'stable', yellow: 'stable', orange: 'declining', red: 'declining' }
  const clusterHealthMap = { green: 'healthy', yellow: 'healthy', orange: 'weakening', red: 'fragmenting' }

  const clusters = clusterTemplates.map((tpl, i) => ({
    name: tpl.name,
    cluster_health: i < 2 ? 'healthy' : clusterHealthMap[patient.alert_level],
    nodes: tpl.nodes.map(n => ({
      label: n.label,
      mention_count: Math.max(1, n.base - (patient.alert_level === 'red' ? 5 : patient.alert_level === 'orange' ? 3 : 0)),
      trend: i === 0 ? 'stable' : trendMap[patient.alert_level],
    })),
  }))

  const repPatterns = {
    green: [{ story: 'Story about first grandchild', times_told: 2, concern_level: 'low', type: 'thematic' }],
    yellow: [
      { story: 'Story about retirement party', times_told: 3, concern_level: 'low', type: 'thematic' },
      { story: 'Recipe for apple tart', times_told: 3, concern_level: 'low', type: 'thematic' },
    ],
    orange: [
      { story: 'Story about wedding day', times_told: 5, concern_level: 'moderate', type: 'near_verbatim' },
      { story: 'Anecdote about childhood home', times_told: 4, concern_level: 'moderate', type: 'thematic' },
      { story: 'Description of garden flowers', times_told: 4, concern_level: 'low', type: 'thematic' },
    ],
    red: [
      { story: 'War memory about liberation day', times_told: 8, concern_level: 'high', type: 'verbatim' },
      { story: 'Story about meeting wife', times_told: 7, concern_level: 'high', type: 'verbatim' },
      { story: 'Description of childhood village', times_told: 6, concern_level: 'moderate', type: 'near_verbatim' },
    ],
  }

  const weakening = { green: 0, yellow: 1, orange: 3, red: 5 }
  const isolated = { green: 0, yellow: 1, orange: 2, red: 4 }

  const summaries = {
    green: "Semantic network shows healthy connectivity with stable topic clusters. No significant repetition patterns or lexical erosion. All conversational themes maintain expected richness and variety.",
    yellow: "Semantic network largely intact. Minor weakening detected in peripheral topic bridges. Slight increase in repetition frequency for well-rehearsed autobiographical narratives. Lexical access remains broadly preserved.",
    orange: "Notable fragmentation in semantic network. Multiple bridge connections weakening between topic clusters. Increasing repetition of core autobiographical narratives with near-verbatim reproduction. Proper noun access declining. Generic word substitution emerging.",
    red: "Severe semantic network fragmentation. Core autobiographical narratives being reproduced verbatim across sessions. Significant lexical erosion with frequent generic substitutions. Proper noun retrieval severely impaired. Temporal anchoring disrupted - events from different decades being confused.",
  }

  return {
    network_health: {
      overall: healthMap[patient.alert_level],
      total_clusters: clusters.length,
      weakening_bridges: weakening[patient.alert_level],
      isolated_nodes: isolated[patient.alert_level],
      active_clusters: clusters.length - isolated[patient.alert_level],
    },
    semantic_clusters: clusters,
    repetition_patterns: repPatterns[patient.alert_level] || repPatterns.green,
    temporal_anchoring: {
      precision_trend: patient.alert_level === 'green' || patient.alert_level === 'yellow' ? 'stable' : 'declining',
      temporal_vagueness_instances: { green: 1, yellow: 3, orange: 7, red: 15 }[patient.alert_level] || 0,
    },
    lexical_evolution: {
      generic_substitutions: { green: 0, yellow: 2, orange: 6, red: 14 }[patient.alert_level] || 0,
      proper_noun_failures: { green: 0, yellow: 1, orange: 4, red: 11 }[patient.alert_level] || 0,
      circumlocution_instances: { green: 1, yellow: 3, orange: 8, red: 16 }[patient.alert_level] || 0,
    },
    clinical_summary: summaries[patient.alert_level] || summaries.green,
  }
}

// ─── Memories per patient (20-30 each) ────────────────────────────────

const PATIENT_MEMORIES = {
  'p1-dorothy-mitchell-00a1': [
    { id: 'm1-01', category: 'family', title: 'Wedding day with Harold', description: 'Married Harold Mitchell on June 12, 1975 at St. Patrick\'s Church in Boston. Wore her mother\'s lace veil. Harold was 25 minutes late.', people: ['Harold Mitchell (husband, deceased 2019)'], year: 1975, emotional_weight: 'high' },
    { id: 'm1-02', category: 'family', title: 'Birth of daughter Claire', description: 'Claire was born March 3, 1980 at Mass General Hospital. Weighed 7 lbs 4 oz. Harold fainted in the delivery room.', people: ['Claire Mitchell (daughter)'], year: 1980, emotional_weight: 'high' },
    { id: 'm1-03', category: 'family', title: 'First grandchild, Lily', description: 'Lily was born in 2010. Dorothy drove through a snowstorm to be there. Lily has her grandmother\'s green eyes.', people: ['Lily (granddaughter)', 'Claire Mitchell'], year: 2010, emotional_weight: 'high' },
    { id: 'm1-04', category: 'family', title: 'Second grandchild, James', description: 'James born in 2013. Very active boy, loves dinosaurs. Dorothy reads him stories every Sunday.', people: ['James (grandson)'], year: 2013, emotional_weight: 'high' },
    { id: 'm1-05', category: 'career', title: '35 years at Boston Public Library', description: 'Started as a shelving assistant in 1970, became head librarian by 1992. Organized the children\'s reading program that ran for 20 years.', people: ['Margaret Chen (colleague)'], year: 1970, emotional_weight: 'medium' },
    { id: 'm1-06', category: 'career', title: 'Retirement party', description: 'Retired in 2005. The whole library staff threw a surprise party. Received a first-edition Dickens as a gift.', people: ['Library staff'], year: 2005, emotional_weight: 'medium' },
    { id: 'm1-07', category: 'hobby', title: 'Rose garden', description: 'Has maintained a rose garden since 1985. Grows 14 varieties including her prized David Austin roses. Won the neighborhood garden prize three times.', people: [], year: 1985, emotional_weight: 'medium' },
    { id: 'm1-08', category: 'hobby', title: 'Book club with Eleanor', description: 'Weekly book club every Thursday with Eleanor Barnes and 4 other friends since 1998. Currently reading historical fiction.', people: ['Eleanor Barnes (best friend)'], year: 1998, emotional_weight: 'medium' },
    { id: 'm1-09', category: 'childhood', title: 'Growing up in Vermont', description: 'Born in Burlington, Vermont, 1953. Youngest of three sisters. Family had a small dairy farm. Loved climbing the old maple tree behind the barn.', people: ['Ruth (sister)', 'Betty (sister)'], year: 1953, emotional_weight: 'medium' },
    { id: 'm1-10', category: 'childhood', title: 'Father\'s general store', description: 'Father ran Mitchell\'s General Store on Main Street. Dorothy helped after school counting inventory. Store had the best penny candy in town.', people: ['Thomas Mitchell (father, deceased)'], year: 1960, emotional_weight: 'medium' },
    { id: 'm1-11', category: 'travel', title: 'Trip to Ireland', description: 'Visited Ireland with Harold in 1995 to trace family roots. Found the Mitchell family cottage in County Cork. Harold learned to pour Guinness.', people: ['Harold Mitchell'], year: 1995, emotional_weight: 'medium' },
    { id: 'm1-12', category: 'family', title: 'Harold\'s passing', description: 'Harold passed away in November 2019 after 44 years of marriage. He was in the garden when it happened. Dorothy planted a rose bush in his memory.', people: ['Harold Mitchell'], year: 2019, emotional_weight: 'high' },
    { id: 'm1-13', category: 'daily', title: 'Morning routine', description: 'Wakes at 6:30, makes Earl Grey tea, reads the Boston Globe at the kitchen table. Feeds the birds in the backyard. Has done this for 30 years.', people: [], year: null, emotional_weight: 'low' },
    { id: 'm1-14', category: 'family', title: 'Sunday dinners', description: 'Hosts Sunday dinner for Claire, her husband Mark, and the grandchildren. Always makes her famous pot roast recipe from her mother.', people: ['Claire Mitchell', 'Mark (son-in-law)', 'Lily', 'James'], year: null, emotional_weight: 'medium' },
    { id: 'm1-15', category: 'hobby', title: 'Knitting for charity', description: 'Knits blankets and hats for the children\'s hospital. Has donated over 200 items since she started in 2010.', people: [], year: 2010, emotional_weight: 'low' },
    { id: 'm1-16', category: 'pet', title: 'Cat named Biscuit', description: 'Adopted a tabby cat named Biscuit in 2020 after Harold passed. Biscuit sleeps on Harold\'s side of the bed.', people: [], year: 2020, emotional_weight: 'medium' },
    { id: 'm1-17', category: 'travel', title: 'Road trip to Maine', description: 'Annual summer trip to a cabin in Bar Harbor, Maine with Harold for 30 years. Still goes with Claire now. Loves watching the sunrise over Cadillac Mountain.', people: ['Harold Mitchell', 'Claire Mitchell'], year: 1989, emotional_weight: 'medium' },
    { id: 'm1-18', category: 'childhood', title: 'Mother\'s apple pie', description: 'Mother baked apple pie every Saturday. Dorothy has the recipe written in her mother\'s handwriting. She makes it for Thanksgiving every year.', people: ['Helen Mitchell (mother, deceased)'], year: 1960, emotional_weight: 'high' },
    { id: 'm1-19', category: 'health', title: 'Hip replacement', description: 'Had hip replacement surgery in 2022. Recovered well. Physical therapy at the Y three times a week. Now walks 2 miles daily.', people: ['Dr. Patel (surgeon)'], year: 2022, emotional_weight: 'low' },
    { id: 'm1-20', category: 'family', title: 'Lily\'s piano recital', description: 'Lily performed at her first piano recital in 2022. Played Fur Elise. Dorothy cried. Has the video saved on her phone.', people: ['Lily (granddaughter)'], year: 2022, emotional_weight: 'high' },
    { id: 'm1-21', category: 'community', title: 'Church choir', description: 'Sings in the choir at St. Patrick\'s every Sunday since 1976. Alto section. Favorite hymn is Amazing Grace.', people: ['Father O\'Brien'], year: 1976, emotional_weight: 'medium' },
    { id: 'm1-22', category: 'family', title: 'Harold\'s navy stories', description: 'Harold served in the Navy 1968-1972. Loved telling the story about the time his ship docked in Naples and he ate the best pizza of his life.', people: ['Harold Mitchell'], year: 1970, emotional_weight: 'medium' },
  ],
  'p2-robert-henderson-00b2': [
    { id: 'm2-01', category: 'career', title: '38 years teaching history', description: 'Taught American History at Lincoln High School in Chicago from 1968 to 2006. Favorite period: Civil War era. Students called him "Mr. H."', people: ['Lincoln High students'], year: 1968, emotional_weight: 'high' },
    { id: 'm2-02', category: 'family', title: 'Marriage to Barbara', description: 'Married Barbara Chen in 1970. Met at a Vietnam War protest at University of Chicago. She was holding a "Give Peace a Chance" sign.', people: ['Barbara Henderson (wife)'], year: 1970, emotional_weight: 'high' },
    { id: 'm2-03', category: 'family', title: 'Son Anthony born', description: 'Anthony born December 1973. First word was "book." Robert read him history stories instead of fairy tales.', people: ['Anthony Henderson (son)'], year: 1973, emotional_weight: 'high' },
    { id: 'm2-04', category: 'family', title: 'Daughter Susan born', description: 'Susan born in 1976. Much more athletic than Anthony. Played softball through college. Lives in Seattle now.', people: ['Susan Henderson (daughter)'], year: 1976, emotional_weight: 'high' },
    { id: 'm2-05', category: 'career', title: 'Teacher of the Year', description: 'Won Illinois Teacher of the Year in 1994. Governor shook his hand. Barbara framed the certificate — it\'s still in the hallway.', people: ['Barbara Henderson'], year: 1994, emotional_weight: 'high' },
    { id: 'm2-06', category: 'hobby', title: 'Chess at the park', description: 'Plays chess every Saturday at Grant Park with his friend Walter. Been doing it since 1985. Walter still can\'t beat him.', people: ['Walter Kowalski (friend)'], year: 1985, emotional_weight: 'medium' },
    { id: 'm2-07', category: 'childhood', title: 'Growing up on the South Side', description: 'Born and raised on Chicago\'s South Side. Father was a steelworker at US Steel. Mother was a nurse at Cook County Hospital.', people: ['Robert Sr. (father, deceased)', 'Evelyn (mother, deceased)'], year: 1944, emotional_weight: 'medium' },
    { id: 'm2-08', category: 'childhood', title: 'Brother James', description: 'Brother James was 3 years older. They shared a room. James taught him to play catch. James passed away in 2015 from cancer.', people: ['James Henderson (brother, deceased)'], year: 1950, emotional_weight: 'high' },
    { id: 'm2-09', category: 'travel', title: 'Trip to Gettysburg', description: 'Took his class to Gettysburg every spring for 25 years. Would stand on Cemetery Ridge and recite Lincoln\'s address from memory. Students were always moved.', people: ['Lincoln High students'], year: 1980, emotional_weight: 'high' },
    { id: 'm2-10', category: 'hobby', title: 'Baseball — lifelong Cubs fan', description: 'Season ticket holder since 1988. Was at Wrigley Field when they won the 2016 World Series. Cried openly. Still has the ticket stub.', people: ['Anthony Henderson', 'Walter Kowalski'], year: 2016, emotional_weight: 'high' },
    { id: 'm2-11', category: 'family', title: 'Barbara\'s cooking', description: 'Barbara makes the best Chinese dumplings from her mother\'s recipe. Sunday dumpling-making is a family tradition. Robert is in charge of folding.', people: ['Barbara Henderson'], year: null, emotional_weight: 'medium' },
    { id: 'm2-12', category: 'career', title: 'The history book collection', description: 'Has over 2,000 history books in his study. Organized by era. Favorites are worn from re-reading. Wants to donate them to Lincoln High.', people: [], year: null, emotional_weight: 'medium' },
    { id: 'm2-13', category: 'family', title: 'Granddaughter Emily', description: 'Anthony\'s daughter Emily, born 2008. She\'s studying pre-med. Robert is incredibly proud. Calls him "Grandpa Professor."', people: ['Emily Henderson (granddaughter)'], year: 2008, emotional_weight: 'high' },
    { id: 'm2-14', category: 'health', title: 'Knee surgery', description: 'Had knee replacement in 2020. Recovery was tough. Barbara pushed him to do physical therapy. Walking fine now with occasional stiffness.', people: ['Barbara Henderson', 'Dr. Kim (surgeon)'], year: 2020, emotional_weight: 'low' },
    { id: 'm2-15', category: 'daily', title: 'Morning coffee ritual', description: 'Reads three newspapers every morning: Tribune, Sun-Times, and the New York Times. Black coffee, two cups. Has the same mug from 1990.', people: [], year: null, emotional_weight: 'low' },
    { id: 'm2-16', category: 'hobby', title: 'Woodworking', description: 'Built a bookshelf for every room in the house. Made a rocking horse for Emily when she was born. Workshop in the garage.', people: ['Emily Henderson'], year: 2000, emotional_weight: 'medium' },
    { id: 'm2-17', category: 'travel', title: 'Washington DC trip', description: 'Took the whole family to DC in 2005. Spent 3 hours at the Lincoln Memorial. Anthony had to drag him away from the National Archives.', people: ['Barbara Henderson', 'Anthony Henderson', 'Susan Henderson'], year: 2005, emotional_weight: 'medium' },
    { id: 'm2-18', category: 'community', title: 'Tutoring at-risk youth', description: 'Volunteers at the Boys & Girls Club tutoring history and reading since retirement. Goes every Tuesday and Thursday.', people: [], year: 2006, emotional_weight: 'medium' },
    { id: 'm2-19', category: 'family', title: 'Barbara\'s health scare', description: 'Barbara had breast cancer in 2018. Surgery and treatment were successful. Robert cooked every meal for 6 months. Says it made them closer.', people: ['Barbara Henderson'], year: 2018, emotional_weight: 'high' },
    { id: 'm2-20', category: 'childhood', title: 'Father\'s jazz records', description: 'Father had a collection of jazz vinyl records. Miles Davis, Coltrane, Ellington. Robert inherited them. Still plays them on the original turntable.', people: ['Robert Sr. (father)'], year: 1955, emotional_weight: 'medium' },
    { id: 'm2-21', category: 'career', title: 'Retirement speech', description: 'Gave a 20-minute retirement speech quoting Lincoln, FDR, and MLK. The entire auditorium gave a standing ovation. Former students came back.', people: ['Lincoln High staff'], year: 2006, emotional_weight: 'high' },
    { id: 'm2-22', category: 'family', title: '50th wedding anniversary', description: 'Celebrated 50 years with Barbara in 2020. Small family gathering due to COVID. Anthony arranged a Zoom with former students.', people: ['Barbara Henderson', 'Anthony Henderson', 'Susan Henderson'], year: 2020, emotional_weight: 'high' },
    { id: 'm2-23', category: 'daily', title: 'Evening walk with Barbara', description: 'Takes a 30-minute walk with Barbara every evening after dinner. Same route through the neighborhood. Knows every neighbor by name.', people: ['Barbara Henderson'], year: null, emotional_weight: 'low' },
  ],
  'p3-margaret-sullivan-00c3': [
    { id: 'm3-01', category: 'career', title: '30 years in education', description: 'Started as an English teacher, became principal of Westlake Elementary in San Francisco in 1988. Ran the school for 22 years until retirement in 2010.', people: ['Westlake staff'], year: 1980, emotional_weight: 'high' },
    { id: 'm3-02', category: 'family', title: 'Marriage to Patrick', description: 'Married Patrick Sullivan in 1962. He was an electrician. They built their house on Noe Valley together, literally — Patrick did the wiring.', people: ['Patrick Sullivan (husband, deceased 2017)'], year: 1962, emotional_weight: 'high' },
    { id: 'm3-03', category: 'family', title: 'Three children', description: 'Had three children: Michael (1964), Karen (1967), and Timothy (1970). Karen lives closest and visits most often. Timothy is a doctor in Portland.', people: ['Michael Sullivan (son)', 'Karen Sullivan (daughter)', 'Timothy Sullivan (son)'], year: 1964, emotional_weight: 'high' },
    { id: 'm3-04', category: 'family', title: 'Granddaughter Sophie', description: 'Sophie is Karen\'s daughter, born 1995. Named after Margaret\'s mother. Sophie is a graphic designer and visits every weekend.', people: ['Sophie Sullivan (granddaughter)'], year: 1995, emotional_weight: 'high' },
    { id: 'm3-05', category: 'childhood', title: 'Growing up in the Mission', description: 'Born in San Francisco\'s Mission District in 1936. Father was a longshoreman. Mother sewed dresses. House always smelled of her mother\'s soda bread.', people: ['Frank (father, deceased)', 'Sophie (mother, deceased)'], year: 1936, emotional_weight: 'medium' },
    { id: 'm3-06', category: 'career', title: 'Reading program she created', description: 'Created the "Every Child Reads" program in 1992. Raised literacy rates at Westlake by 40%. Program was adopted by 15 other schools.', people: ['Westlake teachers'], year: 1992, emotional_weight: 'high' },
    { id: 'm3-07', category: 'family', title: 'Patrick\'s passing', description: 'Patrick passed away in 2017 from heart failure. They were married 55 years. Margaret still sets two places at dinner sometimes.', people: ['Patrick Sullivan'], year: 2017, emotional_weight: 'high' },
    { id: 'm3-08', category: 'hobby', title: 'Painting watercolors', description: 'Took up watercolor painting in retirement. Paints the view from her window — the city skyline. Has sold a few at the neighborhood art fair.', people: [], year: 2010, emotional_weight: 'medium' },
    { id: 'm3-09', category: 'travel', title: 'Trip to Italy with Patrick', description: 'Traveled to Italy in 2000 for their anniversary. Spent two weeks in Tuscany. Patrick learned to make pasta from a grandmother in Siena.', people: ['Patrick Sullivan'], year: 2000, emotional_weight: 'high' },
    { id: 'm3-10', category: 'childhood', title: 'The 1952 earthquake', description: 'Remembers the 1957 earthquake vividly. The dishes fell out of the cabinet. Mother gathered all the children under the dining table. Nobody was hurt.', people: ['Frank (father)', 'Sophie (mother)'], year: 1957, emotional_weight: 'medium' },
    { id: 'm3-11', category: 'community', title: 'St. Mary\'s parish', description: 'Active member of St. Mary\'s for 60 years. Organized the annual Christmas bazaar for three decades. Knows everyone at the 9am Mass.', people: ['Father Rodriguez'], year: 1965, emotional_weight: 'medium' },
    { id: 'm3-12', category: 'family', title: 'Six grandchildren', description: 'Has six grandchildren total. Sophie visits the most. Christmas gathering is always at Margaret\'s house. She insists on cooking everything herself.', people: ['All grandchildren'], year: null, emotional_weight: 'high' },
    { id: 'm3-13', category: 'daily', title: 'Tea at 3pm', description: 'Has Irish Breakfast tea at exactly 3pm every day with two digestive biscuits. Watches the hummingbirds at the feeder from the kitchen window.', people: [], year: null, emotional_weight: 'low' },
    { id: 'm3-14', category: 'hobby', title: 'Crossword puzzles', description: 'Does the San Francisco Chronicle crossword every morning in pen. Has done it since 1975. Getting harder lately but won\'t switch to pencil.', people: [], year: 1975, emotional_weight: 'low' },
    { id: 'm3-15', category: 'career', title: 'The difficult parent meeting', description: 'Favorite story: handled an angry parent in 1995 by inviting them to teach the class for a day. Parent became a school volunteer for 10 years.', people: [], year: 1995, emotional_weight: 'medium' },
    { id: 'm3-16', category: 'family', title: 'Michael\'s wedding', description: 'Michael married Jennifer in 1990. Beautiful outdoor ceremony in Napa Valley. Patrick gave a toast that made everyone cry.', people: ['Michael Sullivan', 'Patrick Sullivan'], year: 1990, emotional_weight: 'high' },
    { id: 'm3-17', category: 'health', title: 'Cataract surgery', description: 'Had cataract surgery in both eyes in 2021. Was nervous but recovery was quick. Says colors look brighter now, which helps with painting.', people: ['Dr. Wong (ophthalmologist)'], year: 2021, emotional_weight: 'low' },
    { id: 'm3-18', category: 'pet', title: 'Dog named Seamus', description: 'Had an Irish Setter named Seamus for 14 years. Patrick named him. Seamus went everywhere with them. Passed away in 2016.', people: ['Patrick Sullivan'], year: 2002, emotional_weight: 'medium' },
    { id: 'm3-19', category: 'childhood', title: 'Learning to read', description: 'Mother taught her to read at age 4 using newspapers. This inspired her entire career in education. "Reading opens every door," she always says.', people: ['Sophie (mother)'], year: 1940, emotional_weight: 'high' },
    { id: 'm3-20', category: 'travel', title: 'Trip to Ireland', description: 'Took the whole family to Ireland in 2005 to visit Sullivan family roots in County Kerry. Found gravestones with the family name from the 1800s.', people: ['Patrick Sullivan', 'Michael', 'Karen', 'Timothy'], year: 2005, emotional_weight: 'medium' },
    { id: 'm3-21', category: 'community', title: 'Neighborhood watch captain', description: 'Was neighborhood watch captain for 15 years. Organized block parties every summer. Still knows every family on the street.', people: ['Neighbors'], year: 1990, emotional_weight: 'low' },
    { id: 'm3-22', category: 'family', title: 'Sophie\'s graduation', description: 'Sophie graduated from CalArts in 2017. Margaret sat front row. Cried when Sophie\'s name was called. Has the graduation photo framed by her bed.', people: ['Sophie Sullivan'], year: 2017, emotional_weight: 'high' },
    { id: 'm3-23', category: 'hobby', title: 'Baking Irish soda bread', description: 'Makes her mother\'s Irish soda bread recipe every Sunday. Same recipe for 70+ years. Timothy says no bakery can match it.', people: ['Timothy Sullivan'], year: null, emotional_weight: 'medium' },
    { id: 'm3-24', category: 'daily', title: 'Phone call with Karen', description: 'Karen calls every evening at 7pm. They talk about the day, the grandchildren, what\'s on television. Margaret says it\'s the best part of her day.', people: ['Karen Sullivan'], year: null, emotional_weight: 'medium' },
  ],
  'p4-henry-carpenter-00d4': [
    { id: 'm4-01', category: 'military', title: 'Korean War service', description: 'Served in the Army 1951-1953. Was a radio operator in the 2nd Infantry Division. Stationed near the 38th parallel. Lost two close friends there.', people: ['Sgt. Bill Thompson (friend, deceased)', 'Pvt. Eddie Ruiz (friend, deceased)'], year: 1951, emotional_weight: 'high' },
    { id: 'm4-02', category: 'family', title: 'Marriage to Eleanor', description: 'Married Eleanor Wright in 1955 after returning from Korea. She was a nurse at Walter Reed. Met at a USO dance. "She was the prettiest girl in the room."', people: ['Eleanor Carpenter (wife, deceased 2020)'], year: 1955, emotional_weight: 'high' },
    { id: 'm4-03', category: 'family', title: 'Son Philip born', description: 'Philip born in 1958 in Washington DC. Named after Henry\'s father. Philip became an attorney. Lives 20 minutes away and visits twice a week.', people: ['Philip Carpenter (son)'], year: 1958, emotional_weight: 'high' },
    { id: 'm4-04', category: 'family', title: 'Daughter Catherine born', description: 'Catherine born in 1961. Became a schoolteacher like her grandmother. Lives in Virginia with her family. Visits monthly.', people: ['Catherine Carpenter (daughter)'], year: 1961, emotional_weight: 'high' },
    { id: 'm4-05', category: 'career', title: '40 years at the Post Office', description: 'Worked at the US Postal Service from 1954 to 1994. Started as a mail carrier, became postmaster of the Georgetown branch. Never missed a day of work in 40 years.', people: ['Georgetown branch staff'], year: 1954, emotional_weight: 'high' },
    { id: 'm4-06', category: 'childhood', title: 'Growing up in DC', description: 'Born in Washington DC in 1931. Grew up in Georgetown when it was a working-class neighborhood. Father was a carpenter — the family name fit perfectly.', people: ['Philip Sr. (father, deceased)', 'Mary (mother, deceased)'], year: 1931, emotional_weight: 'medium' },
    { id: 'm4-07', category: 'childhood', title: 'The Depression years', description: 'Family struggled during the Depression. Father took any job available. Mother grew vegetables in the backyard. Henry learned to never waste food.', people: ['Philip Sr. (father)', 'Mary (mother)'], year: 1935, emotional_weight: 'medium' },
    { id: 'm4-08', category: 'military', title: 'Coming home from Korea', description: 'Arrived home on a transport ship in San Francisco, then train to DC. Mother was waiting at Union Station. "She looked like she\'d aged ten years."', people: ['Mary (mother)'], year: 1953, emotional_weight: 'high' },
    { id: 'm4-09', category: 'family', title: 'Eleanor\'s passing', description: 'Eleanor passed in January 2020 after 65 years of marriage. She had Alzheimer\'s herself in her last years. Henry cared for her at home until the end.', people: ['Eleanor Carpenter'], year: 2020, emotional_weight: 'high' },
    { id: 'm4-10', category: 'hobby', title: 'Fishing on the Potomac', description: 'Has fished on the Potomac River every weekend since the 1960s. Same spot near Great Falls. Taught Philip and Catherine to fish there.', people: ['Philip Carpenter', 'Catherine Carpenter'], year: 1965, emotional_weight: 'medium' },
    { id: 'm4-11', category: 'family', title: 'Five grandchildren', description: 'Has five grandchildren. Philip\'s three: David, Sarah, and Michael. Catherine\'s two: Anna and Thomas. David is in the Army, following in Henry\'s footsteps.', people: ['David', 'Sarah', 'Michael', 'Anna', 'Thomas'], year: null, emotional_weight: 'high' },
    { id: 'm4-12', category: 'community', title: 'VFW Post regular', description: 'Member of VFW Post 162 since 1953. Goes every Wednesday. Fewer and fewer Korean War vets left. He\'s one of the last.', people: ['VFW members'], year: 1953, emotional_weight: 'medium' },
    { id: 'm4-13', category: 'daily', title: 'Morning flag raising', description: 'Raises the American flag outside his house every morning at 7am and takes it down at sunset. Has done this every single day since 1955.', people: [], year: 1955, emotional_weight: 'medium' },
    { id: 'm4-14', category: 'hobby', title: 'Model trains', description: 'Built an elaborate model train set in the basement. The layout covers an 8x12 foot table. Grandchildren love watching it. Each car has a story.', people: ['Grandchildren'], year: 1975, emotional_weight: 'medium' },
    { id: 'm4-15', category: 'family', title: 'Eleanor\'s garden', description: 'Eleanor planted a garden of dahlias and zinnias. After she passed, Philip took over tending it. Henry sits in the garden every afternoon.', people: ['Eleanor Carpenter', 'Philip Carpenter'], year: null, emotional_weight: 'high' },
    { id: 'm4-16', category: 'travel', title: 'Trip back to Korea', description: 'Returned to South Korea in 2003 for the 50th anniversary of the armistice. The country was unrecognizable. A Korean family thanked him and wept.', people: [], year: 2003, emotional_weight: 'high' },
    { id: 'm4-17', category: 'career', title: 'The blizzard of 1978', description: 'Delivered mail during the blizzard of 1978 when no one else would go out. Made every stop on his route. Became a legend at the post office.', people: [], year: 1978, emotional_weight: 'medium' },
    { id: 'm4-18', category: 'family', title: 'Dancing with Eleanor', description: 'Used to dance with Eleanor every Friday night at the Officers\' Club, then later at home. Their song was "Unforgettable" by Nat King Cole.', people: ['Eleanor Carpenter'], year: 1960, emotional_weight: 'high' },
    { id: 'm4-19', category: 'childhood', title: 'Pearl Harbor announcement', description: 'Was 10 years old when Pearl Harbor was attacked. Remembers his father listening to the radio, mother crying. "That\'s when everything changed."', people: ['Philip Sr. (father)', 'Mary (mother)'], year: 1941, emotional_weight: 'high' },
    { id: 'm4-20', category: 'health', title: 'Heart surgery in 2015', description: 'Had triple bypass surgery in 2015. Eleanor refused to leave the hospital. Philip slept in the waiting room for three nights.', people: ['Eleanor Carpenter', 'Philip Carpenter'], year: 2015, emotional_weight: 'medium' },
    { id: 'm4-21', category: 'family', title: 'Great-grandchild', description: 'David\'s son, Henry Jr., born in 2024. Named after him. Henry held the baby and said "Now I can go in peace." Philip told him to stop being dramatic.', people: ['David (grandson)', 'Henry Jr. (great-grandson)'], year: 2024, emotional_weight: 'high' },
    { id: 'm4-22', category: 'daily', title: 'Philip\'s visits', description: 'Philip visits every Tuesday and Saturday. They watch old war movies together. Philip brings groceries and pretends Henry doesn\'t notice.', people: ['Philip Carpenter'], year: null, emotional_weight: 'medium' },
    { id: 'm4-23', category: 'military', title: 'The radio that saved lives', description: 'During an ambush, Henry\'s radio call brought in artillery support that saved his platoon. Received the Bronze Star. Never talks about it unless asked.', people: ['2nd Infantry Division'], year: 1952, emotional_weight: 'high' },
    { id: 'm4-24', category: 'hobby', title: 'Birdwatching', description: 'Started birdwatching with Eleanor in the 1990s. Can identify 40+ species by sound alone. Keeps a notebook of sightings dating back to 1995.', people: ['Eleanor Carpenter'], year: 1995, emotional_weight: 'low' },
    { id: 'm4-25', category: 'community', title: 'Memorial Day speeches', description: 'Gave the Memorial Day speech at the VFW for 30 consecutive years. Always ended with the names of his fallen friends. Stopped in 2022.', people: ['Bill Thompson', 'Eddie Ruiz'], year: 1975, emotional_weight: 'high' },
  ],
  'p5-jean-parker-00e5': [
    { id: 'm5-01', category: 'career', title: '30 years in banking', description: 'Worked at Chase Manhattan, then JPMorgan after the merger. Started as a teller in 1988, retired as VP of operations in 2023. "I counted other people\'s money for a living."', people: ['JPMorgan colleagues'], year: 1988, emotional_weight: 'medium' },
    { id: 'm5-02', category: 'family', title: 'Marriage to David', description: 'Married David Parker in 1985. He\'s a retired electrician. Still together, 40 years this year. "We argue about the thermostat and nothing else."', people: ['David Parker (husband)'], year: 1985, emotional_weight: 'high' },
    { id: 'm5-03', category: 'family', title: 'Daughter Emma', description: 'Emma born in 1990. Works in healthcare administration. She\'s the one who enrolled Jean in this program. "She worries more than I do."', people: ['Emma Parker (daughter)'], year: 1990, emotional_weight: 'high' },
    { id: 'm5-04', category: 'family', title: 'Son Kevin', description: 'Kevin born in 1993. Software engineer in Austin. Calls every Sunday. Comes home for Thanksgiving. Teaching Jean to use FaceTime.', people: ['Kevin Parker (son)'], year: 1993, emotional_weight: 'high' },
    { id: 'm5-05', category: 'childhood', title: 'Growing up in Queens', description: 'Born and raised in Flushing, Queens. Daughter of Greek immigrants. Real name is Eugenia but nobody could pronounce it, so she became Jean.', people: ['Nikos (father, deceased)', 'Maria (mother)'], year: 1958, emotional_weight: 'medium' },
    { id: 'm5-06', category: 'childhood', title: 'Father\'s diner', description: 'Father ran "Nick\'s Diner" on Northern Blvd. Jean worked there after school. Could make a perfect Greek salad by age 10. Diner closed in 1995.', people: ['Nikos (father)'], year: 1968, emotional_weight: 'high' },
    { id: 'm5-07', category: 'hobby', title: 'Running', description: 'Started running at 45 during a midlife crisis. Has completed 8 half-marathons and 2 full marathons. NYC Marathon in 2012 was her proudest moment.', people: [], year: 2003, emotional_weight: 'high' },
    { id: 'm5-08', category: 'hobby', title: 'Greek cooking', description: 'Makes traditional Greek dishes from memory — moussaka, spanakopita, baklava. Hosts Greek Easter every year. The whole block comes for the lamb.', people: ['Maria (mother)', 'Neighbors'], year: null, emotional_weight: 'medium' },
    { id: 'm5-09', category: 'family', title: 'Mother Maria, still alive at 92', description: 'Mother Maria lives in assisted living in Queens. Jean visits every Thursday. They speak Greek together. Maria still corrects Jean\'s accent.', people: ['Maria (mother)'], year: null, emotional_weight: 'high' },
    { id: 'm5-10', category: 'travel', title: 'Greece trip with David', description: 'Took David to Greece in 2010 to meet extended family in Thessaloniki. David tried to speak Greek and ordered "shoes" instead of "wine."', people: ['David Parker', 'Greek relatives'], year: 2010, emotional_weight: 'high' },
    { id: 'm5-11', category: 'daily', title: 'Morning yoga', description: 'Does yoga every morning at 6:30am in the living room. Started during COVID lockdown. David calls her "the pretzel."', people: ['David Parker'], year: 2020, emotional_weight: 'low' },
    { id: 'm5-12', category: 'family', title: 'Emma\'s wedding', description: 'Emma married Jake in 2022. Beautiful ceremony at a vineyard in the Hudson Valley. Jean danced to "My Girl" with David. Cried during her speech.', people: ['Emma Parker', 'Jake (son-in-law)'], year: 2022, emotional_weight: 'high' },
    { id: 'm5-13', category: 'community', title: 'Volunteering at food bank', description: 'Volunteers at the local food bank every Wednesday since retirement. Sorts donations and helps with distribution. "Keeps me useful."', people: ['Food bank team'], year: 2023, emotional_weight: 'medium' },
    { id: 'm5-14', category: 'hobby', title: 'Book club', description: 'Joined a book club in 2023. Meets monthly at the local library. Currently reading historical fiction about WWII. Loves the discussions.', people: ['Book club members'], year: 2023, emotional_weight: 'low' },
    { id: 'm5-15', category: 'pet', title: 'Dog named Baxter', description: 'Adopted a golden retriever named Baxter in 2021. He\'s her running buddy now. David pretends to be jealous of the dog.', people: ['David Parker'], year: 2021, emotional_weight: 'medium' },
    { id: 'm5-16', category: 'family', title: 'Kevin\'s first job', description: 'Kevin got his first tech job at 22 and immediately offered to pay for his parents\' vacation. Jean framed the email. "That\'s when I knew we raised him right."', people: ['Kevin Parker'], year: 2015, emotional_weight: 'medium' },
    { id: 'm5-17', category: 'childhood', title: 'Greek Orthodox church', description: 'Attended Holy Cross Greek Orthodox Church every Sunday growing up. Sang in the choir. Still goes for Easter and Christmas. Lights a candle for her father.', people: ['Nikos (father)'], year: 1965, emotional_weight: 'medium' },
    { id: 'm5-18', category: 'career', title: 'The 2008 financial crisis', description: 'Was at JPMorgan during the 2008 crash. Worked 80-hour weeks for months. "I saw grown men cry at their desks." Made her appreciate job security.', people: ['JPMorgan colleagues'], year: 2008, emotional_weight: 'medium' },
    { id: 'm5-19', category: 'travel', title: 'Road trip with Emma', description: 'Drove cross-country with Emma in 2019 — NYC to San Francisco. Two weeks, no plan. Grand Canyon was the highlight. "Best trip of my life."', people: ['Emma Parker'], year: 2019, emotional_weight: 'high' },
    { id: 'm5-20', category: 'health', title: 'Retirement health checkup', description: 'Doctor said she\'s in excellent health for her age. Blood pressure perfect. "Running pays off." Emma enrolled her in this program as a precaution.', people: ['Emma Parker', 'Dr. Stevens'], year: 2025, emotional_weight: 'low' },
    { id: 'm5-21', category: 'daily', title: 'Coffee with David', description: 'Every morning at 7am, she and David have coffee together on the porch. They\'ve done this since 1985. "Even when we weren\'t talking, we had coffee."', people: ['David Parker'], year: null, emotional_weight: 'medium' },
    { id: 'm5-22', category: 'family', title: 'Expecting first grandchild', description: 'Emma is expecting a baby in spring 2026. Jean is already knitting booties. Has been reading parenting books "just in case Emma asks."', people: ['Emma Parker', 'Jake (son-in-law)'], year: 2026, emotional_weight: 'high' },
  ],
}

// ─── Calls schedule generation ────────────────────────────────────────

function generateUpcomingCalls(patient, memories) {
  const calls = []
  const now = new Date()
  const topics = memories.filter(m => m.emotional_weight === 'high' || m.emotional_weight === 'medium')

  for (let i = 0; i < 14; i++) {
    const callDate = new Date(now.getTime() + i * 86400000)
    const dayOfWeek = callDate.getDay()
    if (dayOfWeek === 0) continue // skip Sundays

    const topicIdx = i % topics.length
    const topic = topics[topicIdx]
    const [hours, minutes] = patient.call_schedule.time.split(':').map(Number)

    calls.push({
      id: `call-${patient.patient_id}-${i}`,
      date: callDate.toISOString().split('T')[0],
      time: patient.call_schedule.time,
      datetime: new Date(callDate.getFullYear(), callDate.getMonth(), callDate.getDate(), hours, minutes).toISOString(),
      status: i === 0 ? 'today' : i < 3 ? 'upcoming' : 'scheduled',
      planned_topic: topic.title,
      planned_category: topic.category,
      conversation_goal: i % 3 === 0 ? 'free_recall' : i % 3 === 1 ? 'cued_recall' : 'emotional_engagement',
      memory_ref: topic.id,
      notes: i === 0 ? `Today's call will focus on ${topic.title}. The AI will gently explore this memory to assess recall detail and emotional engagement.` : null,
    })
  }
  return calls
}

// ─── Notifications generation ────────────────────────────────────────

function generateNotifications(patient) {
  const notifications = []
  const now = new Date()

  const templates = {
    green: [
      { type: 'report', title: 'Weekly report ready', desc: `${patient.first_name}'s weekly analysis is available. All indicators within normal range.`, icon: 'file-text', color: 'text-emerald-400' },
      { type: 'call', title: 'Call completed successfully', desc: `Today's conversation with ${patient.first_name} lasted 12 minutes. Rich recall and engagement observed.`, icon: 'phone', color: 'text-blue-400' },
      { type: 'system', title: 'Monitoring running smoothly', desc: `All systems normal. Next call scheduled for tomorrow at ${patient.call_schedule.time}.`, icon: 'check-circle', color: 'text-emerald-400' },
      { type: 'memory', title: 'New memory added', desc: `A new memory was added to ${patient.first_name}'s profile to enrich upcoming conversations.`, icon: 'heart', color: 'text-violet-400' },
      { type: 'call', title: 'Tomorrow\'s call scheduled', desc: `Call scheduled for ${patient.call_schedule.time}. Topic: life memories and recent events.`, icon: 'calendar', color: 'text-blue-400' },
    ],
    yellow: [
      { type: 'alert', title: 'Alert level updated to Yellow', desc: `${patient.first_name}'s composite score has shifted. Subtle speech pattern changes detected.`, icon: 'alert-triangle', color: 'text-yellow-400' },
      { type: 'report', title: 'Weekly report — monitor closely', desc: `Mild changes in memory recall patterns detected this week. Review the full report.`, icon: 'file-text', color: 'text-yellow-400' },
      { type: 'call', title: 'Call completed', desc: `${patient.first_name} had a good conversation today. Slightly longer pauses noted during recall.`, icon: 'phone', color: 'text-blue-400' },
      { type: 'recommendation', title: 'Consider follow-up', desc: `Based on recent trends, a follow-up with ${patient.first_name}'s doctor may be helpful.`, icon: 'heart', color: 'text-rose-400' },
      { type: 'memory', title: 'Memory update suggested', desc: `Adding more recent memories could help assess short-term recall more effectively.`, icon: 'heart', color: 'text-violet-400' },
    ],
    orange: [
      { type: 'alert', title: 'Alert level elevated to Orange', desc: `Significant changes in ${patient.first_name}'s speech patterns. Medical consultation recommended.`, icon: 'alert-triangle', color: 'text-orange-400' },
      { type: 'report', title: 'Weekly report — attention needed', desc: `Multiple cognitive domains showing decline. Word-finding difficulty observed.`, icon: 'file-text', color: 'text-orange-400' },
      { type: 'recommendation', title: 'Schedule medical consultation', desc: `We recommend scheduling an appointment with ${patient.first_name}'s healthcare provider.`, icon: 'heart', color: 'text-rose-400' },
      { type: 'call', title: 'Conversation approach adapted', desc: `Questions simplified to reduce frustration. More cued recall prompts will be used.`, icon: 'phone', color: 'text-blue-400' },
      { type: 'system', title: 'Monitoring frequency increased', desc: `Due to recent changes, monitoring sensitivity has been increased.`, icon: 'activity', color: 'text-orange-400' },
    ],
    red: [
      { type: 'alert', title: 'Critical alert — immediate attention', desc: `${patient.first_name}'s score crossed the critical threshold. Multiple domains severely affected.`, icon: 'alert-circle', color: 'text-red-400' },
      { type: 'report', title: 'Urgent weekly report available', desc: `Significant multi-domain decline. Discourse coherence and memory recall severely impacted.`, icon: 'file-text', color: 'text-red-400' },
      { type: 'recommendation', title: 'Urgent medical consultation required', desc: `Immediate consultation with ${patient.first_name}'s healthcare provider is strongly recommended.`, icon: 'heart', color: 'text-red-400' },
      { type: 'call', title: 'Call adaptation applied', desc: `Conversation approach simplified. Emotional engagement prioritized over factual recall.`, icon: 'phone', color: 'text-blue-400' },
      { type: 'alert', title: 'Cascade progression detected', desc: `AD linguistic cascade progressed to Stage 2. Syntactic simplification confirmed.`, icon: 'alert-circle', color: 'text-red-400' },
      { type: 'system', title: 'High-priority monitoring active', desc: `${patient.first_name} flagged for high-priority monitoring with daily analysis.`, icon: 'activity', color: 'text-red-400' },
    ],
  }

  const alertNotifs = templates[patient.alert_level] || templates.green

  alertNotifs.forEach((notif, i) => {
    const hoursAgo = i * 14 + (i % 3) * 5
    notifications.push({
      id: `n-${patient.patient_id}-${i}`,
      ...notif,
      timestamp: new Date(now.getTime() - hoursAgo * 3600000).toISOString(),
      read: i > 2,
      patient_id: patient.patient_id,
      patient_name: patient.first_name,
    })
  })

  return notifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
}

// ─── Patient Situation Summaries ──────────────────────────────────────

const PATIENT_SUMMARIES = {
  'p1-dorothy-mitchell-00a1': {
    status: 'stable',
    statusColor: 'emerald',
    headline: 'Dorothy is doing well. All cognitive indicators are within normal range.',
    keyObservations: [
      'Rich vocabulary and detailed storytelling maintained across all sessions',
      'Excellent recall of grandchildren\'s activities and recent family events',
      'Rose garden descriptions remain vivid and emotionally engaged',
      'No word-finding difficulties or unusual pauses detected',
    ],
    trendSummary: 'Composite score has been stable for 18 monitoring sessions with no downward drift. All 5 cognitive domains remain within healthy baseline variation.',
    riskLevel: 'Low risk — 8% probability of early cognitive changes based on cohort matching',
    nextSteps: [
      { priority: 'routine', text: 'Continue standard monitoring — daily calls at 9:00 AM EST' },
      { priority: 'routine', text: 'Next weekly report available in 3 days' },
      { priority: 'suggested', text: 'Add recent memories about Lily\'s school activities to keep conversations fresh' },
      { priority: 'suggested', text: 'Annual cognitive screening recommended (last: 6 months ago)' },
    ],
    doctorNote: 'No clinical concerns at this time. Dorothy\'s linguistic profile is consistent with healthy aging. Continue routine monitoring.',
  },
  'p2-robert-henderson-00b2': {
    status: 'monitor',
    statusColor: 'yellow',
    headline: 'Robert shows subtle changes in speech patterns. Close monitoring recommended.',
    keyObservations: [
      'Slight increase in word-finding pauses during history discussions',
      'Occasional repetition of the Gettysburg teaching story (told 3 times this month)',
      'Response latency has increased by ~15% from baseline over 6 weeks',
      'Still highly engaged with family topics — Barbara and Emily discussions remain rich',
      'Chess strategies described with less precision than baseline',
    ],
    trendSummary: 'Composite z-score has drifted from -0.35 to -0.65 over the past 8 weeks. Memory domain showing the earliest deviation (-0.65 SD) while lexical diversity is beginning to decrease.',
    riskLevel: 'Moderate risk — 22% probability of early Alzheimer\'s indicators based on linguistic cascade model',
    nextSteps: [
      { priority: 'recommended', text: 'Schedule follow-up with Robert\'s primary care physician within 2 weeks' },
      { priority: 'recommended', text: 'Increase monitoring sensitivity — add extra recall probes to daily calls' },
      { priority: 'suggested', text: 'Consider adding more recent memory prompts to detect short-term recall changes' },
      { priority: 'routine', text: 'Review weekly report trends with family — subtle changes may be noticeable at home' },
      { priority: 'suggested', text: 'Encourage continued chess and tutoring activities — cognitive engagement is protective' },
    ],
    doctorNote: 'Pre-symptomatic fluency markers detected (Stage 0 per Fraser taxonomy). Memory domain z-score at -0.65 warrants baseline neuropsychological testing. Not yet clinically significant but trending.',
  },
  'p3-margaret-sullivan-00c3': {
    status: 'attention',
    statusColor: 'orange',
    headline: 'Margaret shows significant cognitive changes. Medical consultation recommended.',
    keyObservations: [
      'Word-finding difficulty has increased substantially — frequent use of "thing" and "that place"',
      'Wedding day story with Patrick repeated 5 times this month in near-verbatim form',
      'Crossword puzzle completion time has doubled (self-reported)',
      'Sentence structure becoming simpler — fewer subordinate clauses than baseline',
      'Still recognizes family members but occasionally confuses grandchildren\'s ages',
      'Watercolor painting descriptions less detailed than 3 months ago',
    ],
    trendSummary: 'Composite z-score at -0.95 with consistent downward drift of -0.03 per week. Lexical diversity and memory domains most affected. Semantic coherence showing Stage 1 cascade pattern.',
    riskLevel: 'Elevated risk — 42% probability of Alzheimer\'s disease based on multi-domain linguistic analysis',
    nextSteps: [
      { priority: 'urgent', text: 'Schedule appointment with neurologist — multi-domain decline pattern requires clinical evaluation' },
      { priority: 'recommended', text: 'Request formal neuropsychological assessment (MMSE + comprehensive battery)' },
      { priority: 'recommended', text: 'Discuss findings with Sophie and Karen — coordinated family support important' },
      { priority: 'suggested', text: 'Simplify conversation prompts — reduce open-ended questions, use more cued recall' },
      { priority: 'routine', text: 'Monitor for daily living changes — cooking, medication management, navigation' },
    ],
    doctorNote: 'AD linguistic cascade Stage 1 criteria met: lexical diversity decline (-0.6 SD) combined with coherence deficit (-0.55 SD). Syntactic simplification emerging. Recommend formal diagnostic workup including neuroimaging.',
  },
  'p4-henry-carpenter-00d4': {
    status: 'critical',
    statusColor: 'red',
    headline: 'Henry shows severe cognitive decline across multiple domains. Urgent medical attention needed.',
    keyObservations: [
      'War memories repeated verbatim 8 times this month without self-awareness of repetition',
      'Cannot reliably place events in correct decade — confuses Korean War with childhood',
      'Proper noun retrieval severely impaired — refers to Philip as "my boy" more often than by name',
      'Sentence fragments and incomplete thoughts increasing — discourse coherence breaking down',
      'Emotional engagement with Eleanor memories remains strong but facts are increasingly confused',
      'Model train descriptions, once extremely detailed, are now vague and repetitive',
    ],
    trendSummary: 'Composite z-score at -1.75 with accelerating decline (-0.04 per week). All 5 cognitive domains below -0.6 SD. Memory domain at critical -1.5 SD. Full AD linguistic cascade progression documented.',
    riskLevel: 'High risk — 58% probability of Alzheimer\'s disease. Multiple cascade stages active (0, 1, 2).',
    nextSteps: [
      { priority: 'urgent', text: 'Immediate consultation with neurologist or geriatric psychiatrist required' },
      { priority: 'urgent', text: 'Discuss care planning with Philip and Catherine — may need increased daily support' },
      { priority: 'recommended', text: 'Evaluate medication options with physician — early intervention may slow progression' },
      { priority: 'recommended', text: 'Assess daily living safety — driving, cooking, medication self-management' },
      { priority: 'suggested', text: 'Prioritize emotional engagement in calls over factual recall to reduce frustration' },
      { priority: 'routine', text: 'Continue monitoring to track treatment response if medication started' },
    ],
    doctorNote: 'Critical: Composite z = -1.75 with full cascade progression (Stages 0-2). Multi-domain collapse affecting discourse coherence, lexical access, and temporal orientation. Urgent comprehensive neurological evaluation required. Consider AD pharmacotherapy (cholinesterase inhibitors).',
  },
  'p5-jean-parker-00e5': {
    status: 'stable',
    statusColor: 'emerald',
    headline: 'Jean is in excellent cognitive health. No concerns detected.',
    keyObservations: [
      'Vocabulary richness above average for age group — banking career vocabulary well-preserved',
      'Recent events recalled with precise detail — marathon training, Emma\'s pregnancy, food bank',
      'Bilingual advantage observed — switches between English and Greek references naturally',
      'High emotional engagement scores — particularly around upcoming grandchild',
      'No repetition patterns, no word-finding difficulty, no temporal confusion',
    ],
    trendSummary: 'Composite z-score stable at -0.08 across 15 monitoring sessions. All domains within or above baseline. Youngest participant in cohort with strongest baseline profile.',
    riskLevel: 'Very low risk — 8% probability of any cognitive changes. Enrolled preventatively by daughter Emma.',
    nextSteps: [
      { priority: 'routine', text: 'Continue standard monitoring — daily calls at 3:00 PM EST' },
      { priority: 'routine', text: 'Next quarterly summary available in 6 weeks' },
      { priority: 'suggested', text: 'Add new memories about the upcoming grandchild to enrich conversation topics' },
      { priority: 'suggested', text: 'Encourage Jean to continue running and yoga — physical activity supports cognitive health' },
    ],
    doctorNote: 'No clinical concerns. Jean\'s cognitive-linguistic profile is excellent for age 67. All markers consistent with healthy cognition. Recommend continued annual screening per standard guidelines.',
  },
}

// ─── Pre-generate all data ───────────────────────────────────────────

const _cache = {}

function getPatientData(patientId) {
  if (_cache[patientId]) return _cache[patientId]

  const patient = PATIENTS.find(p => p.patient_id === patientId)
  if (!patient) return null

  const timeline = generateTimeline(patient)
  const reports = generateWeeklyReports(patient, timeline)
  const differential = generateDifferential(patient)
  const twin = generateTwin(patient)
  const cohort = generateCohort(patient)
  const semantic = generateSemanticMap(patient)
  const memories = PATIENT_MEMORIES[patientId] || []
  const calls = generateUpcomingCalls(patient, memories)
  const notifications = generateNotifications(patient)

  const summary = PATIENT_SUMMARIES[patientId] || null

  _cache[patientId] = { patient, timeline, reports, differential, twin, cohort, semantic, memories, calls, notifications, summary }
  return _cache[patientId]
}

// Pre-warm cache
PATIENTS.forEach(p => getPatientData(p.patient_id))

// ─── Public patient list (clean, no internal params) ──────────────────

function cleanPatient(p) {
  return {
    patient_id: p.patient_id,
    first_name: p.first_name,
    last_name: p.last_name,
    age: p.age,
    language: p.language,
    phone_number: p.phone_number,
    call_schedule: p.call_schedule,
    created_at: p.created_at,
    baseline_established: p.baseline_established,
    baseline_sessions: p.baseline_sessions,
    alert_level: p.alert_level,
    personality_notes: p.personality_notes,
  }
}

// ─── Current user tracking for patient scoping ───────────────────────

let _currentUserId = 'f1'

// ─── Demo API (same interface as real api) ────────────────────────────

export const demoApi = {
  // Auth — tracks current user for patient scoping
  login: (userId) => {
    _currentUserId = userId
    const user = FAMILY_DEMO_USERS.find(u => u.id === userId) || FAMILY_DEMO_USERS[0]
    return Promise.resolve({ token: 'demo-token', user })
  },
  getMe: () => {
    const user = FAMILY_DEMO_USERS.find(u => u.id === _currentUserId) || FAMILY_DEMO_USERS[0]
    return Promise.resolve({ user })
  },

  // Patient data — each family user sees ONLY their own patient
  getPatients: () => {
    const user = FAMILY_DEMO_USERS.find(u => u.id === _currentUserId)
    if (user?.patientId) {
      const p = PATIENTS.find(pp => pp.patient_id === user.patientId)
      return Promise.resolve(p ? [cleanPatient(p)] : [])
    }
    return Promise.resolve(PATIENTS.map(cleanPatient))
  },
  getPatient: (id) => {
    const p = PATIENTS.find(pp => pp.patient_id === id)
    return Promise.resolve(p ? cleanPatient(p) : null)
  },

  // Timeline
  getTimeline: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.timeline : null)
  },

  // Weekly reports
  getWeeklyReport: (id, week) => {
    const data = getPatientData(id)
    if (!data) return Promise.resolve(null)
    const report = data.reports.find(r => r.week_number === Number(week))
    return Promise.resolve(report || null)
  },

  // V2 Deep analysis
  getDifferential: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.differential : null)
  },

  getTwin: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.twin : null)
  },

  getCohortMatch: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.cohort : null)
  },

  getSemanticMap: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.semantic : null)
  },

  // Memories
  getMemories: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.memories : [])
  },

  // Notifications — scoped to current user's patient
  getNotifications: () => {
    const user = FAMILY_DEMO_USERS.find(u => u.id === _currentUserId)
    if (user?.patientId) {
      const data = getPatientData(user.patientId)
      return Promise.resolve(data ? data.notifications : [])
    }
    const all = PATIENTS.flatMap(p => {
      const data = getPatientData(p.patient_id)
      return data ? data.notifications : []
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    return Promise.resolve(all)
  },

  // Patient summary
  getPatientSummary: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.summary : null)
  },

  // Calls
  getCalls: (id) => {
    const data = getPatientData(id)
    return Promise.resolve(data ? data.calls : [])
  },

  // Stubs for other endpoints
  getHealth: () => Promise.resolve({ status: 'ok', mode: 'demo', version: '5.0.0' }),
  getDeepAnalysis: () => Promise.resolve(null),
  getDeepAnalyses: () => Promise.resolve([]),
  runDeepAnalysis: () => Promise.resolve(null),
  getLibraryStatus: () => Promise.resolve(null),
  getCostEstimate: () => Promise.resolve(null),
  generateCohort: () => Promise.resolve(null),
  gdprExport: () => Promise.resolve(null),
  gdprErase: () => Promise.resolve(null),
  gdprEraseAll: () => Promise.resolve(null),
  getAuditLogs: () => Promise.resolve([]),
  getEngineMetrics: () => Promise.resolve(null),
  getDatabaseStatus: () => Promise.resolve(null),
  getCognitoUsers: () => Promise.resolve([]),
  getCognitoUser: () => Promise.resolve(null),
  createCognitoUser: () => Promise.resolve(null),
  updateCognitoUserRole: () => Promise.resolve(null),
  disableCognitoUser: () => Promise.resolve(null),
  enableCognitoUser: () => Promise.resolve(null),
  updatePatientMapping: () => Promise.resolve(null),
}
