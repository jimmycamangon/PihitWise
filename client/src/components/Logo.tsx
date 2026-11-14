import { Link } from 'react-router-dom'
import Icon from './Icon'

interface LogoProps {
    /** Links home by default. Inside the app (signed in) it goes to the Dashboard instead. */
    to?: string
    /** Icon only: used when the header is too tight for the wordmark (see useTightHeader). */
    compact?: boolean
}

export default function Logo({ to = '/', compact = false }: LogoProps) {
    return (
        <Link to={to} aria-label="PihitWise" className="relative flex items-center gap-2.5 shrink-0 no-underline text-ink">
            <span className="w-7 h-7 shrink-0 rounded-md border border-line bg-surface flex items-center justify-center text-accent">
                <Icon name="gauge" size={15} />
            </span>
            {/* When compact, the wordmark is taken out of the layout but kept measurable. */}
            <span data-wordmark data-hidden={compact}
                className={`text-[13px] font-semibold tracking-[.18em] whitespace-nowrap
                    ${compact ? 'absolute left-0 top-0 invisible pointer-events-none' : ''}`}
                aria-hidden={compact}>
                PIHIT<span className="text-accent">WISE</span>
            </span>
        </Link>
    )
}
