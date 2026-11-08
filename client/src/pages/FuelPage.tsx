import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { BarChart, Card, DataTable, FormMessage, PageHeader, Stat } from '../components/ui'
import { Field } from '../components/AuthLayout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import Icon from '../components/Icon'
import { useBike } from '../hooks/useBike'
import { createFuelLog, deleteFuelLog, getFuelEconomy, getFuelLogs, updateFuelLog } from '../api/fuelLogs'
import type { FuelEconomy, FuelLog } from '../types/fuelLogs'
import { formatDate, km, peso } from '../lib/format'

interface FuelLogErrors { date?: string, odometer?: string, liters?: string, cost?: string }

// Today as "YYYY-MM-DD" in the rider's own time zone.
const today = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const emptyEconomy: FuelEconomy = { averageKmPerLiter: null, points: [] }

export default function FuelPage() {
    const { vehicle, vehiclesLoading, reloadVehicles } = useBike()
    const vehicleId = vehicle?.id

    const [logs, setLogs] = useState<FuelLog[]>([])
    const [economy, setEconomy] = useState<FuelEconomy>(emptyEconomy)
    // Which bike the data belongs to. Different from the chosen bike = still loading.
    const [loadedFor, setLoadedFor] = useState<string | null>(null)
    const loading = loadedFor !== vehicleId
    const [errors, setErrors] = useState('')
    const [showForm, setShowForm] = useState(false)

    // Smart defaults: today, the bike's km, full tank checked.
    const [date, setDate] = useState(today())
    const [odometer, setOdometer] = useState('')
    const [liters, setLiters] = useState('')
    const [cost, setCost] = useState('')
    const [isFullTank, setIsFullTank] = useState(true)

    const [fieldErrors, setFieldErrors] = useState<FuelLogErrors>({})
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [toast, setToast] = useState('')
    const [saving, setSaving] = useState(false)

    // Load the fill-ups and the km/L every time the rider picks another bike.
    useEffect(() => {
        if (!vehicleId) return
        Promise.all([getFuelLogs(vehicleId), getFuelEconomy(vehicleId)])
            .then(([logsData, economyData]) => {
                setLogs(logsData)
                setEconomy(economyData)
                setErrors('')
            })
            .catch((err) => setErrors(err.message))
            .finally(() => setLoadedFor(vehicleId))
    }, [vehicleId])

    // km/L changes after every add, edit or delete. The API works it out again.
    const reloadEconomy = async () => {
        if (!vehicleId) return
        try {
            setEconomy(await getFuelEconomy(vehicleId))
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }

    const resetForm = () => {
        setDate(today())
        // Start from the bike's current odometer: the rider only changes the last digits.
        setOdometer(vehicle ? String(vehicle.odometer) : '')
        setLiters(''); setCost('')
        setIsFullTank(true)
        setFieldErrors({})
        setEditingId(null)
    }

    const openAdd = () => { resetForm(); setShowForm(true) }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!vehicle) return

        const next: FuelLogErrors = {}
        if (!date) next.date = 'Pick a date.'
        else if (date > today()) next.date = 'The date can\'t be in the future.'
        if (odometer === '' || Number(odometer) < 0) next.odometer = 'Enter the odometer.'
        else {
            // km only goes up. Check the new km against the other fill-ups.
            const newKm = Number(odometer)
            const others = logs.filter((l) => l.id !== editingId)
            const before = others.find((l) => l.date < date && l.odometer > newKm)
            const after = others.find((l) => l.date > date && l.odometer < newKm)
            if (before) next.odometer = `Lower than your fill-up on ${formatDate(before.date)} (${km(before.odometer)}).`
            else if (after) next.odometer = `Higher than your fill-up on ${formatDate(after.date)} (${km(after.odometer)}).`
        }
        if (liters === '' || Number(liters) <= 0) next.liters = 'Enter the liters.'
        else if (Number(liters) > 1000) next.liters = 'That is too many liters.'
        if (cost === '' || Number(cost) < 0) next.cost = 'Enter the cost.'
        setFieldErrors(next)
        if (Object.keys(next).length > 0) return

        setSaving(true)
        try {
            const data = {
                date,
                odometer: Number(odometer),
                liters: Number(liters),
                cost: Number(cost),
                isFullTank,
            }
            let saved: FuelLog
            if (editingId) {
                saved = await updateFuelLog(editingId, data)
                setToast('Fill-up updated')
            } else {
                saved = await createFuelLog(vehicle.id, data)
                setToast('Fill-up added')
            }
            // Put the saved fill-up in the list, then keep the list newest first.
            const others = logs.filter((l) => l.id !== saved.id)
            setLogs([saved, ...others].sort((a, b) => b.date.localeCompare(a.date) || b.odometer - a.odometer))
            setShowForm(false)
            resetForm()
            reloadEconomy()
            // The API may have raised the bike's odometer. Get the new one.
            reloadVehicles()
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setSaving(false)
        }
    }

    const onEdit = (log: FuelLog) => {
        setEditingId(log.id)
        setDate(log.date)
        setOdometer(String(log.odometer))
        setLiters(String(log.liters))
        setCost(String(log.cost))
        setIsFullTank(log.isFullTank)
        setFieldErrors({})
        setShowForm(true)
    }

    const onDelete = async (id: string) => {
        try {
            await deleteFuelLog(id)
            setLogs(logs.filter((l) => l.id !== id))
            setToast('Fill-up deleted')
            reloadEconomy()
        } catch (err) {
            setErrors((err as Error).message)
        }
    }

    // Bikes are still loading (the free API server can take a while to wake up).
    if (vehiclesLoading && !vehicle) {
        return (
            <>
                <PageHeader title="Fuel" subtitle="Fill-ups and fuel economy of your bike." />
                <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
            </>
        )
    }

    // No bike yet: Fuel needs one first.
    if (!vehicle) {
        return (
            <>
                <PageHeader title="Fuel" subtitle="Fill-ups and fuel economy of your bike." />
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">No bike yet</div>
                    <p className="text-xs text-muted mt-1 mb-5">Add a bike in your Garage first. Then log its fill-ups here.</p>
                    <Link to="/garage"
                        className="h-8 px-3.5 inline-flex items-center rounded-md bg-accent text-on-accent text-xs font-medium
                             no-underline hover:opacity-90 transition-opacity">
                        Go to Garage
                    </Link>
                </div>
            </>
        )
    }

    const totalSpent = logs.reduce((sum, l) => sum + l.cost, 0)
    const totalLiters = logs.reduce((sum, l) => sum + l.liters, 0)
    const best = economy.points.length > 0 ? Math.max(...economy.points.map((p) => p.kmPerLiter)) : null
    // km/L of each full tank, by fill-up id, for the table.
    const kmlById = new Map(economy.points.map((p) => [p.fuelLogId, p.kmPerLiter]))

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Fuel" subtitle={`Fill-ups and fuel economy of your ${vehicle.name}.`} />
                <button type="button" onClick={openAdd}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    + Add fill-up
                </button>
            </div>
            <FormMessage text={errors} />

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-3">
                <Stat label="Avg km/L" tone="ok"
                    value={loading ? '…' : economy.averageKmPerLiter !== null ? economy.averageKmPerLiter.toFixed(1) : '—'}
                    sub={economy.averageKmPerLiter !== null ? 'full tank to full tank' : 'needs 2 full tanks'} />
                <Stat label="Best km/L" value={loading ? '…' : best !== null ? best.toFixed(1) : '—'} sub="single full tank" />
                <Stat label="Fuel spent" value={loading ? '…' : peso(totalSpent)} sub={`${logs.length} fill-ups`} tone="accent" />
                <Stat label="Liters" value={loading ? '…' : `${totalLiters.toFixed(1)} L`} sub="total filled" />
            </div>

            <Card title="Fuel economy per full tank (km/L)" className="mb-3">
                <BarChart bars={economy.points.map((p) => ({
                    label: formatDate(p.date).split(',')[0], value: p.kmPerLiter, display: p.kmPerLiter.toFixed(1),
                }))} />
            </Card>

            <Card title="Fill-up log">
                {loading ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-8 bg-raised rounded" />
                        <div className="h-8 bg-raised rounded" />
                        <div className="h-8 bg-raised rounded" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-10">
                        <div className="w-12 h-12 rounded-full bg-raised flex items-center justify-center mb-3">
                            <Icon name="fuel" size={20} className="text-muted" />
                        </div>
                        <div className="text-sm font-medium text-ink">No fill-ups logged yet</div>
                        <p className="text-xs text-muted mt-1 mb-4">Fill your tank to full and log it. That is your start point.</p>
                        <button type="button" onClick={openAdd}
                            className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                                 hover:opacity-90 transition-opacity cursor-pointer">
                            + Add your first fill-up
                        </button>
                    </div>
                ) : (
                    <DataTable
                        rows={logs}
                        empty="No fill-ups logged yet."
                        columns={[
                            { head: 'Date', cell: (f) => formatDate(f.date) },
                            { head: 'Odometer', cell: (f) => km(f.odometer), align: 'right', mono: true },
                            { head: 'Liters', cell: (f) => f.liters.toFixed(2), align: 'right', mono: true },
                            { head: 'Full', cell: (f) => f.isFullTank ? <span className="text-ok">Yes</span> : <span className="text-faint">No</span> },
                            { head: '₱ / L', cell: (f) => (f.cost / f.liters).toFixed(2), align: 'right', mono: true },
                            { head: 'km/L', cell: (f) => kmlById.get(f.id)?.toFixed(1) ?? '—', align: 'right', mono: true },
                            { head: 'Cost', cell: (f) => peso(f.cost), align: 'right', mono: true },
                            {
                                head: '', align: 'right', cell: (f) => (
                                    <div className="flex justify-end gap-1.5">
                                        <button type="button" onClick={() => onEdit(f)}
                                            className="h-7 px-2.5 rounded-md border border-line text-[11px] text-ink
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => setDeleteId(f.id)}
                                            className="h-7 px-2.5 rounded-md border border-line text-[11px] text-warn
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Delete
                                        </button>
                                    </div>
                                ),
                            },
                        ]}
                    />
                )}
            </Card>

            <Modal open={showForm} title={editingId ? 'Edit fill-up' : 'Add fill-up'} onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Date" icon="calendar" name="date" type="date" max={today()}
                            value={date}
                            onChange={(e) => {
                                setDate(e.target.value)
                                setFieldErrors({ ...fieldErrors, date: undefined })
                            }}
                            error={fieldErrors.date} />
                        <Field label="Odometer (km)" icon="gauge" placeholder="12000" name="odometer" type="number" min={0}
                            value={odometer}
                            onChange={(e) => {
                                setOdometer(e.target.value)
                                setFieldErrors({ ...fieldErrors, odometer: undefined })
                            }}
                            error={fieldErrors.odometer} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Liters" icon="fuel" placeholder="3.5" name="liters" type="number" min={0} step="0.01"
                            value={liters}
                            onChange={(e) => {
                                setLiters(e.target.value)
                                setFieldErrors({ ...fieldErrors, liters: undefined })
                            }}
                            error={fieldErrors.liters} />
                        <Field label="Cost (₱)" icon="wallet" placeholder="230" name="cost" type="number" min={0} step="0.01"
                            value={cost}
                            onChange={(e) => {
                                setCost(e.target.value)
                                setFieldErrors({ ...fieldErrors, cost: undefined })
                            }}
                            error={fieldErrors.cost} />
                    </div>
                    <label htmlFor="isFullTank" className="flex items-start gap-2.5 cursor-pointer">
                        <input id="isFullTank" name="isFullTank" type="checkbox"
                            checked={isFullTank}
                            onChange={(e) => setIsFullTank(e.target.checked)}
                            className="mt-0.5 w-4 h-4 accent-accent cursor-pointer" />
                        <span>
                            <span className="block text-[13px] text-ink">Full tank</span>
                            <span className="block text-[11px] text-muted">km/L is measured from one full tank to the next.</span>
                        </span>
                    </label>
                    <button type="submit" disabled={saving}
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
                             hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {saving ? 'Saving...' : editingId ? 'Save changes' : 'Save fill-up'}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                open={deleteId !== null}
                title="Delete fill-up"
                message="This fill-up will be removed. This can't be undone."
                confirmText="Delete"
                danger
                onConfirm={() => { onDelete(deleteId!); setDeleteId(null) }}
                onCancel={() => setDeleteId(null)}
            />
            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
