import { useT } from '../lib/i18n'
import { useRouter } from '../lib/router'
import { sanitizeHTML } from '../lib/sanitize'

function Section({ children, className = '' }) {
  return <section className={`py-20 ${className}`}><div className="max-w-7xl mx-auto px-6">{children}</div></section>
}

function SectionHeader({ label, title, highlight, desc }) {
  return (
    <div className="text-center mb-16">
      {label && <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300 mb-4">{label}</span>}
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{title} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{highlight}</span></h2>
      {desc && <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">{desc}</p>}
    </div>
  )
}

export default function FamilyPage() {
  const { t } = useT()
  const { navigate } = useRouter()

  return (
    <div className="pt-20">
      {/* Hero */}
      <Section className="bg-gradient-to-b from-violet-950/20 to-transparent">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('familyPage.heroTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('familyPage.heroHighlight')}</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-3xl mx-auto leading-relaxed">{t('familyPage.heroSubtitle')}</p>
        </div>
      </Section>

      {/* Story */}
      <Section>
        <SectionHeader label={t('familyPage.storyLabel')} title={t('familyPage.storyTitle')} highlight={t('familyPage.storyHighlight')} />
        <div className="max-w-3xl mx-auto space-y-6">
          <p className="text-slate-400 leading-relaxed">{t('familyPage.storyP1')}</p>
          <p className="text-slate-400 leading-relaxed" dangerouslySetInnerHTML={{ __html: sanitizeHTML(t('familyPage.storyP2')) }} />
          <p className="text-slate-400 leading-relaxed">{t('familyPage.storyP3')}</p>
        </div>
      </Section>

      {/* Dignity */}
      <Section className="bg-white/[0.01]">
        <SectionHeader label={t('familyPage.dignityLabel')} title={t('familyPage.dignityTitle')} highlight={t('familyPage.dignityHighlight')} desc={t('familyPage.dignityDesc')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`familyPage.dignity${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`familyPage.dignity${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Peace of Mind */}
      <Section>
        <SectionHeader label={t('familyPage.peaceMindLabel')} title={t('familyPage.peaceMindTitle')} highlight={t('familyPage.peaceMindHighlight')} />
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="p-6 rounded-xl bg-white/[0.02] border border-white/5">
              <h3 className="text-sm font-semibold text-white mb-2">{t(`familyPage.peace${i}Title`)}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{t(`familyPage.peace${i}Desc`)}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* Two Modes */}
      <Section className="bg-white/[0.01]">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs font-medium text-violet-300 mb-4">Two Modes</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Prevention & <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Treatment</span></h2>
          <p className="text-slate-400 max-w-3xl mx-auto leading-relaxed">AlzheimerVoice adapts to where your loved one is on their journey — whether you're watching for early signs or supporting someone already diagnosed.</p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Prevention Mode */}
          <div className="p-8 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
            <span className="inline-block px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-medium text-emerald-300 mb-4">Prevention Mode</span>
            <h3 className="text-xl font-bold text-white mb-3">Early Detection Through Natural Conversations</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              For families who want to monitor a loved one before any diagnosis. Daily or weekly phone calls or in-app recordings, built around personal memories, detect subtle cognitive changes years before clinical symptoms appear.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">💜</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Family sets the memories</span> — childhood stories, holidays, career milestones, traditions. All managed from the family dashboard.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">🤖</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">AI leads the conversation</span> — proactively asks questions aligned with those memories. Your loved one simply enjoys reminiscing about their own life.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">📊</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Silent monitoring</span> — while they talk, the CVF Engine analyzes 85 cognitive indicators across 9 domains. Families receive weekly drift reports.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-emerald-400 mt-0.5">📞</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Daily or weekly</span> — via AI-guided phone calls or in-app voice recordings. Flexible scheduling that fits your family's routine.</p>
              </div>
            </div>
          </div>

          {/* Treatment Mode */}
          <div className="p-8 rounded-2xl bg-blue-500/5 border border-blue-500/10">
            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-medium text-blue-300 mb-4">Treatment Mode</span>
            <h3 className="text-xl font-bold text-white mb-3">Cognitive Stimulation for Diagnosed Patients</h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-6">
              For people already diagnosed with Alzheimer's or MCI by a clinical professional. Daily or weekly AI-guided sessions actively stimulate the brain and memories to help preserve cognitive capacity.
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">🧠</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Memory activation therapy</span> — structured reminiscence sessions built around the patient's life story to strengthen neural connections.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">📈</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Progressive stimulation</span> — AI guides recall from strong memories to weaker ones, adapting in real-time to the patient's cognitive state.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">👨‍⚕️</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Clinician reports</span> — detailed session reports tracking response patterns, cognitive engagement, and progression over time.</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-blue-400 mt-0.5">📞</span>
                <p className="text-sm text-slate-400"><span className="text-slate-200 font-medium">Daily or weekly</span> — via phone calls or in-app recordings. Regular cognitive engagement through meaningful conversation contributes to cognitive reserve.</p>
              </div>
            </div>
          </div>
        </div>
      </Section>

      {/* Quote */}
      <Section>
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="text-xl md:text-2xl text-slate-300 italic leading-relaxed mb-4">
            "{t('familyPage.quoteText')}"
          </blockquote>
          <p className="text-sm text-slate-500">— {t('familyPage.quoteAttribution')}</p>
        </div>
      </Section>

      {/* CTA */}
      <Section className="bg-white/[0.01]">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">{t('familyPage.ctaTitle')} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">{t('familyPage.ctaHighlight')}</span></h2>
          <p className="text-slate-400 mb-8 max-w-xl mx-auto">Start protecting your loved ones today. Explore the open source engine on GitHub or register for the managed SaaS platform.</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="https://app.alzheimervoice.org/register" target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-lg bg-violet-600 hover:bg-violet-500 text-sm font-medium text-white transition-colors inline-flex items-center gap-2">
              Register as a Family
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>
            </a>
            <a href="https://github.com/remifrancois/cognitivevoicefingerprint" target="_blank" rel="noopener noreferrer" className="px-8 py-3 rounded-lg border border-white/10 hover:border-white/20 text-sm font-medium text-slate-300 transition-colors inline-flex items-center gap-2">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
              Open Source on GitHub
            </a>
          </div>
          <div className="mt-4">
            <button onClick={() => navigate('home')} className="text-xs text-slate-600 hover:text-slate-400 transition-colors">← Back to Home</button>
          </div>
        </div>
      </Section>
    </div>
  )
}
