import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'

interface LoginErrors { email?: string; password?: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [errors, setErrors] = useState<LoginErrors>({})
    const [notice, setNotice] = useState('')

    const onSubmit = (e: FormEvent) => {
        e.preventDefault()
        const next: LoginErrors = {}
        if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.'
        if (!password) next.password = 'Enter your password.'
        setErrors(next)
        if (Object.keys(next).length > 0) return setNotice('')

        // TODO: call the auth API once the backend exposes a login endpoint
        setNotice('Sign in isn\'t connected to the server yet.')
    }

    return (
        <AuthLayout
            title="Welcome back"
            subtitle="Sign in to your garage."
            footer={<>New to PihitWise?{' '}
                <Link to="/register" className="text-accent no-underline hover:opacity-80">Create an account</Link></>}
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <Field label="Email" icon="mail" type="email" name="email" autoComplete="email"
                    placeholder="you@example.com" value={email} error={errors.email}
                    onChange={(e) => setEmail(e.target.value)} />
                <Field label="Password" icon="lock" type="password" name="password" autoComplete="current-password"
                    placeholder="Your password" value={password} error={errors.password}
                    onChange={(e) => setPassword(e.target.value)} />

                <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2 text-xs text-muted cursor-pointer">
                        <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)}
                            className="w-3.5 h-3.5 accent-(--accent)" />
                        Remember me
                    </label>
                    <Link to="/forgot-password" className="text-xs text-accent no-underline hover:opacity-80">
                        Forgot password?
                    </Link>
                </div>

                <button type="submit"
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer">
                    Sign in
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
