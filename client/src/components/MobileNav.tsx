import { useState } from 'react'
import type { ReactNode } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import Icon from './Icon'
import type { IconName } from './Icon'
import type { NavStyle } from '../lib/navStyle'

export interface NavItem { to: string; label: string; icon: IconName }

interface MobileNavProps {
    style: NavStyle
    items: NavItem[]
    bikeSelect: ReactNode
}

// The bottom bar shows these; everything else goes under More.
const BOTTOM_MAIN = ['/dashboard', '/fuel', '/maintenance', '/reminders']

const tab = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 h-8 px-2.5 rounded-md text-xs no-underline whitespace-nowrap transition-colors
     ${isActive ? 'bg-raised text-ink font-medium' : 'text-muted hover:text-ink hover:bg-raised'}`

const row = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 h-10 px-3 rounded-md text-[13px] no-underline transition-colors
     ${isActive ? 'bg-raised text-ink font-medium' : 'text-muted hover:text-ink hover:bg-raised'}`

/** Page navigation on phones and tablets, in the style picked in Settings. Hidden on desktop (sidebar). */
export function MobileNavTop({ style, items, bikeSelect }: MobileNavProps) {
    const [open, setOpen] = useState(false)
    const { pathname } = useLocation()
    const current = items.find((i) => pathname.startsWith(i.to))

    if (style === 'menu') {
        return (
            <div className="lg:hidden border-t border-line">
                <div className="flex items-center gap-2 px-3 py-2">
                    <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="mobile-menu"
                        className="h-8 px-2.5 inline-flex items-center gap-2 rounded-md border border-line text-xs text-ink
                             hover:bg-raised transition-colors cursor-pointer shrink-0">
                        <Icon name="menu" size={14} />
                        {current?.label ?? 'Menu'}
                    </button>
                    <div className="flex-1 min-w-0">{bikeSelect}</div>
                </div>
                {open && (
                    <nav id="mobile-menu" className="flex flex-col gap-0.5 px-3 pb-3">
                        {items.map((item) => (
                            <NavLink key={item.to} to={item.to} className={row} onClick={() => setOpen(false)}>
                                <Icon name={item.icon} size={16} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                )}
            </div>
        )
    }

    if (style === 'bottom') {
        // Only the bike picker up top; the pages are in the bar at the bottom.
        return <div className="lg:hidden border-t border-line px-4 py-2">{bikeSelect}</div>
    }

    return (
        <div className="lg:hidden border-t border-line">
            <nav className="flex gap-1 px-3 py-2 overflow-x-auto">
                {items.map((item) => (
                    <NavLink key={item.to} to={item.to} className={tab}>
                        <Icon name={item.icon} size={14} />
                        {item.label}
                    </NavLink>
                ))}
            </nav>
            <div className="px-4 pb-2.5">{bikeSelect}</div>
        </div>
    )
}

/** Fixed bar at the bottom of the screen (only for the "Bottom bar" style). */
export function MobileNavBottom({ items }: { items: NavItem[] }) {
    const [more, setMore] = useState(false)
    const { pathname } = useLocation()
    const main = items.filter((i) => BOTTOM_MAIN.includes(i.to))
    const rest = items.filter((i) => !BOTTOM_MAIN.includes(i.to))
    const inMore = rest.some((i) => pathname.startsWith(i.to))

    const cell = (active: boolean) =>
        `flex-1 flex flex-col items-center justify-center gap-1 h-full text-[10px] no-underline transition-colors cursor-pointer
         ${active ? 'text-accent font-medium' : 'text-muted hover:text-ink'}`

    return (
        <div className="lg:hidden">
            {more && (
                <>
                    <button type="button" aria-label="Close" onClick={() => setMore(false)}
                        className="fixed inset-0 z-40 bg-black/30 cursor-default" />
                    <nav className="fixed left-3 right-3 bottom-[calc(4rem+env(safe-area-inset-bottom)+0.5rem)] z-50
                         flex flex-col gap-0.5 p-2 rounded-xl border border-line bg-surface shadow-lg">
                        {rest.map((item) => (
                            <NavLink key={item.to} to={item.to} className={row} onClick={() => setMore(false)}>
                                <Icon name={item.icon} size={16} />
                                {item.label}
                            </NavLink>
                        ))}
                    </nav>
                </>
            )}
            <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-canvas/95 backdrop-blur-xl
                 pb-[env(safe-area-inset-bottom)]">
                <div className="flex h-16">
                    {main.map((item) => (
                        <NavLink key={item.to} to={item.to} onClick={() => setMore(false)}
                            className={({ isActive }) => cell(isActive)}>
                            <Icon name={item.icon} size={18} />
                            {item.label}
                        </NavLink>
                    ))}
                    <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className={cell(more || inMore)}>
                        <Icon name="more" size={18} />
                        More
                    </button>
                </div>
            </nav>
        </div>
    )
}
