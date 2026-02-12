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
        <div className="grid sm:grid-cols-3 gap-8 mb-12">
          <div>
            <a href={buildPath(lang, 'home')} onClick={(e) => handleNav(e, 'home')} className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v20M8 6v12M4 10v4M16 6v12M20 10v4" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">MemoVoice</span>
            </a>
            <p className="text-sm text-slate-500 leading-relaxed">{t('footer.brandDesc')}</p>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('footer.researchHeader')}</h4>
            <ul className="space-y-2">
              <li><a href={buildPath(lang, 'scientific')} onClick={(e) => handleNav(e, 'scientific')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkScience')}</a></li>
              <li><a href={buildPath(lang, 'family')} onClick={(e) => handleNav(e, 'family')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkFamilies')}</a></li>
              <li><a href={buildPath(lang, 'opensource')} onClick={(e) => handleNav(e, 'opensource')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkTech')}</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{t('footer.projectHeader')}</h4>
            <ul className="space-y-2">
              <li className="text-sm text-slate-500">{t('footer.projectOrg')}</li>
              <li className="text-sm text-slate-500">{t('footer.projectEvent')}</li>
              <li><a href={buildPath(lang, 'privacy')} onClick={(e) => handleNav(e, 'privacy')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkPrivacy')}</a></li>
              <li><a href={buildPath(lang, 'legal')} onClick={(e) => handleNav(e, 'legal')} className="text-sm text-slate-500 hover:text-white transition-colors">{t('footer.linkLegal')}</a></li>
              <li><a href="https://interface.alzheimervoice.com" className="text-sm text-slate-500 hover:text-white transition-colors">Login</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-600">{t('footer.bottomLine')}</p>
          <p className="text-xs text-slate-700">{t('footer.disclaimer')}</p>
        </div>
      </div>
    </footer>
  )
}
