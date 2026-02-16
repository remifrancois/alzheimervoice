import { useT } from '../lib/i18n'
import { useRouter, buildPath } from '../lib/router'

export default function Footer() {
  const { t, lang } = useT()
  const { navigate } = useRouter()

  function handleNav(e, page) {
    e.preventDefault()
    navigate(page)
  }

  return (
    <footer className="border-t border-white/5 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div>
            <a href={buildPath(lang, 'home')} onClick={(e) => handleNav(e, 'home')} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M8 6v12M4 10v4M16 6v12M20 10v4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">AlzheimerVoice.org</span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed">{t('footer.brandDesc')}</p>
          </div>

          {/* Research */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('footer.researchHeader')}</h4>
            <ul className="space-y-2">
              <li><a href={buildPath(lang, 'science')} onClick={(e) => handleNav(e, 'science')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkScience')}</a></li>
              <li><a href={buildPath(lang, 'cognitivevoicefingerprint')} onClick={(e) => handleNav(e, 'cognitivevoicefingerprint')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkCvf')}</a></li>
              <li><a href={buildPath(lang, 'opensource')} onClick={(e) => handleNav(e, 'opensource')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkOpenSource')}</a></li>
            </ul>
          </div>

          {/* For Families */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('footer.familyHeader')}</h4>
            <ul className="space-y-2">
              <li><a href={buildPath(lang, 'family')} onClick={(e) => handleNav(e, 'family')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkFamily')}</a></li>
              <li><a href={buildPath(lang, 'demo')} onClick={(e) => handleNav(e, 'demo')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkDemo')}</a></li>
              <li><a href="https://demo.alzheimervoice.org" target="_blank" rel="noopener noreferrer" className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkPlatform')}</a></li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('footer.legalHeader')}</h4>
            <ul className="space-y-2">
              <li><a href={buildPath(lang, 'privacy')} onClick={(e) => handleNav(e, 'privacy')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkPrivacy')}</a></li>
              <li><a href={buildPath(lang, 'compliance')} onClick={(e) => handleNav(e, 'compliance')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkCompliance')}</a></li>
              <li><a href={buildPath(lang, 'legal')} onClick={(e) => handleNav(e, 'legal')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkLegal')}</a></li>
              <li><a href={buildPath(lang, 'creators')} onClick={(e) => handleNav(e, 'creators')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkCreators')}</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 space-y-3">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-600">{t('footer.bottomLine')}</p>
            <p className="text-xs text-slate-700">{t('footer.disclaimer')}</p>
          </div>
          <p className="text-[10px] text-slate-700 text-center leading-relaxed">{t('footer.affiliation')}</p>
        </div>
      </div>
    </footer>
  )
}
