import { useState } from 'react'
import { Link, NavLink, Outlet } from 'react-router-dom'
import Icon from './Icon'
import type { IconName } from './Icon'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'
import { Badge } from './ui'
import { bikes, user } from '../data/mock'
import type { BikeContext } from '../hooks/useBike'

const navItems: { to: string; label: string; icon: IconName }[] = [
    { to: '/dashboard', label: 'Dashboard', icon: 'grid' },
    { to: '/garage', label: 'Garage', icon: 'garage' },
    { to: '/maintenance', label: 'Maintenance', icon: 'wrench' },
    { to: '/fuel', label: 'Fuel', icon: 'fuel' },
    { to: '/expenses', label: 'Expenses', icon: 'wallet' },
    { to: '/reminders', label: 'Reminders', icon: 'bell' },
    { to: '/settings', label: 'Settings', icon: 'settings' },
]

const navLink = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 h-8 px-2.5 rounded-md text-xs no-underline whitespace-nowrap transition-colors
     ${isActive ? 'bg-raised text-ink font-medium' : 'text-muted hover:text-ink hover:bg-raised'}`

export default function AppLayout() {
    const [bikeId, setBikeId] = useState(bikes[0].id)
    const bike = bikes.find((b) => b.id === bikeId) ?? bikes[0]
    const context: BikeContext = { bike, setBikeId }

    const bikeSelect = (
        <select value={bike.id} onChange={(e) => setBikeId(e.target.value)} aria-label="Active bike"
            className="w-full h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink
                 outline-none focus:border-accent cursor-pointer">
            {bikes.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
    )

    return (
        <div className="min-h-screen bg-canvas text-ink font-sans antialiased transition-colors duration-300">

            {/* ── SIDEBAR (desktop) ───────────────────────────────────────────── */}
            <aside className="hidden lg:flex fixed inset-y-0 left-0 w-56 flex-col bg-surface border-r border-line">
                <div className="h-14 flex items-center px-4 border-b border-line">
                    <Logo />
                </div>
                <div className="p-3 border-b border-line">
                    <div className="font-mono text-[9px] uppercase tracking-[.14em] text-faint mb-1.5">Active bike</div>
                    {bikeSelect}
                </div>
                <nav className="flex-1 flex flex-col gap-0.5 p-3 overflow-y-auto">
                    {navItems.map((item) => (
                        <NavLink key={item.to} to={item.to} className={navLink}>
                            <Icon name={item.icon} size={14} />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="p-3 border-t border-line">
                    <div className="px-2.5 mb-2">
                        <div className="text-xs font-medium text-ink truncate">{user.name}</div>
                        <div className="text-[11px] text-faint truncate">{user.email}</div>
                    </div>
                    <Link to="/login" className={navLink({ isActive: false })}>
                        <Icon name="logout" size={14} />
                        Sign out
                    </Link>
                </div>
            </aside>

            <div className="lg:pl-56">
                {/* ── TOP BAR ─────────────────────────────────────────────────── */}
                <header className="sticky top-0 z-40 bg-canvas/80 backdrop-blur-xl border-b border-line">
                    <div className="h-14 flex items-center justify-between gap-3 px-4 md:px-8">
                        <div className="lg:hidden"><Logo /></div>
                        <div className="hidden lg:block text-xs text-muted">
                            {bike.name} <span className="text-faint">· {bike.plate}</span>
                        </div>
                        <div className="flex items-center gap-2.5">
                            <span className="hidden sm:inline-flex"><Badge>Sample data</Badge></span>
                            <ThemeToggle />
                        </div>
                    </div>

                    {/* Mobile nav */}
                    <div className="lg:hidden border-t border-line">
                        <nav className="flex gap-1 px-3 py-2 overflow-x-auto">
                            {navItems.map((item) => (
                                <NavLink key={item.to} to={item.to} className={navLink}>
                                    <Icon name={item.icon} size={14} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </nav>
                        <div className="px-4 pb-2.5">{bikeSelect}</div>
                    </div>
                </header>

                <main className="px-4 md:px-8 py-6 md:py-8 max-w-6xl">
                    <Outlet context={context} />
                </main>
            </div>
        </div>
    )
}
