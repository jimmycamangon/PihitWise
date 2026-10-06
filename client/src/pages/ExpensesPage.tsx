import { useState } from 'react'
import { BarChart, Card, DataTable, PageHeader, Stat } from '../components/ui'
import { TODAY, expensesFor, monthOf, recentMonths, sumCost } from '../data/mock'
import type { ExpenseCategory } from '../data/mock'
import { useBike } from '../hooks/useBike'
import { formatDate, formatMonth, peso } from '../lib/format'

const filters: ('All' | ExpenseCategory)[] = ['All', 'Fuel', 'Maintenance', 'Other']

export default function ExpensesPage() {
    const { bike } = useBike()
    const [filter, setFilter] = useState<'All' | ExpenseCategory>('All')
    const expenses = expensesFor(bike.id)
    const thisMonth = expenses.filter((e) => monthOf(e.date) === monthOf(TODAY))
    const months = recentMonths(6)
    const shown = filter === 'All' ? expenses : expenses.filter((e) => e.category === filter)
    const totalOf = (category: ExpenseCategory) => sumCost(thisMonth.filter((e) => e.category === category))

    return (
        <>
            <PageHeader title="Expenses" subtitle={`What your ${bike.name} really costs.`} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="This month" value={peso(sumCost(thisMonth))} sub="total spent" tone="accent" />
                <Stat label="Fuel" value={peso(totalOf('Fuel'))} sub="this month" />
                <Stat label="Maintenance" value={peso(totalOf('Maintenance'))} sub="this month" />
                <Stat label="Other" value={peso(totalOf('Other'))} sub="this month" />
            </div>

            <Card title="Monthly spend — last 6 months" className="mb-3">
                <BarChart zeroBase bars={months.map((m) => {
                    const total = sumCost(expenses.filter((e) => monthOf(e.date) === m))
                    return { label: formatMonth(m), value: total, display: peso(total) }
                })} />
            </Card>

            <Card title="All expenses" action={
                <div className="flex gap-1">
                    {filters.map((f) => (
                        <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f}
                            className={`h-6 px-2.5 rounded-full border text-[10px] transition-colors cursor-pointer
                                ${filter === f ? 'border-accent text-accent' : 'border-line text-muted hover:text-ink'}`}>
                            {f}
                        </button>
                    ))}
                </div>
            }>
                <DataTable
                    rows={shown}
                    empty="No expenses in this category."
                    columns={[
                        { head: 'Date', cell: (e) => formatDate(e.date) },
                        { head: 'Item', cell: (e) => <span className="font-medium">{e.label}</span> },
                        { head: 'Category', cell: (e) => <span className="text-muted">{e.category}</span> },
                        { head: 'Cost', cell: (e) => peso(e.cost), align: 'right', mono: true },
                    ]}
                />
            </Card>
        </>
    )
}
