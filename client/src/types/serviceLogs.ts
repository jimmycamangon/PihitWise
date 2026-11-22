import type { PendingFields } from "../lib/outbox"

export interface ServiceLog extends PendingFields {
    id: string
    vehicleId: string
    date: string
    cost: number
    shop: string | null
    odometer: number
    type: string
    notes: string | null
    createdAt: string
    updatedAt?: string | null   // set when the entry was changed after it was first saved
}

export interface ServiceLogRequest {
    date: string
    cost: number
    shop: string | null
    odometer: number
    type: string
    notes: string | null
}