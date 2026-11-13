import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { startTourOnDashboard } from '../lib/tour'
import Icon from '../components/Icon'
import type { IconName } from '../components/Icon'
import SetupChecklist from '../components/SetupChecklist'
import { PageHeader } from '../components/ui'

interface Topic { id: string; icon: IconName; title: string; body: ReactNode; link?: { to: string; label: string } }

const topics: Topic[] = [
    {
        id: 'bikes', icon: 'garage', title: 'Your bikes',
        body: <>
            <p>Add each bike in <b>Garage</b> with the odometer reading on your panel. If you have more than one, pick the
                active bike from the selector at the top. Every log and reminder belongs to the active bike.</p>
            <p>The odometer goes up by itself whenever you log a fill-up or service with a higher reading.</p>
        </>,
        link: { to: '/garage', label: 'Open Garage' },
    },
    {
        id: 'logging', icon: 'fuel', title: 'Logging fill-ups, services and expenses',
        body: <>
            <p>Tap <b>+ Log</b> in the top bar from any page and pick <b>Fill-up</b>, <b>Service</b> or <b>Other expense</b>.</p>
            <p>For fill-ups, enter the odometer, liters and cost, and tick <b>Full tank</b> when you filled it up.
                km/L is worked out between two full-tank fill-ups, so it shows after your second one.</p>
            <p>Other expenses are anything else: wash, parts, accessories, insurance, registration.</p>
        </>,
        link: { to: '/fuel?add=1', label: 'Log a fill-up' },
    },
    {
        id: 'reminders', icon: 'bell', title: 'Reminders',
        body: <>
            <p>Set a reminder by km, by date, or both; whichever comes first counts. It counts down as your odometer goes up.</p>
            <p>Use <b>Repeat every km</b> for things like oil changes: when you tap <b>Done</b>, the next one is set from your
                current odometer, so you never type the due km again.</p>
            <p>The <b>bell</b> in the top bar shows how many are overdue or due soon (within 500 km or 30 days).</p>
        </>,
        link: { to: '/reminders', label: 'Open Reminders' },
    },
    {
        id: 'money', icon: 'chart', title: 'Expenses and analytics',
        body: <>
            <p><b>Expenses</b> puts fuel, maintenance and other costs in one list with a 6-month chart.</p>
            <p><b>Analytics</b> shows cost per km, how far you ride per month, when your next km-based service is
                likely due, and totals per year.</p>
        </>,
        link: { to: '/analytics', label: 'Open Analytics' },
    },
    {
        id: 'offline', icon: 'wifiOff', title: 'Offline mode',
        body: <>
            <p><b>1. Install it.</b> On Android (Chrome): ⋮ menu → <b>Add to Home screen</b> or <b>Install app</b>.
                On iPhone (Safari): Share → <b>Add to Home Screen</b>. Open PihitWise from that icon.</p>
            <p><b>2. Open it online first.</b> Visit the Dashboard and the pages you'll need before a long ride.
                Each page you open is saved on the phone.</p>
            <p><b>3. Without signal</b>, an orange <b>You're offline</b> bar shows. You see your last loaded data, and you
                can still add fill-ups, services and expenses. They show <b>Waiting to sync</b>.</p>
            <p><b>4. Back online</b>, they sync by themselves (or tap <b>Sync now</b>). If one can't be saved, it shows
                <b> Couldn't sync</b>: edit it to try again or delete it.</p>
            <p>Online only: reminders, bikes, and editing or deleting logs that already synced. Signing out removes
                the offline copy and asks first if logs are still waiting.</p>
        </>,
    },
    {
        id: 'settings', icon: 'settings', title: 'Account and settings',
        body: <>
            <p>In <b>Settings</b> you can change your name, email and password, and choose how pages are listed on
                phones: scrolling tabs, a collapsible menu, or a bottom bar.</p>
            <p>Forgot your password? Use <b>Forgot password</b> on the sign-in page to get a reset link by email.</p>
        </>,
        link: { to: '/settings', label: 'Open Settings' },
    },
]

export default function GuidePage() {
    const { hash } = useLocation()
    const navigate = useNavigate()

    // Links like /guide#offline open and scroll to that topic.
    useEffect(() => {
        if (!hash) return
        const el = document.getElementById(hash.slice(1))
        if (el instanceof HTMLDetailsElement) el.open = true
        el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, [hash])

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Guide" subtitle="How to get the most out of PihitWise." />
                <button type="button" onClick={() => startTourOnDashboard(navigate)}
                    className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    <Icon name="zap" size={13} />
                    Take the tour
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
                <div className="lg:col-span-2">
                    <SetupChecklist />
                </div>

                <div className="lg:col-span-3 flex flex-col gap-2">
                    {topics.map((t) => (
                        <details key={t.id} id={t.id}
                            className="group bg-surface border border-line rounded-xl scroll-mt-32 open:pb-1">
                            <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none
                                 [&::-webkit-details-marker]:hidden">
                                <span className="w-8 h-8 rounded-md border border-line bg-raised flex items-center justify-center text-accent shrink-0">
                                    <Icon name={t.icon} size={15} />
                                </span>
                                <span className="flex-1 text-[13px] font-medium text-ink">{t.title}</span>
                                <Icon name="arrow" size={14} className="text-faint transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-4 pb-3 text-xs text-muted leading-relaxed flex flex-col gap-2
                                 [&_b]:text-ink [&_b]:font-medium">
                                {t.body}
                                {t.link && (
                                    <Link to={t.link.to}
                                        className="self-start mt-1 h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-line
                                             text-[11px] text-accent no-underline hover:bg-raised transition-colors">
                                        {t.link.label} <Icon name="arrow" size={11} />
                                    </Link>
                                )}
                            </div>
                        </details>
                    ))}
                </div>
            </div>
        </>
    )
}
