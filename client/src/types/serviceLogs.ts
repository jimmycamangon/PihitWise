export interface ServiceLog {
    id: string
    vehicleId: string
    date: string
    cost: number
    shop: string | null
    odometer: number
    type: string
    notes: string | null
    createdAt: string
}

export interface ServiceLogRequest {
    date: string
    cost: number
    shop: string | null
    odometer: number
    type: string
    notes: string | null
}