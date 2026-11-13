import type { PendingFields } from './outbox'
import type { OtherExpense } from '../types/expenses'
import type { FuelLog } from '../types/fuelLogs'
import type { ServiceLog } from '../types/serviceLogs'

// One list of everything the bike costs. Fuel and maintenance costs come from
// their own logs; "Other" expenses (wash, accessories, insurance) are stored on their own.
export type ExpenseCategory = 'Fuel' | 'Maintenance' | 'Other'

export interface Expense extends PendingFields { id: string; date: string; category: ExpenseCategory; label: string; cost: number }

const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date)

/** Fuel, maintenance and other costs as one list, newest first. */
export function toExpenses(fuel: FuelLog[], services: ServiceLog[], other: OtherExpense[]): Expense[] {
    return [
        ...fuel.map((f): Expense => ({ id: f.id, date: f.date, category: 'Fuel', label: `Fill-up · ${f.liters.toFixed(1)} L`, cost: f.cost, pending: f.pending, syncError: f.syncError })),
        ...services.map((s): Expense => ({ id: s.id, date: s.date, category: 'Maintenance', label: s.type, cost: s.cost, pending: s.pending, syncError: s.syncError })),
        ...other.map((o): Expense => ({ id: o.id, date: o.date, category: 'Other', label: o.label, cost: o.cost, pending: o.pending, syncError: o.syncError })),
    ].sort(byDateDesc)
}

export const sumCost = (items: { cost: number }[]) => items.reduce((sum, e) => sum + e.cost, 0)

/** `YYYY-MM` of an ISO date. */
export const monthOf = (date: string) => date.slice(0, 7)

/** Today's `YYYY-MM-DD` in the rider's own time zone. */
export function today() {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The last `count` months up to this month as `YYYY-MM`, oldest first. */
export function recentMonths(count: number) {
    const [year, month] = today().split('-').map(Number)
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1))
        return d.toISOString().slice(0, 7)
    })
}
