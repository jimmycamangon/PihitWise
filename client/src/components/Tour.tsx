import { useEffect, useState } from 'react'
import { endTour, goToStep, useTour } from '../lib/tour'

// Guided tour: dims the screen, cuts a glowing spotlight around one part of the app at a time,
// and explains it in a card next to it. Parts are marked in the markup with data-tour="…".
// A step whose part isn't on screen (hidden on this screen size or not there yet) is skipped.

interface TourStep { target: string; title: string; text: string }

const STEPS: TourStep[] = [
    { target: 'nav', title: 'Your pages', text: 'Dashboard, Garage, Fuel, Maintenance, Reminders and more. On phones you can change how this looks in Settings.' },
    { target: 'bike', title: 'Active bike', text: 'Every log and reminder belongs to the bike picked here. Switch it if you have more than one.' },
    { target: 'quick-add', title: '+ Log', text: 'Add a fill-up, service or expense from any page, even without signal.' },
    { target: 'bell', title: 'Reminder alerts', text: 'The number shows reminders that are overdue or due soon. Tap it to see them.' },
    { target: 'checklist', title: 'Get started', text: 'Your setup steps. Each one ticks itself off when you do it.' },
    { target: 'guide', title: 'Guide', text: 'Forgot how something works? Open the guide anytime. You can replay this tour from there.' },
]

interface Box { top: number; left: number; width: number; height: number }

/** The first element marked for this step that is actually visible. */
function findTarget(name: string): HTMLElement | null {
    const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${name}"]`))
    return all.find((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 }) ?? null
}

const PAD = 6
const CARD_WIDTH = 320

export default function Tour() {
    const { active, step } = useTour()
    const [box, setBox] = useState<Box | null>(null)

    const steps = active ? STEPS.filter((s) => findTarget(s.target)) : []
    const current = steps[step]
    const target = current?.target

    // Bring the part into view, then follow it (scrolling, resizing, layout changes).
    useEffect(() => {
        if (!active) return
        if (!target) { endTour(); return }
        findTarget(target)?.scrollIntoView({ block: 'center', behavior: 'smooth' })
        let frame = 0
        const follow = () => {
            const el = findTarget(target)
            if (el) {
                const r = el.getBoundingClientRect()
                setBox((prev) => prev && prev.top === r.top && prev.left === r.left && prev.width === r.width && prev.height === r.height
                    ? prev : { top: r.top, left: r.left, width: r.width, height: r.height })
            }
            frame = requestAnimationFrame(follow)
        }
        frame = requestAnimationFrame(follow)
        return () => cancelAnimationFrame(frame)
    }, [active, target])

    const last = step >= steps.length - 1
    const next = () => (last ? endTour() : goToStep(step + 1))
    const back = () => step > 0 && goToStep(step - 1)

    useEffect(() => {
        if (!active) return
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') endTour()
            if (e.key === 'ArrowRight' || e.key === 'Enter') next()
            if (e.key === 'ArrowLeft') back()
        }
        document.addEventListener('keydown', onKey)
        return () => document.removeEventListener('keydown', onKey)
    })

    if (!active || !current || !box) return null

    const spot = { top: box.top - PAD, left: box.left - PAD, width: box.width + PAD * 2, height: box.height + PAD * 2 }
    const vw = window.innerWidth
    const vh = window.innerHeight
    const width = Math.min(CARD_WIDTH, vw - 32)
    const left = Math.min(Math.max(spot.left + spot.width / 2 - width / 2, 16), vw - width - 16)
    // Below the part when there's room, otherwise above it.
    const below = spot.top + spot.height + 200 < vh
    const cardPosition = below
        ? { top: Math.min(spot.top + spot.height + 14, vh - 200), left, width }
        : { bottom: Math.max(vh - spot.top + 14, 16), left, width }

    return (
        <div className="fixed inset-0 z-[80]" role="dialog" aria-modal="true" aria-label={`Tour: ${current.title}`}>
            {/* Blocks clicks on the app while the tour is open. */}
            <div className="absolute inset-0" onClick={() => { }} />

            {/* Spotlight: everything outside it is dimmed by the huge shadow. */}
            <div className="tour-spotlight fixed rounded-xl pointer-events-none"
                style={{ ...spot, boxShadow: '0 0 0 9999px rgba(0, 0, 0, .65)' }}>
                <div className="tour-ring absolute inset-0 rounded-xl border-2 border-accent" />
            </div>

            <div key={step} className="tour-card fixed rounded-xl border border-line bg-surface shadow-2xl p-4" style={cardPosition}>
                <div className="font-mono text-[10px] uppercase tracking-[.14em] text-accent mb-1">
                    Step {step + 1} of {steps.length}
                </div>
                <div className="text-sm font-semibold text-ink mb-1">{current.title}</div>
                <p className="text-xs text-muted leading-relaxed mb-4">{current.text}</p>

                <div className="flex items-center gap-2">
                    <div className="flex gap-1 mr-auto">
                        {steps.map((s, i) => (
                            <span key={s.target}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-4 bg-accent' : 'w-1.5 bg-line'}`} />
                        ))}
                    </div>
                    <button type="button" onClick={endTour}
                        className="h-8 px-2.5 text-[11px] text-muted hover:text-ink cursor-pointer">
                        Skip
                    </button>
                    {step > 0 && (
                        <button type="button" onClick={back}
                            className="h-8 px-3 rounded-md border border-line text-xs text-ink hover:bg-raised cursor-pointer">
                            Back
                        </button>
                    )}
                    <button type="button" onClick={next} autoFocus
                        className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium hover:opacity-90 cursor-pointer">
                        {last ? 'Done' : 'Next'}
                    </button>
                </div>
            </div>
        </div>
    )
}
