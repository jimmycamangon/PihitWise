import { FormMessage, Label, PageHeader } from '../components/ui'
import { useBike } from '../hooks/useBike'
import { km } from '../lib/format'
import { getVehicles } from '../api/vehicles'
import { useState, useEffect } from 'react'
import type { Vehicle } from '../types/vehicles'

export default function GaragePage() {
    const { bike: active } = useBike()
    const [vehicles, setVehicles] = useState<Vehicle[]>([])
    const [loading, setLoading] = useState(false)
    const [errors, setErrors] = useState('')

    useEffect(() => {
        setLoading(true)
        getVehicles()
            .then((data) => setVehicles(data))
            .catch((errors) => setErrors(errors.message))
            .finally(() => setLoading(false))
    }, [])



    return (
        <>
            {loading && <p>Loading...</p>}
            <FormMessage text={errors} />

            <PageHeader title="Garage" subtitle="Every bike you own, in one place." />

            {!loading && vehicles.length === 0 && <p>No bikes yet.</p>}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {vehicles.map((bike) => {
                    const isActive = bike.id === active.id
                    return (
                        <div key={bike.id}
                            className={`bg-surface border rounded-xl p-5 transition-colors ${isActive ? 'border-accent/50' : 'border-line'}`}>
                            <div className="flex items-start justify-between gap-3 mb-5">
                                <div>
                                    <div className="text-base font-medium text-ink">{bike.name}</div>
                                    <div className="text-base font-medium text-ink">{bike.brand}</div>
                                    <div className="text-base font-medium text-ink">{bike.model}</div>
                                    <div className="text-xs text-faint">{bike.year} · {bike.plateNumber ?? 'No plate'}</div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-x-4 gap-y-4">
                                <div>
                                    <Label>Odometer</Label>
                                    <div className="font-mono text-sm text-ink tracking-tight mt-1">{km(bike.odometer)}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
