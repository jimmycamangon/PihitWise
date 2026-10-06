import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import PublicLayout from '../components/PublicLayout'

export default function NotFoundPage() {
    return (
        <PublicLayout eyebrow="404" title="Page not found." intro="The page you're looking for doesn't exist or has moved.">
            <Link to="/"
                className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-accent text-on-accent
                     text-[13px] font-medium no-underline hover:opacity-90 transition-opacity">
                Back to home
                <Icon name="arrow" size={14} />
            </Link>
        </PublicLayout>
    )
}
