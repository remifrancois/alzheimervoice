import Topbar from '../components/layout/Topbar'
import { Card } from '../components/ui/Card'
import { useT } from '../lib/i18n'

export default function PrivacyPage() {
  const { t } = useT()

  const sections = [
    { title: t('privacy.introTitle'), text: t('privacy.introText') },
    { title: t('privacy.dataCollectedTitle'), text: t('privacy.dataCollectedText') },
    { title: t('privacy.dataUsageTitle'), text: t('privacy.dataUsageText') },
    { title: t('privacy.dataStorageTitle'), text: t('privacy.dataStorageText') },
    { title: t('privacy.aiProcessingTitle'), text: t('privacy.aiProcessingText') },
    { title: t('privacy.patientRightsTitle'), text: t('privacy.patientRightsText') },
    { title: t('privacy.contactTitle'), text: t('privacy.contactText') },
  ]

  return (
    <>
      <Topbar title={t('privacy.title')} subtitle={t('privacy.subtitle')} />

      <div className="p-6 max-w-3xl">
        <Card>
          <p className="text-xs text-slate-500 mb-6">{t('privacy.lastUpdated')}</p>

          <div className="space-y-6">
            {sections.map((section, i) => (
              <div key={i}>
                <h3 className="text-sm font-semibold text-slate-200 mb-2">
                  {i + 1}. {section.title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">
                  {section.text}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </>
  )
}
