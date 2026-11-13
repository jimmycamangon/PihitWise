import { Badge } from './ui'
import type { PendingFields } from '../lib/outbox'
import { useT } from '../lib/i18n'

/** Marks a log that is saved on this device but not on the server yet. */
export default function SyncBadge({ row }: { row: PendingFields }) {
    const t = useT()
    if (!row.pending) return null
    return (
        <span title={row.syncError ?? t('sync.savedHere')} className="ml-2 align-middle">
            <Badge tone={row.syncError ? 'warn' : 'accent'}>{row.syncError ? t('sync.couldntTag') : t('sync.waitingTag')}</Badge>
        </span>
    )
}
