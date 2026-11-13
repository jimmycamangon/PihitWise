import { useSyncExternalStore } from 'react'
import { en } from '../i18n/en'
import { fil } from '../i18n/fil'

// App language. English is the source; every key must also exist in Filipino (TypeScript checks it).
// Saved per device, like the theme. Server messages stay in English for now.

export type Lang = 'en' | 'fil'
export type TKey = keyof typeof en
export type Dictionary = Record<TKey, string>

const dictionaries: Record<Lang, Dictionary> = { en, fil }
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
}

/** Text for a key in the current language. `{name}` placeholders are filled from `vars`. */
export function t(key: TKey, vars?: Record<string, string | number>): string {
    let text = dictionaries[getLang()][key] ?? en[key]
    if (vars) for (const [k, v] of Object.entries(vars)) text = text.replaceAll(`{${k}}`, String(v))
    return text
}

/** Re-renders the component when the language changes, and returns `t`. */
export function useT() {
    useSyncExternalStore(
        (onChange) => { listeners.add(onChange); return () => { listeners.delete(onChange) } },
        getLang,
        () => 'en' as Lang,
    )
    return t
}

export const useLang = () => useSyncExternalStore(
    (onChange) => { listeners.add(onChange); return () => { listeners.delete(onChange) } },
    getLang,
    () => 'en' as Lang,
)
