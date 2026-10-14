import type { Vehicle, VehicleRequest } from "../types/vehicles";
import { checkSession } from './session'

export async function getVehicles(): Promise<Vehicle[]> {
    const token = localStorage.getItem('token')

    const response = await fetch('/api/vehicles', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}


export async function createVehicle(data: VehicleRequest): Promise<Vehicle> {
    const token = localStorage.getItem('token')

    const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    checkSession(response)
    if (response.status === 409) {
        const body = await response.json()
        throw new Error(body.message)
    }
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function updateVehicle(id: string, data: VehicleRequest): Promise<Vehicle> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    checkSession(response)
    if (response.status === 409) {
        const body = await response.json()
        throw new Error(body.message)
    }
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function deleteVehicle(id: string): Promise<void> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if (!response.ok) {
        throw new Error(await response.text())
    }
}