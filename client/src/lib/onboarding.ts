import { useSyncExternalStore } from 'react'

// First-visit guide state, saved on this device:
// - welcomeSeen: the one-time welcome pop-up was closed
// - checklistHidden: the "Get started" card was hidden from the Dashboard (Settings can bring it back)
// - doneSeen: the one-time "You're all set" summary was closed
interface OnboardingState { welcomeSeen: boolean; checklistHidden: boolean; doneSeen: boolean }

const KEY = 'pihitwise-onboarding'
const listeners = new Set<() => void>()
let cache: { raw: string | null; state: OnboardingState } | null = null

function read(): OnboardingState {
    let raw: string | null = null
    try { raw = localStorage.getItem(KEY) } catch { /* storage blocked */ }
    if (cache && cache.raw === raw) return cache.state
    let state: OnboardingState = { welcomeSeen: false, checklistHidden: false, doneSeen: false }
    try { if (raw) state = { ...state, ...JSON.parse(raw) } } catch { /* ignore bad value */ }
    cache = { raw, state }
    return state
}

function write(change: Partial<OnboardingState>) {
    try { localStorage.setItem(KEY, JSON.stringify({ ...read(), ...change })) } catch { /* storage blocked */ }
    listeners.forEach((l) => l())
}

export const markWelcomeSeen = () => write({ welcomeSeen: true })
export const hideChecklist = () => write({ checklistHidden: true })
export const markDoneSeen = () => write({ doneSeen: true })
/** Brings the guide back: the checklist (or the "all set" summary) shows on the Dashboard again. */
export const showChecklistAgain = () => write({ checklistHidden: false, doneSeen: false })

function subscribe(onChange: () => void) {
    listeners.add(onChange)
    return () => { listeners.delete(onChange) }
}

export function useOnboarding() {
    return useSyncExternalStore(subscribe, read, read)
}

/** True when PihitWise is opened from the home screen (installed), not in a browser tab. */
export function isInstalled() {
    return window.matchMedia('(display-mode: standalone)').matches
        || (navigator as Navigator & { standalone?: boolean }).standalone === true
}
