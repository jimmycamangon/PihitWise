export interface FuelLog {
    id: string
    vehicleId: string
    date: string
    liters: number
    cost: number
    odometer: number
    isFullTank: boolean
    createdAt: string
}

export interface FuelLogRequest {
    date: string
    odometer: number
    liters: number
    cost: number
    isFullTank: boolean
}

export interface FuelEconomyPoint {
    fuelLogId: string
    date: string
    kmPerLiter: number
}

export interface FuelEconomy {
    averageKmPerLiter: number | null   // null = not enough full tanks
    points: FuelEconomyPoint[]
}