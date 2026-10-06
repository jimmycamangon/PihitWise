import type { Tone } from '../components/ui'
import type { Urgency } from '../data/mock'

export const urgencyTone: Record<Urgency, Tone> = { overdue: 'warn', soon: 'accent', ok: 'ok' }
export const urgencyLabel: Record<Urgency, string> = { overdue: 'Overdue', soon: 'Due soon', ok: 'On track' }
