import { useSyncExternalStore } from 'react'

const subscribe = (onChange: () => void) => {
    window.addEventListener('online', onChange)
    window.addEventListener('offline', onChange)
    return () => {
        window.removeEventListener('online', onChange)
        window.removeEventListener('offline', onChange)
    }
}

/** False while the phone or computer has no connection. */
export function useOnline() {
    return useSyncExternalStore(subscribe, () => navigator.onLine, () => true)
}
