import { languages, setLang, useLang, useT } from '../lib/i18n'

/** EN / FIL switch for the top bar. */
export default function LanguageToggle({ className = '' }: { className?: string }) {
    const lang = useLang()
    const t = useT()
    const next = lang === 'en' ? 'fil' : 'en'
    const nextLabel = languages.find((l) => l.value === next)!.label

    return (
        <button type="button" onClick={() => setLang(next)}
            aria-label={t('lang.switchTo', { language: nextLabel })} title={t('lang.switchTo', { language: nextLabel })}
            className={`h-8 px-2 rounded-md border border-line text-muted font-mono text-[10px] tracking-wider
                 hover:text-ink hover:bg-raised transition-colors cursor-pointer ${className}`}>
            {languages.find((l) => l.value === lang)!.short}
        </button>
    )
}
