import type { ServiceLog, ServiceLogRequest } from "../types/serviceLogs";
import { checkSession } from "./session";

export async function getServiceLogs(vehicleId: string): Promise<ServiceLog[]> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/services`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function createServiceLog(vehicleId: string, data: ServiceLogRequest): Promise<ServiceLog[]> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/vehicles/${vehicleId}/services`, {
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

export async function updateServiceLog(id: string, data: ServiceLogRequest): Promise<ServiceLog> {
    const token = localStorage.getItem('token')

    const response = await fetch(`/api/services/${id}`, {
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

export async function deleteServiceLog(id: string): Promise<void> {
    const token = localStorage.getItem('token')

    const response = await fetch(`api/service/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
}