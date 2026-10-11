import type { User, LoginResult, Me } from "../types/auth"


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
    if(!response.ok) {
        throw new Error(await response.text())
    }
    return response.json()
}