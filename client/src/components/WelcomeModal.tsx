import { useNavigate } from 'react-router-dom'
import Icon from './Icon'
import Modal from './Modal'
import { markWelcomeSeen, useOnboarding } from '../lib/onboarding'
import { startTourOnDashboard } from '../lib/tour'
import { useT } from '../lib/i18n'

/** Shown once on a device, to a rider who has no bike yet (a brand-new account). */
export default function WelcomeModal({ name, isNewRider }: { name?: string; isNewRider: boolean }) {
    const { welcomeSeen } = useOnboarding()
    const navigate = useNavigate()
    const t = useT()
    const firstName = name?.trim().split(/\s+/)[0]

    const close = () => markWelcomeSeen()
    const start = () => { markWelcomeSeen(); startTourOnDashboard(navigate) }

    return (
        <Modal open={isNewRider && !welcomeSeen} title={firstName ? t('welcome.titleName', { name: firstName }) : t('welcome.title')} onClose={close}>
            <p className="text-xs text-muted leading-relaxed mb-4">
                {t('welcome.intro')}
            </p>
            <ol className="flex flex-col gap-3 mb-5">
                {([
                    ['bike', t('welcome.step1'), t('welcome.step1Rest')],
                    ['fuel', t('welcome.step2'), t('welcome.step2Rest')],
                    ['bell', t('welcome.step3'), t('welcome.step3Rest')],
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
                {t('welcome.tourNote')}
            </p>
            <div className="flex gap-2">
                <button type="button" onClick={start}
                    className="flex-1 h-10 rounded-md bg-accent text-on-accent text-[13px] font-medium hover:opacity-90 cursor-pointer">
                    {t('welcome.showMe')}
                </button>
                <button type="button" onClick={close}
                    className="h-10 px-4 rounded-md border border-line text-[13px] text-ink hover:bg-raised cursor-pointer">
                    {t('welcome.skip')}
                </button>
            </div>
        </Modal>
    )
}
