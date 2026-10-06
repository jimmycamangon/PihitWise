// Sample data used until the backend exposes real endpoints.
// Dates are anchored to TODAY so the pages always render the same picture.

export const TODAY = '2026-10-06'

export interface Bike { id: string; name: string; year: number; plate: string; odo: number }
export interface FuelLog { id: string; bikeId: string; date: string; odo: number; liters: number; cost: number }
export interface ServiceLog { id: string; bikeId: string; date: string; odo: number; type: string; shop: string; cost: number }
export interface OtherExpense { id: string; bikeId: string; date: string; label: string; cost: number }
export interface Reminder { id: string; bikeId: string; title: string; dueOdo?: number; dueDate?: string }

export type ExpenseCategory = 'Fuel' | 'Maintenance' | 'Other'
export interface Expense { id: string; date: string; category: ExpenseCategory; label: string; cost: number }
export type Urgency = 'overdue' | 'soon' | 'ok'
export interface ReminderStatus { text: string; urgency: Urgency; rank: number }

export const user = { name: 'Juan Dela Cruz', email: 'juan@example.com' }

export const bikes: Bike[] = [
    { id: 'nmax', name: 'Yamaha NMAX 155', year: 2023, plate: 'ABC 1234', odo: 12480 },
    { id: 'adv', name: 'Honda ADV 160', year: 2022, plate: 'XYZ 5678', odo: 8220 },
]

export const fuelLogs: FuelLog[] = [
    { id: 'f1', bikeId: 'nmax', date: '2026-07-12', odo: 11410, liters: 4.1, cost: 280 },
    { id: 'f2', bikeId: 'nmax', date: '2026-07-26', odo: 11585, liters: 4.2, cost: 287 },
    { id: 'f3', bikeId: 'nmax', date: '2026-08-09', odo: 11752, liters: 4.0, cost: 274 },
    { id: 'f4', bikeId: 'nmax', date: '2026-08-23', odo: 11936, liters: 4.3, cost: 294 },
    { id: 'f5', bikeId: 'nmax', date: '2026-09-06', odo: 12108, liters: 4.1, cost: 280 },
    { id: 'f6', bikeId: 'nmax', date: '2026-09-20', odo: 12296, liters: 4.3, cost: 294 },
    { id: 'f7', bikeId: 'nmax', date: '2026-10-04', odo: 12480, liters: 4.2, cost: 287 },
    { id: 'f8', bikeId: 'adv', date: '2026-07-10', odo: 7330, liters: 3.9, cost: 267 },
    { id: 'f9', bikeId: 'adv', date: '2026-07-25', odo: 7480, liters: 3.9, cost: 267 },
    { id: 'f10', bikeId: 'adv', date: '2026-08-08', odo: 7628, liters: 3.8, cost: 260 },
    { id: 'f11', bikeId: 'adv', date: '2026-08-22', odo: 7772, liters: 3.8, cost: 260 },
    { id: 'f12', bikeId: 'adv', date: '2026-09-05', odo: 7920, liters: 3.9, cost: 267 },
    { id: 'f13', bikeId: 'adv', date: '2026-09-19', odo: 8070, liters: 3.9, cost: 267 },
    { id: 'f14', bikeId: 'adv', date: '2026-10-03', odo: 8220, liters: 3.9, cost: 267 },
]

export const serviceLogs: ServiceLog[] = [
    { id: 's1', bikeId: 'nmax', date: '2026-10-01', odo: 12420, type: 'Oil change', shop: 'Moto World QC', cost: 380 },
    { id: 's2', bikeId: 'nmax', date: '2026-08-15', odo: 11800, type: 'CVT cleaning', shop: 'Moto World QC', cost: 450 },
    { id: 's3', bikeId: 'nmax', date: '2026-06-20', odo: 11000, type: 'Front brake pads', shop: 'RideFix Marikina', cost: 650 },
    { id: 's4', bikeId: 'nmax', date: '2026-04-05', odo: 10200, type: 'Rear tire replacement', shop: 'RideFix Marikina', cost: 2400 },
    { id: 's5', bikeId: 'adv', date: '2026-09-22', odo: 8000, type: 'CVT cleaning', shop: 'Shop Moto Cubao', cost: 500 },
    { id: 's6', bikeId: 'adv', date: '2026-08-30', odo: 7700, type: 'Oil change', shop: 'Shop Moto Cubao', cost: 420 },
    { id: 's7', bikeId: 'adv', date: '2026-07-12', odo: 7100, type: 'Air filter', shop: 'Shop Moto Cubao', cost: 350 },
]

export const otherExpenses: OtherExpense[] = [
    { id: 'o1', bikeId: 'nmax', date: '2026-10-02', label: 'Bike wash', cost: 120 },
    { id: 'o2', bikeId: 'nmax', date: '2026-09-12', label: 'Phone holder', cost: 450 },
    { id: 'o3', bikeId: 'adv', date: '2026-09-28', label: 'Bike wash', cost: 120 },
    { id: 'o4', bikeId: 'adv', date: '2026-08-14', label: 'Top box bracket', cost: 1250 },
]

export const reminders: Reminder[] = [
    { id: 'r1', bikeId: 'nmax', title: 'Oil change (PMS)', dueOdo: 12820 },
    { id: 'r2', bikeId: 'nmax', title: 'LTO registration renewal', dueDate: '2026-11-18' },
    { id: 'r3', bikeId: 'nmax', title: 'Insurance renewal', dueDate: '2027-01-10' },
    { id: 'r4', bikeId: 'adv', title: 'Oil change (PMS)', dueOdo: 9000 },
    { id: 'r5', bikeId: 'adv', title: 'LTO registration renewal', dueDate: '2027-03-02' },
]

// ── Selectors ──────────────────────────────────────────────────────────────
const byDateDesc = <T extends { date: string }>(a: T, b: T) => b.date.localeCompare(a.date)
const DAY_MS = 86_400_000
const SOON_KM = 500
const SOON_DAYS = 45

export const fuelFor = (bikeId: string) => fuelLogs.filter((f) => f.bikeId === bikeId).sort(byDateDesc)
export const servicesFor = (bikeId: string) => serviceLogs.filter((s) => s.bikeId === bikeId).sort(byDateDesc)
export const remindersFor = (bikeId: string) => reminders.filter((r) => r.bikeId === bikeId)

/** km/L per fill-up, oldest first. The first fill-up has no previous odometer, so it has no value. */
export function fuelEconomy(bikeId: string) {
    const logs = fuelFor(bikeId).reverse()
    return logs.slice(1).map((log, i) => ({
        id: log.id,
        date: log.date,
        kml: (log.odo - logs[i].odo) / log.liters,
    }))
}

export function avgKml(bikeId: string) {
    const values = fuelEconomy(bikeId)
    if (values.length === 0) return 0
    return values.reduce((sum, v) => sum + v.kml, 0) / values.length
}

export function expensesFor(bikeId: string): Expense[] {
    return [
        ...fuelFor(bikeId).map((f): Expense => ({ id: f.id, date: f.date, category: 'Fuel', label: `Fill-up · ${f.liters.toFixed(1)} L`, cost: f.cost })),
        ...servicesFor(bikeId).map((s): Expense => ({ id: s.id, date: s.date, category: 'Maintenance', label: s.type, cost: s.cost })),
        ...otherExpenses.filter((o) => o.bikeId === bikeId).map((o): Expense => ({ id: o.id, date: o.date, category: 'Other', label: o.label, cost: o.cost })),
    ].sort(byDateDesc)
}

export const monthOf = (date: string) => date.slice(0, 7)
export const sumCost = (items: { cost: number }[]) => items.reduce((sum, e) => sum + e.cost, 0)

/** The last `count` months up to TODAY as `YYYY-MM`, oldest first. */
export function recentMonths(count: number) {
    const [year, month] = TODAY.split('-').map(Number)
    return Array.from({ length: count }, (_, i) => {
        const d = new Date(Date.UTC(year, month - 1 - (count - 1 - i), 1))
        return d.toISOString().slice(0, 7)
    })
}

export function reminderStatus(reminder: Reminder, bike: Bike): ReminderStatus {
    if (reminder.dueOdo !== undefined) {
        const left = reminder.dueOdo - bike.odo
        if (left < 0) return { text: `${Math.abs(left).toLocaleString()} km overdue`, urgency: 'overdue', rank: left }
        return { text: `${left.toLocaleString()} km left`, urgency: left <= SOON_KM ? 'soon' : 'ok', rank: left / 10 }
    }
    const days = Math.round((Date.parse(reminder.dueDate ?? TODAY) - Date.parse(TODAY)) / DAY_MS)
    if (days < 0) return { text: `${Math.abs(days)} days overdue`, urgency: 'overdue', rank: days }
    return { text: `${days} days left`, urgency: days <= SOON_DAYS ? 'soon' : 'ok', rank: days }
}

/** Reminders for a bike with their status, most urgent first. */
export function upcomingReminders(bike: Bike) {
    return remindersFor(bike.id)
        .map((reminder) => ({ reminder, status: reminderStatus(reminder, bike) }))
        .sort((a, b) => a.status.rank - b.status.rank)
}
