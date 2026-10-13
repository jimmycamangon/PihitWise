import { useEffect } from 'react'
import type { ReactNode } from 'react'

interface ModalProps { open: boolean; title: string; onClose: () => void; children: ReactNode }

/** A pop-up box. Slides up from the bottom on phones, sits in the center on bigger screens. */
export default function Modal({ open, title, onClose, children }: ModalProps) {
    // Close on Escape, and stop the page behind from scrolling while open.
    useEffect(() => {
        if (!open) return
        const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [open, onClose])

    if (!open) return null

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
            {/* dark background; clicking it closes the modal */}
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />

            <div role="dialog" aria-modal="true" aria-label={title}
                className="relative w-full sm:max-w-md max-h-[90vh] overflow-y-auto
                     bg-surface border border-line rounded-t-2xl sm:rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-sm font-medium text-ink">{title}</h2>
                    <button type="button" onClick={onClose} aria-label="Close"
                        className="w-8 h-8 rounded-md flex items-center justify-center text-faint
                             hover:text-ink hover:bg-raised transition-colors cursor-pointer text-lg leading-none">
                        ×
                    </button>
                </div>
                {children}
            </div>
        </div>
    )
}
