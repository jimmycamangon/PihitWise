import { useOutletContext } from 'react-router-dom'
import type { Bike } from '../data/mock'

export interface BikeContext { bike: Bike; setBikeId: (id: string) => void }

/** The bike currently selected in the app shell. */
export function useBike() {
    return useOutletContext<BikeContext>()
}
