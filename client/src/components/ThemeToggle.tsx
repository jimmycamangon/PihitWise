import Icon from './Icon'
import { useTheme } from '../hooks/useTheme'
import { useT } from '../lib/i18n'

export default function ThemeToggle() {
    const { dark, toggle } = useTheme()
    const t = useT()

    return (
        <button onClick={toggle} type="button"
            aria-label={dark ? t('theme.toLight') : t('theme.toDark')}
            className="w-8 h-8 rounded-md border border-line text-muted
                 flex items-center justify-center
                 hover:text-ink hover:bg-raised transition-colors cursor-pointer">
            <Icon name={dark ? 'sun' : 'moon'} size={14} />
        </button>
    )
}
