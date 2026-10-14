export function checkSession(response: Response) {
    if (response.status === 401) {
        localStorage.removeItem('token')
        window.location.href = '/login?expired=1'
    }
}