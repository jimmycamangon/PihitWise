import { getToken } from '../lib/token'
import type { OtherExpense, OtherExpenseRequest } from "../types/expenses";
import { checkSession } from "./session";

export async function getOtherExpenses(vehicleId: string): Promise<OtherExpense[]> {
    const token = getToken()

    const response = await fetch(`/api/vehicles/${vehicleId}/expenses`, {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function createOtherExpense(vehicleId: string, data: OtherExpenseRequest): Promise<OtherExpense> {
    const token = getToken()

    const response = await fetch(`/api/vehicles/${vehicleId}/expenses`, {
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

export async function updateOtherExpense(id: string, data: OtherExpenseRequest): Promise<OtherExpense> {
    const token = getToken()

    const response = await fetch(`/api/expenses/${id}`, {
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

export async function deleteOtherExpense(id: string): Promise<void> {
    const token = getToken()

    const response = await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
}
