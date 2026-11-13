import { useOutletContext } from 'react-router-dom'
import type { Me } from '../types/auth'
import type { Vehicle } from '../types/vehicles'

export interface BikeContext {
    vehicle: Vehicle | null
    vehicles: Vehicle[]
    vehiclesLoading: boolean
    reloadVehicles: () => void
    me: Me | null
    signOut: () => void
}

export function useBike() {
    return useOutletContext<BikeContext>()
}
