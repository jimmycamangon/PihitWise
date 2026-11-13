import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Card, DataTable, FormMessage, PageHeader, Stat } from '../components/ui'
import { Field } from '../components/AuthLayout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import Icon from '../components/Icon'
import { createOtherExpense, deleteOtherExpense, getOtherExpenses, updateOtherExpense } from '../api/expenses'
import { getFuelLogs } from '../api/fuelLogs'
import { getServiceLogs } from '../api/serviceLogs'
import { useBike } from '../hooks/useBike'
import { useVehicleData } from '../hooks/useVehicleData'
import { monthOf, recentMonths, sumCost, toExpenses, today } from '../lib/expenses'
import type { ExpenseCategory } from '../lib/expenses'
import { formatDate, formatMonth, peso } from '../lib/format'
import type { OtherExpense } from '../types/expenses'

interface ExpenseErrors { label?: string, cost?: string, date?: string }

const filters: ('All' | ExpenseCategory)[] = ['All', 'Fuel', 'Maintenance', 'Other']

// Ideas for the item box. The rider can still type anything.
const labelIdeas = ['Bike wash', 'Parking', 'Toll', 'Helmet', 'Phone holder', 'Top box', 'LTO registration', 'CTPL insurance']

const loadExpenses = async (vehicleId: string) => {
    const [fuel, services, other] = await Promise.all([
        getFuelLogs(vehicleId), getServiceLogs(vehicleId), getOtherExpenses(vehicleId),
    ])
    return { expenses: toExpenses(fuel, services, other), other }
}

export default function ExpensesPage() {
    const { vehicle, vehiclesLoading } = useBike()
    const [filter, setFilter] = useState<'All' | ExpenseCategory>('All')
    const { data, loading, error, reload } = useVehicleData(vehicle?.id, loadExpenses)

    const [showForm, setShowForm] = useState(false)
    const [editing, setEditing] = useState<OtherExpense | null>(null)
    const [label, setLabel] = useState('')
    const [cost, setCost] = useState('')
    const [date, setDate] = useState(today())
    const [fieldErrors, setFieldErrors] = useState<ExpenseErrors>({})
    const [saveError, setSaveError] = useState('')
    const [saving, setSaving] = useState(false)
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [toast, setToast] = useState('')

    const openAdd = () => {
        setEditing(null)
        setLabel(''); setCost(''); setDate(today())
        setFieldErrors({})
        setShowForm(true)
    }

    const onEdit = (id: string) => {
        const expense = data?.other.find((o) => o.id === id)
        if (!expense) return
        setEditing(expense)
        setLabel(expense.label); setCost(String(expense.cost)); setDate(expense.date)
        setFieldErrors({})
        setShowForm(true)
    }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!vehicle) return

        const next: ExpenseErrors = {}
        if (label.trim() === '') next.label = 'Enter what it was for.'
        else if (label.trim().length > 100) next.label = 'Keep it under 100 letters.'
        if (cost === '') next.cost = 'Enter the cost.'
        else if (Number(cost) < 0) next.cost = 'The cost can\'t be below 0.'
        else if (Number(cost) > 1_000_000) next.cost = 'That cost is too high.'
        if (date === '') next.date = 'Pick a date.'
        else if (date > today()) next.date = 'The date can\'t be in the future.'
        setFieldErrors(next)
        if (Object.keys(next).length > 0) return

        setSaving(true)
        try {
            const request = { label: label.trim(), cost: Number(cost), date, notes: editing?.notes ?? null }
            if (editing) {
                await updateOtherExpense(editing.id, request)
                setToast('Expense updated')
            } else {
                await createOtherExpense(vehicle.id, request)
                setToast('Expense added')
            }
            setShowForm(false)
            setSaveError('')
            reload()
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setSaving(false)
        }
    }

    const onDelete = async (id: string) => {
        try {
            await deleteOtherExpense(id)
            setToast('Expense deleted')
            setSaveError('')
            reload()
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }

    // Bikes are still loading (the free API server can take a while to wake up).
    if (vehiclesLoading && !vehicle) {
        return (
            <>
                <PageHeader title="Expenses" subtitle="What your bike really costs." />
                <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
            </>
        )
    }

    if (!vehicle) {
        return (
            <>
                <PageHeader title="Expenses" subtitle="What your bike really costs." />
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">No bike yet</div>
                    <p className="text-xs text-muted mt-1 mb-5">Add a bike in your Garage first. Its costs show up here.</p>
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
    const months = recentMonths(6)
    const shown = filter === 'All' ? expenses : expenses.filter((e) => e.category === filter)
    const totalOf = (category: ExpenseCategory) => sumCost(thisMonth.filter((e) => e.category === category))
    const show = (value: number) => (loading ? '…' : peso(value))

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Expenses" subtitle={`What your ${vehicle.name} really costs.`} />
                <button type="button" onClick={openAdd}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    + Add expense
                </button>
            </div>
            <FormMessage text={error || saveError} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="This month" value={show(sumCost(thisMonth))} sub="total spent" tone="accent" />
                <Stat label="Fuel" value={show(totalOf('Fuel'))} sub="this month" />
                <Stat label="Maintenance" value={show(totalOf('Maintenance'))} sub="this month" />
                <Stat label="Other" value={show(totalOf('Other'))} sub="this month" />
            </div>

            <Card title="Monthly spend — last 6 months" className="mb-3">
                {loading
                    ? <div className="h-40 bg-raised rounded animate-pulse" />
                    : <BarChart zeroBase bars={months.map((m) => {
                        const total = sumCost(expenses.filter((e) => monthOf(e.date) === m))
                        return { label: formatMonth(m), value: total, display: peso(total) }
                    })} />}
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
                {loading ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-10 bg-raised rounded" />
                        <div className="h-10 bg-raised rounded" />
                        <div className="h-10 bg-raised rounded" />
                    </div>
                ) : (
                    <DataTable
                        rows={shown}
                        empty={filter === 'All'
                            ? 'No expenses yet. Log a fill-up, a service, or add an expense.'
                            : 'No expenses in this category.'}
                        columns={[
                            { head: 'Date', cell: (e) => formatDate(e.date) },
                            { head: 'Item', cell: (e) => <span className="font-medium">{e.label}</span> },
                            { head: 'Category', cell: (e) => <span className="text-muted">{e.category}</span> },
                            { head: 'Cost', cell: (e) => peso(e.cost), align: 'right', mono: true },
                            {
                                head: '', align: 'right', cell: (e) => e.category === 'Other' ? (
                                    <div className="flex justify-end gap-1.5">
                                        <button type="button" onClick={() => onEdit(e.id)}
                                            className="h-6 px-2 rounded-md border border-line text-[10px] text-ink
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => setDeleteId(e.id)}
                                            className="h-6 px-2 rounded-md border border-line text-[10px] text-warn
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Delete
                                        </button>
                                    </div>
                                ) : (
                                    // Fuel and maintenance costs are edited on their own pages.
                                    <Link to={e.category === 'Fuel' ? '/fuel' : '/maintenance'}
                                        className="text-[10px] text-faint no-underline hover:text-ink">
                                        View
                                    </Link>
                                ),
                            },
                        ]}
                    />
                )}
            </Card>

            <Modal open={showForm} title={editing ? 'Edit expense' : 'Add expense'} onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label="What was it for?" icon="wallet" placeholder="Bike wash" name="label" list="expense-label-ideas" maxLength={100}
                        value={label}
                        onChange={(e) => { setLabel(e.target.value); setFieldErrors({ ...fieldErrors, label: undefined }) }}
                        error={fieldErrors.label} />
                    <datalist id="expense-label-ideas">
                        {labelIdeas.map((l) => <option key={l} value={l} />)}
                    </datalist>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Cost (₱)" icon="wallet" placeholder="120" name="cost" type="number" min={0} step="0.01"
                            value={cost}
                            onChange={(e) => { setCost(e.target.value); setFieldErrors({ ...fieldErrors, cost: undefined }) }}
                            error={fieldErrors.cost} />
                        <Field label="Date" icon="calendar" name="date" type="date" max={today()}
                            value={date}
                            onChange={(e) => { setDate(e.target.value); setFieldErrors({ ...fieldErrors, date: undefined }) }}
                            error={fieldErrors.date} />
                    </div>
                    <p className="text-[11px] text-muted -mt-1">For costs that aren't a fill-up or a service. Log those on the Fuel and Maintenance pages.</p>
                    <button type="submit" disabled={saving}
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
                             hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {saving ? 'Saving...' : editing ? 'Save changes' : 'Save expense'}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                open={deleteId !== null}
                title="Delete expense"
                message="This expense will be removed. This can't be undone."
                confirmText="Delete"
                danger
                onConfirm={() => { onDelete(deleteId!); setDeleteId(null) }}
                onCancel={() => setDeleteId(null)}
            />
            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
