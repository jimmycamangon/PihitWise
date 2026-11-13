import { useSyncExternalStore } from 'react'

// How the app's pages are listed on phones. Saved per device, like the theme.
export type NavStyle = 'scroll' | 'menu' | 'bottom'

export const navStyles: { value: NavStyle; label: string; description: string }[] = [
    { value: 'scroll', label: 'Scrolling tabs', description: 'All pages in a row under the top bar. Swipe sideways to see more.' },
    { value: 'menu', label: 'Collapsible menu', description: 'A Menu button that opens the full list and folds it away.' },
    { value: 'bottom', label: 'Bottom bar', description: 'Main pages at the bottom of the screen, the rest under More.' },
]

const KEY = 'pihitwise-nav'
const listeners = new Set<() => void>()

export function getNavStyle(): NavStyle {
    try {
        const saved = localStorage.getItem(KEY)
        if (saved === 'menu' || saved === 'bottom' || saved === 'scroll') return saved
    } catch { /* storage blocked */ }
    return 'scroll'
}

export function setNavStyle(style: NavStyle) {
    try { localStorage.setItem(KEY, style) } catch { /* storage blocked */ }
    listeners.forEach((l) => l())
}

function subscribe(onChange: () => void) {
    listeners.add(onChange)
    return () => { listeners.delete(onChange) }
}

export function useNavStyle() {
    return useSyncExternalStore(subscribe, getNavStyle, () => 'scroll' as NavStyle)
}
