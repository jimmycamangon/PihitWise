import { useSyncExternalStore } from 'react'
import { getToken } from './token'

// Changes made without signal wait here (on the device) and are sent, in order, when the connection is back:
// - create: a new fill-up / service / expense
// - update: an edit to a log the server already has
// - delete: deleting a log the server already has
// - done:   marking a reminder done
// Each item remembers which rider made it, so another account on the same phone never sends or sees it.

export type OutboxKind = 'fuel' | 'service' | 'expense' | 'reminder'
export type OutboxOp = 'create' | 'update' | 'delete' | 'done'

export interface OutboxItem {
    id: string              // "pending-…"; for a create it is also the row id until it syncs
    owner: string           // user id from the sign-in token
    kind: OutboxKind
    op?: OutboxOp           // missing on items saved by older versions = create
    vehicleId: string
    targetId?: string       // the server record an update / delete / done is for
    body: Record<string, unknown>
    queuedAt: string
    error?: string          // the server refused it; the rider has to fix or delete it
}

/** Shape the pages get for a log that hasn't reached the server yet. */
export interface PendingFields { pending?: boolean; syncError?: string }

const KEY = 'pihitwise-outbox'
const listPath: Record<OutboxKind, (vehicleId: string) => string> = {
    fuel: (v) => `/api/vehicles/${v}/fuel`,
    service: (v) => `/api/vehicles/${v}/services`,
    expense: (v) => `/api/vehicles/${v}/expenses`,
    reminder: (v) => `/api/vehicles/${v}/reminders`,
}
const itemPath: Record<OutboxKind, (id: string) => string> = {
    fuel: (id) => `/api/fuel/${id}`,
    service: (id) => `/api/services/${id}`,
    expense: (id) => `/api/expenses/${id}`,
    reminder: (id) => `/api/reminders/${id}`,
}
const opOf = (item: OutboxItem): OutboxOp => item.op ?? 'create'

/** Thrown when the request never reached the server (no signal). */
export class OfflineError extends Error {
    constructor(message = 'You\'re offline. This needs a connection.') {
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

/** This rider's queued changes, oldest first. */
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

const newId = () => `pending-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`

function requireOwner() {
    const owner = currentUser()
    if (!owner) throw new Error('Sign in again to save.')
    return owner
}

// ── New logs (create) ──────────────────────────────────────────────────────

function toRecord<T>(item: OutboxItem): T {
    return { ...item.body, id: item.id, vehicleId: item.vehicleId, createdAt: item.queuedAt, pending: true, syncError: item.error } as T
}

/** Saves a new log on the device and returns it shaped like the server's answer. */
export function queue<T>(kind: OutboxKind, vehicleId: string, body: object): T {
    const item: OutboxItem = {
        id: newId(), owner: requireOwner(), kind, op: 'create', vehicleId, body: { ...body }, queuedAt: new Date().toISOString(),
    }
    writeAll([...readAll(), item])
    return toRecord<T>(item)
}

/** Queued new logs of one kind for one bike, shaped like server records. */
export function pendingRecords<T>(kind: OutboxKind, vehicleId: string): T[] {
    return getOutbox()
        .filter((i) => i.kind === kind && opOf(i) === 'create' && i.vehicleId === vehicleId)
        .map((i) => toRecord<T>(i))
}

/** Editing a queued new log changes what will be sent, and gives it another try. */
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

// ── Changes to records the server already has (update / delete / done) ────

const sameTarget = (i: OutboxItem, owner: string, kind: OutboxKind, targetId: string) =>
    i.owner === owner && i.kind === kind && i.targetId === targetId

/**
 * Queues an edit, delete or "done" for a record that is already on the server.
 * Several edits to one record become one; deleting drops any edits queued for it.
 */
export function queueChange(kind: OutboxKind, op: Exclude<OutboxOp, 'create'>, targetId: string, body: object = {}) {
    const owner = requireOwner()
    let all = readAll()

    if (op === 'update') {
        const existing = all.find((i) => sameTarget(i, owner, kind, targetId) && i.op === 'update')
        if (existing) {
            existing.body = { ...body }
            delete existing.error
            return writeAll(all)
        }
    }
    if (op === 'delete') all = all.filter((i) => !(sameTarget(i, owner, kind, targetId) && (i.op === 'update' || i.op === 'done')))
    if (op === 'done' && all.some((i) => sameTarget(i, owner, kind, targetId) && i.op === 'done')) return

    all.push({ id: newId(), owner, kind, op, vehicleId: '', targetId, body: { ...body }, queuedAt: new Date().toISOString() })
    writeAll(all)
}

/**
 * Shows queued changes on top of the records the server sent (or the offline copy of them):
 * edited records get their new values, deleted ones disappear, reminders marked done look done.
 */
export function applyChanges<T extends { id: string }>(kind: OutboxKind, records: T[]): T[] {
    const changes = getOutbox().filter((i) => i.kind === kind && i.targetId)
    if (changes.length === 0) return records
    const deleted = new Set(changes.filter((i) => i.op === 'delete').map((i) => i.targetId))

    return records
        .filter((r) => !deleted.has(r.id))
        .map((r) => {
            let record: T = r
            for (const change of changes) {
                if (change.targetId !== r.id) continue
                if (change.op === 'update') record = { ...record, ...change.body, pending: true, syncError: change.error }
                if (change.op === 'done') {
                    // A one-time reminder closes; a repeating one gets its next due km from the server when it syncs.
                    const repeating = (record as { repeatEveryKm?: number | null }).repeatEveryKm != null
                    record = { ...record, ...(repeating ? {} : { isDone: true, status: 'done' }), pending: true }
                }
            }
            return record
        })
}

/** Throws away this rider's queued changes (used on sign out, after asking). */
export function clearOutbox() {
    const owner = currentUser()
    writeAll(readAll().filter((i) => i.owner !== owner))
}

// ── Sync ───────────────────────────────────────────────────────────────────

function requestFor(item: OutboxItem): [string, RequestInit] {
    const auth = { Authorization: `Bearer ${getToken()}` }
    const json = { ...auth, 'Content-Type': 'application/json' }
    switch (opOf(item)) {
        case 'update': return [itemPath[item.kind](item.targetId!), { method: 'PUT', headers: json, body: JSON.stringify(item.body) }]
        case 'delete': return [itemPath[item.kind](item.targetId!), { method: 'DELETE', headers: auth }]
        case 'done': return [`${itemPath[item.kind](item.targetId!)}/done`, { method: 'PATCH', headers: auth }]
        default: return [listPath[item.kind](item.vehicleId), { method: 'POST', headers: json, body: JSON.stringify(item.body) }]
    }
}

let syncing: Promise<number> | null = null

/**
 * Sends this rider's queued changes in the order they were made.
 * Stops at the first "no connection". A refused new log or edit keeps its error and is skipped until edited;
 * a change for a record that no longer exists (or a refused delete / done) is dropped, since there's nothing to fix.
 * Returns how many changes reached the server.
 */
export function syncOutbox(): Promise<number> {
    syncing ??= (async () => {
        let sent = 0
        try {
            for (const item of getOutbox()) {
                if (item.error) continue
                let response: Response
                try {
                    response = await fetch(...requestFor(item))
                } catch {
                    break   // still no connection
                }
                // Signed out or expired: keep everything for after the rider signs back in.
                if (response.status === 401) break

                const all = readAll()
                const op = opOf(item)
                const gone = response.status === 404 && op !== 'create'
                if (response.ok || gone || (!response.ok && (op === 'delete' || op === 'done'))) {
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

/** After an online save or delete of a record, drop any queued (or failed) offline changes for it. */
export function clearChangesFor(kind: OutboxKind, targetId: string) {
    const owner = currentUser()
    const all = readAll()
    const kept = all.filter((i) => !(i.owner === owner && i.kind === kind && i.targetId === targetId))
    if (kept.length !== all.length) writeAll(kept)
}
