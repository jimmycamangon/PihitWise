import { Link, useNavigate } from 'react-router-dom'
import { startTourOnDashboard } from '../lib/tour'
import { useT } from '../lib/i18n'
import Icon from './Icon'
import { Card } from './ui'
import { useBike } from '../hooks/useBike'
import { useSetupSteps } from '../hooks/useSetupSteps'

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

    // On the Dashboard the card only shows once we know setup isn't finished:
    // while the bike and its logs are still loading it stays hidden, so riders who are
    // already set up never see it flash in after signing in.
    if (onHide && (loading || complete)) return null

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
