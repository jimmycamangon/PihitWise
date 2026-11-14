import { useState } from 'react'
import type { InputHTMLAttributes, ReactNode } from 'react'
import Icon from './Icon'
import type { IconName } from './Icon'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { useT } from '../lib/i18n'
import { useTightHeader } from '../hooks/useTightHeader'

interface AuthLayoutProps { title: string; subtitle: string; children: ReactNode; footer: ReactNode }
interface FieldProps extends InputHTMLAttributes<HTMLInputElement> { label: string; icon: IconName; error?: string }

// ── Form field ─────────────────────────────────────────────────────────────
export function Field({ label, icon, error, type, id, ...rest }: FieldProps) {
    const [show, setShow] = useState(false)
    const t = useT()
    const isPassword = type === 'password'
    const fieldId = id ?? rest.name

    return (
        <div>
            <label htmlFor={fieldId} className="block text-[11px] font-medium text-muted mb-1.5">{label}</label>
            <div className="relative">
                <Icon name={icon} size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-faint pointer-events-none" />
                <input
                    id={fieldId}
                    type={isPassword && show ? 'text' : type}
                    aria-invalid={!!error}
                    aria-describedby={error ? `${fieldId}-error` : undefined}
                    className={`w-full h-10 rounded-md border bg-surface pl-9 text-[13px] text-ink
                        placeholder:text-faint outline-none transition-colors
                        focus:border-accent focus:ring-2 focus:ring-accent/20
                        ${isPassword ? 'pr-10' : 'pr-3'} ${error ? 'border-warn' : 'border-line'}`}
                    {...rest}
                />
                {isPassword && (
                    <button type="button" onClick={() => setShow(!show)}
                        aria-label={show ? t('auth.hidePassword') : t('auth.showPassword')}
                        className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-md
                             flex items-center justify-center text-faint hover:text-ink transition-colors cursor-pointer">
                        <Icon name={show ? 'eyeOff' : 'eye'} size={14} />
                    </button>
                )}
            </div>
            {error && <p id={`${fieldId}-error`} className="text-[11px] text-warn mt-1.5">{error}</p>}
        </div>
    )
}

// ── Layout ─────────────────────────────────────────────────────────────────
export default function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
    const t = useT()
    const [headerRef, headerTight] = useTightHeader<HTMLElement>()
    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-canvas text-ink font-sans antialiased transition-colors duration-300">

            {/* Form side */}
            <div className="flex flex-col min-h-screen px-6 md:px-16">
                <header ref={headerRef} className="flex items-center justify-between gap-3 h-14">
                    <Logo compact={headerTight} />
                    <div className="flex items-center gap-2">
                        <LanguageToggle />
                        <ThemeToggle />
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center py-10">
                    <div className="w-full max-w-sm">
                        <h1 className="font-semibold tracking-tight text-2xl text-ink mb-1.5">{title}</h1>
                        <p className="text-[13px] text-muted mb-8">{subtitle}</p>
                        {children}
                        <div className="text-xs text-faint mt-6 text-center">{footer}</div>
                    </div>
                </main>
            </div>

            {/* Brand side */}
            <aside className="relative hidden lg:flex flex-col justify-center overflow-hidden
                      bg-surface border-l border-line px-16">
                <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-200 h-150 pointer-events-none opacity-[.08]
                        bg-[radial-gradient(ellipse_at_center,var(--accent),transparent_70%)]" />
                <div className="relative max-w-sm">
                    <p className="font-mono text-[10px] uppercase tracking-[.2em] text-accent mb-4">{t('auth.brandEyebrow')}</p>
                    <h2 className="font-semibold tracking-tight text-2xl md:text-3xl text-ink leading-[1.15] mb-8">
                        {t('auth.brandTitle1')}<br />{t('auth.brandTitle2')}
                    </h2>

                    <div className="flex flex-col gap-2.5">
                        {[t('auth.brand1'), t('auth.brand2'), t('auth.brand3')].map((item) => (
                            <div key={item} className="flex items-center gap-2.5 text-[13px] text-muted">
                                <Icon name="check" size={14} className="text-accent shrink-0" />
                                {item}
                            </div>
                        ))}
                    </div>
                </div>
            </aside>
        </div>
    )
}
