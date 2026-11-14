import { getToken } from '../lib/token'
import { OfflineError, applyChanges, clearChangesFor, isPendingId, pendingRecords, queue, queueChange, removePending, send, updatePending } from '../lib/outbox'
import type { OutboxKind } from '../lib/outbox'
import { checkSession } from './session'

// List, add, edit and delete for the logs a rider can make offline (fuel, services, other expenses).
// Without signal, adding, editing and deleting are saved on the device (lib/outbox) and synced later.
// Lists show those queued changes on top of the server's (or the offline copy's) records.

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

export function loggable<T extends { id: string }, R extends object>(kind: OutboxKind, listPath: (vehicleId: string) => string, itemPath: (id: string) => string) {
    return {
        async list(vehicleId: string): Promise<T[]> {
            // A bike added offline isn't on the server yet: only what was logged for it on this device.
            if (isPendingId(vehicleId)) return pendingRecords<T>(kind, vehicleId)
            const saved = await read<T[]>(await send(listPath(vehicleId), {
                headers: { Authorization: `Bearer ${getToken()}` },
            }, NOT_CACHED))
            return [...pendingRecords<T>(kind, vehicleId), ...applyChanges(kind, saved)]
        },

        async create(vehicleId: string, data: R): Promise<T> {
            // For a bike that's still waiting to sync, the log has to wait for it.
            if (isPendingId(vehicleId)) return queue<T>(kind, vehicleId, data)
            try {
                return await read<T>(await send(listPath(vehicleId), { method: 'POST', ...json(data) }))
            } catch (err) {
                if (err instanceof OfflineError) return queue<T>(kind, vehicleId, data)
                throw err
            }
        },

        async update(id: string, data: R): Promise<T> {
            if (isPendingId(id)) return updatePending<T>(id, data)
            try {
                const saved = await read<T>(await send(itemPath(id), { method: 'PUT', ...json(data) }))
                clearChangesFor(kind, id)
                return saved
            } catch (err) {
                if (!(err instanceof OfflineError)) throw err
                // Offline: keep the edit on the device; the row shows the new values with "Waiting to sync".
                queueChange(kind, 'update', id, data)
                return { ...data, id, pending: true } as unknown as T
            }
        },

        async remove(id: string): Promise<void> {
            if (isPendingId(id)) return removePending(id)
            let response: Response
            try {
                response = await send(itemPath(id), {
                    method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` },
                })
            } catch (err) {
                if (!(err instanceof OfflineError)) throw err
                // Offline: hide it now, delete it on the server when the connection is back.
                return queueChange(kind, 'delete', id)
            }
            checkSession(response)
            if (!response.ok) throw new Error(await response.text())
            clearChangesFor(kind, id)
        },
    }
}
