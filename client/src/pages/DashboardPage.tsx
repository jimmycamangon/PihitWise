import { Link } from 'react-router-dom'
import Icon from '../components/Icon'
import type { IconName } from '../components/Icon'
import { Badge, BarChart, Card, Label, PageHeader, Stat } from '../components/ui'
import { TODAY, avgKml, expensesFor, fuelEconomy, fuelFor, monthOf, sumCost, upcomingReminders } from '../data/mock'
import type { ExpenseCategory } from '../data/mock'
import { useBike } from '../hooks/useBike'
import { formatDate, km, peso } from '../lib/format'
import { urgencyLabel, urgencyTone } from '../lib/urgency'

const categoryIcon: Record<ExpenseCategory, IconName> = { Fuel: 'fuel', Maintenance: 'wrench', Other: 'wallet' }

function ViewAll({ to }: { to: string }) {
    return (
        <Link to={to} className="inline-flex items-center gap-1 text-[11px] text-accent no-underline hover:opacity-80">
            View all <Icon name="arrow" size={11} />
        </Link>
    )
}

export default function DashboardPage() {
    const { bike } = useBike()
    const expenses = expensesFor(bike.id)
    const thisMonth = expenses.filter((e) => monthOf(e.date) === monthOf(TODAY))
    const economy = fuelEconomy(bike.id).slice(-6)
    const lastFill = fuelFor(bike.id)[0]
    const upcoming = upcomingReminders(bike)
    const next = upcoming[0]

    return (
        <>
            <PageHeader title="Dashboard" subtitle={`Overview of your ${bike.name}.`} />

            {/* Active bike */}
            <div className="flex items-end justify-between gap-4 bg-surface border border-line rounded-xl p-5 mb-3">
                <div>
                    <div className="flex items-center gap-1.5 mb-2">
                        <span className="w-1 h-1 rounded-full bg-accent" />
                        <Label>Active ride</Label>
                    </div>
                    <div className="text-base font-medium text-ink">{bike.name}</div>
                    <div className="text-xs text-faint mb-4">{bike.year} · {bike.plate}</div>
                    <Label>Odometer</Label>
                    <div className="font-mono text-2xl text-ink tracking-tight mt-0.5">{km(bike.odo)}</div>
                </div>
                <div className="text-right">
                    <div className="font-mono text-2xl text-ok tracking-tight">{avgKml(bike.id).toFixed(1)}</div>
                    <Label>km/L avg</Label>
                </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="This month" value={peso(sumCost(thisMonth))} sub="total spent" tone="accent" />
                <Stat label="Fuel this month" value={peso(sumCost(thisMonth.filter((e) => e.category === 'Fuel')))} sub="on fill-ups" />
                <Stat label="Fuel price" value={lastFill ? `₱${(lastFill.cost / lastFill.liters).toFixed(1)}` : '—'} sub="per liter, last fill-up" />
                <Stat label="Next due" value={next ? next.status.text : '—'} sub={next?.reminder.title}
                    tone={next ? urgencyTone[next.status.urgency] : 'ink'} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3 mb-3">
                <Card title="Fuel economy — last 6 fill-ups (km/L)" action={<ViewAll to="/fuel" />} className="lg:col-span-3">
                    <BarChart bars={economy.map((e) => ({
                        label: formatDate(e.date).split(',')[0], value: e.kml, display: e.kml.toFixed(1),
                    }))} />
                </Card>

                <Card title="Upcoming reminders" action={<ViewAll to="/reminders" />} className="lg:col-span-2">
                    {upcoming.length === 0 && <p className="text-xs text-faint py-6 text-center">No reminders set.</p>}
                    {upcoming.slice(0, 3).map(({ reminder, status }) => (
                        <div key={reminder.id} className="flex items-center justify-between gap-3 py-2.5 border-t border-line first:border-0 first:pt-0">
                            <div className="min-w-0">
                                <div className="text-xs font-medium text-ink truncate">{reminder.title}</div>
                                <div className="font-mono text-[10px] text-faint mt-0.5">{status.text}</div>
                            </div>
                            <Badge tone={urgencyTone[status.urgency]}>{urgencyLabel[status.urgency]}</Badge>
                        </div>
                    ))}
                </Card>
            </div>

            <Card title="Recent activity" action={<ViewAll to="/expenses" />}>
                {expenses.slice(0, 5).map((e) => (
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
