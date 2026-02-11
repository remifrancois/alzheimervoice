import { Link } from 'react-router-dom'
import { useT } from '../../lib/i18n'

export default function Footer() {
  const { t } = useT()

  return (
    <footer className="border-t border-slate-800/50 py-4 mt-auto">
      <div className="px-6 flex items-center justify-between text-[11px] text-slate-600">
        <span>{t('footer.version')}</span>
        <div className="flex items-center gap-4">
          <Link to="/changelog" className="hover:text-slate-400 transition-colors">
            {t('footer.changelog')}
          </Link>
          <Link to="/privacy" className="hover:text-slate-400 transition-colors">
            {t('footer.privacy')}
          </Link>
          <span className="hidden sm:inline">{t('footer.copyright')}</span>
        </div>
      </div>
    </footer>
  )
}
