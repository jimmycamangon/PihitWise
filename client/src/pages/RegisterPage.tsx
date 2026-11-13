import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout, { Field } from '../components/AuthLayout'
import Icon from '../components/Icon'
import { register } from '../api/auth'
import { FormMessage } from '../components/ui'
import { useT } from '../lib/i18n'

interface RegisterErrors { name?: string; email?: string; password?: string; confirm?: string; terms?: string }

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MIN_PASSWORD = 8

export default function RegisterPage() {
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const t = useT()

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [terms, setTerms] = useState(false)
    const [errors, setErrors] = useState<RegisterErrors>({})
    const [notice, setNotice] = useState('')

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        const next: RegisterErrors = {}
        if (!name.trim()) next.name = t('register.err.name')
        if (!emailPattern.test(email.trim())) next.email = t('auth.err.email')
        if (password.length < MIN_PASSWORD) next.password = t('auth.err.short', { count: MIN_PASSWORD })
        if (confirm !== password) next.confirm = t('auth.err.match')
        if (!terms) next.terms = t('register.err.terms')
        setErrors(next)
        if (Object.keys(next).length > 0) return setNotice('')

        setLoading(true)
        try {
            await register(name, email, password)
            navigate('/login')
        } catch (err) {
            setNotice((err as Error).message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <AuthLayout
            title={t('register.title')}
            subtitle={t('register.subtitle')}
            footer={<>{t('register.haveAccount')}{' '}
                <Link to="/login" className="text-accent no-underline hover:opacity-80">{t('login.submit')}</Link></>}
        >
            <form onSubmit={onSubmit} noValidate className="flex flex-col gap-4">
                <Field label={t('register.fullName')} icon="user" type="text" name="name" autoComplete="name"
                    placeholder="Juan Dela Cruz" value={name} error={errors.name}
                    onChange={(e) => {
                        setName(e.target.value)
                        setErrors({ ...errors, name: undefined })
                        }} />
                <Field label={t('auth.email')} icon="mail" type="email" name="email" autoComplete="email"
                    placeholder="you@example.com" value={email} error={errors.email}
                    onChange={(e) => {
                        setEmail(e.target.value)
                        setErrors({ ...errors, email: undefined })
                        }} />
                <Field label={t('auth.password')} icon="lock" type="password" name="password" autoComplete="new-password"
                    placeholder={t('auth.atLeast', { count: MIN_PASSWORD })} value={password} error={errors.password}
                    onChange={(e) => {
                        setPassword(e.target.value)
                        setErrors({ ...errors, password: undefined })
                        }} />
                <Field label={t('register.confirm')} icon="lock" type="password" name="confirm" autoComplete="new-password"
                    placeholder={t('register.repeat')} value={confirm} error={errors.confirm}
                    onChange={(e) => {
                        setConfirm(e.target.value)
                        setErrors({ ...errors, confirm: undefined })
                        }} />

                <div>
                    <label className="flex items-start gap-2 text-xs text-muted cursor-pointer">
                        <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)}
                            className="w-3.5 h-3.5 mt-0.5 accent-(--accent)" />
                        <span>
                            {t('register.agree')}{' '}
                            <Link to="/terms" className="text-accent no-underline hover:opacity-80">{t('register.terms')}</Link>
                            {' '}{t('register.and')}{' '}
                            <Link to="/privacy" className="text-accent no-underline hover:opacity-80">{t('register.privacy')}</Link>.
                        </span>
                    </label>
                    {errors.terms && <p className="text-[11px] text-warn mt-1.5">{errors.terms}</p>}
                </div>

                <button type="submit" disabled={loading}
                    className="inline-flex items-center justify-center gap-2 h-10 rounded-md bg-accent text-on-accent
                         text-[13px] font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                    {loading ? t('register.creating') : t('register.submit')}
                    <Icon name="arrow" size={14} />
                </button>
                <FormMessage text={notice} />
            </form>
        </AuthLayout>
    )
}
