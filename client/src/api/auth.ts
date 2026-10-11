import type { User, LoginResult } from "../types/auth"


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