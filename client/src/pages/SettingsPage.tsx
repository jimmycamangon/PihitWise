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
        if (!name.trim()) errors.name = 'Enter your name.'
        if (!EMAIL_PATTERN.test(email.trim())) errors.email = 'Enter a valid email.'
        setProfileErrors(errors)
        if (Object.keys(errors).length) return

        setSavingProfile(true)
        setProfileMessage('')
        try {
            const result = await updateProfile(name.trim(), email.trim(), isRemembered())
            // The old token still carries the old name and email, so keep the new one.
            setToken(result.token)
            setMe({ id: result.user.id, name: result.user.fullName, email: result.user.email })
            setProfileOpen(false)
            setToast('Profile updated')
        } catch (err) {
            setProfileMessage(err instanceof Error && err.message ? err.message : 'Could not save your profile.')
        } finally {
            setSavingProfile(false)
        }
    }

    const onSavePassword = async (e: FormEvent) => {
        e.preventDefault()
        const errors: PasswordErrors = {}
        if (!current) errors.current = 'Enter your current password.'
        if (next.length < MIN_PASSWORD) errors.next = `Use at least ${MIN_PASSWORD} characters.`
        if (confirm !== next) errors.confirm = 'Passwords don\'t match.'
        setPasswordErrors(errors)
        if (Object.keys(errors).length) return

        setSavingPassword(true)
        setPasswordMessage('')
        try {
            await changePassword(current, next)
            setPasswordOpen(false)
            setToast('Password changed')
        } catch (err) {
            setPasswordMessage(err instanceof Error && err.message ? err.message : 'Could not change your password.')
        } finally {
            setSavingPassword(false)
        }
    }

    return (
        <>
            <PageHeader title="Settings" subtitle="Your account and preferences." />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-w-3xl">
                <Card title="Account">
                    <Row label="Name" value={me?.name ?? '…'} />
                    <Row label="Email" value={me?.email ?? '…'} />
                    <Row label="Bikes" value={vehiclesLoading ? '…' : String(vehicles.length)} />
                    <div className="flex flex-wrap gap-2 pt-3">
                        <button type="button" onClick={openProfile} disabled={!me} className={outlineButton}>
                            <Icon name="user" size={14} />
                            Edit profile
                        </button>
                        <button type="button" onClick={openPassword} className={outlineButton}>
                            <Icon name="lock" size={14} />
                            Change password
                        </button>
                    </div>
                </Card>

                <Card title="Preferences">
                    <Row label="Currency" value="Philippine peso (₱)" />
                    <Row label="Distance" value="Kilometers" />
                    <Row label="Fuel economy" value="km/L" />
                    <Row label="Theme" value="Use the toggle in the top bar" />
                </Card>

                <Card title="Guide" className="lg:col-span-2">
                    <p className="text-[11px] text-muted mb-3">
                        Forgot how something works? Show the setup steps on your Dashboard again, or open the full guide.
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <button type="button"
                            onClick={() => { showChecklistAgain(); navigate('/dashboard') }}
                            className={outlineButton}>
                            <Icon name="check" size={14} />
                            Show setup guide again
                        </button>
                        <button type="button" onClick={() => startTourOnDashboard(navigate)} className={outlineButton}>
                            <Icon name="zap" size={14} />
                            Replay tour
                        </button>
                        <Link to="/guide" className={`${outlineButton} no-underline`}>
                            <Icon name="help" size={14} />
                            Open guide
                        </Link>
                    </div>
                </Card>

                <Card title="Navigation on phones" className="lg:col-span-2">
                    <p className="text-[11px] text-muted mb-3">
                        How pages are listed on small screens. Saved on this device. Computers always use the sidebar.
                    </p>
                    <div role="radiogroup" aria-label="Navigation on phones" className="grid grid-cols-1 sm:grid-cols-3 gap-2">
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
                                        <span className="text-xs font-medium text-ink">{option.label}</span>
                                    </div>
                                    <p className="text-[11px] text-muted mt-1.5 leading-relaxed">{option.description}</p>
                                </button>
                            )
                        })}
                    </div>
                </Card>
            </div>

            <button type="button" onClick={signOut} className={`${outlineButton} mt-5`}>
                <Icon name="logout" size={14} />
                Sign out
            </button>

            <Modal open={profileOpen} title="Edit profile" onClose={() => setProfileOpen(false)}>
                <form onSubmit={onSaveProfile} noValidate className="flex flex-col gap-3">
                    <Field label="Full name" icon="user" name="fullName" autoComplete="name" maxLength={100}
                        value={name} error={profileErrors.name}
                        onChange={(e) => { setName(e.target.value); setProfileErrors({ ...profileErrors, name: undefined }) }} />
                    <Field label="Email" icon="mail" name="email" type="email" autoComplete="email" maxLength={200}
                        value={email} error={profileErrors.email}
                        onChange={(e) => { setEmail(e.target.value); setProfileErrors({ ...profileErrors, email: undefined }) }} />
                    <FormMessage text={profileMessage} />
                    <button type="submit" disabled={savingProfile} className={submitButton}>
                        {savingProfile ? 'Saving...' : 'Save changes'}
                    </button>
                </form>
            </Modal>

            <Modal open={passwordOpen} title="Change password" onClose={() => setPasswordOpen(false)}>
                <form onSubmit={onSavePassword} noValidate className="flex flex-col gap-3">
                    <Field label="Current password" icon="lock" type="password" name="currentPassword"
                        autoComplete="current-password" value={current} error={passwordErrors.current}
                        onChange={(e) => { setCurrent(e.target.value); setPasswordErrors({ ...passwordErrors, current: undefined }) }} />
                    <Field label="New password" icon="lock" type="password" name="newPassword"
                        autoComplete="new-password" placeholder={`At least ${MIN_PASSWORD} characters`}
                        value={next} error={passwordErrors.next}
                        onChange={(e) => { setNext(e.target.value); setPasswordErrors({ ...passwordErrors, next: undefined }) }} />
                    <Field label="Confirm new password" icon="lock" type="password" name="confirmPassword"
                        autoComplete="new-password" value={confirm} error={passwordErrors.confirm}
                        onChange={(e) => { setConfirm(e.target.value); setPasswordErrors({ ...passwordErrors, confirm: undefined }) }} />
                    <FormMessage text={passwordMessage} />
                    <button type="submit" disabled={savingPassword} className={submitButton}>
                        {savingPassword ? 'Saving...' : 'Change password'}
                    </button>
                </form>
            </Modal>

            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
