import { useSyncExternalStore } from 'react'
import { en } from '../i18n/en'

// App language. English is the source; every key must also exist in Filipino (TypeScript checks it).
// Saved per device, like the theme. Server messages stay in English for now.
// English is built in; Filipino is downloaded only for riders who use it (smaller first load).

export type Lang = 'en' | 'fil'
export type TKey = keyof typeof en
export type Dictionary = Record<TKey, string>

let filipino: Dictionary | null = null

/** Makes sure a language's text is downloaded (only Filipino needs it). Safe to call any time. */
export function loadLanguage(lang: Lang = getLang()): Promise<void> {
    if (lang !== 'fil' || filipino) return Promise.resolve()
    return import('../i18n/fil').then((m) => { filipino = m.fil })
}
export const languages: { value: Lang; label: string; short: string }[] = [
    { value: 'en', label: 'English', short: 'EN' },
    { value: 'fil', label: 'Filipino', short: 'FIL' },
]

const KEY = 'pihitwise-lang'
const listeners = new Set<() => void>()

export function getLang(): Lang {
    try { return localStorage.getItem(KEY) === 'fil' ? 'fil' : 'en' } catch { return 'en' }
}

export function setLang(lang: Lang) {
    try { localStorage.setItem(KEY, lang) } catch { /* storage blocked */ }
    document.documentElement.lang = lang === 'fil' ? 'fil' : 'en'
    listeners.forEach((l) => l())
    // If the Filipino text isn't here yet, show it as soon as it arrives.
    if (lang === 'fil' && !filipino) loadLanguage('fil').then(() => listeners.forEach((l) => l())).catch(() => { /* offline: stays English */ })
}

/** Text for a key in the current language. `{name}` placeholders are filled from `vars`. */
export function t(key: TKey, vars?: Record<string, string | number>): string {
    let text = (getLang() === 'fil' && filipino ? filipino[key] : en[key]) ?? en[key]
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v))
    return text
}

/** Re-renders the component when the language changes, and returns `t`. */
export function useT() {
    // The snapshot includes whether the Filipino text has arrived, so text re-renders when it does.
    useSyncExternalStore(
        (onChange) => { listeners.add(onChange); return () => { listeners.delete(onChange) } },
        () => `${getLang()}:${filipino ? 1 : 0}`,
        () => 'en:0',
    )
    return t
}

export const useLang = () => useSyncExternalStore(
    (onChange) => { listeners.add(onChange); return () => { listeners.delete(onChange) } },
    getLang,
    () => 'en' as Lang,
)
