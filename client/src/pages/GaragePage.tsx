import { FormMessage, Label, PageHeader } from '../components/ui'
import { km } from '../lib/format'
import { getVehicles } from '../api/vehicles'
import { useState, useEffect, type FormEvent } from 'react'
import type { Vehicle } from '../types/vehicles'
import { Field } from '../components/AuthLayout'
import { createVehicle } from '../api/vehicles'
import Modal from '../components/Modal'
import { Badge } from '../components/ui'

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

    useEffect(() => {
        setLoading(true)
        getVehicles()
            .then((data) => setVehicles(data))
            .catch((errors) => setErrors(errors.message))
            .finally(() => setLoading(false))
    }, [])


    const onSubmit = async (e: FormEvent) => {
        e.preventDefault()
        try {
            const created = await createVehicle({
                type: 'Motorcycle',
                name, brand, model,
                year: Number(year),
                plateNumber: plateNumber || null,
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
                <PageHeader title="Garage" subtitle="Every bike you own, in one place." />
                <button type="button" onClick={() => setShowForm(true)}
                    className="h-8 px-3.5 rounded-md bg-accent text-on-accent text-xs font-medium
             hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap">
                    + Add bike
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

            <Modal open={showForm} title="Add bike" onClose={() => setShowForm(false)}>
                <form onSubmit={onSubmit} className="flex flex-col gap-3 mb-4">
                    <Field label="Name" icon="user" name="name"
                        value={name} onChange={(e) => setName(e.target.value)} />
                    {/* brand, model, year, plateNumber, odometer: same way */}
                    <Field label="Brand" icon="user" name="brand"
                        value={brand} onChange={(e) => setBrand(e.target.value)} />
                    <Field label="Model" icon="user" name="model"
                        value={model} onChange={(e) => setModel(e.target.value)} />
                    <Field label="Year" icon="user" name="year" type="number"
                        value={year} onChange={(e) => setYear(e.target.value)} />
                    <Field label="Plate Number" icon="user" name="plateNumber"
                        value={plateNumber} onChange={(e) => setplateNumber(e.target.value)} />
                    <Field label="Odometer" icon="user" name="odometer" type="number"
                        value={odometer} onChange={(e) => setOdometer(e.target.value)} />
                    <button type="submit"
                        className="h-10 mt-2 rounded-md bg-accent text-on-accent text-[13px] font-medium
         hover:opacity-90 transition-opacity cursor-pointer">
                        Save bike
                    </button>
                </form>
            </Modal>
        </>
    )
}
