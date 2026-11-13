import { clearToken } from '../lib/token'
export function checkSession(response: Response) {
    if (response.status === 401) {
        clearToken()
        window.location.href = '/login?expired=1'
    }
}