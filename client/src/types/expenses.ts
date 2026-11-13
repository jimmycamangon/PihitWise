// An "Other" expense: anything that is not a fill-up or a service.
import type { PendingFields } from "../lib/outbox"

export interface OtherExpense extends PendingFields {
    id: string
    vehicleId: string
    date: string
    label: string
    cost: number
    notes: string | null
    createdAt: string
}

export interface OtherExpenseRequest {
    date: string
    label: string
    cost: number
    notes: string | null
}
