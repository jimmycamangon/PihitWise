// Where the sign-in token lives:
// - "Remember me" on: localStorage, so it survives closing the browser (token lasts 30 days).
// - Off: sessionStorage, so closing the browser signs you out (token lasts 60 minutes).
const KEY = 'token'

function safe<T>(read: () => T, fallback: T): T {
    try { return read() } catch { return fallback }
}

export function getToken(): string | null {
    return safe(() => localStorage.getItem(KEY) ?? sessionStorage.getItem(KEY), null)
}

/** True when the current sign-in used "Remember me". */
export function isRemembered(): boolean {
    return safe(() => localStorage.getItem(KEY) !== null, false)
}

/** Saves a token. Without `remember`, it stays where the current one is (used when the token is renewed). */
export function setToken(token: string, remember = isRemembered()) {
    clearToken()
    safe(() => (remember ? localStorage : sessionStorage).setItem(KEY, token), undefined)
}

export function clearToken() {
    safe(() => { localStorage.removeItem(KEY); sessionStorage.removeItem(KEY) }, undefined)
    // Forget the offline copy of this rider's data (see public/sw.js), so the next person can't see it.
    if ('caches' in window) caches.delete('pihitwise-api').catch(() => { })
}
