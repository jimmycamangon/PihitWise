import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PublicLayout from '../components/PublicLayout'
import { useT } from '../lib/i18n'

export default function NotFoundPage() {
    const t = useT()
    return (
        <PublicLayout eyebrow="404" title={t('notFound.title')} intro={t('notFound.intro')}>
            <Link to="/"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-accent text-on-accent
                     text-[13px] font-medium no-underline hover:opacity-90 transition-opacity">
                {t('notFound.home')}
                <Icon name="arrow" size={14} />
            </Link>
        </PublicLayout>
    )
}
