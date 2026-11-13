import { Link } from 'react-router-dom'
import Icon from './Icon'

/** Links home by default. Inside the app (signed in) it goes to the Dashboard instead. */
export default function Logo({ to = '/' }: { to?: string }) {
    return (
        <Link to={to} className="flex items-center gap-2.5 no-underline text-ink">
            <span className="w-7 h-7 rounded-md border border-line bg-surface flex items-center justify-center text-accent">
                <Icon name="gauge" size={15} />
            </span>
            <span className="text-[13px] font-semibold tracking-[.18em]">PIHIT<span className="text-accent">WISE</span></span>
        </Link>
    )
}
