import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Card, DataTable, FormMessage, PageHeader, Stat } from '../components/ui'
import { Field } from '../components/AuthLayout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import Icon from '../components/Icon'
import { useBike } from '../hooks/useBike'
import { createServiceLog, deleteServiceLog, getServiceLogs, updateServiceLog } from '../api/serviceLogs'
import type { ServiceLog } from '../types/serviceLogs'
import { formatDate, km, peso } from '../lib/format'

interface ServiceLogErrors { date?: string, odometer?: string, type?: string, cost?: string }

// Suggestions for the "Service" field. The rider can still type anything.
const serviceTypes = [
    'Oil change', 'Gear oil', 'Tune-up', 'CVT cleaning', 'Brake pads', 'Brake fluid',
    'Tire change', 'Chain & sprocket', 'Air filter', 'Spark plug', 'Battery', 'Coolant',
]

// Today as "YYYY-MM-DD" in the rider's own time zone.
const today = () => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function MaintenancePage() {
    const { vehicle, vehiclesLoading, reloadVehicles } = useBike()
    const vehicleId = vehicle?.id

    const [logs, setLogs] = useState<ServiceLog[]>([])
    // Which bike the logs in `logs` belong to. Different from the chosen bike = still loading.
    const [loadedFor, setLoadedFor] = useState<string | null>(null)
    const loading = loadedFor !== vehicleId
    const [errors, setErrors] = useState('')
    const [showForm, setShowForm] = useState(false)

    const [date, setDate] = useState(today())
    const [odometer, setOdometer] = useState('')
    const [type, setType] = useState('')
    const [shop, setShop] = useState('')
    const [cost, setCost] = useState('')
    const [notes, setNotes] = useState('')

    const [fieldErrors, setFieldErrors] = useState<ServiceLogErrors>({})
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [toast, setToast] = useState('')
    const [saving, setSaving] = useState(false)

    // Load the logs again every time the rider picks another bike.
    useEffect(() => {
        if (!vehicleId) return
        getServiceLogs(vehicleId)
            .then((data) => { setLogs(data); setErrors('') })
            .catch((err) => setErrors(err.message))
            .finally(() => setLoadedFor(vehicleId))
    }, [vehicleId])

    const resetForm = () => {
        setDate(today())
        // Start from the bike's current odometer: the rider only changes the last digits.
        setOdometer(vehicle ? String(vehicle.odometer) : '')
        setType(''); setShop(''); setCost(''); setNotes('')
        setFieldErrors({})
        setEditingId(null)
    }

    const openAdd = () => { resetForm(); setShowForm(true) }

    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!vehicle) return

        const next: ServiceLogErrors = {}
        if (!date) next.date = 'Pick a date.'
        else if (date > today()) next.date = 'The date can\'t be in the future.'
        if (!type.trim()) next.type = 'Enter the service.'
        if (odometer === '' || Number(odometer) < 0) next.odometer = 'Enter the odometer.'
        if (cost === '' || Number(cost) < 0) next.cost = 'Enter the cost (0 if free).'
        setFieldErrors(next)
        if (Object.keys(next).length > 0) return

        setSaving(true)
        try {
            const data = {
                date,
                odometer: Number(odometer),
                type: type.trim(),
                shop: shop.trim() || null,
                cost: Number(cost),
                notes: notes.trim() || null,
            }
            let saved: ServiceLog
            if (editingId) {
                saved = await updateServiceLog(editingId, data)
                setToast('Service updated')
            } else {
                saved = await createServiceLog(vehicle.id, data)
                setToast('Service added')
            }
            // Put the saved log in the list, then keep the list newest first.
            const others = logs.filter((l) => l.id !== saved.id)
            setLogs([saved, ...others].sort((a, b) => b.date.localeCompare(a.date)))
            setShowForm(false)
            resetForm()
            // The API may have raised the bike's odometer. Get the new one.
            reloadVehicles()
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setSaving(false)
        }
    }

    const onEdit = (log: ServiceLog) => {
        setEditingId(log.id)
        setDate(log.date)
        setOdometer(String(log.odometer))
        setType(log.type)
        setShop(log.shop ?? '')
        setCost(String(log.cost))
        setNotes(log.notes ?? '')
        setFieldErrors({})
        setShowForm(true)
    }

    const onDelete = async (id: string) => {
        try {
            await deleteServiceLog(id)
            setLogs(logs.filter((l) => l.id !== id))
            setToast('Service deleted')
        } catch (err) {
            setErrors((err as Error).message)
        }
    }

    // Bikes are still loading (the free API server can take a while to wake up).
    if (vehiclesLoading && !vehicle) {
        return (
            <>
                <PageHeader title="Maintenance" subtitle="Service history of your bike." />
                <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
            </>
        )
    }

    // No bike yet: Maintenance needs one first.
    if (!vehicle) {
        return (
            <>
                <PageHeader title="Maintenance" subtitle="Service history of your bike." />
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">No bike yet</div>
                    <p className="text-xs text-muted mt-1 mb-5">Add a bike in your Garage first. Then log its services here.</p>
                    <Link to="/garage"
                        className="h-8 px-3.5 inline-flex items-center rounded-md bg-accent text-on-accent text-xs font-medium
                             no-underline hover:opacity-90 transition-opacity">
                        Go to Garage
                    </Link>
                </div>
            </>
        )
    }

    const last = logs[0]
    const totalSpent = logs.reduce((sum, l) => sum + l.cost, 0)

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Maintenance" subtitle={`Service history of your ${vehicle.name}.`} />
                <button type="button" onClick={openAdd}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    + Add service
                </button>
            </div>
            <FormMessage text={errors} />

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-3">
                <Stat label="Services logged" value={loading ? '…' : String(logs.length)} sub="all time" />
                <Stat label="Total spent" value={loading ? '…' : peso(totalSpent)} sub="on maintenance" tone="accent" />
                <Stat label="Last service" value={loading ? '…' : last ? last.type : '—'}
                    sub={last ? `${formatDate(last.date)} · ${km(Math.max(0, vehicle.odometer - last.odometer))} ago` : undefined} />
            </div>

            <Card title="Service history">
                {loading ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-8 bg-raised rounded" />
                        <div className="h-8 bg-raised rounded" />
                        <div className="h-8 bg-raised rounded" />
                    </div>
                ) : logs.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-10">
                        <div className="w-12 h-12 rounded-full bg-raised flex items-center justify-center mb-3">
                            <Icon name="wrench" size={20} className="text-muted" />
                        </div>
                        <div className="text-sm font-medium text-ink">No services logged yet</div>
                        <p className="text-xs text-muted mt-1 mb-4">Log your last oil change to start the history.</p>
                        <button type="button" onClick={openAdd}
                            className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                                 hover:opacity-90 transition-opacity cursor-pointer">
                            + Add your first service
                        </button>
                    </div>
                ) : (
                    <DataTable
                        rows={logs}
                        empty="No services logged yet."
                        columns={[
                            { head: 'Date', cell: (l) => formatDate(l.date) },
                            {
                                head: 'Service', cell: (l) => (
                                    <div>
                                        <div className="font-medium">{l.type}</div>
                                        {l.notes && <div className="text-[11px] text-faint max-w-56 truncate">{l.notes}</div>}
                                    </div>
                                ),
                            },
                            { head: 'Shop', cell: (l) => <span className="text-muted">{l.shop ?? '—'}</span> },
                            { head: 'Odometer', cell: (l) => km(l.odometer), align: 'right', mono: true },
                            { head: 'Cost', cell: (l) => peso(l.cost), align: 'right', mono: true },
                            {
                                head: '', align: 'right', cell: (l) => (
                                    <div className="flex justify-end gap-1.5">
                                        <button type="button" onClick={() => onEdit(l)}
                                            className="h-7 px-2.5 rounded-md border border-line text-[11px] text-ink
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Edit
                                        </button>
                                        <button type="button" onClick={() => setDeleteId(l.id)}
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

            <Modal open={showForm} title={editingId ? 'Edit service' : 'Add service'} onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label="Service" icon="wrench" placeholder="Oil change" name="type" list="service-types"
                        value={type}
                        onChange={(e) => {
                            setType(e.target.value)
                            setFieldErrors({ ...fieldErrors, type: undefined })
                        }}
                        error={fieldErrors.type} />
                    <datalist id="service-types">
                        {serviceTypes.map((t) => <option key={t} value={t} />)}
                    </datalist>
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
                        <Field label="Cost (₱)" icon="wallet" placeholder="350" name="cost" type="number" min={0} step="0.01"
                            value={cost}
                            onChange={(e) => {
                                setCost(e.target.value)
                                setFieldErrors({ ...fieldErrors, cost: undefined })
                            }}
                            error={fieldErrors.cost} />
                        <Field label="Shop (optional)" icon="tag" placeholder="Motoshop" name="shop" maxLength={100}
                            value={shop}
                            onChange={(e) => setShop(e.target.value)} />
                    </div>
                    <div>
                        <label htmlFor="notes" className="block text-[11px] font-medium text-muted mb-1.5">Notes (optional)</label>
                        <textarea id="notes" name="notes" rows={3} maxLength={500} placeholder="Used Motul 10W-40"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-[13px] text-ink
                                 placeholder:text-faint outline-none transition-colors resize-none
                                 focus:border-accent focus:ring-2 focus:ring-accent/20" />
                    </div>
                    <button type="submit" disabled={saving}
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
                             hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {saving ? 'Saving...' : editingId ? 'Save changes' : 'Save service'}
                    </button>
                </form>
            </Modal>

            <ConfirmDialog
                open={deleteId !== null}
                title="Delete service"
                message="This service log will be removed. This can't be undone."
                confirmText="Delete"
                danger
                onConfirm={() => { onDelete(deleteId!); setDeleteId(null) }}
                onCancel={() => setDeleteId(null)}
            />
            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
