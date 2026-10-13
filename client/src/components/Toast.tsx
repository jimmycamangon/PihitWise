import { useEffect } from 'react'
import Icon from './Icon'

interface ToastProps { message: string; onClose: () => void }

/** A small message at the bottom of the screen. Hides itself after 3 seconds. Empty message = hidden. */
export default function Toast({ message, onClose }: ToastProps) {
    useEffect(() => {
        if (!message) return
        const timer = setTimeout(onClose, 3000)
        return () => clearTimeout(timer)
    }, [message, onClose])

    if (!message) return null

    return (
        <div role="status"
            className="fixed z-50 bottom-4 left-1/2 -translate-x-1/2
                 md:bottom-auto md:top-4 md:left-auto md:right-4 md:translate-x-0 flex items-center gap-2
                 h-10 px-4 rounded-lg bg-surface border border-line shadow-lg text-[13px] text-ink whitespace-nowrap
                 animate-[toast-up_0.25s_ease-out] md:animate-[toast-left_0.25s_ease-out]">
            <Icon name="check" size={14} className="text-ok" />
            {message}
        </div>
    )
}
