import { Fragment, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { startTourOnDashboard } from '../lib/tour'
import { useT } from '../lib/i18n'
import type { TKey } from '../lib/i18n'
import Icon from '../components/Icon'
import type { IconName } from '../components/Icon'
import SetupChecklist from '../components/SetupChecklist'
import { PageHeader } from '../components/ui'

// Each topic is a title, a few paragraphs and an optional button, all from the dictionaries (guide.*).
interface Topic { id: string; icon: IconName; title: TKey; paragraphs: TKey[]; link?: { to: string; label: TKey } }

const topics: Topic[] = [
    { id: 'bikes', icon: 'garage', title: 'guide.bikes.title', paragraphs: ['guide.bikes.p1', 'guide.bikes.p2'], link: { to: '/garage', label: 'guide.bikes.link' } },
    { id: 'logging', icon: 'fuel', title: 'guide.logging.title', paragraphs: ['guide.logging.p1', 'guide.logging.p2', 'guide.logging.p3'], link: { to: '/fuel?add=1', label: 'guide.logging.link' } },
    { id: 'reminders', icon: 'bell', title: 'guide.reminders.title', paragraphs: ['guide.reminders.p1', 'guide.reminders.p2', 'guide.reminders.p3'], link: { to: '/reminders', label: 'guide.reminders.link' } },
    { id: 'money', icon: 'chart', title: 'guide.money.title', paragraphs: ['guide.money.p1', 'guide.money.p2'], link: { to: '/analytics', label: 'guide.money.link' } },
    { id: 'offline', icon: 'wifiOff', title: 'guide.offline.title', paragraphs: ['guide.offline.p1', 'guide.offline.p2', 'guide.offline.p3', 'guide.offline.p4', 'guide.offline.p5'] },
    { id: 'settings', icon: 'settings', title: 'guide.settings.title', paragraphs: ['guide.settings.p1', 'guide.settings.p2'], link: { to: '/settings', label: 'guide.settings.link' } },
]

/** Renders **bold** parts of a dictionary sentence. */
function Rich({ text }: { text: string }) {
    return <>{text.split('**').map((part, i) => (i % 2 ? <b key={i}>{part}</b> : <Fragment key={i}>{part}</Fragment>))}</>
}

export default function GuidePage() {
    const { hash } = useLocation()
    const navigate = useNavigate()
    const t = useT()

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
                <PageHeader title={t('guide.title')} subtitle={t('guide.subtitle')} />
                <button type="button" onClick={() => startTourOnDashboard(navigate)}
                    className="h-8 px-3.5 inline-flex items-center gap-1.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    <Icon name="zap" size={13} />
                    {t('guide.takeTour')}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 items-start">
                <div className="lg:col-span-2">
                    <SetupChecklist />
                </div>

                <div className="lg:col-span-3 flex flex-col gap-2">
                    {topics.map((topic) => (
                        <details key={topic.id} id={topic.id}
                            className="group bg-surface border border-line rounded-xl scroll-mt-32 open:pb-1">
                            <summary className="flex items-center gap-3 px-4 py-3.5 cursor-pointer list-none
                                 [&::-webkit-details-marker]:hidden">
                                <span className="w-8 h-8 rounded-md border border-line bg-raised flex items-center justify-center text-accent shrink-0">
                                    <Icon name={topic.icon} size={15} />
                                </span>
                                <span className="flex-1 text-[13px] font-medium text-ink">{t(topic.title)}</span>
                                <Icon name="arrow" size={14} className="text-faint transition-transform group-open:rotate-90" />
                            </summary>
                            <div className="px-4 pb-3 text-xs text-muted leading-relaxed flex flex-col gap-2
                                 [&_b]:text-ink [&_b]:font-medium">
                                {topic.paragraphs.map((p) => <p key={p}><Rich text={t(p)} /></p>)}
                                {topic.link && (
                                    <Link to={topic.link.to}
                                        className="self-start mt-1 h-8 px-3 inline-flex items-center gap-1.5 rounded-md border border-line
                                             text-[11px] text-accent no-underline hover:bg-raised transition-colors">
                                        {t(topic.link.label)} <Icon name="arrow" size={11} />
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
