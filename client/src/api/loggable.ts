import { getToken } from '../lib/token'
import { OfflineError, isPendingId, pendingRecords, queue, removePending, send, updatePending } from '../lib/outbox'
import type { OutboxKind } from '../lib/outbox'
import { checkSession } from './session'

// List, add, edit and delete for the logs a rider can make offline (fuel, services, other expenses).
// Without signal, adding is saved on the device (lib/outbox) and synced later.
// Logs still waiting to sync can be edited or deleted on the device too.

/** A list that was never opened online on this device has no offline copy. */
export const NOT_CACHED = 'You\'re offline, and this page hasn\'t been opened online on this device yet.'

const json = (body: unknown) => ({
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
    body: JSON.stringify(body),
})

async function read<T>(response: Response): Promise<T> {
    checkSession(response)
    if (!response.ok) throw new Error(await response.text())
    return response.json()
}

export function loggable<T, R extends object>(kind: OutboxKind, listPath: (vehicleId: string) => string, itemPath: (id: string) => string) {
    return {
        async list(vehicleId: string): Promise<T[]> {
            const saved = await read<T[]>(await send(listPath(vehicleId), {
                headers: { Authorization: `Bearer ${getToken()}` },
            }, NOT_CACHED))
            return [...pendingRecords<T>(kind, vehicleId), ...saved]
        },

        async create(vehicleId: string, data: R): Promise<T> {
            try {
                return await read<T>(await send(listPath(vehicleId), { method: 'POST', ...json(data) }))
            } catch (err) {
                if (err instanceof OfflineError) return queue<T>(kind, vehicleId, data)
                throw err
            }
        },

        async update(id: string, data: R): Promise<T> {
            if (isPendingId(id)) return updatePending<T>(id, data)
            return read<T>(await send(itemPath(id), { method: 'PUT', ...json(data) }))
        },

        async remove(id: string): Promise<void> {
            if (isPendingId(id)) return removePending(id)
            const response = await send(itemPath(id), {
                method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
            })
            checkSession(response)
            if (!response.ok) throw new Error(await response.text())
        },
    }
}
