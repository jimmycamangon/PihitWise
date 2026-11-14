import { clearToken } from '../lib/token'
import { useState, useEffect, useRef } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import Icon from './Icon'
import type { IconName } from './Icon'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import LanguageToggle from './LanguageToggle'
import { useT } from '../lib/i18n'
import { useTightHeader } from '../hooks/useTightHeader'
import type { TKey } from '../lib/i18n'
import QuickAdd from './QuickAdd'
import ReminderBell from './ReminderBell'
import WelcomeModal from './WelcomeModal'
import { FooterLine } from './SiteFooter'
import Tour from './Tour'
import { MobileNavBottom, MobileNavTop } from './MobileNav'
import { useNavStyle } from '../lib/navStyle'
import { useOnline } from '../hooks/useOnline'
import { clearOutbox, syncOutbox, useOutbox } from '../lib/outbox'
import type { BikeContext } from '../hooks/useBike'
import { getMe } from '../api/auth'
import type { Me } from '../types/auth'
import { getVehicles } from '../api/vehicles'
import type { Vehicle } from '../types/vehicles'


const navDefs: { to: string; labelKey: TKey; icon: IconName }[] = [
    { to: '/dashboard', labelKey: 'nav.dashboard', icon: 'grid' },
    { to: '/garage', labelKey: 'nav.garage', icon: 'garage' },
    { to: '/maintenance', labelKey: 'nav.maintenance', icon: 'wrench' },
    { to: '/fuel', labelKey: 'nav.fuel', icon: 'fuel' },
    { to: '/expenses', labelKey: 'nav.expenses', icon: 'wallet' },
    { to: '/analytics', labelKey: 'nav.analytics', icon: 'chart' },
    { to: '/reminders', labelKey: 'nav.reminders', icon: 'bell' },
    { to: '/settings', labelKey: 'nav.settings', icon: 'settings' },
    { to: '/guide', labelKey: 'nav.guide', icon: 'help' },
    { to: '/admin', labelKey: 'nav.admin', icon: 'user' },
]

const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 h-8 px-2.5 rounded-md text-xs no-underline whitespace-nowrap transition-colors
     ${isActive ? 'bg-raised text-ink font-medium' : 'text-muted hover:text-ink hover:bg-raised'}`

export default function AppLayout() {
    const navigate = useNavigate()
    const t = useT()
    const [headerRef, headerTight] = useTightHeader<HTMLDivElement>()
    const [me, setMe] = useState<Me | null>(null)
    // The Admin page is only listed for admins (the server checks again on every request).
    const navItems = navDefs
        .filter((d) => d.to !== '/admin' || me?.isAdmin)
        .map((d) => ({ to: d.to, icon: d.icon, label: t(d.labelKey) }))
    const online = useOnline()
    const navStyle = useNavStyle()
    const bottomNav = navStyle === 'bottom'

    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [vehicleId, setVehicleId] = useState<string | null>(null)
    const [vehiclesLoading, setVehiclesLoading] = useState(true)


    const reloadVehicles = () => {
        getVehicles().then((data) => {
            setVehicles(data)
            // chosen bike was deleted, or nothing chosen yet? -> pick the first one
            if (!data.some((v) => v.id === vehicleId)) {
                setVehicleId(data[0]?.id ?? null)
            }
        }).finally(() => setVehiclesLoading(false))
    }

    const vehicle = vehicles.find((v) => v.id === vehicleId) ?? null


    const bikeSelect = (
        <select data-tour="bike" value={vehicleId ?? ''} onChange={(e) => setVehicleId(e.target.value)} aria-label={t('bike.active')}
            className="w-full h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink
                 outline-none focus:border-accent cursor-pointer">
            {vehicles.length === 0 && <option value="">{vehiclesLoading ? t('bike.loading') : t('bike.none')}</option>}
            {vehicles.map((v) => <option key={v.id} value={v.id}>{v.name}</option>)}
        </select>
    )

    useEffect(() => { reloadVehicles() }, [])


    useEffect(() => {
        getMe()
            .then((data) => setMe(data))
            .catch((err) => {
                // No signal (fetch itself failed): stay signed in and work from the offline copy.
                if (err instanceof TypeError) return
                clearToken()
                navigate('/login', { replace: true })
            })
    }, [navigate])

    // Logs made offline wait in the outbox. Send them on start and whenever the signal comes back.
    const outbox = useOutbox()
    const waiting = outbox.filter((i) => !i.error).length
    const refused = outbox.length - waiting
    const [syncing, setSyncing] = useState(false)
    const [pageVersion, setPageVersion] = useState(0)

    const sync = () => {
        setSyncing(true)
        syncOutbox()
            .then((sent) => {
                if (sent === 0) return
                // Reload the bike (odometer) and the open page so synced logs show their real data.
                reloadVehicles()
                setPageVersion((v) => v + 1)
            })
            .finally(() => setSyncing(false))
    }
    const syncRef = useRef(sync)
    useEffect(() => { syncRef.current = sync })

    useEffect(() => {
        if (online) syncRef.current()
    }, [online])

    const signOut = () => {
        if (outbox.length > 0 && !window.confirm(t('sync.signOutConfirm', { count: outbox.length }))) return
        clearOutbox()
        clearToken()
        navigate('/login', { replace: true })
    }

    const context: BikeContext = { vehicle, vehicles, vehiclesLoading, reloadVehicles, me, setMe, signOut }

    return (
        <div className={`min-h-screen bg-canvas text-ink font-sans antialiased transition-colors duration-300
            ${bottomNav ? '[--bottom-nav:4.5rem] lg:[--bottom-nav:0px]' : ''}`}>

            {/* ── SIDEBAR (desktop) ───────────────────────────────────────────── */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 flex-col bg-surface border-r border-line">
                <div className="h-14 flex items-center px-4 border-b border-line">
                    <Logo to="/dashboard" />
                </div>
                <div className="p-3 border-b border-line">
                    <div className="font-mono text-[9px] uppercase tracking-[.14em] text-faint mb-1.5">{t('bike.active')}</div>
                    {bikeSelect}
                </div>
                <nav data-tour="nav" className="flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={navLink}>
                            <Icon name={item.icon} size={14} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-3 border-t border-line">
                    <div className="px-2.5 mb-2">
                        <div className="text-xs font-medium text-ink truncate">{me?.name}</div>
                        <div className="text-[11px] text-faint truncate">{me?.email}</div>
                    </div>
                    <button type="button" className={navLink({ isActive: false })}
                        onClick={signOut}>
                        <Icon name="logout" size={14} />
                        {t('nav.signOut')}
                    </button>
                </div>
            </aside>

            <div className="lg:pl-56">
                {/* ── TOP BAR ─────────────────────────────────────────────────── */}
                <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-xl border-b border-line">
                    <div ref={headerRef} className="h-14 flex items-center justify-between gap-3 px-4 md:px-8">
                        <div className="lg:hidden"><Logo to="/dashboard" compact={headerTight} /></div>
                        <div className="hidden lg:block text-xs text-muted">
                            {vehicle?.name}{vehicle?.plateNumber && <span className="text-faint"> · {vehicle.plateNumber}</span>}
                        </div>
                        <div className="flex items-center gap-2.5">
                            {vehicle && <QuickAdd />}
                            {vehicle && <ReminderBell vehicleId={vehicle.id} />}
                            <Link data-tour="guide" to="/guide" aria-label={t('nav.guide')} title={t('nav.guide')}
                                className="w-8 h-8 rounded-md border border-line text-muted flex items-center justify-center
                                     hover:text-ink hover:bg-raised transition-colors no-underline">
                                <Icon name="help" size={16} />
                            </Link>
                            <LanguageToggle className="hidden sm:block" />
                            <ThemeToggle />
                            <button className="lg:hidden w-8 h-8 rounded-md border border-line text-muted
                            flex items-center justify-center
                            hover:text-ink hover:bg-raised transition-colors cursor-pointer" type="button" onClick={signOut} aria-label={t('nav.signOut')}>
                                <Icon name="logout" size={16} />
                            </button>
                        </div>
                    </div>

                    {/* Mobile nav: style picked in Settings */}
                    <MobileNavTop style={navStyle} items={navItems} bikeSelect={bikeSelect} />
                </header>

                {!online && (
                    <div role="status" className="flex items-start gap-3 px-4 md:px-8 py-3 border-b-2 border-warn bg-warn/15">
                        <Icon name="alert" size={18} className="text-warn shrink-0 mt-px" />
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-warn">{t('offline.title')}</div>
                            <div className="text-xs text-ink">
                                {t('offline.body')}
                                {waiting > 0 && <span className="font-medium"> {t('offline.waiting', { count: waiting })}</span>}
                            </div>
                        </div>
                    </div>
                )}

                {online && waiting > 0 && (
                    <div role="status" className="flex items-center gap-3 px-4 md:px-8 py-2.5 border-b-2 border-accent bg-accent/10">
                        <Icon name="clock" size={16} className="text-accent shrink-0" />
                        <div className="flex-1 text-xs text-ink">
                            {t(syncing ? 'sync.syncing' : 'sync.waiting', { count: waiting })}
                        </div>
                        {!syncing && (
                            <button type="button" onClick={sync}
                                className="h-7 px-3 rounded-md bg-accent text-on-accent text-[11px] font-medium hover:opacity-90 cursor-pointer">
                                {t('sync.now')}
                            </button>
                        )}
                    </div>
                )}

                {refused > 0 && (
                    <div role="alert" className="flex items-start gap-3 px-4 md:px-8 py-2.5 border-b-2 border-warn bg-warn/10">
                        <Icon name="alert" size={16} className="text-warn shrink-0 mt-px" />
                        <div className="text-xs text-ink">
                            <span className="font-semibold text-warn">
                                {t('sync.refused', { count: refused })}
                            </span>{' '}
                            {t('sync.refusedHelp')}
                        </div>
                    </div>
                )}

                <main className={`px-4 md:px-8 py-6 md:py-8 max-w-6xl ${bottomNav ? "pb-28 lg:pb-8" : ""}`}>
                    <Outlet key={pageVersion} context={context} />
                    <FooterLine />
                    <WelcomeModal name={me?.name} isNewRider={!vehiclesLoading && vehicles.length === 0} />
                    <Tour />
                </main>
            </div>

            {bottomNav && <MobileNavBottom items={navItems} />}
        </div>
    )
}
