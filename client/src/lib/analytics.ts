import type { Expense, ExpenseCategory } from './expenses'
import { sumCost, today } from './expenses'
import type { Reminder } from '../types/reminders'

export interface Reading { date: string; odometer: number }

const DAY_MS = 86_400_000
const dayNumber = (iso: string) => {
    const [y, m, d] = iso.slice(0, 10).split('-').map(Number)
    return Date.UTC(y, m - 1, d) / DAY_MS
}

/** Adds `days` to today and returns `YYYY-MM-DD`. */
export function daysFromToday(days: number) {
    return new Date((dayNumber(today()) + days) * DAY_MS).toISOString().slice(0, 10)
}

/**
 * How far the bike goes on average, from the odometer readings on fill-ups and services.
 * Needs at least a week between the first and last reading to be meaningful.
 */
export function ridingPace(readings: Reading[]) {
    if (readings.length < 2) return null
    const sorted = [...readings].sort((a, b) => a.date.localeCompare(b.date) || a.odometer - b.odometer)
    const first = sorted[0]
    const last = sorted[sorted.length - 1]
    const days = dayNumber(last.date) - dayNumber(first.date)
    const kmRidden = Math.max(...readings.map((r) => r.odometer)) - Math.min(...readings.map((r) => r.odometer))
    if (days < 7 || kmRidden <= 0) return null
    return { kmRidden, days, kmPerDay: kmRidden / days }
}

/** The open km-based reminder that comes up first, with a guessed date from the riding pace. */
export function nextByKm(reminders: Reminder[], kmPerDay: number | null) {
    const next = reminders
        .filter((r) => !r.isDone && r.kmLeft !== null)
        .sort((a, b) => a.kmLeft! - b.kmLeft!)[0]
    if (!next) return null
    const daysAway = kmPerDay && next.kmLeft! > 0 ? Math.round(next.kmLeft! / kmPerDay) : null
    return { reminder: next, daysAway, date: daysAway !== null ? daysFromToday(daysAway) : null }
}

/** Years that have any expense, newest first. Always includes this year. */
export function yearsOf(expenses: Expense[]) {
    const years = new Set(expenses.map((e) => e.date.slice(0, 4)))
    years.add(today().slice(0, 4))
    return [...years].sort().reverse()
}

export type CategoryTotals = Record<ExpenseCategory, number> & { total: number }

export function totalsByCategory(expenses: Expense[]): CategoryTotals {
    const of = (c: ExpenseCategory) => sumCost(expenses.filter((e) => e.category === c))
    return { Fuel: of('Fuel'), Maintenance: of('Maintenance'), Other: of('Other'), total: sumCost(expenses) }
}

/** Spend per month of a year, January first, as `YYYY-MM` keys. */
export function monthlyTotals(expenses: Expense[], year: string) {
    return Array.from({ length: 12 }, (_, i) => {
        const month = `${year}-${String(i + 1).padStart(2, '0')}`
        return { month, total: sumCost(expenses.filter((e) => e.date.startsWith(month))) }
    })
}
