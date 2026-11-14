import type { Vehicle, VehicleRequest } from '../types/vehicles'
import { loggable } from './loggable'

// Bikes work offline too: adding, editing and deleting are queued on the device (lib/outbox).
// A bike added offline gets its real id when it syncs, and anything logged for it follows.
const vehicles = loggable<Vehicle, VehicleRequest>('vehicle', () => '/api/vehicles', (id) => `/api/vehicles/${id}`)

export const getVehicles = () => vehicles.list('')
export const createVehicle = (data: VehicleRequest) => vehicles.create('', data)
export const updateVehicle = vehicles.update
export const deleteVehicle = vehicles.remove
