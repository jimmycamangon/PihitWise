import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import { FormMessage } from '../components/ui'
import { resetPassword } from '../api/auth'
import { useT } from '../lib/i18n'

const MIN_PASSWORD = 8

interface ResetErrors { password?: string; confirm?: string }

/** Opened from the emailed link: /reset-password?email=...&token=... */
export default function ResetPasswordPage() {
    const navigate = useNavigate()
    const t = useT()
    const [params] = useSearchParams()
    const email = params.get('email') ?? ''
    const token = params.get('token') ?? ''

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [errors, setErrors] = useState<ResetErrors>({})
    const [failure, setFailure] = useState('')
    const [saving, setSaving] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const next: ResetErrors = {}
        if (password.length < MIN_PASSWORD) next.password = t('auth.err.short', { count: MIN_PASSWORD })
        if (confirm !== password) next.confirm = t('auth.err.match')
        setErrors(next)
        if (Object.keys(next).length) return

        setSaving(true)
        setFailure('')
        try {
            await resetPassword(email, token, password)
            navigate('/login?reset=1', { replace: true })
        } catch (err) {
            setFailure(err instanceof Error && err.message ? err.message : t('reset.failed'))
        } finally {
            setSaving(false)
        }
    }

    const footer = <>{t('auth.remembered')}{' '}
        <Link to="/login" className="text-accent no-underline hover:opacity-80">{t('auth.backToSignIn')}</Link></>

    if (!email || !token) {
        return (
            <AuthLayout title={t('reset.invalidTitle')} subtitle={t('reset.invalidSubtitle')} footer={footer}>
                <p className="text-xs text-muted text-center">
                    {t('reset.invalidHelp')}{' '}
                    <Link to="/forgot-password" className="text-accent no-underline hover:opacity-80">{t('reset.askNew')}</Link>.
                </p>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout title={t('reset.title')} subtitle={t('reset.subtitle', { email })} footer={footer}>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <Field label={t('reset.newPassword')} icon="lock" type="password" name="newPassword" autoComplete="new-password"
                    placeholder={t('auth.atLeast', { count: MIN_PASSWORD })} value={password} error={errors.password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }) }} />
                <Field label={t('reset.confirm')} icon="lock" type="password" name="confirmPassword" autoComplete="new-password"
                    value={confirm} error={errors.confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors({ ...errors, confirm: undefined }) }} />

                <button type="submit" disabled={saving}
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                    {saving ? t('reset.saving') : t('reset.save')}
                    {!saving && <Icon name="arrow" size={14} />}
                </button>

                <FormMessage text={failure} />
                {failure && (
                    <Link to="/forgot-password" className="text-[11px] text-accent text-center no-underline hover:opacity-80">
                        {t('reset.askNewLink')}
                    </Link>
                )}
            </form>
        </AuthLayout>
    )
}
