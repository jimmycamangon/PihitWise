import { isRemembered, setToken } from '../lib/token'
import { useState } from 'react'
import type { FormEvent } from 'react'
import Icon from '../components/Icon'
import Modal from '../components/Modal'
import Toast from '../components/Toast'
import { Field } from '../components/AuthLayout'
import { Card, FormMessage, Label, PageHeader } from '../components/ui'
import { useBike } from '../hooks/useBike'
import { navStyles, setNavStyle, useNavStyle } from '../lib/navStyle'
import { languages, setLang, useLang, useT } from '../lib/i18n'
import { showChecklistAgain } from '../lib/onboarding'
import { startTourOnDashboard } from '../lib/tour'
import { Link, useNavigate } from 'react-router-dom'
import { changePassword, updateProfile } from '../api/auth'

const MIN_PASSWORD = 8
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface ProfileErrors { name?: string; email?: string }
interface PasswordErrors { current?: string; next?: string; confirm?: string }

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 py-2.5 border-t border-line first:border-0 first:pt-0 last:pb-0">
            <Label>{label}</Label>
            <div className="text-xs text-ink text-right truncate">{value}</div>
        </div>
    )
}

const outlineButton = `inline-flex items-center gap-2 h-9 px-4 rounded-md border border-line
    text-xs font-medium text-ink hover:bg-raised transition-colors cursor-pointer`

const submitButton = `h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
    hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60`

export default function SettingsPage() {
    const { me, setMe, vehicles, vehiclesLoading, signOut } = useBike()
    const [toast, setToast] = useState('')
    const navStyle = useNavStyle()
    const t = useT()
    const lang = useLang()
    const navigate = useNavigate()

    // Edit profile
    const [profileOpen, setProfileOpen] = useState(false)
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [profileErrors, setProfileErrors] = useState<ProfileErrors>({})
    const [profileMessage, setProfileMessage] = useState('')
    const [savingProfile, setSavingProfile] = useState(false)

    // Change password
    const [passwordOpen, setPasswordOpen] = useState(false)
    const [current, setCurrent] = useState('')
    const [next, setNext] = useState('')
    const [confirm, setConfirm] = useState('')
    const [passwordErrors, setPasswordErrors] = useState<PasswordErrors>({})
    const [passwordMessage, setPasswordMessage] = useState('')
    const [savingPassword, setSavingPassword] = useState(false)

    const openProfile = () => {
        setName(me?.name ?? '')
        setEmail(me?.email ?? '')
        setProfileErrors({})
        setProfileMessage('')
        setProfileOpen(true)
    }

    const openPassword = () => {
        setCurrent('')
        setNext('')
        setConfirm('')
        setPasswordErrors({})
        setPasswordMessage('')
        setPasswordOpen(true)
    }

    const onSaveProfile = async (e: FormEvent) => {
        e.preventDefault()
        const errors: ProfileErrors = {}
        if (!name.trim()) errors.name = t('settings.err.name')
        if (!EMAIL_PATTERN.test(email.trim())) errors.email = t('settings.err.email')
        setProfileErrors(errors)
        if (Object.keys(errors).length) return

        setSavingProfile(true)
        setProfileMessage('')
        try {
            const result = await updateProfile(name.trim(), email.trim(), isRemembered())
            // The old token still carries the old name and email, so keep the new one.
            setToken(result.token)
            setMe({ ...me, id: result.user.id, name: result.user.fullName, email: result.user.email })
            setProfileOpen(false)
            setToast(t('settings.profileUpdated'))
        } catch (err) {
            setProfileMessage(err instanceof Error && err.message ? err.message : t('settings.err.profile'))
        } finally {
            setSavingProfile(false)
        }
    }

    const onSavePassword = async (e: FormEvent) => {
        e.preventDefault()
        const errors: PasswordErrors = {}
        if (!current) errors.current = t('settings.err.current')
        if (next.length < MIN_PASSWORD) errors.next = t('settings.err.short', { count: MIN_PASSWORD })
        if (confirm !== next) errors.confirm = t('settings.err.match')
        setPasswordErrors(errors)
        if (Object.keys(errors).length) return

        setSavingPassword(true)
        setPasswordMessage('')
        try {
            await changePassword(current, next)
            setPasswordOpen(false)
            setToast(t('settings.passwordChanged'))
        } catch (err) {
            setPasswordMessage(err instanceof Error && err.message ? err.message : t('settings.err.password'))
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <>
            <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-3xl">
                <Card title={t('settings.account')}>
                    <Row label={t('settings.name')} value={me?.name ?? '…'} />
                    <Row label={t('settings.email')} value={me?.email ?? '…'} />
                    <Row label={t('settings.bikes')} value={vehiclesLoading ? '…' : String(vehicles.length)} />
                    <div className="flex flex-wrap gap-2 pt-3">
                        <button type="button" onClick={openProfile} disabled={!me} className={outlineButton}>
                            <Icon name="user" size={14} />
                            {t('settings.editProfile')}
                        </button>
                        <button type="button" onClick={openPassword} className={outlineButton}>
                            <Icon name="lock" size={14} />
                            {t('settings.changePassword')}
                        </button>
                    </div>
                </Card>

                <Card title={t('settings.preferences')}>
                    <Row label={t('settings.currency')} value={t('settings.currencyValue')} />
                    <Row label={t('settings.distance')} value={t('settings.distanceValue')} />
                    <Row label={t('settings.economy')} value="km/L" />
                    <Row label={t('settings.theme')} value={t('settings.themeValue')} />
                </Card>

                <Card title={t('lang.title')} className="lg:col-span-2">
                    <p className="text-[11px] text-muted mb-3">{t('lang.description')}</p>
                    <div role="radiogroup" aria-label={t('lang.title')} className="flex gap-2">
                        {languages.map((option) => (
                            <button key={option.value} type="button" role="radio" aria-checked={lang === option.value}
                                onClick={() => setLang(option.value)}
                                className={`h-9 px-4 rounded-md border text-xs font-medium transition-colors cursor-pointer
                                    ${lang === option.value ? 'border-accent bg-accent/10 text-ink' : 'border-line text-muted hover:bg-raised'}`}>
                                {option.label}
                            </button>
                        ))}
                    </div>
                </Card>

                <Card title={t('settings.guide')} className="lg:col-span-2">
                    <p className="text-[11px] text-muted mb-3">
                        {t('settings.guideHelp')}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button"
                            onClick={() => { showChecklistAgain(); navigate('/dashboard') }}
                            className={outlineButton}>
                            <Icon name="check" size={14} />
                            {t('settings.showSetup')}
                        </button>
                        <button type="button" onClick={() => startTourOnDashboard(navigate)} className={outlineButton}>
                            <Icon name="zap" size={14} />
                            {t('settings.replayTour')}
                        </button>
                        <Link to="/guide" className={`${outlineButton} no-underline`}>
                            <Icon name="help" size={14} />
                            {t('settings.openGuide')}
                        </Link>
                    </div>
                </Card>

                <Card title={t('settings.navTitle')} className="lg:col-span-2">
                    <p className="text-[11px] text-muted mb-3">
                        {t('settings.navHelp')}
                    </p>
                    <div role="radiogroup" aria-label={t('settings.navTitle')} className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {navStyles.map((option) => {
                            const selected = navStyle === option.value
                            return (
                                <button key={option.value} type="button" role="radio" aria-checked={selected}
                                    onClick={() => setNavStyle(option.value)}
                                    className={`text-left p-3 rounded-lg border transition-colors cursor-pointer
                                        ${selected ? 'border-accent bg-accent/10' : 'border-line hover:bg-raised'}`}>
                                    <div className="flex items-center gap-2">
                                        <span className={`w-3.5 h-3.5 rounded-full border-2 shrink-0
                                            ${selected ? 'border-accent bg-accent' : 'border-line'}`} />
                                        <span className="text-xs font-medium text-ink">{t(`settings.nav.${option.value}`)}</span>
                                    </div>
                                    <p className="text-[11px] text-muted mt-1.5 leading-relaxed">{t(`settings.nav.${option.value}Help`)}</p>
                                </button>
                            )
                        })}
                    </div>
                </Card>
            </div>

            <button type="button" onClick={signOut} className={`${outlineButton} mt-5`}>
                <Icon name="logout" size={14} />
                {t('nav.signOut')}
            </button>

            <Modal open={profileOpen} title={t('settings.editProfile')} onClose={() => setProfileOpen(false)}>
                <form onSubmit={onSaveProfile} noValidate className="flex flex-col gap-3">
                    <Field label={t('settings.fullName')} icon="user" name="fullName" autoComplete="name" maxLength={100}
                        value={name} error={profileErrors.name}
                        onChange={(e) => { setName(e.target.value); setProfileErrors({ ...profileErrors, name: undefined }) }} />
                    <Field label={t('settings.email')} icon="mail" name="email" type="email" autoComplete="email" maxLength={200}
                        value={email} error={profileErrors.email}
                        onChange={(e) => { setEmail(e.target.value); setProfileErrors({ ...profileErrors, email: undefined }) }} />
                    <FormMessage text={profileMessage} />
                    <button type="submit" disabled={savingProfile} className={submitButton}>
                        {savingProfile ? t('settings.saving') : t('settings.save')}
                    </button>
                </form>
            </Modal>

            <Modal open={passwordOpen} title={t('settings.changePassword')} onClose={() => setPasswordOpen(false)}>
                <form onSubmit={onSavePassword} noValidate className="flex flex-col gap-3">
                    <Field label={t('settings.currentPassword')} icon="lock" type="password" name="currentPassword"
                        autoComplete="current-password" value={current} error={passwordErrors.current}
                        onChange={(e) => { setCurrent(e.target.value); setPasswordErrors({ ...passwordErrors, current: undefined }) }} />
                    <Field label={t('settings.newPassword')} icon="lock" type="password" name="newPassword"
                        autoComplete="new-password" placeholder={t('settings.atLeast', { count: MIN_PASSWORD })}
                        value={next} error={passwordErrors.next}
                        onChange={(e) => { setNext(e.target.value); setPasswordErrors({ ...passwordErrors, next: undefined }) }} />
                    <Field label={t('settings.confirmPassword')} icon="lock" type="password" name="confirmPassword"
                        autoComplete="new-password" value={confirm} error={passwordErrors.confirm}
                        onChange={(e) => { setConfirm(e.target.value); setPasswordErrors({ ...passwordErrors, confirm: undefined }) }} />
                    <FormMessage text={passwordMessage} />
                    <button type="submit" disabled={savingPassword} className={submitButton}>
                        {savingPassword ? t('settings.saving') : t('settings.changePassword')}
                    </button>
                </form>
            </Modal>

            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
