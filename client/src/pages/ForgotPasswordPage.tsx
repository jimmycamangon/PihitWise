import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import { FormMessage } from '../components/ui'
import { requestPasswordReset } from '../api/auth'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [failure, setFailure] = useState('')
    const [sentTo, setSentTo] = useState('')
    const [sending, setSending] = useState(false)

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!emailPattern.test(email.trim())) return setError('Enter a valid email address.')
        setError('')
        setFailure('')
        setSending(true)
        try {
            await requestPasswordReset(email.trim())
            setSentTo(email.trim())
        } catch {
            setFailure('Could not send the reset link. Please try again.')
        } finally {
            setSending(false)
        }
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we'll send you a reset link."
            footer={<>Remembered it?{' '}
                <Link to="/login" className="text-accent no-underline hover:opacity-80">Back to sign in</Link></>}
        >
            {sentTo ? (
                <div role="status" className="flex flex-col items-center text-center gap-3 py-2">
                    <div className="w-12 h-12 rounded-full bg-raised flex items-center justify-center">
                        <Icon name="mail" size={20} className="text-accent" />
                    </div>
                    <p className="text-xs text-ink">
                        If <span className="font-medium">{sentTo}</span> has a PihitWise account, a reset link is on its way.
                    </p>
                    <p className="text-[11px] text-muted">
                        The link works for 1 hour. Check your spam folder if it doesn't show up.
                    </p>
                    <button type="button" onClick={() => setSentTo('')}
                        className="text-[11px] text-accent hover:opacity-80 cursor-pointer">
                        Use a different email
                    </button>
                </div>
            ) : (
                <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                    <Field label="Email" icon="mail" type="email" name="email" autoComplete="email"
                        placeholder="you@example.com" value={email} error={error}
                        onChange={(e) => { setEmail(e.target.value); setError('') }} />

                    <button type="submit" disabled={sending}
                        className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                             text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {sending ? 'Sending...' : 'Send reset link'}
                        {!sending && <Icon name="arrow" size={14} />}
                    </button>

                    <FormMessage text={failure} />
                </form>
            )}
        </AuthLayout>
    )
}
