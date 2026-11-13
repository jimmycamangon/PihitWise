import { useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import { BarChart, Card, DataTable, FormMessage, PageHeader, Stat } from '../components/ui'
import { getOtherExpenses } from '../api/expenses'
import { getFuelLogs } from '../api/fuelLogs'
import { getReminders } from '../api/reminders'
import { getServiceLogs } from '../api/serviceLogs'
import { useBike } from '../hooks/useBike'
import { useVehicleData } from '../hooks/useVehicleData'
import { toExpenses, today } from '../lib/expenses'
import type { ExpenseCategory } from '../lib/expenses'
import { monthlyTotals, nextByKm, ridingPace, totalsByCategory, yearsOf } from '../lib/analytics'
import { formatDate, km, peso } from '../lib/format'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const CATEGORIES: ExpenseCategory[] = ['Fuel', 'Maintenance', 'Other']

const loadAnalytics = async (vehicleId: string) => {
    const [fuel, services, other, reminders] = await Promise.all([
        getFuelLogs(vehicleId), getServiceLogs(vehicleId), getOtherExpenses(vehicleId), getReminders(vehicleId),
    ])
    return {
        expenses: toExpenses(fuel, services, other),
        readings: [...fuel, ...services].map((l) => ({ date: l.date, odometer: l.odometer })),
        reminders,
    }
}

export default function AnalyticsPage() {
    const { vehicle, vehiclesLoading } = useBike()
    const { data, loading, error } = useVehicleData(vehicle?.id, loadAnalytics)
    const [year, setYear] = useState(today().slice(0, 4))

    if (!vehicle) {
        return (
            <>
                <PageHeader title="Analytics" subtitle="Where your money and kilometers go." />
                {vehiclesLoading
                    ? <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
                    : <p className="text-xs text-muted">
                        Add a bike in the <Link to="/garage" className="text-accent">Garage</Link> to see analytics.
                    </p>}
            </>
        )
    }

    const expenses = data?.expenses ?? []
    const pace = ridingPace(data?.readings ?? [])
    const allTime = totalsByCategory(expenses)
    const costPerKm = pace ? allTime.total / pace.kmRidden : null
    const next = nextByKm(data?.reminders ?? [], pace?.kmPerDay ?? null)

    const years = yearsOf(expenses)
    const yearExpenses = expenses.filter((e) => e.date.startsWith(year))
    const yearTotals = totalsByCategory(yearExpenses)
    const months = monthlyTotals(expenses, year)
    const yearRows = years.map((y) => ({ id: y, year: y, ...totalsByCategory(expenses.filter((e) => e.date.startsWith(y))) }))

    const show = (value: string) => (loading ? '…' : value)
    const nextValue = !next ? '—'
        : next.reminder.kmLeft! <= 0 ? 'Due now'
            : next.date ? formatDate(next.date) : `${km(next.reminder.kmLeft!)} left`
    const nextSub = !next ? 'set a km reminder'
        : next.daysAway !== null && next.reminder.kmLeft! > 0
            ? `${next.reminder.title} · in about ${next.daysAway} day${next.daysAway === 1 ? '' : 's'}`
            : next.reminder.title

    return (
        <>
            <PageHeader title="Analytics" subtitle={`Where your ${vehicle.name}'s money and kilometers go.`} />
            <FormMessage text={error} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="Cost per km" value={show(costPerKm !== null ? `₱${costPerKm.toFixed(2)}` : '—')}
                    sub="all spending ÷ km logged" tone="accent" />
                <Stat label="Riding pace" value={show(pace ? `${Math.round(pace.kmPerDay * 30).toLocaleString('en-PH')} km` : '—')}
                    sub={pace ? 'per month, on average' : 'needs logs a week apart'} />
                <Stat label="Km logged" value={show(pace ? km(pace.kmRidden) : '—')}
                    sub={pace ? `over ${pace.days} days` : 'from fill-ups and services'} />
                <Stat label="Next service" value={show(nextValue)} sub={nextSub}
                    tone={next && next.reminder.kmLeft! <= 0 ? 'warn' : 'ink'} />
            </div>

            <div className="flex items-center gap-2 mb-3">
                <label htmlFor="analytics-year" className="text-[11px] font-medium text-muted">Year</label>
                <select id="analytics-year" value={year} onChange={(e) => setYear(e.target.value)}
                    className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink outline-none
                         focus:border-accent cursor-pointer">
                    {years.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">
                <Card title={`Spending per month — ${year}`} className="lg:col-span-3">
                    {loading
                        ? <div className="h-36 bg-raised rounded animate-pulse" />
                        : yearTotals.total === 0
                            ? <p className="text-xs text-faint py-6 text-center">Nothing spent in {year}.</p>
                            : <BarChart zeroBase bars={months.map((m, i) => ({
                                label: MONTHS[i], value: m.total, display: m.total > 0 ? peso(m.total) : '',
                            }))} />}
                </Card>

                <Card title={`Breakdown — ${year}`} className="lg:col-span-2">
                    <div className="flex flex-col gap-3">
                        {CATEGORIES.map((c) => {
                            const share = yearTotals.total > 0 ? (yearTotals[c] / yearTotals.total) * 100 : 0
                            return (
                                <div key={c}>
                                    <div className="flex justify-between text-xs mb-1">
                                        <span className="text-ink">{c}</span>
                                        <span className="font-mono text-muted">{show(`${peso(yearTotals[c])} · ${Math.round(share)}%`)}</span>
                                    </div>
                                    <div className="h-1.5 rounded-full bg-raised overflow-hidden">
                                        <div className="h-full bg-accent rounded-full" style={{ width: `${share}%` }} />
                                    </div>
                                </div>
                            )
                        })}
                        <div className="flex justify-between text-xs pt-2 border-t border-line">
                            <span className="font-medium text-ink">Total</span>
                            <span className="font-mono text-ink">{show(peso(yearTotals.total))}</span>
                        </div>
                    </div>
                </Card>
            </div>

            <Card title="Totals by year" action={<Icon name="chart" size={14} className="text-faint" />}>
                <DataTable
                    rows={loading ? [] : yearRows}
                    empty={loading ? 'Loading…' : 'No spending logged yet.'}
                    columns={[
                        { head: 'Year', cell: (r) => r.year, mono: true },
                        { head: 'Fuel', cell: (r) => peso(r.Fuel), align: 'right', mono: true },
                        { head: 'Maintenance', cell: (r) => peso(r.Maintenance), align: 'right', mono: true },
                        { head: 'Other', cell: (r) => peso(r.Other), align: 'right', mono: true },
                        { head: 'Total', cell: (r) => peso(r.total), align: 'right', mono: true },
                    ]}
                />
            </Card>
        </>
    )
}
