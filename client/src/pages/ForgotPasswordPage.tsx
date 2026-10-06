import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [error, setError] = useState('')
    const [notice, setNotice] = useState('')

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        if (!emailPattern.test(email.trim())) {
            setNotice('')
            return setError('Enter a valid email address.')
        }
        setError('')

        // TODO: call the auth API once the backend exposes a password reset endpoint
        setNotice('Password reset isn\'t connected to the server yet.')
    }

    return (
        <AuthLayout
            title="Reset your password"
            subtitle="Enter your email and we'll send you a reset link."
            footer={<>Remembered it?{' '}
                <Link to="/login" className="text-accent no-underline hover:opacity-80">Back to sign in</Link></>}
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <Field label="Email" icon="mail" type="email" name="email" autoComplete="email"
                    placeholder="you@example.com" value={email} error={error}
                    onChange={(e) => setEmail(e.target.value)} />

                <button type="submit"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    Send reset link
                    <Icon name="arrow" size={14} />
                </button>

                {notice && <p role="status" className="text-[11px] text-muted text-center">{notice}</p>}
            </form>
        </AuthLayout>
    )
}
