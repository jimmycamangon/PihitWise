import { getToken } from '../lib/token'
import { send } from '../lib/outbox'
import { checkSession } from './session'
import type { AdminUsersPage } from '../types/admin'

/** One page of users (newest first), searched on the server. Admins only (403 otherwise). */
export async function getAdminUsers(search: string, page: number, pageSize = 50): Promise<AdminUsersPage> {
    const query = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    if (search.trim()) query.set('search', search.trim())
    const response = await send(`/api/admin/users?${query}`, { headers: { Authorization: `Bearer ${getToken()}` } })
    checkSession(response)
    if (!response.ok) throw new Error(await response.text() || `Error ${response.status}`)
    return response.json()
}
