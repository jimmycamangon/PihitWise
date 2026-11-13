import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import { FormMessage } from '../components/ui'
import { resetPassword } from '../api/auth'

const MIN_PASSWORD = 8

interface ResetErrors { password?: string; confirm?: string }

/** Opened from the emailed link: /reset-password?email=...&token=... */
export default function ResetPasswordPage() {
    const navigate = useNavigate()
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
        if (password.length < MIN_PASSWORD) next.password = `Use at least ${MIN_PASSWORD} characters.`
        if (confirm !== password) next.confirm = 'Passwords don\'t match.'
        setErrors(next)
        if (Object.keys(next).length) return

        setSaving(true)
        setFailure('')
        try {
            await resetPassword(email, token, password)
            navigate('/login?reset=1', { replace: true })
        } catch (err) {
            setFailure(err instanceof Error && err.message ? err.message : 'Could not reset your password.')
        } finally {
            setSaving(false)
        }
    }

    const footer = <>Remembered it?{' '}
        <Link to="/login" className="text-accent no-underline hover:opacity-80">Back to sign in</Link></>

    if (!email || !token) {
        return (
            <AuthLayout title="Link not valid" subtitle="This reset link is missing some parts." footer={footer}>
                <p className="text-xs text-muted text-center">
                    Open the link from your email again, or{' '}
                    <Link to="/forgot-password" className="text-accent no-underline hover:opacity-80">ask for a new one</Link>.
                </p>
            </AuthLayout>
        )
    }

    return (
        <AuthLayout title="Choose a new password" subtitle={`For ${email}`} footer={footer}>
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <Field label="New password" icon="lock" type="password" name="newPassword" autoComplete="new-password"
                    placeholder={`At least ${MIN_PASSWORD} characters`} value={password} error={errors.password}
                    onChange={(e) => { setPassword(e.target.value); setErrors({ ...errors, password: undefined }) }} />
                <Field label="Confirm new password" icon="lock" type="password" name="confirmPassword" autoComplete="new-password"
                    value={confirm} error={errors.confirm}
                    onChange={(e) => { setConfirm(e.target.value); setErrors({ ...errors, confirm: undefined }) }} />

                <button type="submit" disabled={saving}
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                    {saving ? 'Saving...' : 'Save new password'}
                    {!saving && <Icon name="arrow" size={14} />}
                </button>

                <FormMessage text={failure} />
                {failure && (
                    <Link to="/forgot-password" className="text-[11px] text-accent text-center no-underline hover:opacity-80">
                        Ask for a new link
                    </Link>
                )}
            </form>
        </AuthLayout>
    )
}
