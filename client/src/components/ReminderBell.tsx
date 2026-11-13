import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import Icon from './Icon'
import { getReminders } from '../api/reminders'
import { dueReminders, leftText, statusLabel } from '../lib/reminders'
import type { Reminder } from '../types/reminders'

/**
 * Bell in the top bar with a count of reminders that are overdue or due soon.
 * Checks again on every page change and when opened, so it follows new logs and "done" marks.
 */
export default function ReminderBell({ vehicleId }: { vehicleId: string }) {
    const { pathname } = useLocation()
    const [due, setDue] = useState<{ vehicleId: string; items: Reminder[] } | null>(null)
    const [open, setOpen] = useState(false)
    const [check, setCheck] = useState(0)
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        let cancelled = false
        getReminders(vehicleId)
            .then((data) => { if (!cancelled) setDue({ vehicleId, items: dueReminders(data) }) })
            .catch(() => { /* the bell is a hint only; the Reminders page shows errors */ })
        return () => { cancelled = true }
    }, [vehicleId, pathname, check])

    useEffect(() => {
        if (!open) return
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
        }
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
        document.addEventListener('mousedown', onClick)
        document.addEventListener('keydown', onKey)
        return () => {
            document.removeEventListener('mousedown', onClick)
            document.removeEventListener('keydown', onKey)
        }
    }, [open])

    // Ignore a list that still belongs to the bike picked before.
    const items = due?.vehicleId === vehicleId ? due.items : []
    const overdue = items.some((r) => r.status === 'overdue')

    const toggle = () => {
        if (!open) setCheck((c) => c + 1)
        setOpen(!open)
    }

    return (
        <div ref={ref} data-tour="bell" className="relative">
            <button type="button" onClick={toggle} aria-haspopup="menu" aria-expanded={open}
                aria-label={items.length ? `${items.length} reminder${items.length === 1 ? '' : 's'} need attention` : 'Reminders'}
                className="relative w-8 h-8 rounded-md border border-line text-muted flex items-center justify-center
                     hover:text-ink hover:bg-raised transition-colors cursor-pointer">
                <Icon name="bell" size={16} />
                {items.length > 0 && (
                    <span className={`absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 rounded-full font-mono text-[9px]
                        leading-4 text-center text-on-accent ${overdue ? 'bg-warn' : 'bg-accent'}`}>
                        {items.length}
                    </span>
                )}
            </button>
            {open && (
                <div role="menu"
                    className="absolute right-0 top-full mt-1.5 w-64 p-1 rounded-lg border border-line bg-surface shadow-lg z-50">
                    {items.length === 0
                        ? <p className="px-2.5 py-3 text-xs text-faint">Nothing due soon.</p>
                        : items.slice(0, 5).map((r) => (
                            <Link key={r.id} to="/reminders" role="menuitem" onClick={() => setOpen(false)}
                                className="block px-2.5 py-2 rounded-md no-underline hover:bg-raised transition-colors">
                                <div className="flex items-center justify-between gap-2">
                                    <span className="text-xs text-ink truncate">{r.title}</span>
                                    <span className={`font-mono text-[9px] uppercase tracking-widest whitespace-nowrap
                                        ${r.status === 'overdue' ? 'text-warn' : 'text-accent'}`}>
                                        {statusLabel[r.status]}
                                    </span>
                                </div>
                                <div className="text-[11px] text-faint mt-0.5">{leftText(r)}</div>
                            </Link>
                        ))}
                    <Link to="/reminders" role="menuitem" onClick={() => setOpen(false)}
                        className="flex items-center gap-1 px-2.5 py-2 mt-0.5 border-t border-line text-[11px] text-accent no-underline">
                        All reminders <Icon name="arrow" size={11} />
                    </Link>
                </div>
            )}
        </div>
    )
}
