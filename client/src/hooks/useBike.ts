import { useOutletContext } from 'react-router-dom'
import type { Vehicle } from '../types/vehicles'
import type { Bike } from '../data/mock'

export interface BikeContext {

    bike: Bike
    setBikeId: (id: string) => void
    vehicle: Vehicle | null
    reloadVehicles: () => void
}

export function useBike() {
    return useOutletContext<BikeContext>()
}