import type { PendingFields } from '../lib/outbox'

export interface Vehicle extends PendingFields {
    id: string
    type: 'Motorcycle' | 'Car'
    name: string
    brand: string
    model: string
    year: number
    plateNumber: string | null
    odometer: number
    createdAt: string
}

export interface VehicleRequest {
    type: 'Motorcycle' | 'Car'
    name: string
    brand: string
    model: string
    year: number
    plateNumber: string | null
    odometer: number
}