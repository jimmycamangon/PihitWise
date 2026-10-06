import { useEffect, useState } from 'react'

const STORAGE_KEY = 'revora-theme'

export function useTheme() {
    const [dark, setDark] = useState<boolean>(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved !== null) return saved === 'dark'
        return true
    })

    useEffect(() => {
        document.documentElement.classList.toggle('dark', dark)
        localStorage.setItem(STORAGE_KEY, dark ? 'dark' : 'light')
    }, [dark])

    return { dark, toggle: () => setDark((d) => !d) }
}
