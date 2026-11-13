import { useEffect, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'

/**
 * Opens the page's add form when the URL has `?add=1` (from the "+ Log" menu),
 * then drops the flag so a reload or Back doesn't open it again.
 * `ready` waits for whatever the form needs, like the active bike.
 */
export function useQuickAdd(openAdd: () => void, ready: boolean) {
    const [params, setParams] = useSearchParams()
    const wanted = params.get('add') === '1'
    // Always call the latest openAdd without re-running the effect on every render.
    const open = useRef(openAdd)
    useEffect(() => { open.current = openAdd })

    useEffect(() => {
        if (!wanted || !ready) return
        open.current()
        setParams((p) => { p.delete('add'); return p }, { replace: true })
    }, [wanted, ready, setParams])
}
