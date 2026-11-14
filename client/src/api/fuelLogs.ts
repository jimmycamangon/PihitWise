import { getToken } from '../lib/token'
import { isPendingId, send } from '../lib/outbox'
import type { FuelLog, FuelLogRequest, FuelEconomy } from '../types/fuelLogs'
import { checkSession } from './session'
import { NOT_CACHED, loggable } from './loggable'

const fuel = loggable<FuelLog, FuelLogRequest>('fuel', (v) => `/api/vehicles/${v}/fuel`, (id) => `/api/fuel/${id}`)

export const getFuelLogs = fuel.list
export const createFuelLog = fuel.create
export const updateFuelLog = fuel.update
export const deleteFuelLog = fuel.remove

// km/L is worked out by the server, so fill-ups still waiting to sync aren't counted yet.
export async function getFuelEconomy(vehicleId: string): Promise<FuelEconomy> {
    if (isPendingId(vehicleId)) return { averageKmPerLiter: null, points: [] }   // bike added offline
    const response = await send(`/api/vehicles/${vehicleId}/fuel/economy`, {
        headers: { Authorization: `Bearer ${getToken()}` },
    }, NOT_CACHED)
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}
