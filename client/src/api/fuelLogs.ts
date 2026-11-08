import type { FuelLog, FuelLogRequest } from "../types/fuelLogs";
import { checkSession } from "./session";

export async function getFuelLogs(vehicleId: string): Promise<FuelLog[]> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/fuel`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function createFuelLog(vehicleId: string, data: FuelLogRequest): Promise<FuelLog> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/fuel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify(data),
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function updateFuelLog(id: string, data: FuelLogRequest): Promise<FuelLog> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/fuel/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function deleteFuelLog(id: string): Promise<void> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/fuel/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
}

export async function getFuelEconomy(vehicleId: string): Promise<FuelLog[]> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/fuel/economy`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}