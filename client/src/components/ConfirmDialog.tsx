import Modal from './Modal'

interface ConfirmDialogProps {
    open: boolean
    title: string
    message: string
    confirmText?: string
    danger?: boolean
    onConfirm: () => void
    onCancel: () => void
}

/** A small "Are you sure?" box with Cancel and a confirm button. */
export default function ConfirmDialog({
    open, title, message, confirmText = 'Confirm', danger = false, onConfirm, onCancel,
}: ConfirmDialogProps) {
    return (
        <Modal open={open} title={title} onClose={onCancel}>
            <p className="text-[13px] text-muted mb-5">{message}</p>
            <div className="flex justify-end gap-2">
                <button type="button" onClick={onCancel}
                    className="h-9 px-4 rounded-md border border-line text-xs font-medium text-ink
                         hover:bg-raised transition-colors cursor-pointer">
                    Cancel
                </button>
                <button type="button" onClick={onConfirm}
                    className={`h-9 px-4 rounded-md text-xs font-medium hover:opacity-90 transition-opacity cursor-pointer
                         ${danger ? 'bg-warn text-white' : 'bg-accent text-on-accent'}`}>
                    {confirmText}
                </button>
            </div>
        </Modal>
    )
}
