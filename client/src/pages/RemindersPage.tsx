import { useState, useEffect, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Badge, Card, FormMessage, PageHeader, Stat } from '../components/ui'
import { Field } from '../components/AuthLayout'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import Icon from '../components/Icon'
import { useBike } from '../hooks/useBike'
import { t, useT } from '../lib/i18n'
import { useQuickAdd } from '../hooks/useQuickAdd'
import { createReminder, deleteReminder, getReminders, markReminderDone, updateReminder } from '../api/reminders'
import type { Reminder, ReminderRequest, ReminderStatus } from '../types/reminders'
import { formatDate, km } from '../lib/format'
import { leftText, statusLabel, statusTone } from '../lib/reminders'
import SyncBadge from '../components/SyncBadge'

interface ReminderErrors { title?: string, due?: string }

// Ideas for the title box. The rider can still type anything.
const titleIdeas = ['Oil change', 'CVT cleaning', 'Brake pads', 'Tire change', 'Chain cleaning', 'LTO registration', 'CTPL insurance']

// "Due at 13,000 km · Dec 18, 2026 · every 1,500 km"
function dueText(r: Reminder) {
    const parts: string[] = []
    if (r.dueOdometer !== null) parts.push(t('rem.dueAt', { km: km(r.dueOdometer) }))
    if (r.dueDate !== null) parts.push(formatDate(r.dueDate))
    if (r.repeatEveryKm !== null) parts.push(t('rem.every', { km: km(r.repeatEveryKm) }))
    return t('rem.due', { parts: parts.join(' · ') })
}
 
export default function RemindersPage() {
    const { vehicle, vehiclesLoading } = useBike()
    useT()   // re-render on language change; dueText below uses t too
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
            setErrors(err instanceof Error ? err.message : t('common.somethingWrong'))
        }
    }
 
    const resetForm = () => {
        setTitle(''); setDueOdometer(''); setDueDate(''); setRepeatEveryKm('')
        setFieldErrors({})
        setEditingId(null)
    }
 
    const openAdd = () => { resetForm(); setShowForm(true) }
    useQuickAdd(openAdd, !!vehicle)
 
    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        if (!vehicle) return
 
        const next: ReminderErrors = {}
        if (title.trim() === '') next.title = t('rem.err.title')
        else if (title.trim().length > 100) next.title = t('rem.err.long')
        if (dueOdometer === '' && dueDate === '' && repeatEveryKm === '') next.due = t('rem.err.due')
        else if (dueOdometer !== '' && Number(dueOdometer) < 0) next.due = t('rem.err.negative')
        else if (repeatEveryKm !== '' && (Number(repeatEveryKm) < 1 || Number(repeatEveryKm) > 100000)) next.due = t('rem.err.repeat')
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
                const saved = await updateReminder(editingId, data)
                setToast(saved.pending ? t('common.savedOffline') : t('rem.updated'))
            } else {
                const saved = await createReminder(vehicle.id, data)
                setToast(saved.pending ? t('common.savedOffline') : t('rem.added'))
            }
            setShowForm(false)
            resetForm()
            await reload()
        } catch (err) {
            setErrors(err instanceof Error ? err.message : t('common.somethingWrong'))
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
            setToast(updated.pending
                ? t('common.savedOffline')
                : updated.isDone || updated.dueOdometer === null
                    ? t('rem.markedDone')
                    : t('rem.nextAt', { km: km(updated.dueOdometer) }))
            await reload()
        } catch (err) {
            setErrors(err instanceof Error ? err.message : t('common.somethingWrong'))
        }
    }
 
    const onDelete = async (id: string) => {
        try {
            await deleteReminder(id)
            setReminders(reminders.filter((r) => r.id !== id))
            setToast(t('rem.deleted'))
        } catch (err) {
            setErrors(err instanceof Error ? err.message : t('common.somethingWrong'))
        }
    }
 
    // Bikes are still loading (the free API server can take a while to wake up).
    if (vehiclesLoading && !vehicle) {
        return (
            <>
                <PageHeader title={t('rem.title')} subtitle={t('rem.subtitle')} />
                <div className="h-40 bg-surface border border-line rounded-xl animate-pulse" />
            </>
        )
    }
 
    // No bike yet: Reminders need one first.
    if (!vehicle) {
        return (
            <>
                <PageHeader title={t('rem.title')} subtitle={t('rem.subtitle')} />
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">{t('common.noBike')}</div>
                    <p className="text-xs text-muted mt-1 mb-5">{t('rem.noBikeHelp')}</p>
                    <Link to="/garage"
                        className="h-8 px-3.5 inline-flex items-center rounded-md bg-accent text-on-accent text-xs font-medium
                             no-underline hover:opacity-90 transition-opacity">
                        {t('common.goToGarage')}
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
                <PageHeader title={t('rem.title')} subtitle={t('rem.subtitleBike', { bike: vehicle.name })} />
                <button type="button" onClick={openAdd}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                         hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    {t('rem.add')}
                </button>
            </div>
            <FormMessage text={errors} />
 
            <div className="grid grid-cols-3 gap-3 mb-3">
                <Stat label={t('status.overdue')} value={loading ? '…' : String(overdue)} tone={overdue > 0 ? 'warn' : 'ink'} />
                <Stat label={t('status.soon')} value={loading ? '…' : String(soon)} tone={soon > 0 ? 'accent' : 'ink'} />
                <Stat label={t('status.ok')} value={loading ? '…' : String(count('ok'))} />
            </div>
 
            <Card title={t('rem.all')}>
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
                        <div className="text-sm font-medium text-ink">{t('rem.none')}</div>
                        <p className="text-xs text-muted mt-1 mb-4">{t('rem.noneHelp', { km: km(vehicle.odometer + 1500) })}</p>
                        <button type="button" onClick={openAdd}
                            className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
                                 hover:opacity-90 transition-opacity cursor-pointer">
                            {t('rem.addFirst')}
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
                                            {r.title}<SyncBadge row={r} />
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
                                            {t('rem.markDone')}
                                        </button>
                                    )}
                                    <button type="button" onClick={() => onEdit(r)}
                                        className="flex-1 sm:flex-none h-8 sm:h-7 px-2.5 rounded-md border border-line text-xs sm:text-[11px] text-ink
                                             hover:bg-raised transition-colors cursor-pointer">
                                        {t('common.edit')}
                                    </button>
                                    <button type="button" onClick={() => setDeleteId(r.id)}
                                        className="flex-1 sm:flex-none h-8 sm:h-7 px-2.5 rounded-md border border-line text-xs sm:text-[11px] text-warn
                                             hover:bg-raised transition-colors cursor-pointer">
                                        {t('common.delete')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </Card>
 
            <Modal open={showForm} title={editingId ? t('rem.formEdit') : t('rem.formAdd')} onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label={t('rem.titleField')} icon="bell" placeholder={t('rem.titlePlaceholder')} name="title" list="reminder-title-ideas" maxLength={100}
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
                        <Field label={t('rem.dueKm')} icon="gauge" placeholder={String(vehicle.odometer + 1500)}
                            name="dueOdometer" type="number" min={0}
                            value={dueOdometer}
                            onChange={(e) => {
                                setDueOdometer(e.target.value)
                                setFieldErrors({ ...fieldErrors, due: undefined })
                            }} />
                        <Field label={t('rem.dueDate')} icon="calendar" name="dueDate" type="date"
                            value={dueDate}
                            onChange={(e) => {
                                setDueDate(e.target.value)
                                setFieldErrors({ ...fieldErrors, due: undefined })
                            }} />
                    </div>
                    <Field label={t('rem.repeat')} icon="clock" placeholder="1500"
                        name="repeatEveryKm" type="number" min={1} max={100000}
                        value={repeatEveryKm}
                        onChange={(e) => {
                            setRepeatEveryKm(e.target.value)
                            setFieldErrors({ ...fieldErrors, due: undefined })
                        }} />
                    {fieldErrors.due
                        ? <p className="text-[11px] text-warn -mt-1">{fieldErrors.due}</p>
                        : <p className="text-[11px] text-muted -mt-1">
                            {t('rem.help', { km: km(vehicle.odometer) })}
                            {repeatEveryKm !== '' && dueOdometer === '' && Number(repeatEveryKm) > 0
                                ? t('rem.firstDue', { km: km(vehicle.odometer + Number(repeatEveryKm)) }) : '.'}
                        </p>}
                    <button type="submit" disabled={saving}
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
                             hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-60">
                        {saving ? t('common.saving') : editingId ? t('common.saveChanges') : t('rem.save')}
                    </button>
                </form>
            </Modal>
 
            <ConfirmDialog
                open={deleteId !== null}
                title={t('rem.deleteTitle')}
                message={t('rem.deleteMessage')}
                confirmText={t('common.delete')}
                danger
                onConfirm={() => { onDelete(deleteId!); setDeleteId(null) }}
                onCancel={() => setDeleteId(null)}
            />
            <Toast message={toast} onClose={() => setToast('')} />
        </>
    )
}
 