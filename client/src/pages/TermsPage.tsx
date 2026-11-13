import PublicLayout, { Section } from '../components/PublicLayout'
import { useT } from '../lib/i18n'

// Placeholder copy — replace with the reviewed terms before launch.
export default function TermsPage() {
    const t = useT()
    return (
        <PublicLayout eyebrow={t('public.terms')} title={t('terms.title')}>
            <Section title={t('terms.useTitle')}><p>{t('terms.use')}</p></Section>
            <Section title={t('terms.mechanicTitle')}><p>{t('terms.mechanic')}</p></Section>
            <Section title={t('terms.accountTitle')}><p>{t('terms.account')}</p></Section>
        </PublicLayout>
    )
}
