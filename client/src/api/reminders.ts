import { getToken } from '../lib/token'
import type { Reminder, ReminderRequest } from "../types/reminders";
import { checkSession } from "./session";
import { applyChanges, OfflineError, queueChange, send } from '../lib/outbox'
import { NOT_CACHED } from './loggable'

export async function getReminders(vehicleId: string): Promise<Reminder[]> {
    const token = getToken()

    const response = await send(`/api/vehicles/${vehicleId}/reminders`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    }, NOT_CACHED)
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    // Reminders marked done while offline show as done (or waiting to sync) until they reach the server.
    return applyChanges('reminder', await response.json() as Reminder[])
}


export async function createReminder(vehicleId: string, data: ReminderRequest): Promise<Reminder> {
    const token = getToken()

    const response = await send(`/api/vehicles/${vehicleId}/reminders`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function updateReminder(id: string, data: ReminderRequest): Promise<Reminder> {
    const token = getToken()

    const response = await send(`/api/reminders/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}


export async function deleteReminder(id: string): Promise<void> {
    const token = getToken()

    const response = await send(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
}

/** Marks a reminder done. Offline, it's queued and comes back as `{ pending: true }`. */
export async function markReminderDone(id: string): Promise<Reminder> {
    const token = getToken()

    let response: Response
    try {
        response = await send(`/api/reminders/${id}/done`, {
            method: 'PATCH',
            headers: { Authorization: `Bearer ${token}` },
        })
    } catch (err) {
        if (!(err instanceof OfflineError)) throw err
        queueChange('reminder', 'done', id)
        return { id, pending: true } as Reminder
    }
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}