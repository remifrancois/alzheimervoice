import Topbar from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { useT } from '../lib/i18n'

export default function ChangelogPage() {
  const { t } = useT()

  const v010Items = t('changelog.v010items')
  const comingItems = t('changelog.comingItems')

  return (
    <>
      <Topbar title={t('changelog.title')} subtitle={t('changelog.subtitle')} />

      <div className="p-6 space-y-6 max-w-3xl">
        {/* v0.1.0 */}
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <Badge variant="brand">{t('changelog.v010').split('—')[0].trim()}</Badge>
            <span className="text-xs text-slate-500">{t('changelog.v010date')}</span>
          </div>
          <h3 className="text-sm font-semibold text-slate-200 mb-3">
            {t('changelog.v010')}
          </h3>
          <ul className="space-y-2">
            {(Array.isArray(v010Items) ? v010Items : []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-400">
                <span className="text-emerald-500 mt-0.5 shrink-0">+</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>

        {/* Coming Soon */}
        <Card>
          <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse" />
            {t('changelog.coming')}
          </h3>
          <ul className="space-y-2">
            {(Array.isArray(comingItems) ? comingItems : []).map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-slate-500">
                <span className="text-slate-600 mt-0.5 shrink-0">&#x25CB;</span>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  )
}
