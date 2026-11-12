import type { Reminder, ReminderRequest } from "../types/reminders";
import { checkSession } from "./session";

export async function getReminders(vehicleId: string): Promise<Reminder[]> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/reminders`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}


export async function createReminder(vehicleId: string, data: ReminderRequest): Promise<Reminder> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/reminders`, {
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
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/reminders/${id}`, {
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
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/reminders/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
}

export async function markReminderDone(id: string): Promise<Reminder> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/reminders/${id}/done`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}