import { FormMessage, Label, PageHeader } from '../components/ui'
import { km } from '../lib/format'
import { getVehicles } from '../api/vehicles'
import { useState, useEffect, type FormEvent } from 'react'
import type { Vehicle } from '../types/vehicles'
import { Field } from '../components/AuthLayout'
import { createVehicle, deleteVehicle, updateVehicle } from '../api/vehicles'
import Modal from '../components/Modal'
import ConfirmDialog from '../components/ConfirmDialog'
import Toast from '../components/Toast'
import Icon from '../components/Icon'
import { useBike } from '../hooks/useBike'
import { useT } from '../lib/i18n'

interface VehicleErrors { name?: string, brand?: string, model?: string, year?: string, plateNumber?: string, odometer?: string }

export default function GaragePage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(true)
    const [errors, setErrors] = useState('')
    const [showForm, setShowForm] = useState(false)

    const [name, setName] = useState('')
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [plateNumber, setplateNumber] = useState('')
    const [odometer, setOdometer] = useState('')

    const [fieldErrors, setFieldErrors] = useState<VehicleErrors>({})
    const [deleteId, setDeleteId] = useState<string | null>(null)
    const [editingId, setEditingId] = useState<string | null>(null)
    const [toast, setToast] = useState('')

    const [saving, setSaving] = useState(false)

    const { reloadVehicles } = useBike()
    const t = useT()

    const resetForm = () => {
        setName(''); setBrand(''); setModel('')
        setYear(''); setplateNumber(''); setOdometer('')
        setFieldErrors({})
        setEditingId(null)
    }

    useEffect(() => {
        getVehicles()
            .then((data) => setVehicles(data))
            .catch((errors) => setErrors(errors.message))
            .finally(() => setLoading(false))
    }, [])


    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const next: VehicleErrors = {}
        if (!name.trim()) next.name = t('garage.err.name')
        if (!brand.trim()) next.brand = t('garage.err.brand')
        if (!model.trim()) next.model = t('garage.err.model')
        const y = Number(year)
        if (y < 1950 || y > new Date().getFullYear() + 1) next.year = t('garage.err.year')
        if (plateNumber.trim().length > 10) next.plateNumber = t('garage.err.plate')
        if (Number(odometer) < 0) next.odometer = t('garage.err.odometer')
        setFieldErrors(next)
        if (Object.keys(next).length > 0) return

        setSaving(true)
        try {
            const data = {
                type: 'Motorcycle' as const,
                name, brand, model,
                year: Number(year),
                plateNumber: plateNumber.trim().toUpperCase() || null,
                odometer: Number(odometer),
            }
            if (editingId) {
                const updated = await updateVehicle(editingId, data)
                setVehicles(vehicles.map((v) => (v.id === editingId ? updated : v)))
                setToast(t('garage.updated'))
            } else {
                const created = await createVehicle(data)
                setVehicles([...vehicles, created])
                setToast(t('garage.added'))
            }
            setShowForm(false)
            resetForm()
            reloadVehicles()
        } catch (err) {
            const msg = err instanceof Error ? err.message : t('common.somethingWrong')
            if (msg.includes('plate')) setFieldErrors({ plateNumber: msg })
            else setErrors(msg)
        } finally {
            setSaving(false)
        }
    }

    const onEdit = (vehicle: Vehicle) => {
        setEditingId(vehicle.id)
        setName(vehicle.name)
        setBrand(vehicle.brand)
        setModel(vehicle.model)
        setYear(String(vehicle.year))
        setplateNumber(vehicle.plateNumber ?? '')
        setOdometer(String(vehicle.odometer))
        setFieldErrors({})
        setShowForm(true)
    }

    const onDelete = async (id: string) => {
        try {
            await deleteVehicle(id)
            setVehicles(vehicles.filter((v) => v.id !== id))
            setToast(t('garage.deleted'))

            reloadVehicles()
        } catch (err) {
            setErrors((err as Error).message)
        }
    }

    return (
        <>
            <div className="flex items-start justify-between gap-3">
                <PageHeader title={t('garage.title')} subtitle={t('garage.subtitle')} />
                <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
             hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    {t('garage.add')}
                </button>
            </div>
            <FormMessage text={errors} />
            {loading && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <VehicleSkeleton />
                    <VehicleSkeleton />
                    <VehicleSkeleton />
                </div>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {vehicles.map((vehicle) => {
                    return (
                        <div key={vehicle.id} className="bg-surface border border-line rounded-xl p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <div className="text-base font-medium text-ink">{vehicle.name}</div>
                                    <div className="text-xs text-muted">{vehicle.brand} {vehicle.model} · {vehicle.year}</div>
                                </div>
                                <span className="inline-flex items-center h-5 px-2 rounded-full border border-line font-mono text-[9px] uppercase tracking-widest text-muted whitespace-nowrap">{vehicle.plateNumber ?? t('garage.noPlate')}</span>
                            </div>
                            <Label>{t('common.odometer')}</Label>
                            <div className="font-mono text-sm text-ink tracking-tight mt-1">{km(vehicle.odometer)}</div>
                            <div className="flex gap-2 mt-4 pt-4 border-t border-line">
                                <button type="button" onClick={() => onEdit(vehicle)}
                                    className="h-8 px-3 rounded-md border border-line text-xs text-ink
             hover:bg-raised transition-colors cursor-pointer">
                                    {t('common.edit')}
                                </button>
                                <button type="button" onClick={() => setDeleteId(vehicle.id)}
                                    className="h-8 px-3 rounded-md border border-line text-xs text-warn
             hover:bg-raised transition-colors cursor-pointer">
                                    {t('common.delete')}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>

            {!loading && vehicles.length === 0 && (
                <div className="flex flex-col items-center text-center py-16 border border-dashed border-line rounded-xl">
                    <div className="w-14 h-14 rounded-full bg-raised flex items-center justify-center mb-4">
                        <Icon name="bike" size={24} className="text-muted" />
                    </div>
                    <div className="text-sm font-medium text-ink">{t('garage.none')}</div>
                    <p className="text-xs text-muted mt-1 mb-5">{t('garage.noneHelp')}</p>
                    <button type="button" onClick={() => { resetForm(); setShowForm(true) }}
                        className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
         hover:opacity-90 transition-opacity cursor-pointer">
                        {t('garage.addFirst')}
                    </button>
                </div>
            )}

            <Modal open={showForm} title={editingId ? t('garage.formEdit') : t('garage.formAdd')} onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label={t('garage.name')} icon="garage" placeholder={t('garage.namePlaceholder')} name="name"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value)
                            setFieldErrors({ ...fieldErrors, name: undefined })
                        }}
                        error={fieldErrors.name} />
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('garage.brand')} icon="tag" placeholder="Honda" name="brand"
                            value={brand}
                            onChange={(e) => {
                                setBrand(e.target.value)
                                setFieldErrors({ ...fieldErrors, brand: undefined })
                            }}
                            error={fieldErrors.brand} />
                        <Field label={t('garage.model')} icon="bike" placeholder="Click 125i" name="model"
                            value={model}
                            onChange={(e) => {
                                setModel(e.target.value)
                                setFieldErrors({ ...fieldErrors, model: undefined })
                            }}
                            error={fieldErrors.model} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <Field label={t('garage.year')} icon="calendar" placeholder="2022" name="year" type="number"
                            value={year}
                            onChange={(e) => {
                                setYear(e.target.value)
                                setFieldErrors({ ...fieldErrors, year: undefined })
                            }}
                            error={fieldErrors.year} />
                        <Field label={t('common.odometer')} icon="gauge" placeholder="12000" name="odometer" type="number"
                            value={odometer}
                            onChange={(e) => {
                                setOdometer(e.target.value)
                                setFieldErrors({ ...fieldErrors, odometer: undefined })
                            }}
                            error={fieldErrors.odometer} />
                    </div>
                    <Field label={t('garage.plate')} icon="hash" placeholder="ABC 1234" name="plateNumber"
                        value={plateNumber}
                        onChange={(e) => {
                            setplateNumber(e.target.value)
                            setFieldErrors({ ...fieldErrors, plateNumber: undefined })
                        }}
                        error={fieldErrors.plateNumber} />
                    <button type="submit" disabled={saving}
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
         hover:opacity-90 transition-opacity cursor-pointer">
                        {saving ? t('common.saving') : editingId ? t('common.saveChanges') : t('garage.save')}
                    </button>
                </form>
            </Modal>


            <ConfirmDialog
                open={deleteId !== null}
                title={t('garage.deleteTitle')}
                message={t('garage.deleteMessage')}
                confirmText={t('common.delete')}
                danger
                onConfirm={() => { onDelete(deleteId!); setDeleteId(null) }}
                onCancel={() => setDeleteId(null)}
            />
            <Toast message={toast} onClose={() => setToast('')} />
        </>

    )
}



function VehicleSkeleton() {
    return (
        <div className="h-50 bg-surface border border-line rounded-xl p-5 animate-pulse">
            {/* name + brand line */}
            <div className="h-4 w-32 bg-raised rounded mb-2" />
            <div className="h-3 w-40 bg-raised rounded" />

            {/* odometer */}
            <div className="h-4 w-24 bg-raised rounded mt-4" />

            {/* buttons */}
            <div className="flex gap-2 mt-4 pt-4 border-t border-line">
                <div className="h-8 w-16 bg-raised rounded-md" />
                <div className="h-8 w-16 bg-raised rounded-md" />
            </div>
        </div>
    )
}