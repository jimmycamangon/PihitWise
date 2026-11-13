import PublicLayout, { Section } from '../components/PublicLayout'
import { useT } from '../lib/i18n'

// Placeholder copy — replace with the reviewed policy before launch.
export default function PrivacyPage() {
    const t = useT()
    return (
        <PublicLayout eyebrow={t('public.privacy')} title={t('privacy.title')}>
            <Section title={t('privacy.collectTitle')}><p>{t('privacy.collect')}</p></Section>
            <Section title={t('privacy.useTitle')}><p>{t('privacy.use')}</p></Section>
            <Section title={t('privacy.dataTitle')}><p>{t('privacy.data')}</p></Section>
        </PublicLayout>
    )
}
