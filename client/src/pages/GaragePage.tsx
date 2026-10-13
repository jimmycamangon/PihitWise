import { FormMessage, Label, PageHeader } from '../components/ui'
import { km } from '../lib/format'
import { getVehicles } from '../api/vehicles'
import { useState, useEffect, type FormEvent } from 'react'
import type { Vehicle } from '../types/vehicles'
import { Field } from '../components/AuthLayout'
import { createVehicle } from '../api/vehicles'
import Modal from '../components/Modal'
import { Badge } from '../components/ui'


interface VehicleErrors { name?: string, brand?: string, model?: string, year?: string, plateNumber?: string, odometer?: string }

export default function GaragePage() {
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState('')
    const [showForm, setShowForm] = useState(false)

    const [name, setName] = useState('')
    const [brand, setBrand] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [plateNumber, setplateNumber] = useState('')
    const [odometer, setOdometer] = useState('')

    const [fieldErrors, setFieldErrors] = useState<VehicleErrors>({})

    useEffect(() => {
        setLoading(true)
        getVehicles()
            .then((data) => setVehicles(data))
            .catch((errors) => setErrors(errors.message))
            .finally(() => setLoading(false))
    }, [])


    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()

        const next: VehicleErrors = {}
        if (!name.trim()) next.name = 'Enter a name.'
        if (!brand.trim()) next.brand = 'Enter a brand.'
        if (!model.trim()) next.model = 'Enter a model.'
        const y = Number(year)
        if (y < 1950 || y > new Date().getFullYear() + 1) next.year = 'Enter a valid year.'
        if (plateNumber.trim().length > 10) next.plateNumber = 'Max 10 characters.'
        if (Number(odometer) < 0) next.odometer = 'Odometer can\'t be negative.'
        setFieldErrors(next)
        if (Object.keys(next).length > 0) return


        try {
            const created = await createVehicle({
                type: 'Motorcycle',
                name, brand, model,
                year: Number(year),
                plateNumber: plateNumber.trim().toUpperCase() || null,
                odometer: Number(odometer),
            })
            setVehicles([...vehicles, created])
            setShowForm
        } catch (err) {
            setErrors((err as Error).message)
        }
    }

    return (
        <>
            {loading && <p>Loading...</p>}
            <FormMessage text={errors} />

            <div className="flex items-start justify-between gap-3">
                <PageHeader title="Garage" subtitle="Every vehicle you own, in one place." />
                <button type="button" onClick={() => setShowForm(true)}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
             hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    + Add vehicle
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicles.map((bike) => {
                    return (
                        <div key={bike.id} className="bg-surface border border-line rounded-xl p-5">
                            <div className="flex items-start justify-between gap-3 mb-4">
                                <div>
                                    <div className="text-base font-medium text-ink">{bike.name}</div>
                                    <div className="text-xs text-muted">{bike.brand} {bike.model} · {bike.year}</div>
                                </div>
                                <Badge>{bike.plateNumber ?? 'No plate'}</Badge>
                            </div>
                            <Label>Odometer</Label>
                            <div className="font-mono text-sm text-ink tracking-tight mt-1">{km(bike.odometer)}</div>
                        </div>
                    )
                })}
            </div>

            <Modal open={showForm} title="Add vehicle" onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label="Name" icon="garage" placeholder="My daily ride" name="name"
                        value={name} onChange={(e) => setName(e.target.value)} error={fieldErrors.name} />
                    <Field label="Brand" icon="tag" placeholder="Honda" name="brand"
                        value={brand} onChange={(e) => setBrand(e.target.value)} error={fieldErrors.brand} />
                    <Field label="Model" icon="bike" placeholder="Click 125i" name="model"
                        value={model} onChange={(e) => setModel(e.target.value)} error={fieldErrors.model} />
                    <Field label="Year" icon="calendar" placeholder="2022" name="year" type="number"
                        value={year} onChange={(e) => setYear(e.target.value)} error={fieldErrors.year} />
                    <Field label="Plate Number" icon="hash" placeholder="ABC 1234" name="plateNumber"
                        value={plateNumber} onChange={(e) => setplateNumber(e.target.value)} error={fieldErrors.plateNumber} />
                    <Field label="Odometer" icon="gauge" placeholder="12000" name="odometer" type="number"
                        value={odometer} onChange={(e) => setOdometer(e.target.value)} error={fieldErrors.odometer} />
                    <button type="submit"
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
         hover:opacity-90 transition-opacity cursor-pointer">
                        Save vehicle
                    </button>
                </form>
            </Modal>
        </>
    )
}
