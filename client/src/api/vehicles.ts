import type { Vehicle, VehicleRequest } from "../types/vehicles";


export async function getVehicles(
    type: string,
    name: string,
    brand: string,
    model: string,
    year: number,
    plateNumber: string | null,
    odometer: number,
    createdAt: string
) : Promise<Vehicle[]> {
    const response = await fetch('/api/vehicles/getall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, name, brand, model, year,plateNumber, odometer, createdAt })
    })
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}


export async function createVehicle(data: VehicleRequest) : Promise<VehicleRequest> {
    const token = localStorage.getItem('token')

    const response = await fetch('/api/vehicles/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function updateVehicle(id: string, data: VehicleRequest) : Promise<VehicleRequest> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/update/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(data),
    })
    if (!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function deleteItem(id: string) : Promise<void> {
    const token = localStorage.getItem('token')

    const response = await fetch(`api/vehicles/delete/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    if (!response.ok) {
        throw new Error(await response.text())
    }
}