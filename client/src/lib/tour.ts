import { useSyncExternalStore } from 'react'

// Whether the guided tour is running, and which step it's on. Not saved: a reload ends the tour.
interface TourState { active: boolean; step: number }

let state: TourState = { active: false, step: 0 }
const listeners = new Set<() => void>()
const set = (next: TourState) => { state = next; listeners.forEach((l) => l()) }

export const startTour = () => set({ active: true, step: 0 })
export const endTour = () => set({ active: false, step: 0 })
export const goToStep = (step: number) => set({ active: true, step })

export function useTour() {
    return useSyncExternalStore(
        (onChange) => { listeners.add(onChange); return () => { listeners.delete(onChange) } },
        () => state,
        () => state,
    )
}

/** Opens the Dashboard (where every part of the tour is) and starts the tour once it has drawn. */
export function startTourOnDashboard(navigate: (to: string) => void) {
    navigate('/dashboard')
    window.setTimeout(startTour, 400)
}
