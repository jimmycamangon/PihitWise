import type { User, LoginResult, Me } from "../types/auth"
import { checkSession } from './session'


export async function register(fullName: string, email: string, password: string) : Promise<User> {
    const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fullName, email, password })
    })
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function login(email: string, password: string) : Promise<LoginResult> {
    const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    })
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function getMe() : Promise<Me> {
    const token = localStorage.getItem('token')
    
    const response = await fetch('/api/auth/me', {
        method: 'GET',
        headers: { Authorization: `Bearer ${token}` },
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function updateProfile(fullName: string, email: string) : Promise<LoginResult> {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/auth/me', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ fullName, email })
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}

export async function changePassword(currentPassword: string, newPassword: string) : Promise<void> {
    const token = localStorage.getItem('token')
    const response = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword, newPassword })
    })
    checkSession(response)
    if(!response.ok) {
        throw new Error(await response.text())
    }
}


export async function requestPasswordReset(email: string) : Promise<void> {
    const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
    })
    if(!response.ok) {
        throw new Error(await response.text())
    }
}

export async function resetPassword(email: string, token: string, newPassword: string) : Promise<void> {
    const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, token, newPassword })
    })
    if(!response.ok) {
        throw new Error(await response.text())
    }
}
