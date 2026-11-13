import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import { FormMessage } from '../components/ui'
import { requestPasswordReset } from '../api/auth'
import { useT } from '../lib/i18n'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const t = useT()
    const [error, setError] = useState('')
    const [failure, setFailure] = useState('')
    const [sentTo, setSentTo] = useState('')
    const [sending, setSending] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!emailPattern.test(email.trim())) return setError(t('auth.err.email'))
        setError('')
        setFailure('')
        setSending(true)
        try {
            await requestPasswordReset(email.trim())
            setSentTo(email.trim())
        } catch {
            setFailure(t('forgot.failed'))
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthLayout
            title={t('forgot.title')}
            subtitle={t('forgot.subtitle')}
            footer={<>{t('auth.remembered')}{' '}
                <Link to="/login" className="text-accent no-underline hover:opacity-80">{t('auth.backToSignIn')}</Link></>}
        >
            {sentTo ? (
                <div role="status" className="flex flex-col items-center text-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-full bg-raised flex items-center justify-center">
                        <Icon name="mail" size={20} className="text-accent" />
                    </div>
                    <p className="text-xs text-ink">
                        {t('forgot.sent', { email: sentTo })}
                    </p>
                    <p className="text-[11px] text-muted">
                        {t('forgot.sentHelp')}
                    </p>
                    <button type="button" onClick={() => setSentTo('')}
                        className="text-[11px] text-accent hover:opacity-80 cursor-pointer">
                        {t('forgot.useDifferent')}
                    </button>
                </div>
            ) : (
                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                    <Field label={t('auth.email')} icon="mail" type="email" name="email" autoComplete="email"
                        placeholder="you@example.com" value={email} error={error}
                        onChange={(e) => { setEmail(e.target.value); setError('') }} />

                    <button type="submit" disabled={sending}
                        className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                             text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {sending ? t('forgot.sending') : t('forgot.send')}
                        {!sending && <Icon name="arrow" size={14} />}
                    </button>

                    <FormMessage text={failure} />
                </form>
            )}
        </AuthLayout>
    )
}
