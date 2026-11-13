import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Modal from './Modal'
import { markWelcomeSeen, useOnboarding } from '../lib/onboarding'
import { startTourOnDashboard } from '../lib/tour'

/** Shown once on a device, to a rider who has no bike yet (a brand-new account). */
export default function WelcomeModal({ name, isNewRider }: { name?: string; isNewRider: boolean }) {
    const { welcomeSeen } = useOnboarding()
    const navigate = useNavigate()
    const firstName = name?.trim().split(/\s+/)[0]

    const close = () => markWelcomeSeen()
    const start = () => { markWelcomeSeen(); startTourOnDashboard(navigate) }

    return (
        <Modal open={isNewRider && !welcomeSeen} title={`Welcome to PihitWise${firstName ? `, ${firstName}` : ''}`} onClose={close}>
            <p className="text-xs text-muted leading-relaxed mb-4">
                Your digital garage for fuel, maintenance, expenses and reminders. Three steps get you going:
            </p>
            <ol className="flex flex-col gap-3 mb-5">
                {([
                    ['bike', 'Add your bike', 'with the odometer reading on your panel.'],
                    ['fuel', 'Log a fill-up', 'to start tracking km/L and spending.'],
                    ['bell', 'Set a reminder', 'like an oil change every 1,500 km.'],
                ] as const).map(([icon, title, rest], i) => (
                    <li key={title} className="flex items-start gap-3">
                        <span className="w-6 h-6 rounded-full bg-accent/15 text-accent font-mono text-[11px] flex items-center justify-center shrink-0">{i + 1}</span>
                        <div className="text-xs text-ink">
                            <Icon name={icon} size={12} className="inline text-muted mr-1.5 -mt-0.5" />
                            <span className="font-medium">{title}</span> <span className="text-muted">{rest}</span>
                        </div>
                    </li>
                ))}
            </ol>
            <p className="text-[11px] text-faint mb-4">
                A quick tour shows where everything is. You can replay it anytime from the ? button.
            </p>
            <div className="flex gap-2">
                <button type="button" onClick={start}
                    className="flex-1 h-10 rounded-md bg-accent text-on-accent text-[13px] font-medium hover:opacity-90 cursor-pointer">
                    Show me around
                </button>
                <button type="button" onClick={close}
                    className="h-10 px-4 rounded-md border border-line text-[13px] text-ink hover:bg-raised cursor-pointer">
                    Skip
                </button>
            </div>
        </Modal>
    )
}
