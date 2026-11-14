import { getToken } from '../lib/token'
import { send } from '../lib/outbox'
import { checkSession } from './session'
import type { AdminUser } from '../types/admin'

/** Every account with its counts. Only works for admins (the server answers 403 otherwise). */
export async function getAdminUsers(): Promise<AdminUser[]> {
    const response = await send('/api/admin/users', { headers: { Authorization: `Bearer ${getToken()}` } })
    checkSession(response)
    if (!response.ok) throw new Error(await response.text() || `Error ${response.status}`)
    return response.json()
}
