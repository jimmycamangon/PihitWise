import { Link } from 'react-router-dom'
import Logo from './Logo'
import { useT } from '../lib/i18n'
import type { TKey } from '../lib/i18n'

const CREATOR = { name: 'Jim', url: 'https://j-c-portfolio.vercel.app/' }

const links: [TKey, string][] = [
    ['lp.nav.features', '/#features'],
    ['public.about', '/about'],
    ['public.privacy', '/privacy'],
    ['public.terms', '/terms'],
    ['public.contact', '/contact'],
]

/** "© 2026 PihitWise · Made by Jim, with AI assistance · v1.0.0" */
function Credits() {
    const t = useT()
    return (
        <>
            © {new Date().getFullYear()} PihitWise
            <span aria-hidden> · </span>
            {t('footer.madeBy')}{' '}
            <a href={CREATOR.url} target="_blank" rel="noopener noreferrer"
                className="text-accent no-underline hover:underline underline-offset-2">{CREATOR.name}</a>
            {t('footer.aiAssisted')}
            <span aria-hidden> · </span>
            v{__APP_VERSION__}
        </>
    )
}

/** Footer of the landing page and public pages: logo, tagline, links, credits. */
export default function SiteFooter() {
    const t = useT()
    return (
        <footer className="border-t border-line">
            <div className="max-w-6xl mx-auto px-6 md:px-16 py-8">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                    <div className="max-w-xs">
                        <Logo />
                        <p className="text-xs text-muted mt-3 leading-relaxed">{t('footer.tagline')}</p>
                    </div>
                    <nav className="flex gap-x-6 gap-y-2 flex-wrap" aria-label="Footer">
                        {links.map(([label, to]) => (
                            to.startsWith('/#')
                                ? <a key={to} href={to} className="text-xs text-muted hover:text-ink transition-colors no-underline">{t(label)}</a>
                                : <Link key={to} to={to} className="text-xs text-muted hover:text-ink transition-colors no-underline">{t(label)}</Link>
                        ))}
                    </nav>
                </div>
                <div className="mt-6 pt-5 border-t border-line text-[11px] text-faint">
                    <Credits />
                </div>
            </div>
        </footer>
    )
}

/** One quiet line for inside the app and the sign-in pages. */
export function FooterLine() {
    const t = useT()
    return (
        <p className="text-[11px] text-faint text-center py-6 leading-relaxed">
            <Credits />
            <span aria-hidden> · </span>
            <Link to="/privacy" className="text-faint hover:text-ink no-underline">{t('public.privacy')}</Link>
            <span aria-hidden> · </span>
            <Link to="/terms" className="text-faint hover:text-ink no-underline">{t('public.terms')}</Link>
            <span aria-hidden> · </span>
            <Link to="/contact" className="text-faint hover:text-ink no-underline">{t('public.contact')}</Link>
        </p>
    )
}
