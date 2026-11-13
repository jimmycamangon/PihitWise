import PublicLayout, { Section } from '../components/PublicLayout'
import { useT } from '../lib/i18n'

export default function AboutPage() {
    const t = useT()
    return (
        <PublicLayout eyebrow={t('public.about')} title={t('about.title')} intro={t('about.intro')}>
            <Section title={t('about.whyTitle')}><p>{t('about.why')}</p></Section>
            <Section title={t('about.whatTitle')}><p>{t('about.what')}</p></Section>
            <Section title={t('about.whoTitle')}><p>{t('about.who')}</p></Section>
        </PublicLayout>
    )
}
