import { useSyncExternalStore } from 'react'
import { getToken } from './token'

// Logs made without signal wait here (on the device) and are sent when the connection is back.
// Each item remembers which rider made it, so another account on the same phone never sends or sees it.

export type OutboxKind = 'fuel' | 'service' | 'expense'

export interface OutboxItem {
    id: string              // "pending-…", also used as the row id until it syncs
    owner: string           // user id from the sign-in token
    kind: OutboxKind
    vehicleId: string
    body: Record<string, unknown>
    queuedAt: string
    error?: string          // the server refused it; the rider has to fix or delete it
}

/** Shape the pages get for a log that hasn't reached the server yet. */
export interface PendingFields { pending?: boolean; syncError?: string }

const KEY = 'pihitwise-outbox'
const createPath: Record<OutboxKind, (vehicleId: string) => string> = {
    fuel: (v) => `/api/vehicles/${v}/fuel`,
    service: (v) => `/api/vehicles/${v}/services`,
    expense: (v) => `/api/vehicles/${v}/expenses`,
}

/** Thrown when the request never reached the server (no signal). */
export class OfflineError extends Error {
    constructor(message = 'You\'re offline. Editing or deleting a saved record needs a connection.') {
        super(message)
    }
}

/** fetch that turns "no connection" into an OfflineError. */
export async function send(input: string, init: RequestInit, offlineMessage?: string): Promise<Response> {
    try {
        return await fetch(input, init)
    } catch {
        throw new OfflineError(offlineMessage)
    }
}

export const isPendingId = (id: string) => id.startsWith('pending-')

// ── Storage ────────────────────────────────────────────────────────────────

function currentUser(): string | null {
    const token = getToken()
    if (!token) return null
    try {
        const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
        return (JSON.parse(atob(payload)) as { sub?: string }).sub ?? null
    } catch {
        return null
    }
}

function readAll(): OutboxItem[] {
    try {
        return JSON.parse(localStorage.getItem(KEY) ?? '[]') as OutboxItem[]
    } catch {
        return []
    }
}

const listeners = new Set<() => void>()
let snapshot: { owner: string | null; raw: string | null; items: OutboxItem[] } | null = null

function writeAll(items: OutboxItem[]) {
    try { localStorage.setItem(KEY, JSON.stringify(items)) } catch { /* storage full or blocked */ }
    snapshot = null
    listeners.forEach((l) => l())
}

/** This rider's queued logs, oldest first. */
export function getOutbox(): OutboxItem[] {
    const owner = currentUser()
    let raw: string | null = null
    try { raw = localStorage.getItem(KEY) } catch { /* ignore */ }
    if (snapshot && snapshot.owner === owner && snapshot.raw === raw) return snapshot.items
    const items = owner ? readAll().filter((i) => i.owner === owner) : []
    snapshot = { owner, raw, items }
    return items
}

function subscribe(onChange: () => void) {
    listeners.add(onChange)
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) { snapshot = null; onChange() } }
    window.addEventListener('storage', onStorage)
    return () => {
        listeners.delete(onChange)
        window.removeEventListener('storage', onStorage)
    }
}

export function useOutbox() {
    return useSyncExternalStore(subscribe, getOutbox, () => [])
}

// ── Queue, edit, remove ────────────────────────────────────────────────────

function toRecord<T>(item: OutboxItem): T {
    return { ...item.body, id: item.id, vehicleId: item.vehicleId, createdAt: item.queuedAt, pending: true, syncError: item.error } as T
}

/** Saves a new log on the device and returns it shaped like the server's answer. */
export function queue<T>(kind: OutboxKind, vehicleId: string, body: object): T {
    const owner = currentUser()
    if (!owner) throw new Error('Sign in again to save.')
    const item: OutboxItem = {
        id: `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        owner, kind, vehicleId, body: { ...body }, queuedAt: new Date().toISOString(),
    }
    writeAll([...readAll(), item])
    return toRecord<T>(item)
}

/** Queued logs of one kind for one bike, shaped like server records. */
export function pendingRecords<T>(kind: OutboxKind, vehicleId: string): T[] {
    return getOutbox().filter((i) => i.kind === kind && i.vehicleId === vehicleId).map((i) => toRecord<T>(i))
}

/** Editing a queued log changes what will be sent, and gives it another try. */
export function updatePending<T>(id: string, body: object): T {
    const all = readAll()
    const item = all.find((i) => i.id === id)
    if (!item) throw new Error('This log was already synced. Refresh the page and try again.')
    item.body = { ...body }
    delete item.error
    writeAll(all)
    return toRecord<T>(item)
}

export function removePending(id: string) {
    writeAll(readAll().filter((i) => i.id !== id))
}

/** Throws away this rider's queued logs (used on sign out, after asking). */
export function clearOutbox() {
    const owner = currentUser()
    writeAll(readAll().filter((i) => i.owner !== owner))
}

// ── Sync ───────────────────────────────────────────────────────────────────

let syncing: Promise<number> | null = null

/**
 * Sends this rider's queued logs in the order they were made.
 * Stops at the first "no connection"; a refused log keeps its error and is skipped until it's edited.
 * Returns how many were saved on the server.
 */
export function syncOutbox(): Promise<number> {
    syncing ??= (async () => {
        let sent = 0
        try {
            for (const item of getOutbox()) {
                if (item.error) continue
                let response: Response
                try {
                    response = await fetch(createPath[item.kind](item.vehicleId), {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                        body: JSON.stringify(item.body),
                    })
                } catch {
                    break   // still no connection
                }
                // Signed out or expired: keep everything for after the rider signs back in.
                if (response.status === 401) break
                const all = readAll()
                if (response.ok) {
                    writeAll(all.filter((i) => i.id !== item.id))
                    sent++
                } else {
                    const target = all.find((i) => i.id === item.id)
                    if (target) {
                        target.error = (await response.text()) || `The server refused it (${response.status}).`
                        writeAll(all)
                    }
                }
            }
        } finally {
            syncing = null
        }
        return sent
    })()
    return syncing
}
