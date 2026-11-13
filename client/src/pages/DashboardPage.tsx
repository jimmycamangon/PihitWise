import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import type { IconName } from '../components/Icon'
import { Badge, BarChart, Card, FormMessage, Label, PageHeader, Stat } from '../components/ui'
import { getOtherExpenses } from '../api/expenses'
import { getFuelEconomy, getFuelLogs } from '../api/fuelLogs'
import { getReminders } from '../api/reminders'
import { getServiceLogs } from '../api/serviceLogs'
import { useBike } from '../hooks/useBike'
import SetupChecklist from '../components/SetupChecklist'
import { hideChecklist, useOnboarding } from '../lib/onboarding'
import { useVehicleData } from '../hooks/useVehicleData'
import { monthOf, sumCost, toExpenses, today } from '../lib/expenses'
import type { ExpenseCategory } from '../lib/expenses'
import { formatDate, km, peso } from '../lib/format'
import { dueReminders, leftText, statusLabel, statusTone } from '../lib/reminders'

const categoryIcon: Record<ExpenseCategory, IconName> = { Fuel: 'fuel', Maintenance: 'wrench', Other: 'wallet' }

const loadDashboard = async (vehicleId: string) => {
    const [fuel, services, other, reminders, economy] = await Promise.all([
        getFuelLogs(vehicleId), getServiceLogs(vehicleId), getOtherExpenses(vehicleId), getReminders(vehicleId), getFuelEconomy(vehicleId),
    ])
    // Newest fill-up first. Same day: the higher odometer is the later one.
    const lastFill = [...fuel].sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer)[0]
    return {
        expenses: toExpenses(fuel, services, other),
        // The API already puts the most urgent reminder first.
        upcoming: reminders.filter((r) => !r.isDone),
        economy,
        lastFill,
    }
}

function ViewAll({ to }: { to: string }) {
    return (
        <Link to={to} className="inline-flex items-center gap-1 text-[11px] text-accent no-underline hover:opacity-80">
            View all <Icon name="arrow" size={11} />
        </Link>
    )
}

function Skeleton({ rows = 3 }: { rows?: number }) {
    return (
        <div className="flex flex-col gap-2 animate-pulse">
            {Array.from({ length: rows }, (_, i) => <div key={i} className="h-10 bg-raised rounded" />)}
        </div>
    )
}

export default function DashboardPage() {
    const { vehicle, vehiclesLoading } = useBike()
    const { data, loading, error } = useVehicleData(vehicle?.id, loadDashboard)
    const { checklistHidden } = useOnboarding()

    // Bikes are still loading (the free API server can take a while to wake up).
    if (vehiclesLoading && !vehicle) {
        return (
            <>
                <PageHeader title="Dashboard" subtitle="Overview of your bike." />
                <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
            </>
        )
    }

    if (!vehicle) {
        return (
            <>
                <PageHeader title="Dashboard" subtitle="Overview of your bike." />
                {!checklistHidden && <div data-tour="checklist" className="mb-3"><SetupChecklist onHide={hideChecklist} /></div>}
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">No bike yet</div>
                    <p className="text-xs text-muted mt-1 mb-5">Add your first bike to start tracking fuel, maintenance and reminders.</p>
                    <Link to="/garage"
                        className="h-8 px-3.5 inline-flex items-center rounded-md bg-accent text-on-accent text-xs font-medium
                             no-underline hover:opacity-90 transition-opacity">
                        Go to Garage
                    </Link>
                </div>
            </>
        )
    }

    const expenses = data?.expenses ?? []
    const thisMonth = expenses.filter((e) => monthOf(e.date) === monthOf(today()))
    const economy = data?.economy.points.slice(-6) ?? []
    const average = data?.economy.averageKmPerLiter ?? null
    const lastFill = data?.lastFill
    const upcoming = data?.upcoming ?? []
    const next = upcoming[0]
    const due = dueReminders(upcoming)
    const dueOverdue = due.some((r) => r.status === 'overdue')
    const show = (value: string) => (loading ? '…' : value)

    return (
        <>
            <PageHeader title="Dashboard" subtitle={`Overview of your ${vehicle.name}.`} />
            <FormMessage text={error} />

            {/* First-visit checklist; Settings can bring it back after it's hidden */}
            {!checklistHidden && <div data-tour="checklist" className="mb-3"><SetupChecklist onHide={hideChecklist} /></div>}

            {/* Reminders that need attention now */}
            {due.length > 0 && (
                <Link to="/reminders"
                    className={`flex items-center gap-3 mb-3 p-3.5 rounded-xl border no-underline transition-colors hover:bg-raised
                        ${dueOverdue ? 'border-warn/40 bg-warn/5' : 'border-accent/40 bg-accent/5'}`}>
                    <Icon name="alert" size={16} className={dueOverdue ? 'text-warn' : 'text-accent'} />
                    <div className="flex-1 min-w-0">
                        <div className="text-xs font-medium text-ink truncate">
                            {due[0].title} · {statusLabel[due[0].status].toLowerCase()}
                        </div>
                        <div className="text-[11px] text-muted truncate">
                            {leftText(due[0])}{due.length > 1 ? ` · ${due.length - 1} more need attention` : ''}
                        </div>
                    </div>
                    <Icon name="arrow" size={14} className="text-faint" />
                </Link>
            )}

            {/* Active bike */}
            <div className="flex items-end justify-between gap-4 bg-surface border border-line rounded-xl p-5 mb-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        <Label>Active ride</Label>
                    </div>
                    <div className="text-base font-medium text-ink">{vehicle.name}</div>
                    <div className="text-xs text-faint mb-4">
                        {vehicle.year}{vehicle.plateNumber ? ` · ${vehicle.plateNumber}` : ''}
                    </div>
                    <Label>Odometer</Label>
                    <div className="font-mono text-2xl text-ink tracking-tight mt-0.5">{km(vehicle.odometer)}</div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-2xl text-ok tracking-tight">
                        {show(average !== null ? average.toFixed(1) : '—')}
                    </div>
                    <Label>km/L avg</Label>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="This month" value={show(peso(sumCost(thisMonth)))} sub="total spent" tone="accent" />
                <Stat label="Fuel this month" value={show(peso(sumCost(thisMonth.filter((e) => e.category === 'Fuel'))))} sub="on fill-ups" />
                <Stat label="Fuel price" value={show(lastFill && lastFill.liters > 0 ? `₱${(lastFill.cost / lastFill.liters).toFixed(1)}` : '—')}
                    sub="per liter, last fill-up" />
                <Stat label="Next due" value={show(next ? leftText(next) : '—')} sub={next?.title}
                    tone={next ? statusTone[next.status] : 'ink'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">
                <Card title="Fuel economy — last 6 fill-ups (km/L)" action={<ViewAll to="/fuel" />} className="lg:col-span-3">
                    {loading
                        ? <div className="h-40 bg-raised rounded animate-pulse" />
                        : <BarChart bars={economy.map((p) => ({
                            label: formatDate(p.date).split(',')[0], value: p.kmPerLiter, display: p.kmPerLiter.toFixed(1),
                        }))} />}
                </Card>

                <Card title="Upcoming reminders" action={<ViewAll to="/reminders" />} className="lg:col-span-2">
                    {loading && <Skeleton />}
                    {!loading && upcoming.length === 0 && <p className="text-xs text-faint py-6 text-center">No reminders set.</p>}
                    {!loading && upcoming.slice(0, 3).map((r) => (
                        <div key={r.id} className="flex items-center justify-between gap-3 py-2.5 border-t border-line first:border-0 first:pt-0">
                            <div className="min-w-0">
                                <div className="text-xs font-medium text-ink truncate">{r.title}</div>
                                <div className="font-mono text-[10px] text-faint mt-0.5">{leftText(r)}</div>
                            </div>
                            <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                        </div>
                    ))}
                </Card>
            </div>

            <Card title="Recent activity" action={<ViewAll to="/expenses" />}>
                {loading && <Skeleton />}
                {!loading && expenses.length === 0 && (
                    <p className="text-xs text-faint py-6 text-center">No fill-ups or services logged yet.</p>
                )}
                {!loading && expenses.slice(0, 5).map((e) => (
                    <div key={e.id} className="flex items-center gap-3 py-2.5 border-t border-line first:border-0 first:pt-0 last:pb-0">
                        <div className="w-7 h-7 rounded-md border border-line bg-raised flex items-center justify-center shrink-0 text-accent">
                            <Icon name={categoryIcon[e.category]} size={13} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium text-ink truncate">{e.label}</div>
                            <div className="text-[11px] text-faint">{e.category} · {formatDate(e.date)}</div>
                        </div>
                        <div className="font-mono text-xs text-ink">{peso(e.cost)}</div>
                    </div>
                ))}
            </Card>
        </>
    )
}
