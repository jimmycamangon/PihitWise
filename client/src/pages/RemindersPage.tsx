import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, FormMessage, PageHeader, Stat } from '../components/ui'
import { Field } from '../components/AuthLayout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import Icon from '../components/Icon'
import { useBike } from '../hooks/useBike'
import { createReminder, deleteReminder, getReminders, markReminderDone, updateReminder } from '../api/reminders'
import type { Reminder, ReminderRequest, ReminderStatus } from '../types/reminders'
import { formatDate, km } from '../lib/format'
import { leftText, statusLabel, statusTone } from '../lib/reminders'

interface ReminderErrors { title?: string, due?: string }

// Ideas for the title box. The rider can still type anything.
const titleIdeas = ['Oil change', 'CVT cleaning', 'Brake pads', 'Tire change', 'Chain cleaning', 'LTO registration', 'CTPL insurance']

// "Due at 13,000 km · Dec 18, 2026 · every 1,500 km"
function dueText(r: Reminder) {
    const parts: string[] = []
    if (r.dueOdometer !== null) parts.push(`at ${km(r.dueOdometer)}`)
    if (r.dueDate !== null) parts.push(formatDate(r.dueDate))
    if (r.repeatEveryKm !== null) parts.push(`every ${km(r.repeatEveryKm)}`)
    return `Due ${parts.join(' · ')}`
}
 
export default function RemindersPage() {
    const { vehicle, vehiclesLoading } = useBike()
    const vehicleId = vehicle?.id
 
    const [reminders, setReminders] = useState<Reminder[]>([])
    // Which bike the data belongs to. Different from the chosen bike = still loading.
    const [loadedFor, setLoadedFor] = useState<string | null>(null)
    const loading = loadedFor !== vehicleId
    const [errors, setErrors] = useState('')
    const [showForm, setShowForm] = useState(false)
 
    // Form fields. Empty due km or due date = "not set" (null for the API).
    const [title, setTitle] = useState('')
    const [dueOdometer, setDueOdometer] = useState('')
    const [dueDate, setDueDate] = useState('')
    const [repeatEveryKm, setRepeatEveryKm] = useState('')

    const [fieldErrors, setFieldErrors] = useState<ReminderErrors>({})
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [toast, setToast] = useState('')
    const [saving, setSaving] = useState(false)
 
    // Load the reminders every time the rider picks another bike.
    useEffect(() => {
        if (!vehicleId) return
        getReminders(vehicleId)
            .then((data) => {
                setReminders(data)
                setErrors('')
            })
            .catch((err) => setErrors(err.message))
            .finally(() => setLoadedFor(vehicleId))
    }, [vehicleId])
 
    // The API works out the status and the order. After a change, ask it again.
    const reload = async () => {
        if (!vehicleId) return
        try {
            setReminders(await getReminders(vehicleId))
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }
 
    const resetForm = () => {
        setTitle(''); setDueOdometer(''); setDueDate(''); setRepeatEveryKm('')
        setFieldErrors({})
        setEditingId(null)
    }
 
    const openAdd = () => { resetForm(); setShowForm(true) }
 
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!vehicle) return
 
        const next: ReminderErrors = {}
        if (title.trim() === '') next.title = 'Enter a title.'
        else if (title.trim().length > 100) next.title = 'Keep it under 100 letters.'
        if (dueOdometer === '' && dueDate === '' && repeatEveryKm === '') next.due = 'Set a due km, a due date, or a repeat.'
        else if (dueOdometer !== '' && Number(dueOdometer) < 0) next.due = 'The km can\'t be below 0.'
        else if (repeatEveryKm !== '' && (Number(repeatEveryKm) < 1 || Number(repeatEveryKm) > 100000)) next.due = 'Repeat every 1 to 100,000 km.'
        setFieldErrors(next)
        if (Object.keys(next).length > 0) return
 
        setSaving(true)
        try {
            const data: ReminderRequest = {
                title: title.trim(),
                dueOdometer: dueOdometer === '' ? null : Number(dueOdometer),
                dueDate: dueDate === '' ? null : dueDate,
                repeatEveryKm: repeatEveryKm === '' ? null : Number(repeatEveryKm),
            }
            if (editingId) {
                await updateReminder(editingId, data)
                setToast('Reminder updated')
            } else {
                await createReminder(vehicle.id, data)
                setToast('Reminder added')
            }
            setShowForm(false)
            resetForm()
            await reload()
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        } finally {
            setSaving(false)
        }
    }
 
    const onEdit = (r: Reminder) => {
        setEditingId(r.id)
        setTitle(r.title)
        setDueOdometer(r.dueOdometer !== null ? String(r.dueOdometer) : '')
        setDueDate(r.dueDate ?? '')
        setRepeatEveryKm(r.repeatEveryKm !== null ? String(r.repeatEveryKm) : '')
        setFieldErrors({})
        setShowForm(true)
    }
 
    const onDone = async (id: string) => {
        try {
            const updated = await markReminderDone(id)
            // A repeating reminder stays open with its next due km.
            setToast(updated.isDone || updated.dueOdometer === null
                ? 'Marked as done'
                : `Done · next one at ${km(updated.dueOdometer)}`)
            await reload()
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }
 
    const onDelete = async (id: string) => {
        try {
            await deleteReminder(id)
            setReminders(reminders.filter((r) => r.id !== id))
            setToast('Reminder deleted')
        } catch (err) {
            setErrors(err instanceof Error ? err.message : 'Something went wrong.')
        }
    }
 
    // Bikes are still loading (the free API server can take a while to wake up).
    if (vehiclesLoading && !vehicle) {
        return (
            <>
                <PageHeader title="Reminders" subtitle="What's coming up for your bike." />
                <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
            </>
        )
    }
 
    // No bike yet: Reminders need one first.
    if (!vehicle) {
        return (
            <>
                <PageHeader title="Reminders" subtitle="What's coming up for your bike." />
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">No bike yet</div>
                    <p className="text-xs text-muted mt-1 mb-5">Add a bike in your Garage first. Then set its reminders here.</p>
                    <Link to="/garage"
                        className="h-8 px-3.5 inline-flex items-center rounded-md bg-accent text-on-accent text-xs font-medium
                             no-underline hover:opacity-90 transition-opacity">
                        Go to Garage
                    </Link>
                </div>
            </>
        )
    }
 
    const count = (s: ReminderStatus) => reminders.filter((r) => r.status === s).length
    const overdue = count('overdue')
    const soon = count('soon')
 
    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Reminders" subtitle={`What's coming up for your ${vehicle.name}.`} />
                <button type="button" onClick={openAdd}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    + Add reminder
                </button>
            </div>
            <FormMessage text={errors} />
 
            <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label="Overdue" value={loading ? '…' : String(overdue)} tone={overdue > 0 ? 'warn' : 'ink'} />
                <Stat label="Due soon" value={loading ? '…' : String(soon)} tone={soon > 0 ? 'accent' : 'ink'} />
                <Stat label="On track" value={loading ? '…' : String(count('ok'))} />
            </div>
 
            <Card title="All reminders">
                {loading ? (
                    <div className="flex flex-col gap-2 animate-pulse">
                        <div className="h-10 bg-raised rounded" />
                        <div className="h-10 bg-raised rounded" />
                        <div className="h-10 bg-raised rounded" />
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="flex flex-col items-center text-center py-10">
                        <div className="w-12 h-12 rounded-full bg-raised flex items-center justify-center mb-3">
                            <Icon name="bell" size={20} className="text-muted" />
                        </div>
                        <div className="text-sm font-medium text-ink">No reminders yet</div>
                        <p className="text-xs text-muted mt-1 mb-4">Set one by km, by date, or both. Example: oil change at {km(vehicle.odometer + 1500)}.</p>
                        <button type="button" onClick={openAdd}
                            className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                                 hover:opacity-90 transition-opacity cursor-pointer">
                            + Add your first reminder
                        </button>
                    </div>
                ) : (
                    // Phones: a stacked card (title + status, due, km/days left, then full-width buttons).
                    // Wider screens: one row with the same details side by side.
                    reminders.map((r) => (
                        <div key={r.id}
                            className={`flex items-start sm:items-center gap-3 py-3.5 border-t border-line first:border-0 first:pt-0 last:pb-0
                                ${r.isDone ? 'opacity-60' : ''}`}>
                            <div className="w-8 h-8 rounded-md border border-line bg-raised flex items-center justify-center shrink-0 text-accent">
                                <Icon name={r.isDone ? 'check' : r.dueOdometer !== null ? 'gauge' : 'calendar'} size={14} />
                            </div>

                            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center gap-x-3 gap-y-2.5">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <div className={`text-[13px] sm:text-xs font-medium text-ink break-words sm:truncate
                                            ${r.isDone ? 'line-through' : ''}`}>
                                            {r.title}
                                        </div>
                                        <span className="sm:hidden shrink-0">
                                            <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                                        </span>
                                    </div>
                                    <div className="text-[11px] text-faint mt-0.5">{dueText(r)}</div>
                                    {!r.isDone && (
                                        <div className={`sm:hidden font-mono text-xs mt-1
                                            ${r.status === 'overdue' ? 'text-warn' : r.status === 'soon' ? 'text-accent' : 'text-muted'}`}>
                                            {leftText(r)}
                                        </div>
                                    )}
                                </div>

                                {!r.isDone && (
                                    <div className="hidden sm:block font-mono text-[11px] text-muted whitespace-nowrap">{leftText(r)}</div>
                                )}
                                <span className="hidden sm:inline-flex">
                                    <Badge tone={statusTone[r.status]}>{statusLabel[r.status]}</Badge>
                                </span>

                                <div className="flex gap-1.5">
                                    {!r.isDone && (
                                        <button type="button" onClick={() => onDone(r.id)}
                                            className="flex-1 sm:flex-none h-8 sm:h-7 px-2.5 rounded-md border border-line text-xs sm:text-[11px] text-ok
                                                 hover:bg-raised transition-colors cursor-pointer">
                                            Done
                                        </button>
                                    )}
                                    <button type="button" onClick={() => onEdit(r)}
                                        className="flex-1 sm:flex-none h-8 sm:h-7 px-2.5 rounded-md border border-line text-xs sm:text-[11px] text-ink
                                             hover:bg-raised transition-colors cursor-pointer">
                                        Edit
                                    </button>
                                    <button type="button" onClick={() => setDeleteId(r.id)}
                                        className="flex-1 sm:flex-none h-8 sm:h-7 px-2.5 rounded-md border border-line text-xs sm:text-[11px] text-warn
                                             hover:bg-raised transition-colors cursor-pointer">
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </Card>
 
            <Modal open={showForm} title={editingId ? 'Edit reminder' : 'Add reminder'} onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label="Title" icon="bell" placeholder="Oil change" name="title" list="reminder-title-ideas" maxLength={100}
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value)
                            setFieldErrors({ ...fieldErrors, title: undefined })
                        }}
                        error={fieldErrors.title} />
                    <datalist id="reminder-title-ideas">
                        {titleIdeas.map((t) => <option key={t} value={t} />)}
                    </datalist>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label="Due at km (optional)" icon="gauge" placeholder={String(vehicle.odometer + 1500)}
                            name="dueOdometer" type="number" min={0}
                            value={dueOdometer}
                            onChange={(e) => {
                                setDueOdometer(e.target.value)
                                setFieldErrors({ ...fieldErrors, due: undefined })
                            }} />
                        <Field label="Due date (optional)" icon="calendar" name="dueDate" type="date"
                            value={dueDate}
                            onChange={(e) => {
                                setDueDate(e.target.value)
                                setFieldErrors({ ...fieldErrors, due: undefined })
                            }} />
                    </div>
                    <Field label="Repeat every km (optional)" icon="clock" placeholder="1500"
                        name="repeatEveryKm" type="number" min={1} max={100000}
                        value={repeatEveryKm}
                        onChange={(e) => {
                            setRepeatEveryKm(e.target.value)
                            setFieldErrors({ ...fieldErrors, due: undefined })
                        }} />
                    {fieldErrors.due
                        ? <p className="text-[11px] text-warn -mt-1">{fieldErrors.due}</p>
                        : <p className="text-[11px] text-muted -mt-1">
                            Your bike is at {km(vehicle.odometer)}. Set km, date, or both. The first one reached counts.
                            {' '}With a repeat, marking it done sets the next due km from your odometer then
                            {repeatEveryKm !== '' && dueOdometer === '' && Number(repeatEveryKm) > 0
                                ? ` (first one due at ${km(vehicle.odometer + Number(repeatEveryKm))}).` : '.'}
                        </p>}
                    <button type="submit" disabled={saving}
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
                             hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {saving ? 'Saving...' : editingId ? 'Save changes' : 'Save reminder'}
                    </button>
                </form>
            </Modal>
 
            <ConfirmDialog
                open={deleteId !== null}
                title="Delete reminder"
                message="This reminder will be removed. This can't be undone."
                confirmText="Delete"
                danger
                onConfirm={() => { onDelete(deleteId!); setDeleteId(null) }}
                onCancel={() => setDeleteId(null)}
            />
            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
 