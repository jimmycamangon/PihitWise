import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { startTourOnDashboard } from '../lib/tour'
import { useT } from '../lib/i18n'
import Icon from './Icon'
import { Card } from './ui'
import { useBike } from '../hooks/useBike'
import { useSetupSteps } from '../hooks/useSetupSteps'
import { markDoneSeen, useOnboarding } from '../lib/onboarding'
import type { IconName } from './Icon'
import type { TKey } from '../lib/i18n'

interface SetupChecklistProps {
    /** Shows a Hide button (Dashboard). The Guide page always shows the list. */
    onHide?: () => void
}

/** "Get started" steps that tick themselves off from the rider's real data. */
export default function SetupChecklist({ onHide }: SetupChecklistProps) {
    const { vehicle, vehiclesLoading } = useBike()
    const navigate = useNavigate()
    const t = useT()
    const { steps, loading, doneCount, requiredCount, complete } = useSetupSteps(vehicle, vehiclesLoading)
    const percent = Math.round((doneCount / requiredCount) * 100)

    const { doneSeen } = useOnboarding()

    // On the Dashboard nothing shows while the bike and its logs are still loading,
    // so riders who are already set up never see the checklist flash in after signing in.
    if (onHide && loading) return null
    // Setup finished: show the "You're good to go" summary once, then nothing.
    if (onHide && complete) return doneSeen ? null : <AllSet />

    return (
        <Card title={complete ? t('setup.allSet') : t('setup.getStarted')}
            action={onHide && (
                <button type="button" onClick={onHide}
                    className="text-[11px] text-muted hover:text-ink cursor-pointer">
                    {complete ? t('setup.close') : t('setup.hide')}
                </button>
            )}>
            <div className="flex items-center gap-3 mb-4">
                <div className="flex-1 h-1.5 rounded-full bg-raised overflow-hidden">
                    <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${loading ? 0 : percent}%` }} />
                </div>
                <span className="font-mono text-[11px] text-muted">{loading ? '…' : `${doneCount}/${requiredCount}`}</span>
            </div>

            <ol className="flex flex-col">
                {steps.map((step) => (
                    <li key={step.id} className="flex items-start gap-3 py-3 border-t border-line first:border-0 first:pt-0">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0
                            ${step.done ? 'bg-ok/15 text-ok' : 'border border-line text-muted'}`}>
                            <Icon name={step.done ? 'check' : step.icon} size={14} className={step.done ? 'check-pop' : ''} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className={`text-xs font-medium ${step.done ? 'text-muted line-through' : 'text-ink'}`}>
                                {step.title}
                                {step.optional && <span className="ml-1.5 font-normal text-faint no-underline">{t('setup.optional')}</span>}
                            </div>
                            {!step.done && <p className="text-[11px] text-muted mt-0.5 leading-relaxed">{step.description}</p>}
                        </div>
                        {!step.done && !loading && (
                            <Link to={step.to}
                                className="shrink-0 h-7 px-2.5 inline-flex items-center rounded-md border border-line text-[11px] text-accent
                                     no-underline hover:bg-raised transition-colors">
                                {step.action}
                            </Link>
                        )}
                    </li>
                ))}
            </ol>
            {onHide && (
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-line">
                    <Icon name="zap" size={14} className="text-accent shrink-0" />
                    <span className="flex-1 text-[11px] text-muted">{t('setup.tourPrompt')}</span>
                    <button type="button" onClick={() => startTourOnDashboard(navigate)}
                        className="shrink-0 h-7 px-3 rounded-md bg-accent text-on-accent text-[11px] font-medium hover:opacity-90 cursor-pointer">
                        {t('setup.takeTour')}
                    </button>
                </div>
            )}
        </Card>
    )
}

// A short real-life walkthrough of tracking, shown once when setup is done.
const flow: { icon: IconName; when: TKey; what: TKey }[] = [
    { icon: 'fuel', when: 'setup.flow1', what: 'setup.flow1Do' },
    { icon: 'gauge', when: 'setup.flow2', what: 'setup.flow2Do' },
    { icon: 'bell', when: 'setup.flow3', what: 'setup.flow3Do' },
    { icon: 'chart', when: 'setup.flow4', what: 'setup.flow4Do' },
]

/**
 * Shown once on the Dashboard when setup is done: a carousel with one step per slide.
 * Back/Next, the dots, arrow keys or a swipe move between slides; "Got it" on the last one closes it for good.
 */
function AllSet() {
    const t = useT()
    const [slide, setSlide] = useState(0)
    const touchX = useRef<number | null>(null)
    const last = slide === flow.length - 1

    const go = (to: number) => setSlide(Math.min(Math.max(to, 0), flow.length - 1))

    return (
        <section className="check-pop rounded-xl border-2 border-ok/50 bg-surface p-4"
            aria-roledescription="carousel" aria-label={t('setup.doneTitle')}
            onKeyDown={(e) => {
                if (e.key === 'ArrowRight') go(slide + 1)
                if (e.key === 'ArrowLeft') go(slide - 1)
            }}>
            <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-ok text-on-accent flex items-center justify-center shrink-0">
                    <Icon name="check" size={16} />
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="text-sm font-semibold text-ink">{t('setup.doneTitle')}</h2>
                    <p className="text-[11px] text-muted">{t('setup.flowIntro')}</p>
                </div>
            </div>

            {/* Slides sit side by side; the track slides left by one slide width per step. */}
            <div className="overflow-hidden rounded-lg bg-raised"
                onTouchStart={(e) => { touchX.current = e.touches[0].clientX }}
                onTouchEnd={(e) => {
                    if (touchX.current === null) return
                    const dx = e.changedTouches[0].clientX - touchX.current
                    if (Math.abs(dx) > 40) go(slide + (dx < 0 ? 1 : -1))
                    touchX.current = null
                }}>
                <div className="flex transition-transform duration-300 ease-out motion-reduce:transition-none"
                    style={{ transform: `translateX(-${slide * 100}%)` }}>
                    {flow.map((step, i) => (
                        <div key={step.when} className="w-full shrink-0 flex flex-col items-center text-center px-6 py-6"
                            role="group" aria-roledescription="slide" aria-hidden={i !== slide}
                            aria-label={t('tour.stepOf', { step: i + 1, total: flow.length })}>
                            <div className="w-14 h-14 rounded-2xl bg-accent/15 text-accent flex items-center justify-center mb-3">
                                <Icon name={step.icon} size={26} />
                            </div>
                            <div className="font-mono text-[10px] uppercase tracking-[.14em] text-accent mb-1">
                                {t('tour.stepOf', { step: i + 1, total: flow.length })}
                            </div>
                            <div className="text-sm font-semibold text-ink mb-1">{t(step.when)}</div>
                            <p className="text-xs text-muted leading-relaxed max-w-xs">{t(step.what)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3">
                <div className="flex gap-1.5 mr-auto">
                    {flow.map((step, i) => (
                        <button key={step.when} type="button" onClick={() => go(i)}
                            aria-label={t('tour.stepOf', { step: i + 1, total: flow.length })} aria-current={i === slide}
                            className={`h-2 rounded-full transition-all duration-300 cursor-pointer
                                ${i === slide ? 'w-5 bg-accent' : 'w-2 bg-line hover:bg-muted'}`} />
                    ))}
                </div>
                {slide > 0 && (
                    <button type="button" onClick={() => go(slide - 1)}
                        className="h-8 px-3 rounded-md border border-line text-xs text-ink hover:bg-raised cursor-pointer">
                        {t('tour.back')}
                    </button>
                )}
                {last ? (
                    <button type="button" onClick={markDoneSeen}
                        className="h-8 px-4 rounded-md bg-ok text-on-accent text-xs font-semibold hover:opacity-90 cursor-pointer">
                        {t('setup.gotIt')}
                    </button>
                ) : (
                    <button type="button" onClick={() => go(slide + 1)}
                        className="h-8 px-4 rounded-md bg-accent text-on-accent text-xs font-semibold hover:opacity-90 cursor-pointer">
                        {t('tour.next')}
                    </button>
                )}
            </div>
        </section>
    )
}
