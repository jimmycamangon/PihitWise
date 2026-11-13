import { Badge } from './ui'
import type { PendingFields } from '../lib/outbox'

/** Marks a log that is saved on this device but not on the server yet. */
export default function SyncBadge({ row }: { row: PendingFields }) {
    if (!row.pending) return null
    return (
        <span title={row.syncError ?? 'Saved on this device. It syncs when you\'re online.'} className="ml-2 align-middle">
            <Badge tone={row.syncError ? 'warn' : 'accent'}>{row.syncError ? 'Couldn\'t sync' : 'Waiting to sync'}</Badge>
        </span>
    )
}
