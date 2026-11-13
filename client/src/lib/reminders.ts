import type { Tone } from '../components/ui'
import type { Reminder, ReminderStatus } from '../types/reminders'
import { km } from './format'
import { t } from './i18n'

export const statusTone: Record<ReminderStatus, Tone> = { overdue: 'warn', soon: 'accent', ok: 'ok', done: 'muted' }

// Getters so the label follows the current language each time it's read.
export const statusLabel: Record<ReminderStatus, string> = {
    get overdue() { return t('status.overdue') },
    get soon() { return t('status.soon') },
    get ok() { return t('status.ok') },
    get done() { return t('status.done') },
}

// "400 km left", "3 days overdue". Shows km and days when the reminder has both.
export function leftText(r: Reminder) {
    const parts: string[] = []
    if (r.kmLeft !== null) parts.push(r.kmLeft < 0 ? t('left.kmOverdue', { km: km(-r.kmLeft) }) : t('left.kmLeft', { km: km(r.kmLeft) }))
    if (r.daysLeft !== null) {
        const days = Math.abs(r.daysLeft)
        parts.push(
            r.daysLeft === 0 ? t('left.dueToday')
                : r.daysLeft < 0 ? (days === 1 ? t('left.dayOverdue') : t('left.daysOverdue', { days }))
                    : (days === 1 ? t('left.dayLeft') : t('left.daysLeft', { days })),
        )
    }
    return parts.join(' · ')
}

/** Reminders that need attention: overdue or due soon. The API puts the most urgent first. */
export const dueReminders = (reminders: Reminder[]) =>
    reminders.filter((r) => r.status === 'overdue' || r.status === 'soon')
