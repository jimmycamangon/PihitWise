import type { Tone } from '../components/ui'
import type { Reminder, ReminderStatus } from '../types/reminders'
import { km } from './format'

export const statusTone: Record<ReminderStatus, Tone> = { overdue: 'warn', soon: 'accent', ok: 'ok', done: 'muted' }
export const statusLabel: Record<ReminderStatus, string> = { overdue: 'Overdue', soon: 'Due soon', ok: 'On track', done: 'Done' }

// "400 km left", "3 days overdue". Shows km and days when the reminder has both.
export function leftText(r: Reminder) {
    const parts: string[] = []
    if (r.kmLeft !== null) parts.push(r.kmLeft < 0 ? `${km(-r.kmLeft)} overdue` : `${km(r.kmLeft)} left`)
    if (r.daysLeft !== null) {
        const days = Math.abs(r.daysLeft)
        const word = days === 1 ? 'day' : 'days'
        parts.push(r.daysLeft < 0 ? `${days} ${word} overdue` : r.daysLeft === 0 ? 'due today' : `${days} ${word} left`)
    }
    return parts.join(' · ')
}
