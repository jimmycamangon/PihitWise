import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import { login } from '../api/auth'
import { FormMessage } from '../components/ui'

interface LoginErrors { email?: string; password?: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function LoginPage() {

    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [remember, setRemember] = useState(false)
    const [errors, setErrors] = useState<LoginErrors>({})
    const [notice, setNotice] = useState('')

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const next: LoginErrors = {}
        if (!emailPattern.test(email.trim())) next.email = 'Enter a valid email address.'
        if (!password) next.password = 'Enter your password.'
        setErrors(next)
        if (Object.keys(next).length > 0) return setNotice('')

        setLoading(true)
        try {
            await login(email, password)
            const result = await login(email, password)
            
            localStorage.setItem('token', result.token)
            navigate('/dashboard', { replace: true })
        } catch(err) {
            setNotice((err as Error).message)
        } finally {
            setLoading(false)
        }
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
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors({ ...errors, email: undefined })
                    }} />
                <Field label="Password" icon="lock" type="password" name="password" autoComplete="current-password"
                    placeholder="Your password" value={password} error={errors.password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setErrors({ ...errors, password: undefined })
                    }} />

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

                <button type="submit" disabled={loading}
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    Sign in
                    <Icon name="arrow" size={14} />
                </button>
                <FormMessage text={notice} />
            </form>
        </AuthLayout>
    )
}
