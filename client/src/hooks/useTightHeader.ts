import { useLayoutEffect, useRef, useState } from 'react'

/**
 * Tells a header whether its contents are too wide to fit with the full "PIHITWISE" wordmark.
 * `const [headerRef, tight] = useTightHeader()`: put headerRef on the header row, pass tight to <Logo compact={tight} />.
 *
 * It measures the real widths (so it works for any language and screen size): the wordmark only
 * hides when the logo, the wordmark and the buttons can't all fit, and comes back when they can.
 * While hidden the wordmark is still laid out off-screen, so its width can be measured.
 */
export function useTightHeader<T extends HTMLElement>() {
    const ref = useRef<T>(null)
    const [tight, setTight] = useState(false)

    useLayoutEffect(() => {
        const row = ref.current
        if (!row) return

        const check = () => {
            const style = getComputedStyle(row)
            const space = row.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight)
            const gap = parseFloat(style.columnGap) || 0
            const items = Array.from(row.children).filter((c) => c.getBoundingClientRect().width > 0)
            const used = items.reduce((sum, c) => sum + c.getBoundingClientRect().width, 0) + gap * Math.max(0, items.length - 1)

            const word = row.querySelector<HTMLElement>('[data-wordmark]')
            const wordHidden = word?.dataset.hidden === 'true'
            // Width the wordmark (plus its gap next to the icon) would add if it were shown.
            const wordWidth = word && wordHidden ? word.getBoundingClientRect().width + 10 : 0

            setTight(used + wordWidth > space + 0.5)
        }

        check()
        const observer = new ResizeObserver(check)
        observer.observe(row)
        // Language changes, a bike loading in, etc. resize the children, so watch them too.
        Array.from(row.children).forEach((el) => observer.observe(el))
        return () => observer.disconnect()
    }, [])

    return [ref, tight] as const
}
