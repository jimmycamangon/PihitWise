import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from './Icon'
import type { IconName } from './Icon'

const items: { to: string; label: string; icon: IconName }[] = [
    { to: '/fuel?add=1', label: 'Fill-up', icon: 'fuel' },
    { to: '/maintenance?add=1', label: 'Service', icon: 'wrench' },
    { to: '/expenses?add=1', label: 'Other expense', icon: 'wallet' },
]

/** "+ Log" in the top bar: jumps to a page with its add form already open. */
export default function QuickAdd() {
    const [open, setOpen] = useState(false)
    const ref = useRef<HTMLDivElement>(null)

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

    return (
        <div ref={ref} data-tour="quick-add" className="relative">
            <button type="button" onClick={() => setOpen(!open)} aria-haspopup="menu" aria-expanded={open}
                className="h-8 px-3 inline-flex items-center gap-1 rounded-md bg-accent text-on-accent
                     text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer">
                <span className="text-sm leading-none">+</span> Log
            </button>
            {open && (
                <div role="menu"
                    className="absolute right-0 top-full mt-1.5 w-44 p-1 rounded-lg border border-line bg-surface shadow-lg z-50">
                    {items.map((item) => (
                        <Link key={item.to} to={item.to} role="menuitem" onClick={() => setOpen(false)}
                            className="flex items-center gap-2.5 h-8 px-2.5 rounded-md text-xs text-ink no-underline
                                 hover:bg-raised transition-colors">
                            <Icon name={item.icon} size={14} className="text-muted" />
                            {item.label}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}
