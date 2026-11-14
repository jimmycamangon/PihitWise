import { getToken } from '../lib/token'
import type { Reminder, ReminderRequest, ReminderStatus } from '../types/reminders'
import { checkSession } from './session'
import { OfflineError, isPendingId, queueChange, send } from '../lib/outbox'
import { loggable } from './loggable'
import { t } from '../lib/i18n'

// Reminders work offline like fill-ups, services and expenses: adding, editing and deleting
// are queued on the device (lib/outbox) and synced later. Marking done is queued too.
const reminders = loggable<Reminder, ReminderRequest>(
    'reminder', (v) => `/api/vehicles/${v}/reminders`, (id) => `/api/reminders/${id}`)

export const createReminder = reminders.create
export const updateReminder = reminders.update
export const deleteReminder = reminders.remove

/** The bike's reminders, with any offline changes shown and their countdown worked out on the device. */
export async function getReminders(vehicleId: string): Promise<Reminder[]> {
    return withCountdown(await reminders.list(vehicleId))
}

/** Marks a reminder done. Offline, it's queued and comes back as `{ pending: true }`. */
export async function markReminderDone(id: string): Promise<Reminder> {
    // A reminder added offline isn't on the server yet, so there's nothing to mark there.
    if (isPendingId(id)) throw new Error(t('rem.syncFirst'))

    let response: Response
    try {
        response = await send(`/api/reminders/${id}/done`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${getToken()}` },
        })
    } catch (err) {
        if (!(err instanceof OfflineError)) throw err
        queueChange('reminder', 'done', id)
        return { id, pending: true } as Reminder
    }
    checkSession(response)
    if (!response.ok) throw new Error(await response.text())
    return response.json()
}

// ── Countdown for reminders changed offline ────────────────────────────────
// The server normally works out km left, days left and the status. For reminders that are still
// waiting to sync, the same rules run here so the list looks right before they reach the server.

const DAY_MS = 86_400_000
const rank: Record<ReminderStatus, number> = { overdue: 0, soon: 1, ok: 2, done: 3 }

function todayNumber() {
    const d = new Date()
    return Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY_MS
}

function withCountdown(list: Reminder[]): Reminder[] {
    if (!list.some((r) => r.pending)) return list

    // Every reminder of a bike shares its odometer: due km − km left on any synced one gives it.
    const synced = list.find((r) => !r.pending && r.dueOdometer !== null && r.kmLeft !== null)
    const odometer = synced ? synced.dueOdometer! - synced.kmLeft! : null

    return list
        .map((r) => {
            if (!r.pending) return r
            // Like the server: a repeat with no due km starts from the odometer now.
            const dueOdometer = r.dueOdometer ?? (r.repeatEveryKm && odometer !== null ? odometer + r.repeatEveryKm : null)
            const kmLeft = dueOdometer !== null && dueOdometer !== undefined && odometer !== null ? dueOdometer - odometer : null
            const daysLeft = r.dueDate ? Date.parse(`${r.dueDate}T00:00:00Z`) / DAY_MS - todayNumber() : null
            const isDone = r.isDone ?? false
            const status: ReminderStatus = isDone ? 'done'
                : (kmLeft !== null && kmLeft < 0) || (daysLeft !== null && daysLeft < 0) ? 'overdue'
                    : (kmLeft !== null && kmLeft <= 500) || (daysLeft !== null && daysLeft <= 30) ? 'soon'
                        : 'ok'
            return { ...r, dueOdometer: dueOdometer ?? null, isDone, kmLeft, daysLeft, status }
        })
        .sort((a, b) => rank[a.status] - rank[b.status])
}

