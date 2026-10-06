import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'

interface RegisterErrors { name?: string; email?: string; password?: string; confirm?: string; terms?: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [terms, setTerms] = useState(false)
    const [errors, setErrors] = useState<RegisterErrors>({})
    const [notice, setNotice] = useState('')

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        const next: RegisterErrors = {}
        if (!name.trim()) next.name = 'Enter your name.'
        if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.'
        if (password.length < MIN_PASSWORD) next.password = `Use at least ${MIN_PASSWORD} characters.`
        if (confirm !== password) next.confirm = 'Passwords don\'t match.'
        if (!terms) next.terms = 'Agree to the terms to continue.'
        setErrors(next)
        if (Object.keys(next).length > 0) return setNotice('')

        // TODO: call the auth API once the backend exposes a register endpoint
        setNotice('Sign up isn\'t connected to the server yet.')
    }

    return (
        <AuthLayout
            title="Create your account"
            subtitle="Free for all riders. No credit card required."
            footer={<>Already have an account?{' '}
                <Link to="/login" className="text-accent no-underline hover:opacity-80">Sign in</Link></>}
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <Field label="Full name" icon="user" type="text" name="name" autoComplete="name"
                    placeholder="Juan Dela Cruz" value={name} error={errors.name}
                    onChange={(e) => setName(e.target.value)} />
                <Field label="Email" icon="mail" type="email" name="email" autoComplete="email"
                    placeholder="you@example.com" value={email} error={errors.email}
                    onChange={(e) => setEmail(e.target.value)} />
                <Field label="Password" icon="lock" type="password" name="password" autoComplete="new-password"
                    placeholder={`At least ${MIN_PASSWORD} characters`} value={password} error={errors.password}
                    onChange={(e) => setPassword(e.target.value)} />
                <Field label="Confirm password" icon="lock" type="password" name="confirm" autoComplete="new-password"
                    placeholder="Repeat your password" value={confirm} error={errors.confirm}
                    onChange={(e) => setConfirm(e.target.value)} />

                <div>
                    <label className="flex items-start gap-2 text-xs text-muted cursor-pointer">
                        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                            className="w-3.5 h-3.5 mt-0.5 accent-(--accent)" />
                        <span>
                            I agree to the{' '}
                            <Link to="/terms" className="text-accent no-underline hover:opacity-80">Terms</Link>
                            {' '}and{' '}
                            <Link to="/privacy" className="text-accent no-underline hover:opacity-80">Privacy Policy</Link>.
                        </span>
                    </label>
                    {errors.terms && <p className="text-[11px] text-warn mt-1.5">{errors.terms}</p>}
                </div>

                <button type="submit"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    Create account
                    <Icon name="arrow" size={14} />
                </button>

                {notice && (
                    <p role="status" className="text-[11px] text-muted text-center">
                        {notice}{' '}
                        <Link to="/dashboard" className="text-accent no-underline hover:opacity-80">Open the sample dashboard</Link>
                    </p>
                )}
            </form>
        </AuthLayout>
    )
}
